import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Observer } from '@babylonjs/core/Misc/observable'
import type { Scene } from '@babylonjs/core/scene'
import type { ControllerConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

/** panningSensibility 标定距离：靠近时按 radius 比例提高 sensibility，降低屏幕位移感 */
const PANNING_REFERENCE_RADIUS = 80

export class ControllerModule implements SceneModule<ControllerConfig> {
  readonly name = 'controller'
  private ctx: AppContext | null = null
  private contextMenuHandler: ((e: Event) => void) | null = null
  private panScaleObserver: Observer<Scene> | null = null

  create(ctx: AppContext, config: ControllerConfig): void {
    this.ctx = ctx
    this.apply(config)
  }

  apply(config: ControllerConfig): void {
    const camera = this.ctx?.camera
    const canvas = this.ctx?.canvas
    const scene = this.ctx?.scene
    if (!camera || !canvas || !scene) return

    camera.detachControl()
    this.unbindContextMenu(canvas)
    this.unbindPanScale(scene)

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

    this.syncPanningSensibility(config)
    if (config.allowPan && config.attachControl) {
      this.panScaleObserver = scene.onBeforeRenderObservable.add(() => {
        this.syncPanningSensibility(config)
      })
    }
  }

  /** 平移手感随距离收敛：靠近时提高 sensibility，避免拖动过快 */
  private syncPanningSensibility(config: ControllerConfig): void {
    const camera = this.ctx?.camera
    if (!camera) return
    if (!config.allowPan) {
      camera.panningSensibility = 0
      return
    }
    const radius = Math.max(camera.radius, 1)
    camera.panningSensibility =
      config.panningSensibility * (PANNING_REFERENCE_RADIUS / radius)
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

  private unbindPanScale(scene: Scene): void {
    if (this.panScaleObserver) {
      scene.onBeforeRenderObservable.remove(this.panScaleObserver)
      this.panScaleObserver = null
    }
  }

  dispose(): void {
    if (this.ctx?.scene) {
      this.unbindPanScale(this.ctx.scene)
    }
    if (this.ctx?.canvas) {
      this.unbindContextMenu(this.ctx.canvas)
    }
    this.ctx?.camera?.detachControl()
    this.ctx = null
  }
}
