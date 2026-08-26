/**
 * CSS2D 风格设备信息牌（HTML 叠加 + 世界坐标投影）
 * 视觉参考：深色半透明底、青色描边、标题+关闭、左右两列键值
 */
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Scene } from '@babylonjs/core/scene'
import { postDevicePanelClose } from '../message/postMessage'

export interface DeviceInfoPanelOptions {
  /** 牌子关闭时回调（含点击关闭按钮） */
  onClose?: () => void
}

export interface DeviceInfoPanelApi {
  show: (
    objectName: string,
    title: string,
    metrics: Record<string, string | number>,
    anchor: AbstractMesh | TransformNode,
  ) => void
  hide: () => void
  isOpen: () => boolean
  getObjectName: () => string | null
  /** 指标刷新时若正打开同一设备则更新内容 */
  refreshIfSame: (objectName: string, metrics: Record<string, string | number>) => void
  dispose: () => void
}

function formatValue(v: string | number): string {
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : v.toFixed(1)
  }
  return String(v)
}

export function createDeviceInfoPanel(
  scene: Scene,
  camera: Camera,
  options?: DeviceInfoPanelOptions,
): DeviceInfoPanelApi {
  const LINK_GAP = 24

  const linkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  linkSvg.setAttribute('class', 'device-info-panel__link-layer')
  linkSvg.innerHTML = `
    <line class="device-info-panel__link-line"></line>
    <circle class="device-info-panel__link-dot" r="4"></circle>
  `
  document.body.appendChild(linkSvg)
  const linkLine = linkSvg.querySelector('.device-info-panel__link-line') as SVGLineElement
  const linkDot = linkSvg.querySelector('.device-info-panel__link-dot') as SVGCircleElement

  const root = document.createElement('div')
  root.className = 'device-info-panel'
  root.hidden = true
  root.innerHTML = `
    <div class="device-info-panel__header">
      <span class="device-info-panel__title"></span>
      <button type="button" class="device-info-panel__close" aria-label="关闭">×</button>
    </div>
    <div class="device-info-panel__body"></div>
    <div class="device-info-panel__arrow" aria-hidden="true"></div>
  `
  document.body.appendChild(root)

  const titleEl = root.querySelector('.device-info-panel__title') as HTMLElement
  const bodyEl = root.querySelector('.device-info-panel__body') as HTMLElement
  const closeBtn = root.querySelector('.device-info-panel__close') as HTMLButtonElement

  let currentName: string | null = null
  let anchor: AbstractMesh | TransformNode | null = null
  const worldPos = new Vector3()
  const engine = scene.getEngine()

  const renderRows = (metrics: Record<string, string | number>): void => {
    const keys = Object.keys(metrics)
    if (!keys.length) {
      bodyEl.innerHTML = `<div class="device-info-panel__empty">暂无指标数据</div>`
      return
    }
    bodyEl.innerHTML = keys
      .map(
        (k) =>
          `<div class="device-info-panel__row"><span class="device-info-panel__label">${escapeHtml(k)}</span><span class="device-info-panel__value">${escapeHtml(formatValue(metrics[k]))}</span></div>`,
      )
      .join('')
  }

  const hide = (): void => {
    const closed = currentName
    root.hidden = true
    setLinkVisible(false)
    currentName = null
    anchor = null
    if (closed) {
      postDevicePanelClose(closed)
      options?.onClose?.()
    }
  }

  const setLinkVisible = (visible: boolean): void => {
    if (visible) {
      linkSvg.removeAttribute('hidden')
      linkSvg.style.visibility = 'visible'
    } else {
      linkSvg.setAttribute('hidden', '')
      linkSvg.style.visibility = 'hidden'
    }
  }

  const updateLinkLine = (fromX: number, fromY: number, toX: number, toY: number): void => {
    linkLine.setAttribute('x1', String(fromX))
    linkLine.setAttribute('y1', String(fromY))
    linkLine.setAttribute('x2', String(toX))
    linkLine.setAttribute('y2', String(toY))
    linkDot.setAttribute('cx', String(toX))
    linkDot.setAttribute('cy', String(toY))
  }

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    hide()
  })

  const observer = scene.onBeforeRenderObservable.add(() => {
    if (root.hidden || !anchor || !camera) return
    try {
      const bbox = (anchor as AbstractMesh).getHierarchyBoundingVectors(true)
      worldPos.copyFrom(bbox.max).addInPlace(bbox.min).scaleInPlace(0.5)
      worldPos.y = bbox.max.y
    } catch {
      worldPos.copyFrom(anchor.getAbsolutePosition())
    }

    const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
    const projected = Vector3.Project(
      worldPos,
      Matrix.Identity(),
      scene.getTransformMatrix(),
      viewport,
    )

    // 在视锥外则隐藏牌面与连线
    if (projected.z < 0 || projected.z > 1) {
      root.style.visibility = 'hidden'
      setLinkVisible(false)
      return
    }

    const canvas = engine.getRenderingCanvas()
    const canvasRect = canvas?.getBoundingClientRect()
    const ox = canvasRect?.left ?? 0
    const oy = canvasRect?.top ?? 0
    const anchorX = ox + projected.x
    const anchorY = oy + projected.y

    root.style.visibility = 'visible'
    root.style.left = `${anchorX}px`
    root.style.top = `${anchorY}px`
    root.style.transform = 'translate(-50%, calc(-100% - var(--panel-link-gap, 24px)))'

    const rect = root.getBoundingClientRect()
    const fromX = rect.left + rect.width / 2
    const fromY = rect.bottom
    updateLinkLine(fromX, fromY, anchorX, anchorY)
    setLinkVisible(true)
  })

  return {
    show(objectName, title, metrics, anchorNode) {
      currentName = objectName
      anchor = anchorNode
      titleEl.textContent = title || `${objectName}详情`
      renderRows(metrics)
      root.hidden = false
      setLinkVisible(true)
      root.style.visibility = 'visible'
      root.style.setProperty('--panel-link-gap', `${LINK_GAP}px`)
    },
    hide,
    isOpen: () => !root.hidden && !!currentName,
    getObjectName: () => currentName,
    refreshIfSame(objectName, metrics) {
      if (!currentName) return
      const a = objectName.replace(/_+$/g, '')
      const b = currentName.replace(/_+$/g, '')
      if (a === b) renderRows(metrics)
    },
    dispose() {
      scene.onBeforeRenderObservable.remove(observer)
      root.remove()
      linkSvg.remove()
      currentName = null
      anchor = null
    },
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
