/**
 * 悬停 / 选中：按设备包围盒底部叠加半透明自发光板（不改模型材质）
 */
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Constants } from '@babylonjs/core/Engines/constants'
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Material } from '@babylonjs/core/Materials/material'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { Scene } from '@babylonjs/core/scene'

const SHELL_RENDER_GROUP = 2
const FOOTPRINT_PADDING = 1.08
const FOOTPRINT_MIN_SIZE = 0.12
/** 底部发光板厚度占包围盒高度比例 */
const BOTTOM_HEIGHT_RATIO = 0.1
const BOTTOM_HEIGHT_MIN = 0.06
const BOTTOM_HEIGHT_MAX = 0.45

interface BoundsShell {
  shell: Mesh
  material: StandardMaterial
  meshes: AbstractMesh[]
  color: Color3
  alpha: number
}

export class DeviceEmissiveHighlight {
  private readonly scene: Scene
  private readonly glowLayer: HighlightLayer
  private hover: BoundsShell | null = null
  private selected: BoundsShell | null = null
  private readonly renderObserver

  constructor(scene: Scene) {
    this.scene = scene
    scene.setRenderingAutoClearDepthStencil(SHELL_RENDER_GROUP, false, false, false)

    this.glowLayer = new HighlightLayer('deviceIxBoundsGlow', scene, {
      blurHorizontalSize: 1.1,
      blurVerticalSize: 1.1,
    })
    this.glowLayer.innerGlow = true
    this.glowLayer.outerGlow = true

    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      if (this.hover) fitBottomGlowToMeshes(this.hover.shell, this.hover.meshes)
      if (this.selected) fitBottomGlowToMeshes(this.selected.shell, this.selected.meshes)
    })
  }

  applyHover(meshes: AbstractMesh[], tint: Color3, alpha = 0.28): void {
    this.hover = this.upsertShell(this.hover, 'hover', meshes, tint, alpha)
  }

  applySelected(meshes: AbstractMesh[], tint: Color3, alpha = 0.38): void {
    this.selected = this.upsertShell(this.selected, 'selected', meshes, tint, alpha)
  }

  clearHover(): void {
    this.hover = this.disposeShell(this.hover)
  }

  clearSelected(): void {
    this.selected = this.disposeShell(this.selected)
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.renderObserver)
    this.clearHover()
    this.clearSelected()
    this.glowLayer.dispose()
  }

  private upsertShell(
    current: BoundsShell | null,
    kind: 'hover' | 'selected',
    meshes: AbstractMesh[],
    tint: Color3,
    alpha: number,
  ): BoundsShell | null {
    if (!meshes.length) {
      return this.disposeShell(current)
    }

    if (current) {
      current.meshes = meshes
      current.color = tint.clone()
      current.alpha = alpha
      current.material.diffuseColor = tint
      current.material.emissiveColor = tint.scale(0.95)
      current.material.alpha = alpha
      this.glowLayer.removeMesh(current.shell)
      this.glowLayer.addMesh(current.shell, tint)
      fitBottomGlowToMeshes(current.shell, meshes)
      return current
    }

    const shell = MeshBuilder.CreateBox(`deviceIxShell_${kind}`, { size: 1 }, this.scene)
    const material = new StandardMaterial(`deviceIxShellMat_${kind}`, this.scene)
    material.disableLighting = true
    material.backFaceCulling = false
    material.transparencyMode = Material.MATERIAL_ALPHABLEND
    material.separateCullingPass = true
    material.disableDepthWrite = true
    material.depthFunction = Constants.ALWAYS
    material.diffuseColor = tint
    material.emissiveColor = tint.scale(0.95)
    material.alpha = alpha

    shell.material = material
    shell.isPickable = false
    shell.renderingGroupId = SHELL_RENDER_GROUP
    shell.alphaIndex = kind === 'selected' ? 920 : 910
    fitBottomGlowToMeshes(shell, meshes)
    this.glowLayer.addMesh(shell, tint)

    return { shell, material, meshes, color: tint.clone(), alpha }
  }

  private disposeShell(state: BoundsShell | null): null {
    if (!state) return null
    this.glowLayer.removeMesh(state.shell)
    state.material.dispose()
    state.shell.dispose()
    return null
  }
}

function computeWorldAabb(meshes: AbstractMesh[]): { min: Vector3; max: Vector3 } | null {
  const min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
  const max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE)
  let hit = false

  for (const mesh of meshes) {
    if (!mesh.isEnabled()) continue
    mesh.computeWorldMatrix(true)
    const bi = mesh.getBoundingInfo()
    if (!bi) continue
    for (const corner of bi.boundingBox.vectorsWorld) {
      min.minimizeInPlace(corner)
      max.maximizeInPlace(corner)
      hit = true
    }
  }

  return hit ? { min, max } : null
}

/** 仅贴合包围盒底部一块薄板 */
function fitBottomGlowToMeshes(shell: Mesh, meshes: AbstractMesh[]): void {
  const aabb = computeWorldAabb(meshes)
  if (!aabb) return

  const extent = aabb.max.subtract(aabb.min)
  const height = Math.min(
    BOTTOM_HEIGHT_MAX,
    Math.max(extent.y * BOTTOM_HEIGHT_RATIO, BOTTOM_HEIGHT_MIN),
  )
  const sizeX = Math.max(extent.x * FOOTPRINT_PADDING, FOOTPRINT_MIN_SIZE)
  const sizeZ = Math.max(extent.z * FOOTPRINT_PADDING, FOOTPRINT_MIN_SIZE)

  shell.position.set(
    (aabb.min.x + aabb.max.x) * 0.5,
    aabb.min.y + height * 0.5,
    (aabb.min.z + aabb.max.z) * 0.5,
  )
  shell.scaling.set(sizeX, height, sizeZ)
}
