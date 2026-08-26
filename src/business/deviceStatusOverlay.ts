/**
 * 设备状态：淡淡半透明发光罩子（无显眼轮廓线）
 * - 故障状态 1 → 淡红罩
 * - 运行状态 0 → 淡灰罩
 * - 运行状态 1 → 淡蓝罩
 */
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Constants } from '@babylonjs/core/Engines/constants'
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Material } from '@babylonjs/core/Materials/material'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { Scene } from '@babylonjs/core/scene'
import type { AppOrchestrator } from '../core/app'
import { normalizeDeviceName } from './deviceMetrics'
import type { ModelUpdateObject } from '../message/types'

/** 独立渲染组：在模型与透明层之后绘制，且不参与深度遮挡 */
const SHELL_RENDER_GROUP = 2

const SHELL_THEME = {
  stopped: {
    color: Color3.FromHexString('#A8BCD4'),
    alpha: 0.22,
    pulseSpeed: 1.4,
  },
  running: {
    color: Color3.FromHexString('#00E8FF'),
    alpha: 0.24,
    pulseSpeed: 2.2,
  },
  fault: {
    color: Color3.FromHexString('#FF4466'),
    alpha: 0.26,
    pulseSpeed: 3.6,
  },
} as const

const SHELL_PADDING = 1.14
const SHELL_MIN_SIZE = 0.15

type StatusKind = keyof typeof SHELL_THEME | 'none'

interface DeviceShellState {
  kind: Exclude<StatusKind, 'none'>
  shell: Mesh
  material: StandardMaterial
  meshes: AbstractMesh[]
  pulsePhase: number
}

export interface DeviceStatusOverlayApi {
  applyFromUpdate: (objects: ModelUpdateObject[]) => void
  dispose: () => void
}

function readStatusMetric(
  metrics: Record<string, string | number>,
  name: '故障状态' | '运行状态',
): number | null {
  if (name in metrics) return Number(metrics[name])
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith(name)) return Number(value)
  }
  return null
}

export function resolveOverlayKind(
  metrics: Record<string, string | number>,
): StatusKind | null {
  const fault = readStatusMetric(metrics, '故障状态')
  const running = readStatusMetric(metrics, '运行状态')
  if (fault === null && running === null) return null
  if (fault === 1) return 'fault'
  if (running === 0) return 'stopped'
  if (running === 1) return 'running'
  return 'none'
}

function computeWorldBounds(meshes: AbstractMesh[]): { center: Vector3; size: Vector3 } | null {
  const min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
  const max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE)
  let hit = false

  for (const mesh of meshes) {
    if (!mesh.isEnabled()) continue
    mesh.computeWorldMatrix(true)
    const bi = mesh.getBoundingInfo()
    if (!bi) continue
    for (const corner of bi.boundingBox.vectorsWorld) {
      min.minimizeInPlace(corner)
      max.maximizeInPlace(corner)
      hit = true
    }
  }

  if (!hit) return null

  const center = min.add(max).scaleInPlace(0.5)
  const size = max.subtract(min)
  size.x = Math.max(size.x * SHELL_PADDING, SHELL_MIN_SIZE)
  size.y = Math.max(size.y * SHELL_PADDING, SHELL_MIN_SIZE)
  size.z = Math.max(size.z * SHELL_PADDING, SHELL_MIN_SIZE)
  return { center, size }
}

function applyShellTheme(state: DeviceShellState): void {
  const theme = SHELL_THEME[state.kind]
  state.material.diffuseColor = theme.color
  state.material.emissiveColor = theme.color.scale(0.85)
  state.material.alpha = theme.alpha
}

function createShellMaterial(scene: Scene, objectName: string): StandardMaterial {
  const mat = new StandardMaterial(`statusShellMat_${objectName}`, scene)
  mat.disableLighting = true
  mat.backFaceCulling = false
  mat.transparencyMode = Material.MATERIAL_ALPHABLEND
  mat.separateCullingPass = true
  mat.disableDepthWrite = true
  mat.depthFunction = Constants.ALWAYS
  return mat
}

function fitShellToMeshes(shell: Mesh, meshes: AbstractMesh[]): void {
  const bounds = computeWorldBounds(meshes)
  if (!bounds) return
  shell.position.copyFrom(bounds.center)
  shell.scaling.copyFrom(bounds.size)
}

function createDeviceShell(
  scene: Scene,
  glowLayer: HighlightLayer,
  objectName: string,
  kind: Exclude<StatusKind, 'none'>,
  meshes: AbstractMesh[],
): DeviceShellState {
  const shell = MeshBuilder.CreateBox(`statusShell_${objectName}`, { size: 1 }, scene)
  const material = createShellMaterial(scene, objectName)
  shell.material = material
  shell.isPickable = false
  shell.renderingGroupId = SHELL_RENDER_GROUP
  shell.alphaIndex = 900
  fitShellToMeshes(shell, meshes)

  const state: DeviceShellState = {
    kind,
    shell,
    material,
    meshes,
    pulsePhase: Math.random() * Math.PI * 2,
  }
  applyShellTheme(state)
  glowLayer.addMesh(shell, SHELL_THEME[kind].color)
  return state
}

function pulseShell(state: DeviceShellState, timeSec: number): void {
  const theme = SHELL_THEME[state.kind]
  const wave = 0.5 + 0.5 * Math.sin(timeSec * theme.pulseSpeed + state.pulsePhase)

  state.material.alpha = theme.alpha * (0.92 + 0.12 * wave)
  state.material.emissiveColor = theme.color.scale(0.7 + 0.45 * wave)
}

export function createDeviceStatusOverlay(app: AppOrchestrator): DeviceStatusOverlayApi | null {
  const ctx = app.getContext()
  if (!ctx?.scene) return null

  const scene = ctx.scene
  scene.setRenderingAutoClearDepthStencil(SHELL_RENDER_GROUP, false, false, false)

  const glowLayer = new HighlightLayer('deviceStatusShellGlow', scene, {
    blurHorizontalSize: 1.05,
    blurVerticalSize: 1.05,
  })
  glowLayer.innerGlow = true
  glowLayer.outerGlow = true

  const model = () => app.getModelModule()
  const deviceShells = new Map<string, DeviceShellState>()

  const removeDeviceShell = (objectName: string): void => {
    const state = deviceShells.get(objectName)
    if (!state) return
    glowLayer.removeMesh(state.shell)
    state.material.dispose()
    state.shell.dispose()
    deviceShells.delete(objectName)
  }

  const applyDeviceShell = (objectName: string, kind: StatusKind): void => {
    const key = normalizeDeviceName(objectName)
    if (kind === 'none') {
      removeDeviceShell(key)
      return
    }

    const entry = model().getBimDeviceEntry(key)
    if (!entry) return

    const existing = deviceShells.get(key)
    if (existing) {
      if (existing.kind !== kind) {
        glowLayer.removeMesh(existing.shell)
        existing.kind = kind
        applyShellTheme(existing)
        glowLayer.addMesh(existing.shell, SHELL_THEME[kind].color)
      }
      existing.meshes = entry.meshes
      fitShellToMeshes(existing.shell, entry.meshes)
      return
    }

    deviceShells.set(key, createDeviceShell(scene, glowLayer, key, kind, entry.meshes))
  }

  const updateObserver = scene.onBeforeRenderObservable.add(() => {
    if (!deviceShells.size) return
    const t = performance.now() * 0.001
    let maxBlur = 0.95
    for (const state of deviceShells.values()) {
      fitShellToMeshes(state.shell, state.meshes)
      pulseShell(state, t)
      maxBlur = Math.max(maxBlur, 0.75 + 0.45 * Math.sin(t * SHELL_THEME[state.kind].pulseSpeed + state.pulsePhase))
    }
    glowLayer.blurHorizontalSize = maxBlur
    glowLayer.blurVerticalSize = maxBlur
  })

  const applyFromUpdate = (objects: ModelUpdateObject[]): void => {
    let applied = 0
    for (const obj of objects) {
      if (!obj?.objectName) continue
      const kind = resolveOverlayKind(obj.metrics || {})
      if (kind === null) continue
      applyDeviceShell(obj.objectName, kind)
      applied++
    }
    if (applied > 0) {
      console.info(`[deviceStatusShell] updated ${applied} records, shells ${deviceShells.size}`)
    }
  }

  return {
    applyFromUpdate,
    dispose() {
      scene.onBeforeRenderObservable.remove(updateObserver)
      for (const key of [...deviceShells.keys()]) {
        removeDeviceShell(key)
      }
      glowLayer.dispose()
    },
  }
}
