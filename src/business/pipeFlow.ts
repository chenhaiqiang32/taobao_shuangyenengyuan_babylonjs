/**
 * 管道流动：根据 MODEL_UPDATE 中水泵/阀门状态驱动材质纹理偏移
 */
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Material } from '@babylonjs/core/Materials/material'
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { AppOrchestrator } from '../core/app'
import { getDeviceMetrics } from './deviceMetrics'
import type { PipeEntry } from '../modules/model'
import type { ModelUpdateObject } from '../message/types'

/** 纹理 V 方向滚动速度（单位/秒） */
const FLOW_SCROLL_SPEED = 0.4

export interface PipeFlowApi {
  applyFromUpdate: (objects: ModelUpdateObject[]) => void
  refreshAll: () => void
  dispose: () => void
}

function readMetric(metrics: Record<string, string | number>, name: string): number | null {
  if (name in metrics) return Number(metrics[name])
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith(name)) return Number(value)
  }
  return null
}

/** 水泵：运行信号 === 1 */
export function isPumpRunning(objectName: string): boolean {
  const metrics = getDeviceMetrics(objectName)
  if (!metrics) return false
  return readMetric(metrics, '运行信号') === 1
}

/** 阀门：开到位 / 开度 / 运行状态 任一满足即视为开启 */
export function isValveOpen(objectName: string): boolean {
  const metrics = getDeviceMetrics(objectName)
  if (!metrics) return false
  if (readMetric(metrics, '阀门开到位信号') === 1) return true
  const feedback = readMetric(metrics, '阀门开度反馈')
  if (feedback !== null && feedback > 0) return true
  const opening = readMetric(metrics, '阀门开度')
  if (opening !== null && opening > 0) return true
  return readMetric(metrics, '运行状态') === 1
}

/** shuibeng 中任一水泵运行；famen 中全部阀门开启 */
export function shouldPipeFlow(entry: PipeEntry): boolean {
  const pumpActive =
    entry.pumps.length > 0 && entry.pumps.some((name) => isPumpRunning(name))
  const valvesOpen =
    entry.valves.length === 0 || entry.valves.every((name) => isValveOpen(name))
  return pumpActive && valvesOpen
}

interface ScrollTexture {
  texture: Texture
  baseU: number
  baseV: number
}

interface PipeFlowState {
  entry: PipeEntry
  scrollTextures: ScrollTexture[]
  flowing: boolean
  scrollOffset: number
}

function cloneMaterialTextures(mat: Material | null): void {
  const walk = (material: Material | null): void => {
    if (!material) return
    if (material instanceof MultiMaterial) {
      for (const sub of material.subMaterials) walk(sub)
      return
    }
    if (material instanceof PBRMaterial) {
      if (material.albedoTexture instanceof Texture) {
        material.albedoTexture = material.albedoTexture.clone()
      }
      if (material.emissiveTexture instanceof Texture) {
        material.emissiveTexture = material.emissiveTexture.clone()
      }
      return
    }
    if (material instanceof StandardMaterial) {
      if (material.diffuseTexture instanceof Texture) {
        material.diffuseTexture = material.diffuseTexture.clone()
      }
      if (material.emissiveTexture instanceof Texture) {
        material.emissiveTexture = material.emissiveTexture.clone()
      }
    }
  }
  walk(mat)
}

function clonePipeMaterial(mesh: AbstractMesh): Material | null {
  const current = mesh.material
  if (!current) return null
  const cloned = current.clone(`${current.name || 'pipeMat'}_${mesh.name}`)
  cloneMaterialTextures(cloned)
  mesh.material = cloned
  return cloned
}

function collectScrollTextures(mat: Material | null): ScrollTexture[] {
  const result: ScrollTexture[] = []
  const seen = new Set<Texture>()

  const addTexture = (tex: unknown): void => {
    if (!(tex instanceof Texture) || seen.has(tex)) return
    seen.add(tex)
    result.push({ texture: tex, baseU: tex.uOffset, baseV: tex.vOffset })
  }

  const walk = (material: Material | null): void => {
    if (!material) return
    if (material instanceof MultiMaterial) {
      for (const sub of material.subMaterials) walk(sub)
      return
    }
    if (material instanceof PBRMaterial) {
      addTexture(material.albedoTexture)
      addTexture(material.emissiveTexture)
      return
    }
    if (material instanceof StandardMaterial) {
      addTexture(material.diffuseTexture)
      addTexture(material.emissiveTexture)
    }
  }

  walk(mat)
  return result
}

function resetScroll(state: PipeFlowState): void {
  state.scrollOffset = 0
  for (const item of state.scrollTextures) {
    item.texture.uOffset = item.baseU
    item.texture.vOffset = item.baseV
  }
}

function applyScroll(state: PipeFlowState): void {
  const total = state.scrollOffset % 1
  for (const item of state.scrollTextures) {
    item.texture.uOffset = item.baseU
    item.texture.vOffset = item.baseV + total
  }
}

export function createPipeFlow(app: AppOrchestrator): PipeFlowApi | null {
  const ctx = app.getContext()
  if (!ctx?.scene) return null

  const scene = ctx.scene
  const model = () => app.getModelModule()
  const states: PipeFlowState[] = []

  for (const entry of model().getPipeEntries()) {
    clonePipeMaterial(entry.mesh)
    const scrollTextures = collectScrollTextures(entry.mesh.material)
    states.push({
      entry,
      scrollTextures,
      flowing: false,
      scrollOffset: 0,
    })
  }

  if (!states.length) {
    console.warn('[pipeFlow] no pipes indexed')
  } else {
    const withRefs = states.filter((s) => s.entry.pumps.length || s.entry.valves.length).length
    const withTex = states.filter((s) => s.scrollTextures.length).length
    console.info(
      `[pipeFlow] ready pipes=${states.length}, withRefs=${withRefs}, withScrollTex=${withTex}`,
    )
  }

  const refreshAll = (): void => {
    let flowingCount = 0
    for (const state of states) {
      const shouldFlow = shouldPipeFlow(state.entry)
      if (shouldFlow !== state.flowing) {
        state.flowing = shouldFlow
        if (!shouldFlow) resetScroll(state)
      }
      if (shouldFlow) flowingCount++
    }
    if (flowingCount > 0) {
      console.info(`[pipeFlow] flowing pipes=${flowingCount}/${states.length}`)
    }
  }

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() * 0.001
    for (const state of states) {
      if (!state.flowing || !state.scrollTextures.length) continue
      state.scrollOffset += FLOW_SCROLL_SPEED * dt
      applyScroll(state)
    }
  })

  refreshAll()

  return {
    applyFromUpdate(_objects) {
      refreshAll()
    },
    refreshAll,
    dispose() {
      scene.onBeforeRenderObservable.remove(renderObserver)
      for (const state of states) {
        if (state.flowing) resetScroll(state)
      }
      states.length = 0
    },
  }
}
