import { ArcRotateCamera, ComputeAlpha, ComputeBeta } from '@babylonjs/core/Cameras/arcRotateCamera'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraMouseWheelInput'
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraKeyboardMoveInput'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Observer } from '@babylonjs/core/Misc/observable'
import type { Scene } from '@babylonjs/core/scene'
import type { CameraConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

/** 相机位姿：优先用 position + target；无 target 时用旋转推算 */
export type CameraPose = {
  position: [number, number, number]
  /** 控制器轨道中心（camera target）；有则优先使用 */
  target?: [number, number, number]
  /** Euler XYZ，单位度；仅在无 target 时用于推算视线 */
  rotationDeg?: [number, number, number]
  /** 无 target 时的视线落点距离；默认 80 */
  lookDistance?: number
}

export type SetCameraPoseOptions = {
  /** 过渡时长（毫秒）；0 为立即切换。默认 900 */
  durationMs?: number
}

/** 当前相机 / 控制器位姿快照 */
export type CameraPoseSnapshot = {
  cameraPosition: [number, number, number]
  cameraRotationDeg: [number, number, number]
  /** 控制器轨道中心（camera target） */
  controllerTarget: [number, number, number]
  alpha: number
  beta: number
  radius: number
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** alpha 走最短角路径 */
function shortestAngleDelta(from: number, to: number): number {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

function resolvePoseTarget(pose: CameraPose, eye: Vector3): Vector3 | null {
  if (pose.target) return Vector3.FromArray(pose.target)
  if (!pose.rotationDeg) return null

  const lookDistance = pose.lookDistance ?? 80
  const [rx, ry, rz] = pose.rotationDeg.map((d) => (d * Math.PI) / 180)
  const quat = Quaternion.FromEulerAngles(rx, ry, rz)
  const forward = Vector3.Forward().applyRotationQuaternion(quat)
  if (forward.lengthSquared() < 1e-8) return null
  forward.normalize()
  return eye.add(forward.scale(lookDistance))
}

export class CameraModule implements SceneModule<CameraConfig> {
  readonly name = 'camera'
  private ctx: AppContext | null = null
  private poseAnimObserver: Observer<Scene> | null = null
  private poseAnimToken = 0
  private readonly poseAnimTempTarget = new Vector3()

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

  /**
   * 切换 ArcRotateCamera 视角（默认带过渡动画）。
   * 优先：position + target；否则用旋转推算 target。
   */
  setPose(pose: CameraPose, options?: SetCameraPoseOptions): boolean {
    const camera = this.ctx?.camera
    const scene = this.ctx?.scene
    if (!camera || !scene) return false

    const eye = Vector3.FromArray(pose.position)
    const target = resolvePoseTarget(pose, eye)
    if (!target) return false

    const offset = eye.subtract(target)
    const endRadius = Math.max(offset.length(), 0.01)
    const endAlpha = ComputeAlpha(offset)
    const endBeta = ComputeBeta(offset.y, endRadius)
    const durationMs = options?.durationMs ?? 900

    if (durationMs <= 0) {
      this.stopPoseAnimation()
      this.applyPoseImmediate(camera, eye, target)
      return true
    }

    const startAlpha = camera.alpha
    const startBeta = camera.beta
    const startRadius = camera.radius
    const startTarget = camera.getTarget().clone()
    const alphaDelta = shortestAngleDelta(startAlpha, endAlpha)
    const betaDelta = endBeta - startBeta
    const radiusDelta = endRadius - startRadius

    this.stopPoseAnimation()
    const token = ++this.poseAnimToken
    const startedAt = performance.now()

    this.poseAnimObserver = scene.onBeforeRenderObservable.add(() => {
      if (token !== this.poseAnimToken || !this.ctx?.camera) return

      const t = Math.min(1, (performance.now() - startedAt) / durationMs)
      const e = easeInOutCubic(t)

      camera.alpha = startAlpha + alphaDelta * e
      camera.beta = startBeta + betaDelta * e
      camera.radius = startRadius + radiusDelta * e
      Vector3.LerpToRef(startTarget, target, e, this.poseAnimTempTarget)
      camera.setTarget(this.poseAnimTempTarget)

      if (t >= 1) {
        this.stopPoseAnimation()
        this.applyPoseImmediate(camera, eye, target)
      }
    })

    return true
  }

  private applyPoseImmediate(camera: ArcRotateCamera, eye: Vector3, target: Vector3): void {
    camera.setTarget(target)
    camera.setPosition(eye)
    camera.rebuildAnglesAndRadius()
    this.syncConfigFromCamera(camera, target)
  }

  private syncConfigFromCamera(camera: ArcRotateCamera, target: Vector3): void {
    const config = this.ctx?.config.camera
    if (!config) return
    config.target = [target.x, target.y, target.z]
    config.alpha = camera.alpha
    config.beta = camera.beta
    config.radius = camera.radius
    if (this.ctx?.config.controller) {
      this.ctx.config.controller.target = [target.x, target.y, target.z]
    }
  }

  stopPoseAnimation(): void {
    if (this.poseAnimObserver && this.ctx?.scene) {
      this.ctx.scene.onBeforeRenderObservable.remove(this.poseAnimObserver)
    }
    this.poseAnimObserver = null
  }

  /** 读取当前相机位置、旋转与控制器（轨道目标）位置 */
  getPoseSnapshot(): CameraPoseSnapshot | null {
    const camera = this.ctx?.camera
    if (!camera) return null

    const pos = camera.position
    const target = camera.getTarget()
    // ArcRotateCamera 朝向由 target 决定；用世界矩阵提取 Euler，便于与 Inspector 对照
    const rot = Quaternion.FromRotationMatrix(camera.getWorldMatrix()).toEulerAngles()
    const toDeg = (r: number) => (r * 180) / Math.PI

    return {
      cameraPosition: [round3(pos.x), round3(pos.y), round3(pos.z)],
      cameraRotationDeg: [round2(toDeg(rot.x)), round2(toDeg(rot.y)), round2(toDeg(rot.z))],
      controllerTarget: [round3(target.x), round3(target.y), round3(target.z)],
      alpha: round4(camera.alpha),
      beta: round4(camera.beta),
      radius: round3(camera.radius),
    }
  }

  /** 控制台打印当前相机 / 控制器位姿 */
  logPose(): CameraPoseSnapshot | null {
    const snap = this.getPoseSnapshot()
    if (!snap) {
      console.warn('[camera] 相机未就绪')
      return null
    }
    console.log(
      '[camera] 相机位置',
      snap.cameraPosition,
      '旋转(°)',
      snap.cameraRotationDeg,
      '\n[camera] 控制器位置(target)',
      snap.controllerTarget,
      '\n[camera] alpha/beta/radius',
      snap.alpha,
      snap.beta,
      snap.radius,
    )
    return snap
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
    this.stopPoseAnimation()
    this.ctx?.camera?.dispose()
    if (this.ctx) this.ctx.camera = null
    this.ctx = null
  }
}
