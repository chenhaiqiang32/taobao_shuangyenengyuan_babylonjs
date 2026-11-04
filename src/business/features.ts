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

/** 管道分组：加载后将其下 mesh 设为不透明，并排到地面之后便于显示埋地管段 */
export const PIPE_GROUP_NAME = '设备_管道'

/**
 * 场景地面：场地（路/草）和 bg（背景地面）。
 * 二者盖在埋地管段之上，且透明修复会强制写深度，导致管道被地面裁掉。
 */
const GROUND_NODE_NAMES = ['场地', 'bg'] as const

/**
 * 管道外壳渲染组：晚于地面（组 1），与流光同组。
 * alphaIndex 低于流光（1/2）和设备高亮（910+），保证流光画在管壁之上。
 */
const PIPE_SHELL_RENDER_GROUP = 2
const PIPE_SHELL_ALPHA_INDEX = 0

/** 预设视角：初始化 / 能源站 / 末端（相机位置 + 控制器 target） */
export const CAMERA_VIEW_PRESETS = {
  initial: {
    position: [203.088, 92.723, -95.924],
    rotationDeg: [-34.39, 126.11, 0],
    target: [56.892, -31.146, 10.74],
  },
  energyStation: {
    position: [129.411, 23.344, -87.878],
    rotationDeg: [-28.73, 91.95, 0],
    target: [24.326, -34.294, -84.309],
  },
  terminal: {
    position: [-3.785, 201.84, -26.05],
    rotationDeg: [-87.33, -179.69, 0],
    target: [-3.734, -0.776, -16.589],
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
  /** 将「设备_管道」下 mesh 材质改为不透明，并排到地面之后 */
  applyPipeGroupTransparency: () => number
  /** 按预设切换相机视角（initial / energyStation / terminal） */
  setCameraView: (preset: CameraViewPresetId) => boolean
  /** 按自定义位姿切换相机视角 */
  setCameraPose: (pose: CameraPose) => boolean
  /** 读取当前相机位置与控制器位置 */
  getCameraPose: () => CameraPoseSnapshot | null
  /** 控制台打印当前相机位置与控制器位置 */
  printCameraPose: () => CameraPoseSnapshot | null
}

function setMaterialOpaque(mat: Material, cloneCache: Map<Material, Material>): Material {
  const cached = cloneCache.get(mat)
  if (cached) return cached

  if (mat instanceof MultiMaterial) {
    const clone = mat.clone(`${mat.name}_pipeOpaque`) ?? mat
    clone.subMaterials = mat.subMaterials.map((sub) =>
      sub ? setMaterialOpaque(sub, cloneCache) : sub,
    )
    cloneCache.set(mat, clone)
    return clone
  }

  // 克隆避免管道材质改动影响共用同一材质的其它部件
  const clone = mat.clone(`${mat.name}_pipeOpaque`) ?? mat
  clone.alpha = 1
  clone.transparencyMode = Material.MATERIAL_OPAQUE
  clone.needDepthPrePass = false
  clone.forceDepthWrite = false
  clone.disableDepthWrite = false
  cloneCache.set(mat, clone)
  return clone
}

/** 管道外壳不写入深度缓冲（fixTransparentMaterials 之后需再调用一次） */
function applyPipeNoDepthWrite(mat: Material | null): void {
  if (!mat) return
  if (mat instanceof MultiMaterial) {
    for (const sub of mat.subMaterials) applyPipeNoDepthWrite(sub)
    return
  }
  mat.needDepthPrePass = false
  mat.forceDepthWrite = false
  mat.disableDepthWrite = true
}

/**
 * 场景地面不写深度，并保持在组 1（实体建筑之后、管道外壳之前）。
 * 组 2 仍沿用组 0 的深度，埋地管段可以画在地面上，厂房和设备继续遮挡管道。
 */
function revealPipesUnderGround(app: AppOrchestrator): void {
  const scene = app.getContext()?.scene
  const model = app.getModelModule()
  if (!scene) return

  scene.setRenderingAutoClearDepthStencil(1, false, false, false)
  scene.setRenderingAutoClearDepthStencil(PIPE_SHELL_RENDER_GROUP, false, false, false)

  const seen = new Set<AbstractMesh>()
  let count = 0

  for (const groundName of GROUND_NODE_NAMES) {
    const nodes = model.findPartNodes(groundName)
    if (!nodes.length) {
      console.warn(`[business] ground "${groundName}" not found`)
      continue
    }

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
        if (seen.has(mesh)) continue
        seen.add(mesh)
        applyPipeNoDepthWrite(mesh.material)
        // bg 在组 0 透明阶段先画；场地留在组 1，盖住背景地面，仍早于组 2 的管道
        mesh.renderingGroupId = groundName === 'bg' ? 0 : 1
        count += 1
      }
    }
  }

  console.info(`[business] ground meshes no longer occlude pipes: ${count}`)
}

/**
 * 将「设备_管道」分组下所有 mesh 材质改为不透明，并排到地面之后显示埋地管段
 * @returns 处理的 mesh 数量
 */
export function makePipeGroupSemiTransparent(app: AppOrchestrator): number {
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
      mesh.material = setMaterialOpaque(mesh.material, cloneCache)
      // 组 2：画在场地地面之后；alphaIndex 低于流光，避免管壁盖住流光
      mesh.renderingGroupId = PIPE_SHELL_RENDER_GROUP
      mesh.alphaIndex = PIPE_SHELL_ALPHA_INDEX
      count += 1
    }
  }

  // 统一修复透明材质深度/排序，避免旋转时面片闪烁消失
  model.fixTransparentMaterials()

  // 管道保持不透明深度写入；渲染组在透明修复后重新确认
  for (const mesh of seen) {
    mesh.renderingGroupId = PIPE_SHELL_RENDER_GROUP
    mesh.alphaIndex = PIPE_SHELL_ALPHA_INDEX
  }

  // 放在透明修复之后：地面透明材质会被重新打开深度写入
  revealPipesUnderGround(app)

  console.info(`[business] pipe group "${PIPE_GROUP_NAME}" opaque meshes: ${count}`)
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

    applyPipeGroupTransparency(): number {
      return makePipeGroupSemiTransparent(app)
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
