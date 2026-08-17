import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture'
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture'
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader'
import '@babylonjs/core/Materials/Textures/Loaders/hdrTextureLoader'
import '@babylonjs/core/Helpers/sceneHelpers'
import type { BaseTexture } from '@babylonjs/core/Materials/Textures/baseTexture'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { SkyboxConfig } from '../config/types'
import { withBase } from '../config/baseUrl'
import type { AppContext, SceneModule } from '../core/types'

export class SkyboxModule implements SceneModule<SkyboxConfig> {
  readonly name = 'skybox'
  private ctx: AppContext | null = null
  private texture: BaseTexture | null = null
  private skyboxMesh: Mesh | null = null
  private createdSize = 1000
  private lastUrl = ''
  private lastFormat: SkyboxConfig['format'] | '' = ''
  private lastHdrSize = 0

  async create(ctx: AppContext, config: SkyboxConfig): Promise<void> {
    this.ctx = ctx
    await this.apply(config)
  }

  async apply(config: SkyboxConfig): Promise<void> {
    const scene = this.ctx?.scene
    if (!scene) return

    const resolvedHdrUrl = withBase(config.hdrUrl)
    const needsReload =
      !this.texture ||
      this.lastUrl !== resolvedHdrUrl ||
      this.lastFormat !== config.format ||
      (config.format === 'hdr' && this.lastHdrSize !== config.hdrSize)

    if (needsReload) {
      this.disposeTextureAndMesh()
      if (config.hdrUrl) {
        this.texture = this.loadTexture(config)
        this.lastUrl = resolvedHdrUrl
        this.lastFormat = config.format
        this.lastHdrSize = config.hdrSize
      }
    }

    if (!this.texture) return

    this.texture.level = config.level
    if ('rotationY' in this.texture) {
      ;(this.texture as CubeTexture).rotationY = config.rotationY
    }

    if (config.asEnvironmentTexture && config.enabled) {
      scene.environmentTexture = this.texture
    } else if (scene.environmentTexture === this.texture) {
      scene.environmentTexture = null
    }

    if (config.enabled && config.showMesh) {
      if (!this.skyboxMesh) {
        this.createdSize = Math.max(config.size, 1)
        this.skyboxMesh = scene.createDefaultSkybox(
          this.texture,
          true,
          this.createdSize,
          config.blur,
          true,
        ) as Mesh | null
      } else {
        this.skyboxMesh.setEnabled(true)
        this.skyboxMesh.scaling.setAll(config.size / this.createdSize)
        const mat = this.skyboxMesh.material as { microSurface?: number } | null
        if (mat && typeof mat.microSurface === 'number') {
          mat.microSurface = 1 - config.blur
        }
      }
    } else if (this.skyboxMesh) {
      this.skyboxMesh.setEnabled(false)
    }
  }

  private loadTexture(config: SkyboxConfig): BaseTexture {
    const scene = this.ctx!.scene
    const url = withBase(config.hdrUrl)
    if (config.format === 'hdr') {
      return new HDRCubeTexture(
        url,
        scene,
        config.hdrSize,
        false,
        true,
        false,
        true,
      )
    }
    return CubeTexture.CreateFromPrefilteredData(url, scene)
  }

  private disposeTextureAndMesh(): void {
    const scene = this.ctx?.scene
    if (scene && scene.environmentTexture === this.texture) {
      scene.environmentTexture = null
    }
    this.skyboxMesh?.dispose(false, true)
    this.skyboxMesh = null
    this.texture?.dispose()
    this.texture = null
    this.lastUrl = ''
    this.lastFormat = ''
    this.lastHdrSize = 0
  }

  dispose(): void {
    this.disposeTextureAndMesh()
    this.ctx = null
  }
}
