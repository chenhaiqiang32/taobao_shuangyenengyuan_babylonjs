import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraMouseWheelInput'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraKeyboardMoveInput'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { CameraConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

export class CameraModule implements SceneModule<CameraConfig> {
  readonly name = 'camera'
  private ctx: AppContext | null = null

  create(ctx: AppContext, config: CameraConfig): void {
    this.ctx = ctx
    const camera = new ArcRotateCamera(
      config.name,
      config.alpha,
      config.beta,
      config.radius,
      Vector3.FromArray(config.target),
      ctx.scene,
    )
    // 控制器绑定交给 ControllerModule，避免重复 attach 参数不一致
    ctx.camera = camera
    ctx.scene.activeCamera = camera
    this.apply(config)
  }

  apply(config: CameraConfig): void {
    const camera = this.ctx?.camera
    if (!camera) return

    camera.name = config.name
    camera.alpha = config.alpha
    camera.beta = config.beta
    camera.radius = config.radius
    camera.setTarget(Vector3.FromArray(config.target))
    camera.minZ = config.minZ
    camera.maxZ = config.maxZ
    camera.fov = config.fov
    camera.lowerRadiusLimit = config.lowerRadiusLimit
    camera.upperRadiusLimit = config.upperRadiusLimit
    camera.lowerBetaLimit = config.lowerBetaLimit
    camera.upperBetaLimit = config.upperBetaLimit
  }

  /** 供 ModelModule 自动适配相机时写回运行时参数（不改 JSON 文件） */
  fitToBoundingRadius(target: Vector3, radius: number): void {
    const camera = this.ctx?.camera
    const config = this.ctx?.config.camera
    if (!camera || !config) return
    const safeRadius = Math.max(radius, 5)

    // 缩放范围：允许拉远到约 5 倍适配半径
    const neededUpper = safeRadius * 5
    if (config.upperRadiusLimit == null || config.upperRadiusLimit < neededUpper) {
      config.upperRadiusLimit = neededUpper
      camera.upperRadiusLimit = neededUpper
    }
    if (config.lowerRadiusLimit != null && safeRadius < config.lowerRadiusLimit) {
      config.lowerRadiusLimit = Math.max(0.5, safeRadius * 0.05)
      camera.lowerRadiusLimit = config.lowerRadiusLimit
    }

    // 远裁剪面：覆盖「相机距离 + 模型直径」，避免厂房远端被切掉
    const neededMaxZ = Math.max(safeRadius * 8, config.maxZ)
    if (neededMaxZ > config.maxZ) {
      config.maxZ = neededMaxZ
      camera.maxZ = neededMaxZ
    }

    camera.setTarget(target)
    camera.radius = safeRadius
    config.target = [target.x, target.y, target.z]
    config.radius = safeRadius
  }

  dispose(): void {
    this.ctx?.camera?.dispose()
    if (this.ctx) this.ctx.camera = null
    this.ctx = null
  }
}
