/**
 * 业务功能导出文件
 * 仅存放可抛给外部调用的业务 API（显隐、后续业务开关等）
 */
import type { AppOrchestrator } from '../core/app'

/** 屋顶显隐控制部件名称 */
export const ROOF_PART_NAME = '屋顶_控制显隐'

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
}

/**
 * 基于当前 App 实例创建业务功能 API
 */
export function createBusinessFeatures(app: AppOrchestrator): BusinessFeatures {
  const model = () => app.getModelModule()

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
  }
}

export type BusinessFeaturesGlobal = {
  __app?: AppOrchestrator
  __business?: BusinessFeatures
}
