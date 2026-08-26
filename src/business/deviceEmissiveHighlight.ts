/**
 * 设备 mesh 自发光高亮（悬停 / 选中），替代 HighlightLayer 轮廓
 */
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Material } from '@babylonjs/core/Materials/material'
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

interface MaterialSnapshot {
  emissiveColor: Color3
  emissiveIntensity?: number
  albedoColor?: Color3
  diffuseColor?: Color3
}

export class DeviceEmissiveHighlight {
  private readonly snapshots = new Map<Material, MaterialSnapshot>()
  private readonly hoverMeshes = new Set<AbstractMesh>()
  private readonly selectedMeshes = new Set<AbstractMesh>()

  applyHover(meshes: AbstractMesh[], tint: Color3, intensity: number): void {
    this.clearHover()
    for (const mesh of meshes) {
      if (this.selectedMeshes.has(mesh)) continue
      this.applyTint(mesh, tint, intensity)
      this.hoverMeshes.add(mesh)
    }
  }

  applySelected(meshes: AbstractMesh[], tint: Color3, intensity: number): void {
    this.clearSelected()
    for (const mesh of meshes) {
      if (this.hoverMeshes.has(mesh)) {
        this.restoreMesh(mesh)
        this.hoverMeshes.delete(mesh)
      }
      this.applyTint(mesh, tint, intensity)
      this.selectedMeshes.add(mesh)
    }
  }

  clearHover(): void {
    for (const mesh of this.hoverMeshes) {
      if (!this.selectedMeshes.has(mesh)) this.restoreMesh(mesh)
    }
    this.hoverMeshes.clear()
  }

  clearSelected(): void {
    for (const mesh of this.selectedMeshes) {
      this.restoreMesh(mesh)
    }
    this.selectedMeshes.clear()
  }

  dispose(): void {
    this.clearHover()
    this.clearSelected()
    this.snapshots.clear()
  }

  private ensureClonedMaterial(mesh: AbstractMesh): Material | null {
    const current = mesh.material
    if (!current) return null
    const meta = (mesh.metadata ?? {}) as Record<string, unknown>
    if (meta.interactionMaterialCloned) return mesh.material
    const cloned = current.clone(`${current.name || 'mat'}_ix_${mesh.name}`)
    mesh.material = cloned
    mesh.metadata = { ...meta, interactionMaterialCloned: true }
    return cloned
  }

  private captureSnapshot(mat: PBRMaterial | StandardMaterial): MaterialSnapshot {
    const snap: MaterialSnapshot = {
      emissiveColor: mat.emissiveColor.clone(),
    }
    if (mat instanceof PBRMaterial) {
      snap.emissiveIntensity = mat.emissiveIntensity ?? 0
      snap.albedoColor = mat.albedoColor.clone()
    } else {
      snap.diffuseColor = mat.diffuseColor.clone()
    }
    return snap
  }

  private walkMaterials(
    mat: Material | null,
    fn: (m: PBRMaterial | StandardMaterial, snap: MaterialSnapshot) => void,
  ): void {
    if (!mat) return
    if (mat instanceof MultiMaterial) {
      for (const sub of mat.subMaterials) this.walkMaterials(sub, fn)
      return
    }
    if (!(mat instanceof PBRMaterial) && !(mat instanceof StandardMaterial)) return
    if (!this.snapshots.has(mat)) {
      this.snapshots.set(mat, this.captureSnapshot(mat))
    }
    fn(mat, this.snapshots.get(mat)!)
  }

  private applyTint(mesh: AbstractMesh, tint: Color3, intensity: number): void {
    const mat = this.ensureClonedMaterial(mesh)
    if (!mat) return
    const blend = 0.55
    this.walkMaterials(mat, (m, snap) => {
      if (m instanceof PBRMaterial) {
        m.emissiveColor = Color3.Lerp(snap.emissiveColor, tint, blend)
        m.emissiveIntensity = Math.max(snap.emissiveIntensity ?? 0, intensity)
        if (snap.albedoColor) {
          m.albedoColor = Color3.Lerp(snap.albedoColor, tint, 0.1)
        }
      } else {
        m.emissiveColor = Color3.Lerp(snap.emissiveColor, tint, Math.min(1, intensity + 0.15))
        if (snap.diffuseColor) {
          m.diffuseColor = Color3.Lerp(snap.diffuseColor, tint, 0.1)
        }
      }
    })
  }

  private restoreMesh(mesh: AbstractMesh): void {
    this.walkMaterials(mesh.material, (m, snap) => {
      m.emissiveColor.copyFrom(snap.emissiveColor)
      if (m instanceof PBRMaterial && snap.emissiveIntensity !== undefined) {
        m.emissiveIntensity = snap.emissiveIntensity
      }
      if (m instanceof PBRMaterial && snap.albedoColor) {
        m.albedoColor.copyFrom(snap.albedoColor)
      } else if (m instanceof StandardMaterial && snap.diffuseColor) {
        m.diffuseColor.copyFrom(snap.diffuseColor)
      }
    })
  }
}
