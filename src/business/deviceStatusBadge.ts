/**
 * 常显设备信息浮窗（HTML 投影）
 * - BIM_射流风机 / BIM_卧式风柜：显示中间名称，颜色区分运行状态
 * - BIM_末端温度：显示温度
 */
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { AppOrchestrator } from '../core/app'
import type { ModelUpdateObject } from '../message/types'
import { formatDeviceDisplayName, normalizeDeviceName } from './deviceMetrics'

const PREFIX_JET_FAN = 'BIM_射流风机'
const PREFIX_CABINET = 'BIM_卧式风柜'
const PREFIX_TERMINAL_TEMP = 'BIM_末端温度'

type BadgeTone = 'running' | 'fault' | 'stopped' | 'temp'

interface BadgeSpec {
  text: string
  tone: BadgeTone
}

interface BadgeState {
  el: HTMLElement
  textEl: HTMLElement
  objectName: string
  anchor: AbstractMesh | TransformNode
  text: string
  tone: BadgeTone
}

export interface DeviceStatusBadgeOptions {
  /** 点击牌子：与点击对应模型一致 */
  onBadgeClick?: (objectName: string) => void
}

export interface DeviceStatusBadgeApi {
  applyFromUpdate: (objects: ModelUpdateObject[]) => void
  dispose: () => void
}

function readMetric(
  metrics: Record<string, string | number>,
  name: string,
): number | null {
  if (name in metrics) return Number(metrics[name])
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith(name)) return Number(value)
  }
  return null
}

function formatTemp(value: number): string {
  return Number.isInteger(value) ? `${value}℃` : `${value.toFixed(1)}℃`
}

/** 射流风机：故障=1 红；运行=1 绿；运行=0 灰 */
function resolveJetFanBadge(
  objectName: string,
  metrics: Record<string, string | number>,
): BadgeSpec {
  const fault = readMetric(metrics, '故障状态')
  const running = readMetric(metrics, '运行状态')
  let tone: BadgeTone = 'stopped'
  if (fault === 1) tone = 'fault'
  else if (running === 1) tone = 'running'
  return { text: formatDeviceDisplayName(objectName), tone }
}

/** 卧式风柜：阀门开度 或 阀门开度反馈 任一 > 0 绿，否则灰 */
function resolveCabinetBadge(
  objectName: string,
  metrics: Record<string, string | number>,
): BadgeSpec {
  const open = '阀门开度' in metrics ? Number(metrics['阀门开度']) : null
  const feedback = '阀门开度反馈' in metrics ? Number(metrics['阀门开度反馈']) : null
  const isOpen =
    (open !== null && !Number.isNaN(open) && open > 0) ||
    (feedback !== null && !Number.isNaN(feedback) && feedback > 0)
  return {
    text: formatDeviceDisplayName(objectName),
    tone: isOpen ? 'running' : 'stopped',
  }
}

/** 末端温度：展示温度值 */
function resolveTerminalTempBadge(
  metrics: Record<string, string | number>,
): BadgeSpec | null {
  const temp = readMetric(metrics, '温度')
  if (temp === null || Number.isNaN(temp)) return null
  return { text: formatTemp(temp), tone: 'temp' }
}

export function resolveDeviceStatusBadge(
  objectName: string,
  metrics: Record<string, string | number>,
): BadgeSpec | null {
  const name = String(objectName || '')
  if (name.startsWith(PREFIX_JET_FAN)) {
    return resolveJetFanBadge(name, metrics)
  }
  if (name.startsWith(PREFIX_CABINET)) {
    return resolveCabinetBadge(name, metrics)
  }
  if (name.startsWith(PREFIX_TERMINAL_TEMP)) {
    return resolveTerminalTempBadge(metrics)
  }
  return null
}

export function createDeviceStatusBadge(
  app: AppOrchestrator,
  options?: DeviceStatusBadgeOptions,
): DeviceStatusBadgeApi | null {
  const ctx = app.getContext()
  if (!ctx?.scene || !ctx.camera) {
    console.warn('[deviceStatusBadge] scene/camera 未就绪')
    return null
  }

  const scene = ctx.scene
  const camera = ctx.camera as Camera
  const engine = scene.getEngine()
  const model = () => app.getModelModule()
  const worldPos = new Vector3()

  const layer = document.createElement('div')
  layer.className = 'device-status-badges'
  document.body.appendChild(layer)

  const badges = new Map<string, BadgeState>()

  const ensureBadge = (
    key: string,
    anchor: AbstractMesh | TransformNode,
    spec: BadgeSpec,
  ): void => {
    let state = badges.get(key)
    if (!state) {
      const el = document.createElement('div')
      el.className = 'device-status-badge'
      el.setAttribute('role', 'button')
      el.tabIndex = 0
      el.innerHTML =
        '<span class="device-status-badge__text"></span><span class="device-status-badge__arrow" aria-hidden="true"></span>'
      el.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        options?.onBadgeClick?.(key)
      })
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        options?.onBadgeClick?.(key)
      })
      layer.appendChild(el)
      const textEl = el.querySelector('.device-status-badge__text') as HTMLElement
      state = { el, textEl, objectName: key, anchor, text: '', tone: 'stopped' }
      badges.set(key, state)
    }
    state.anchor = anchor
    state.objectName = key
    if (state.text !== spec.text) {
      state.text = spec.text
      state.textEl.textContent = spec.text
      state.el.title = spec.text
    }
    if (state.tone !== spec.tone) {
      state.tone = spec.tone
      state.el.dataset.tone = spec.tone
      state.el.classList.toggle('device-status-badge--temp', spec.tone === 'temp')
    }
  }

  const observer = scene.onBeforeRenderObservable.add(() => {
    if (!badges.size) return
    const canvas = engine.getRenderingCanvas()
    const canvasRect = canvas?.getBoundingClientRect()
    const ox = canvasRect?.left ?? 0
    const oy = canvasRect?.top ?? 0
    const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
    const transform = scene.getTransformMatrix()

    for (const state of badges.values()) {
      try {
        const bbox = (state.anchor as AbstractMesh).getHierarchyBoundingVectors(true)
        worldPos.copyFrom(bbox.max).addInPlace(bbox.min).scaleInPlace(0.5)
        worldPos.y = bbox.max.y
      } catch {
        worldPos.copyFrom(state.anchor.getAbsolutePosition())
      }

      const projected = Vector3.Project(worldPos, Matrix.Identity(), transform, viewport)
      if (projected.z < 0 || projected.z > 1) {
        state.el.style.visibility = 'hidden'
        continue
      }

      state.el.style.visibility = 'visible'
      state.el.style.left = `${ox + projected.x}px`
      state.el.style.top = `${oy + projected.y}px`
    }
  })

  const applyFromUpdate = (objects: ModelUpdateObject[]): void => {
    let applied = 0
    let missed = 0
    for (const obj of objects) {
      if (!obj?.objectName) continue
      const spec = resolveDeviceStatusBadge(obj.objectName, obj.metrics || {})
      if (!spec) continue

      const key = normalizeDeviceName(obj.objectName)
      const entry = model().getBimDeviceEntry(key)
      if (!entry) {
        missed++
        console.warn(`[deviceStatusBadge] 未找到模型节点: ${obj.objectName}`)
        continue
      }

      ensureBadge(key, entry.node, spec)
      applied++
    }
    if (applied > 0 || missed > 0) {
      console.info(`[deviceStatusBadge] updated ${applied}, missed=${missed}, badges=${badges.size}`)
    }
  }

  return {
    applyFromUpdate,
    dispose() {
      scene.onBeforeRenderObservable.remove(observer)
      for (const state of badges.values()) state.el.remove()
      badges.clear()
      layer.remove()
    },
  }
}
