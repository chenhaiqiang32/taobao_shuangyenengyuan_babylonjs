export type Vec3 = [number, number, number]
export type Color3Tuple = [number, number, number]
export type Color4Tuple = [number, number, number, number]

export interface EngineConfig {
  antialias: boolean
  adaptToDeviceRatio: boolean
  hardwareScalingLevel: number
}

export interface FogConfig {
  enabled: boolean
  mode: 'none' | 'exp' | 'exp2' | 'linear'
  color: Color3Tuple
  density: number
  start: number
  end: number
}

export interface SceneConfig {
  clearColor: Color4Tuple
  ambientColor: Color3Tuple
  environmentIntensity: number
  fog: FogConfig
}

export interface CameraConfig {
  type: 'arcRotate'
  name: string
  alpha: number
  beta: number
  radius: number
  target: Vec3
  minZ: number
  maxZ: number
  lowerRadiusLimit: number | null
  upperRadiusLimit: number | null
  lowerBetaLimit: number | null
  upperBetaLimit: number | null
  fov: number
}

export interface ControllerConfig {
  attachControl: boolean
  /** 控制器默认坐标（通常为绑定模型包围盒中心） */
  target: Vec3
  /** 越小平移越灵敏（Babylon：位移 ∝ 1/panningSensibility） */
  panningSensibility: number
  /** wheelDeltaPercentage 为 0 时生效；越大缩放越慢 */
  wheelPrecision: number
  /** >0 时按半径比例缩放，大场景必须用这个才能正常滚轮缩放 */
  wheelDeltaPercentage: number
  angularSensibilityX: number
  angularSensibilityY: number
  inertia: number
  pinchPrecision: number
  /** false：右键直接平移，无需按住 Ctrl */
  useCtrlForPanning: boolean
  /** 0 左键 / 1 中键 / 2 右键 */
  panningMouseButton: number
  allowPan: boolean
  allowZoom: boolean
  allowRotate: boolean
}

export type LightType = 'hemispheric' | 'directional' | 'point'

export interface LightConfig {
  id: string
  type: LightType
  enabled: boolean
  intensity: number
  color: Color3Tuple
  direction?: Vec3
  position?: Vec3
  specular?: Color3Tuple
}

export interface SkyboxConfig {
  enabled: boolean
  /** HDR/ENV 环境贴图路径（用于 IBL 光照与反射） */
  hdrUrl: string
  format: 'env' | 'hdr'
  size: number
  blur: number
  /** 是否把 HDR/ENV 赋给 scene.environmentTexture（不影响背景图） */
  asEnvironmentTexture: boolean
  /** 是否显示天空/背景网格 */
  showMesh: boolean
  /**
   * 场景背景全景图（等距柱状 JPG/PNG），仅作背景显示，不参与 IBL。
   * 有值时用 PhotoDome 显示；无值且 showMesh 时回退用 HDR 天空盒。
   */
  backgroundUrl: string
  rotationY: number
  level: number
  hdrSize: number
}

export interface ModelAnimationConfig {
  /** 动画组名称（来自 GLB AnimationGroup.name） */
  name: string
  /** 是否播放 */
  play: boolean
  /** 是否循环 */
  loop: boolean
  /** 播放速率 */
  speedRatio: number
}

export interface ModelConfig {
  url: string
  enabled: boolean
  position: Vec3
  rotation: Vec3
  scaling: Vec3
  autoCenter: boolean
  autoFitCamera: boolean
  receiveShadows: boolean
  castShadows: boolean
  /** 加载后是否默认播放全部动画（写入各 animation.play 的初始值） */
  playAnimationsByDefault: boolean
  /** 模型动画清单：加载时自动同步记录，可逐个控制 */
  animations: ModelAnimationConfig[]
  /**
   * 修复透明材质深度/叠加排序（旋转相机时透明面消失）。
   * 对 Alpha 混合材质开启 depthPrePass + forceDepthWrite。
   */
  fixTransparentDepth: boolean
}

export interface SettingsConfig {
  exposure: number
  contrast: number
  toneMappingEnabled: boolean
  toneMappingType: 'standard' | 'aces'
  shadowsEnabled: boolean
  inspectorEnabled: boolean
  showFps: boolean
}

export interface SceneAppConfig {
  version: number
  /**
   * 控制器绑定的模型名称。
   * 加载后按该名称节点的包围盒中心设置控制器默认坐标，
   * 并按中心 + 包围盒半径 × cameraRadiusFactor 设置相机默认位置。
   */
  controlsModelName: string
  /** 相机默认半径 = 绑定模型包围盒半径 × 该系数（本项目默认 1） */
  cameraRadiusFactor: number
  engine: EngineConfig
  scene: SceneConfig
  camera: CameraConfig
  controller: ControllerConfig
  lights: LightConfig[]
  skybox: SkyboxConfig
  model: ModelConfig
  settings: SettingsConfig
}

export type ConfigSection = keyof SceneAppConfig
