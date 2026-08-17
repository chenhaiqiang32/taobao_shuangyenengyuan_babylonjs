import '@babylonjs/loaders/glTF'
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { AnimationGroup } from '@babylonjs/core/Animations/animationGroup'
import type { AssetContainer } from '@babylonjs/core/assetContainer'
import type { Node } from '@babylonjs/core/node'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { ModelAnimationConfig, ModelConfig, Vec3 } from '../config/types'
import { withBase } from '../config/baseUrl'
import type { AppContext, SceneModule } from '../core/types'
import type { CameraModule } from './camera'
import { Material } from '@babylonjs/core/Materials/material'
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'

export interface ModelBounds {
  center: Vector3
  /** 包围盒半径（AABB 半对角线） */
  radius: number
}

export class ModelModule implements SceneModule<ModelConfig> {
  readonly name = 'model'
  private ctx: AppContext | null = null
  private container: AssetContainer | null = null
  private root: TransformNode | null = null
  private lastUrl = ''
  private cameraModule: CameraModule | null = null
  private animationGroups: AnimationGroup[] = []

  setCameraModule(cameraModule: CameraModule): void {
    this.cameraModule = cameraModule
  }

  async create(ctx: AppContext, config: ModelConfig): Promise<void> {
    this.ctx = ctx
    await this.apply(config)
  }

  async apply(config: ModelConfig): Promise<void> {
    const scene = this.ctx?.scene
    if (!scene) return

    if (!config.enabled) {
      for (const group of this.animationGroups) {
        if (group.isPlaying) group.stop()
      }
      this.clearModel()
      return
    }

    let justLoaded = false
    const modelUrl = withBase(config.url)
    if (this.lastUrl !== modelUrl || !this.container) {
      await this.loadModel(modelUrl)
      justLoaded = true
    }

    this.applyTransform(config)
    this.applyShadowFlags(config)

    if (config.autoCenter) {
      this.centerModel()
    }

    if (justLoaded) {
      if (config.fixTransparentDepth) {
        this.fixTransparentMaterials()
      }
      this.syncAnimationsToConfig(config)
      this.bindControlsAndCamera()
    } else if (config.fixTransparentDepth) {
      // 配置开关从关到开时补一次修复
      this.fixTransparentMaterials()
    }

    this.applyAnimations(config)
  }

  private async loadModel(url: string): Promise<void> {
    const scene = this.ctx!.scene
    this.clearModel()
    try {
      const container = await LoadAssetContainerAsync(url, scene)
      container.addAllToScene()
      this.container = container
      this.root = (container.rootNodes[0] as TransformNode | undefined) ?? null
      this.animationGroups = [...container.animationGroups]
      this.lastUrl = url
      console.info(
        `[model] loaded "${url}", animationGroups=${this.animationGroups.length}` +
          (this.animationGroups.length
            ? `: ${this.animationGroups.map((g) => g.name).join(', ')}`
            : ''),
      )
    } catch (err) {
      console.error('[model] failed to load', url, err)
      this.clearModel()
    }
  }

  /**
   * 将模型内动画组同步写入配置：
   * - 已有同名条目保留 play/loop/speedRatio
   * - 新条目按 playAnimationsByDefault 初始化（本项目默认全部播放）
   */
  private syncAnimationsToConfig(config: ModelConfig): void {
    const prevByName = new Map(config.animations.map((a) => [a.name, a]))
    const next: ModelAnimationConfig[] = this.animationGroups.map((group) => {
      const prev = prevByName.get(group.name)
      if (prev) {
        return {
          name: group.name,
          play: prev.play,
          loop: prev.loop,
          speedRatio: prev.speedRatio,
        }
      }
      return {
        name: group.name,
        play: config.playAnimationsByDefault,
        loop: true,
        speedRatio: 1,
      }
    })

    config.animations = next
    if (this.ctx?.config.model) {
      this.ctx.config.model.animations = next
      this.ctx.config.model.playAnimationsByDefault = config.playAnimationsByDefault
    }
  }

  /** 按配置播放 / 停止动画组 */
  applyAnimations(config: ModelConfig): void {
    if (!this.animationGroups.length) return

    const byName = new Map(config.animations.map((a) => [a.name, a]))

    for (const group of this.animationGroups) {
      const entry = byName.get(group.name)
      const shouldPlay = entry?.play ?? config.playAnimationsByDefault
      const loop = entry?.loop ?? true
      const speedRatio = entry?.speedRatio ?? 1

      group.speedRatio = speedRatio

      if (shouldPlay) {
        if (!group.isPlaying) {
          group.start(loop, speedRatio)
        } else {
          group.loopAnimation = loop
          group.speedRatio = speedRatio
        }
      } else if (group.isPlaying) {
        group.stop()
      }
    }
  }

  playAllAnimations(loop = true): void {
    const config = this.ctx?.config.model
    if (!config) return
    for (const anim of config.animations) {
      anim.play = true
      anim.loop = loop
    }
    config.playAnimationsByDefault = true
    this.applyAnimations(config)
  }

  stopAllAnimations(): void {
    const config = this.ctx?.config.model
    if (config) {
      for (const anim of config.animations) {
        anim.play = false
      }
    }
    for (const group of this.animationGroups) {
      if (group.isPlaying) {
        group.stop()
      }
    }
  }

  getAnimationGroups(): AnimationGroup[] {
    return this.animationGroups
  }

  /**
   * 按名称查找模型部件（精确匹配，含 TransformNode / Mesh 及其子网格）
   */
  findPartNodes(partName: string): Array<AbstractMesh | TransformNode> {
    if (!partName || !this.container) return []

    const candidates: Node[] = [
      ...this.container.rootNodes,
      ...this.container.transformNodes,
      ...this.container.meshes,
    ]

    const matched = candidates.filter((n) => n.name === partName) as Array<
      AbstractMesh | TransformNode
    >

    return matched
  }

  /** 查询部件当前是否可见；未找到返回 null */
  isPartVisible(partName: string): boolean | null {
    const nodes = this.findPartNodes(partName)
    if (!nodes.length) return null

    // 以第一个匹配节点为准；若是父节点则看自身 enabled
    return nodes.some((n) => n.isEnabled())
  }

  /**
   * 设置部件显示/隐藏（匹配节点及其子网格）
   * @returns 是否找到并处理了部件
   */
  setPartVisible(partName: string, visible: boolean): boolean {
    const nodes = this.findPartNodes(partName)
    if (!nodes.length) {
      console.warn(`[model] part "${partName}" not found`)
      return false
    }

    for (const node of nodes) {
      node.setEnabled(visible)
      if ('getChildMeshes' in node && typeof node.getChildMeshes === 'function') {
        for (const child of node.getChildMeshes(false)) {
          child.setEnabled(visible)
        }
      }
    }
    return true
  }

  /** 切换部件显隐，返回切换后的可见状态；未找到返回 null */
  togglePartVisible(partName: string): boolean | null {
    const current = this.isPartVisible(partName)
    if (current === null) {
      console.warn(`[model] part "${partName}" not found`)
      return null
    }
    const next = !current
    this.setPartVisible(partName, next)
    return next
  }

  private applyTransform(config: ModelConfig): void {
    if (!this.root) return
    this.root.position = Vector3.FromArray(config.position)
    this.root.rotation = Vector3.FromArray(config.rotation)
    this.root.scaling = Vector3.FromArray(config.scaling)
  }

  private applyShadowFlags(config: ModelConfig): void {
    if (!this.container) return
    for (const mesh of this.container.meshes) {
      mesh.receiveShadows = config.receiveShadows
      if ('castShadows' in mesh) {
        ;(mesh as AbstractMesh & { castShadows: boolean }).castShadows = config.castShadows
      }
    }
  }

  /**
   * 修复透明材质因叠加/排序导致旋转时面片消失的问题。
   * - Alpha 混合：depthPrePass + forceDepthWrite
   * - 接近镂空的透明度：改用 AlphaTest，减少排序错误
   * - 透明网格延后到 renderingGroupId=1，且不清理深度缓冲
   */
  fixTransparentMaterials(): void {
    const scene = this.ctx?.scene
    const container = this.container
    if (!scene || !container) return

    // 组 1 渲染时保留组 0 的深度，便于透明片与实体正确遮挡
    scene.setRenderingAutoClearDepthStencil(1, false, false, false)

    const processed = new Set<Material>()
    let fixedCount = 0

    for (const mesh of container.meshes) {
      if (!mesh.material) continue
      const touched = this.fixMaterialTree(mesh.material, processed)
      if (touched > 0) {
        fixedCount += touched
        // 透明物体放到稍后的渲染组，先画不透明再画透明
        if (this.materialNeedsAlpha(mesh.material)) {
          mesh.renderingGroupId = 1
        }
      }
    }

    if (fixedCount > 0) {
      console.info(`[model] fixed transparent materials: ${fixedCount}`)
    }
  }

  private materialNeedsAlpha(mat: Material | null): boolean {
    if (!mat) return false
    if (mat instanceof MultiMaterial) {
      return mat.subMaterials.some((m) => this.materialNeedsAlpha(m))
    }
    if (mat.needAlphaBlending?.() || mat.needAlphaTesting?.()) return true
    const mode = mat.transparencyMode
    if (
      mode === Material.MATERIAL_ALPHABLEND ||
      mode === Material.MATERIAL_ALPHATEST ||
      mode === Material.MATERIAL_ALPHATESTANDBLEND
    ) {
      return true
    }
    if (mat instanceof PBRMaterial) {
      if (mat.alpha < 1) return true
      if (mat.albedoTexture?.hasAlpha && mat.useAlphaFromAlbedoTexture) return true
    }
    return false
  }

  private fixMaterialTree(mat: Material | null, processed: Set<Material>): number {
    if (!mat || processed.has(mat)) return 0
    processed.add(mat)

    if (mat instanceof MultiMaterial) {
      let total = 0
      for (const sub of mat.subMaterials) {
        total += this.fixMaterialTree(sub, processed)
      }
      return total
    }

    if (!this.materialNeedsAlpha(mat)) return 0

    // 接近 0/1 镂空：AlphaTest 比 Blend 更稳，避免半透明排序花屏/消失
    if (mat instanceof PBRMaterial) {
      const alpha = mat.alpha
      const hasTexAlpha = !!(mat.albedoTexture?.hasAlpha && mat.useAlphaFromAlbedoTexture)
      if (
        (alpha < 0.02 || alpha > 0.98) &&
        hasTexAlpha &&
        mat.transparencyMode === Material.MATERIAL_ALPHABLEND
      ) {
        mat.transparencyMode = Material.MATERIAL_ALPHATEST
        mat.alphaCutOff = 0.4
      }
    }

    mat.needDepthPrePass = true
    mat.forceDepthWrite = true
    // 双面透明时减少“背面先写深度导致正面被剔”的情况
    if (mat instanceof PBRMaterial && mat.alpha < 1) {
      mat.separateCullingPass = true
    }

    return 1
  }

  private getMeshes(): AbstractMesh[] {
    return this.container?.meshes.filter((m) => m.getTotalVertices() > 0) ?? []
  }

  /** 按 controlsModelName 查找用于控制器/相机绑定的网格 */
  private resolveControlMeshes(controlsModelName: string): AbstractMesh[] {
    const all = this.getMeshes()
    if (!controlsModelName || !this.container) {
      return all
    }

    const candidates: Node[] = [
      ...this.container.rootNodes,
      ...this.container.transformNodes,
      ...this.container.meshes,
    ]

    const matchedNodes = candidates.filter((n) => {
      const name = n.name ?? ''
      return name === controlsModelName || name.includes(controlsModelName)
    })

    if (!matchedNodes.length) {
      console.warn(
        `[model] controlsModelName "${controlsModelName}" not found in scene nodes, fallback to all meshes`,
      )
      return all
    }

    const meshSet = new Set<AbstractMesh>()
    for (const node of matchedNodes) {
      if ('getTotalVertices' in node) {
        const mesh = node as AbstractMesh
        if (typeof mesh.getTotalVertices === 'function' && mesh.getTotalVertices() > 0) {
          meshSet.add(mesh)
        }
      }
      if ('getChildMeshes' in node && typeof (node as TransformNode).getChildMeshes === 'function') {
        for (const child of (node as TransformNode).getChildMeshes(false)) {
          if (child.getTotalVertices() > 0) {
            meshSet.add(child)
          }
        }
      }
    }

    const meshes = [...meshSet]
    if (!meshes.length) {
      console.warn(
        `[model] controlsModelName "${controlsModelName}" matched nodes but no vertex meshes, fallback to all`,
      )
      return all
    }
    return meshes
  }

  computeBounds(meshes: AbstractMesh[]): ModelBounds | null {
    if (!meshes.length) return null

    for (const mesh of meshes) {
      mesh.computeWorldMatrix(true)
      mesh.refreshBoundingInfo(true, true)
    }

    let min = meshes[0].getBoundingInfo().boundingBox.minimumWorld.clone()
    let max = meshes[0].getBoundingInfo().boundingBox.maximumWorld.clone()
    for (let i = 1; i < meshes.length; i++) {
      const bi = meshes[i].getBoundingInfo().boundingBox
      min = Vector3.Minimize(min, bi.minimumWorld)
      max = Vector3.Maximize(max, bi.maximumWorld)
    }

    const center = min.add(max).scale(0.5)
    const extent = max.subtract(min)
    const radius = Math.max(extent.length() * 0.5, 1)
    return { center, radius }
  }

  /**
   * 按 controlsModelName：
   * 1) 控制器默认坐标 = 包围盒中心
   * 2) 相机默认位置 = 中心 + 半径 × cameraRadiusFactor（默认 1）
   */
  bindControlsAndCamera(): void {
    const cfg = this.ctx?.config
    if (!cfg || !this.cameraModule) return

    const name = cfg.controlsModelName
    const factor = cfg.cameraRadiusFactor > 0 ? cfg.cameraRadiusFactor : 1
    const meshes = this.resolveControlMeshes(name)
    const bounds = this.computeBounds(meshes)
    if (!bounds) {
      console.warn('[model] cannot compute bounds for controls binding')
      return
    }

    const targetTuple: Vec3 = [bounds.center.x, bounds.center.y, bounds.center.z]
    cfg.controller.target = targetTuple
    cfg.camera.target = targetTuple

    const cameraRadius = bounds.radius * factor
    this.cameraModule.fitToBoundingRadius(bounds.center, cameraRadius)

    console.info(
      `[model] controls bound to "${name || '(all meshes)'}" center=(${targetTuple.map((v) => v.toFixed(2)).join(', ')}) radius=${bounds.radius.toFixed(2)} cameraRadius=${cameraRadius.toFixed(2)} (factor=${factor})`,
    )
  }

  private centerModel(): void {
    const meshes = this.getMeshes()
    if (!meshes.length || !this.root) return

    const bounds = this.computeBounds(meshes)
    if (!bounds) return
    this.root.position.subtractInPlace(bounds.center)
    this.root.computeWorldMatrix(true)
  }

  private clearModel(): void {
    for (const group of this.animationGroups) {
      if (group.isPlaying) {
        group.stop()
      }
    }
    this.animationGroups = []
    this.container?.removeAllFromScene()
    this.container?.dispose()
    this.container = null
    this.root = null
    this.lastUrl = ''
  }

  dispose(): void {
    this.clearModel()
    this.ctx = null
    this.cameraModule = null
  }
}
