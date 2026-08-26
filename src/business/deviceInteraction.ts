/**
 * 设备拾取 + 信息牌：点击「设备_指定名称」下 BIM_* 设备弹出指标牌
 * 悬停 / 选中使用 mesh 自发光叠加（非轮廓光）
 */
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { AppOrchestrator } from '../core/app'
import type { BimDeviceEntry } from '../modules/model'
import { getDeviceMetrics, normalizeDeviceName } from './deviceMetrics'
import { DeviceEmissiveHighlight } from './deviceEmissiveHighlight'
import { createDeviceInfoPanel, type DeviceInfoPanelApi } from '../ui/deviceInfoPanel'
import { postDeviceClick } from '../message/postMessage'

/** 悬停：浅青自发光 */
const HOVER_EMISSIVE = Color3.FromHexString('#66F0FF')
const HOVER_INTENSITY = 0.42

/** 选中（信息牌打开）：琥珀自发光 */
const SELECTED_EMISSIVE = Color3.FromHexString('#FFB020')
const SELECTED_INTENSITY = 0.62

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
  const emissiveFx = new DeviceEmissiveHighlight()

  let pinnedObjectName: string | null = null

  const refreshEmissive = (): void => {
    if (pinnedObjectName) {
      const pinned = model().getBimDeviceEntry(pinnedObjectName)
      if (pinned) emissiveFx.applySelected(pinned.meshes, SELECTED_EMISSIVE, SELECTED_INTENSITY)
      else emissiveFx.clearSelected()
    } else {
      emissiveFx.clearSelected()
    }

    const hover = model().pickDeviceAtPointer()
    if (hover && hover.objectName !== pinnedObjectName) {
      emissiveFx.applyHover(hover.meshes, HOVER_EMISSIVE, HOVER_INTENSITY)
      canvas.style.cursor = 'pointer'
    } else {
      emissiveFx.clearHover()
      canvas.style.cursor = hover || pinnedObjectName ? 'pointer' : 'default'
    }
  }

  const panel = createDeviceInfoPanel(scene, ctx.camera as Camera, {
    onClose: () => {
      pinnedObjectName = null
      refreshEmissive()
    },
  })

  const openForDevice = (entry: BimDeviceEntry): void => {
    pinnedObjectName = entry.objectName
    refreshEmissive()

    const metrics = getDeviceMetrics(entry.objectName) ?? {}
    const title = `${normalizeDeviceName(entry.objectName)}详情`
    panel.show(entry.objectName, title, metrics, entry.node)
    postDeviceClick({ objectName: entry.objectName, metrics })
  }

  const observer = scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
      refreshEmissive()
      return
    }

    if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return
    if (pointerInfo.event.button !== 0) return

    const entry = model().pickDeviceAtPointer()
    if (!entry) return

    if (panel.isOpen() && panel.getObjectName() === entry.objectName) {
      pinnedObjectName = null
      panel.hide()
      refreshEmissive()
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
      emissiveFx.dispose()
      panel.dispose()
    },
  }
}
