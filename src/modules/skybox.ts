import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture'
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture'
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader'
import '@babylonjs/core/Materials/Textures/Loaders/hdrTextureLoader'
import '@babylonjs/core/Helpers/sceneHelpers'
import { PhotoDome } from '@babylonjs/core/Helpers/photoDome'
import type { BaseTexture } from '@babylonjs/core/Materials/Textures/baseTexture'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { SkyboxConfig } from '../config/types'
import { withBase } from '../config/baseUrl'
import type { AppContext, SceneModule } from '../core/types'

export class SkyboxModule implements SceneModule<SkyboxConfig> {
  readonly name = 'skybox'
  private ctx: AppContext | null = null
  /** HDR/ENV：仅用于 IBL */
  private envTexture: BaseTexture | null = null
  /** 无背景图时，用 HDR 创建的天空盒网格 */
  private hdrSkyMesh: Mesh | null = null
  private hdrSkySize = 1000
  /** 背景全景图 PhotoDome（不影响 environmentTexture） */
  private backgroundDome: PhotoDome | null = null
  private backgroundDomeSize = 1000
  private lastEnvUrl = ''
  private lastFormat: SkyboxConfig['format'] | '' = ''
  private lastHdrSize = 0
  private lastBackgroundUrl = ''

  async create(ctx: AppContext, config: SkyboxConfig): Promise<void> {
    this.ctx = ctx
    await this.apply(config)
  }

  async apply(config: SkyboxConfig): Promise<void> {
    const scene = this.ctx?.scene
    if (!scene) return

    this.applyEnvironment(config)
    this.applyBackground(config)
  }

  /** HDR/ENV → scene.environmentTexture（光照/反射） */
  private applyEnvironment(config: SkyboxConfig): void {
    const scene = this.ctx!.scene
    const resolvedHdrUrl = withBase(config.hdrUrl)
    const needsReload =
      !this.envTexture ||
      this.lastEnvUrl !== resolvedHdrUrl ||
      this.lastFormat !== config.format ||
      (config.format === 'hdr' && this.lastHdrSize !== config.hdrSize)

    if (needsReload) {
      this.disposeEnvironmentKeepBackground()
      if (config.hdrUrl) {
        this.envTexture = this.loadEnvTexture(config)
        this.lastEnvUrl = resolvedHdrUrl
        this.lastFormat = config.format
        this.lastHdrSize = config.hdrSize
      }
    }

    if (!this.envTexture) return

    this.envTexture.level = config.level
    if ('rotationY' in this.envTexture) {
      ;(this.envTexture as CubeTexture).rotationY = config.rotationY
    }

    if (config.asEnvironmentTexture && config.enabled) {
      scene.environmentTexture = this.envTexture
    } else if (scene.environmentTexture === this.envTexture) {
      scene.environmentTexture = null
    }
  }

  /**
   * 背景显示：
   * - 有 backgroundUrl：PhotoDome 显示 JPG，不碰 HDR IBL
   * - 无 backgroundUrl 且 showMesh：回退用 HDR 天空盒网格
   */
  private applyBackground(config: SkyboxConfig): void {
    const scene = this.ctx!.scene
    const usePhotoBg = !!(config.backgroundUrl && config.backgroundUrl.trim())
    const show = config.enabled && config.showMesh

    if (usePhotoBg) {
      this.disposeHdrSkyMesh()

      const resolvedBg = withBase(config.backgroundUrl)
      const size = Math.max(config.size, 1)
      if (!this.backgroundDome || this.lastBackgroundUrl !== resolvedBg) {
        this.disposeBackgroundDome()
        this.backgroundDomeSize = size
        this.backgroundDome = new PhotoDome(
          'sceneBackground',
          resolvedBg,
          {
            resolution: 32,
            size: this.backgroundDomeSize,
            useDirectMapping: false,
          },
          scene,
        )
        this.lastBackgroundUrl = resolvedBg
      }

      if (this.backgroundDome) {
        this.backgroundDome.setEnabled(show)
        this.backgroundDome.rotation.y = config.rotationY
        this.backgroundDome.mesh.scaling.setAll(size / this.backgroundDomeSize)
      }
      return
    }

    this.disposeBackgroundDome()
    if (!show || !this.envTexture) {
      this.disposeHdrSkyMesh()
      return
    }

    if (!this.hdrSkyMesh) {
      this.hdrSkySize = Math.max(config.size, 1)
      this.hdrSkyMesh = scene.createDefaultSkybox(
        this.envTexture,
        true,
        this.hdrSkySize,
        config.blur,
        true,
      ) as Mesh | null
    } else {
      this.hdrSkyMesh.setEnabled(true)
      this.hdrSkyMesh.scaling.setAll(config.size / this.hdrSkySize)
      const mat = this.hdrSkyMesh.material as { microSurface?: number } | null
      if (mat && typeof mat.microSurface === 'number') {
        mat.microSurface = 1 - config.blur
      }
    }
  }

  private loadEnvTexture(config: SkyboxConfig): BaseTexture {
    const scene = this.ctx!.scene
    const url = withBase(config.hdrUrl)
    if (config.format === 'hdr') {
      return new HDRCubeTexture(url, scene, config.hdrSize, false, true, false, true)
    }
    return CubeTexture.CreateFromPrefilteredData(url, scene)
  }

  private disposeHdrSkyMesh(): void {
    this.hdrSkyMesh?.dispose(false, true)
    this.hdrSkyMesh = null
  }

  private disposeBackgroundDome(): void {
    this.backgroundDome?.dispose()
    this.backgroundDome = null
    this.lastBackgroundUrl = ''
  }

  private disposeEnvironmentKeepBackground(): void {
    const scene = this.ctx?.scene
    if (scene && scene.environmentTexture === this.envTexture) {
      scene.environmentTexture = null
    }
    this.disposeHdrSkyMesh()
    this.envTexture?.dispose()
    this.envTexture = null
    this.lastEnvUrl = ''
    this.lastFormat = ''
    this.lastHdrSize = 0
  }

  dispose(): void {
    this.disposeEnvironmentKeepBackground()
    this.disposeBackgroundDome()
    this.ctx = null
  }
}
