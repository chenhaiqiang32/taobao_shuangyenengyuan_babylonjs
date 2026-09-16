/**
 * 业务功能导出文件
 * 仅存放可抛给外部调用的业务 API（显隐、视角切换、后续业务开关等）
 */
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Material } from '@babylonjs/core/Materials/material'
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial'
import type { AppOrchestrator } from '../core/app'
import type { CameraPose, CameraPoseSnapshot } from '../modules/camera'

/** 屋顶显隐控制部件名称 */
export const ROOF_PART_NAME = '屋顶_控制显隐'

/** 管道分组：加载后将其下 mesh 材质改为半透明，便于看清管内流光 */
export const PIPE_GROUP_NAME = '设备_管道'

/** 管道外壳半透明 alpha（1=不透明） */
const PIPE_SHELL_ALPHA = 0.45

/** 预设视角：能源站 / 末端（相机位置 + 控制器 target） */
export const CAMERA_VIEW_PRESETS = {
  energyStation: {
    position: [129.411, 23.344, -87.878],
    rotationDeg: [-28.73, 91.95, 0],
    target: [24.326, -34.294, -84.309],
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
  /** 管道分组名称常量 */
  readonly PIPE_GROUP_NAME: string
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
  /** 将「设备_管道」下 mesh 材质改为半透明 */
  applyPipeGroupTransparency: (alpha?: number) => number
  /** 按预设切换相机视角（energyStation / terminal） */
  setCameraView: (preset: CameraViewPresetId) => boolean
  /** 按自定义位姿切换相机视角 */
  setCameraPose: (pose: CameraPose) => boolean
  /** 读取当前相机位置与控制器位置 */
  getCameraPose: () => CameraPoseSnapshot | null
  /** 控制台打印当前相机位置与控制器位置 */
  printCameraPose: () => CameraPoseSnapshot | null
}

function setMaterialSemiTransparent(mat: Material, alpha: number, cloneCache: Map<Material, Material>): Material {
  const cached = cloneCache.get(mat)
  if (cached) return cached

  if (mat instanceof MultiMaterial) {
    const clone = mat.clone(`${mat.name}_pipeAlpha`) ?? mat
    clone.subMaterials = mat.subMaterials.map((sub) =>
      sub ? setMaterialSemiTransparent(sub, alpha, cloneCache) : sub,
    )
    cloneCache.set(mat, clone)
    return clone
  }

  // 克隆避免管道半透明影响共用同一材质的其它部件
  const clone = mat.clone(`${mat.name}_pipeAlpha`) ?? mat
  clone.alpha = alpha
  clone.transparencyMode = Material.MATERIAL_ALPHABLEND
  clone.needDepthPrePass = true
  clone.forceDepthWrite = true
  cloneCache.set(mat, clone)
  return clone
}

/**
 * 将「设备_管道」分组下所有 mesh 材质改为半透明，便于显示管内流光
 * @returns 处理的 mesh 数量
 */
export function makePipeGroupSemiTransparent(app: AppOrchestrator, alpha = PIPE_SHELL_ALPHA): number {
  const model = app.getModelModule()
  const nodes = model.findPartNodes(PIPE_GROUP_NAME)
  if (!nodes.length) {
    console.warn(`[business] pipe group "${PIPE_GROUP_NAME}" not found`)
    return 0
  }

  const cloneCache = new Map<Material, Material>()
  const seen = new Set<AbstractMesh>()
  let count = 0

  for (const node of nodes) {
    const meshes: AbstractMesh[] = []
    if ('getTotalVertices' in node && typeof (node as AbstractMesh).getTotalVertices === 'function') {
      const self = node as AbstractMesh
      if (self.getTotalVertices() > 0) meshes.push(self)
    }
    if ('getChildMeshes' in node && typeof node.getChildMeshes === 'function') {
      for (const child of node.getChildMeshes(false)) {
        if (child.getTotalVertices() > 0) meshes.push(child)
      }
    }

    for (const mesh of meshes) {
      if (seen.has(mesh) || !mesh.material) continue
      seen.add(mesh)
      mesh.material = setMaterialSemiTransparent(mesh.material, alpha, cloneCache)
      mesh.renderingGroupId = 1
      count += 1
    }
  }

  // 统一修复透明材质深度/排序，避免旋转时面片闪烁消失
  model.fixTransparentMaterials()

  console.info(`[business] pipe group "${PIPE_GROUP_NAME}" semi-transparent meshes: ${count}`)
  return count
}

/**
 * 基于当前 App 实例创建业务功能 API
 */
export function createBusinessFeatures(app: AppOrchestrator): BusinessFeatures {
  const model = () => app.getModelModule()
  const camera = () => app.getCameraModule()

  return {
    ROOF_PART_NAME,
    PIPE_GROUP_NAME,

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

    applyPipeGroupTransparency(alpha?: number): number {
      return makePipeGroupSemiTransparent(app, alpha)
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
