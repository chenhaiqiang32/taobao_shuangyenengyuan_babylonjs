import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { ControllerConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

export class ControllerModule implements SceneModule<ControllerConfig> {
  readonly name = 'controller'
  private ctx: AppContext | null = null
  private contextMenuHandler: ((e: Event) => void) | null = null

  create(ctx: AppContext, config: ControllerConfig): void {
    this.ctx = ctx
    this.apply(config)
  }

  apply(config: ControllerConfig): void {
    const camera = this.ctx?.camera
    const canvas = this.ctx?.canvas
    if (!camera || !canvas) return

    camera.detachControl()
    this.unbindContextMenu(canvas)

    if (config.attachControl) {
      camera.attachControl(
        false,
        config.useCtrlForPanning,
        config.panningMouseButton,
      )
      if (!config.useCtrlForPanning && config.panningMouseButton === 2) {
        this.contextMenuHandler = (e) => e.preventDefault()
        canvas.addEventListener('contextmenu', this.contextMenuHandler)
      }
      canvas.focus?.()
    }

    // 控制器默认坐标 → 相机观察目标（轨道中心）
    if (config.target) {
      camera.setTarget(Vector3.FromArray(config.target))
      if (this.ctx?.config.camera) {
        this.ctx.config.camera.target = [config.target[0], config.target[1], config.target[2]]
      }
    }

    camera.inertia = config.inertia
    camera.panningSensibility = config.allowPan ? config.panningSensibility : 0
    camera.angularSensibilityX = config.allowRotate ? config.angularSensibilityX : 1e8
    camera.angularSensibilityY = config.allowRotate ? config.angularSensibilityY : 1e8
    camera.pinchPrecision = config.pinchPrecision

    if (config.allowZoom) {
      camera.wheelDeltaPercentage = config.wheelDeltaPercentage
      camera.wheelPrecision = config.wheelPrecision
    } else {
      camera.wheelDeltaPercentage = 0
      camera.wheelPrecision = 1e8
    }
  }

  /** 由 ModelModule 在绑定包围盒中心时调用 */
  setDefaultTarget(target: Vector3): void {
    const config = this.ctx?.config.controller
    const camera = this.ctx?.camera
    if (!config || !camera) return
    config.target = [target.x, target.y, target.z]
    camera.setTarget(target)
    if (this.ctx?.config.camera) {
      this.ctx.config.camera.target = [target.x, target.y, target.z]
    }
  }

  private unbindContextMenu(canvas: HTMLCanvasElement): void {
    if (this.contextMenuHandler) {
      canvas.removeEventListener('contextmenu', this.contextMenuHandler)
      this.contextMenuHandler = null
    }
  }

  dispose(): void {
    if (this.ctx?.canvas) {
      this.unbindContextMenu(this.ctx.canvas)
    }
    this.ctx?.camera?.detachControl()
    this.ctx = null
  }
}
