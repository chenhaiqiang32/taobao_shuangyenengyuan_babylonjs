/**
 * 设备拾取 + 信息牌：点击「设备_指定名称」下 BIM_* 设备弹出指标牌
 * 悬停 / 选中：按包围盒叠加自发光罩（不改模型材质）
 */
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { AppOrchestrator } from '../core/app'
import type { BimDeviceEntry } from '../modules/model'
import { getDeviceMetrics, formatDeviceDisplayName } from './deviceMetrics'
import { DeviceEmissiveHighlight } from './deviceEmissiveHighlight'
import { createDeviceInfoPanel, type DeviceInfoPanelApi } from '../ui/deviceInfoPanel'
import { postDeviceClick } from '../message/postMessage'

/** 悬停：淡绿色底部发光 */
const HOVER_COLOR = Color3.FromHexString('#7DFF9A')
/** 选中：稍深绿色底部发光 */
const SELECTED_COLOR = Color3.FromHexString('#22C55E')

export interface DeviceInteractionApi {
  panel: DeviceInfoPanelApi
  dispose: () => void
}

export function createDeviceInteraction(app: AppOrchestrator): DeviceInteractionApi | null {
  const ctx = app.getContext()
  if (!ctx?.scene || !ctx.camera) {
    console.warn('[deviceInteraction] scene/camera 未就绪')
    return null
  }

  const scene = ctx.scene
  const canvas = ctx.canvas
  const model = () => app.getModelModule()
  const boundsFx = new DeviceEmissiveHighlight(scene)

  let pinnedObjectName: string | null = null

  const refreshHighlight = (): void => {
    if (pinnedObjectName) {
      const pinned = model().getBimDeviceEntry(pinnedObjectName)
      if (pinned) boundsFx.applySelected(pinned.meshes, SELECTED_COLOR)
      else boundsFx.clearSelected()
    } else {
      boundsFx.clearSelected()
    }

    const hover = model().pickDeviceAtPointer()
    if (hover && hover.objectName !== pinnedObjectName) {
      boundsFx.applyHover(hover.meshes, HOVER_COLOR)
      canvas.style.cursor = 'pointer'
    } else {
      boundsFx.clearHover()
      canvas.style.cursor = hover || pinnedObjectName ? 'pointer' : 'default'
    }
  }

  const panel = createDeviceInfoPanel(scene, ctx.camera as Camera, {
    onClose: () => {
      pinnedObjectName = null
      refreshHighlight()
    },
  })

  const openForDevice = (entry: BimDeviceEntry): void => {
    pinnedObjectName = entry.objectName
    refreshHighlight()

    const metrics = getDeviceMetrics(entry.objectName) ?? {}
    const title = formatDeviceDisplayName(entry.objectName)
    panel.show(entry.objectName, title, metrics, entry.node)
    postDeviceClick({ objectName: entry.objectName, metrics })
  }

  const observer = scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
      refreshHighlight()
      return
    }

    if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return
    if (pointerInfo.event.button !== 0) return

    const entry = model().pickDeviceAtPointer()
    if (!entry) return

    if (panel.isOpen() && panel.getObjectName() === entry.objectName) {
      pinnedObjectName = null
      panel.hide()
      refreshHighlight()
      return
    }

    openForDevice(entry)
  })

  const indexed = model().getBimDeviceEntries().length
  console.info(`[deviceInteraction] ready, indexed devices=${indexed}`)

  return {
    panel,
    dispose() {
      scene.onPointerObservable.remove(observer)
      pinnedObjectName = null
      boundsFx.dispose()
      panel.dispose()
    },
  }
}
