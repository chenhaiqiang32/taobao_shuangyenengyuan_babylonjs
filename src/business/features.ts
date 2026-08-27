/**
 * 业务功能导出文件
 * 仅存放可抛给外部调用的业务 API（显隐、视角切换、后续业务开关等）
 */
import type { AppOrchestrator } from '../core/app'
import type { CameraPose, CameraPoseSnapshot } from '../modules/camera'

/** 屋顶显隐控制部件名称 */
export const ROOF_PART_NAME = '屋顶_控制显隐'

/** 预设视角：能源站 / 末端（相机位置 + 控制器 target） */
export const CAMERA_VIEW_PRESETS = {
  energyStation: {
    position: [165.294, 5.28, -95.199],
    rotationDeg: [-0.39, 105.86, 0],
    target: [-15.422, 3.999, -43.869],
  },
  terminal: {
    position: [227.295, 31.578, -90.585],
    rotationDeg: [-4.63, 125.78, 0],
    target: [38.813, 12.77, 45.262],
  },
} as const satisfies Record<string, CameraPose>

export type CameraViewPresetId = keyof typeof CAMERA_VIEW_PRESETS

export interface BusinessFeatures {
  /** 屋顶部件名称常量 */
  readonly ROOF_PART_NAME: string
  /** 设置任意模型部件显隐 */
  setPartVisible: (partName: string, visible: boolean) => boolean
  /** 切换任意模型部件显隐，返回切换后是否可见；未找到返回 null */
  togglePartVisible: (partName: string) => boolean | null
  /** 查询部件是否可见；未找到返回 null */
  isPartVisible: (partName: string) => boolean | null
  /** 切换屋顶（屋顶_控制显隐）显隐 */
  toggleRoofVisible: () => boolean | null
  /** 设置屋顶显隐 */
  setRoofVisible: (visible: boolean) => boolean
  /** 屋顶当前是否可见 */
  isRoofVisible: () => boolean | null
  /** 按预设切换相机视角（energyStation / terminal） */
  setCameraView: (preset: CameraViewPresetId) => boolean
  /** 按自定义位姿切换相机视角 */
  setCameraPose: (pose: CameraPose) => boolean
  /** 读取当前相机位置与控制器位置 */
  getCameraPose: () => CameraPoseSnapshot | null
  /** 控制台打印当前相机位置与控制器位置 */
  printCameraPose: () => CameraPoseSnapshot | null
}

/**
 * 基于当前 App 实例创建业务功能 API
 */
export function createBusinessFeatures(app: AppOrchestrator): BusinessFeatures {
  const model = () => app.getModelModule()
  const camera = () => app.getCameraModule()

  return {
    ROOF_PART_NAME,

    setPartVisible(partName: string, visible: boolean): boolean {
      return model().setPartVisible(partName, visible)
    },

    togglePartVisible(partName: string): boolean | null {
      return model().togglePartVisible(partName)
    },

    isPartVisible(partName: string): boolean | null {
      return model().isPartVisible(partName)
    },

    toggleRoofVisible(): boolean | null {
      return model().togglePartVisible(ROOF_PART_NAME)
    },

    setRoofVisible(visible: boolean): boolean {
      return model().setPartVisible(ROOF_PART_NAME, visible)
    },

    isRoofVisible(): boolean | null {
      return model().isPartVisible(ROOF_PART_NAME)
    },

    setCameraView(preset: CameraViewPresetId): boolean {
      const pose = CAMERA_VIEW_PRESETS[preset]
      if (!pose) return false
      return camera().setPose(pose)
    },

    setCameraPose(pose: CameraPose): boolean {
      return camera().setPose(pose)
    },

    getCameraPose(): CameraPoseSnapshot | null {
      return camera().getPoseSnapshot()
    },

    printCameraPose(): CameraPoseSnapshot | null {
      return camera().logPose()
    },
  }
}

export type BusinessFeaturesGlobal = {
  __app?: AppOrchestrator
  __business?: BusinessFeatures
}
