import { Scene } from '@babylonjs/core/scene'
import { createDefaultConfig } from '../config/defaults'
import { cloneConfig } from '../config/loadConfig'
import type { SceneAppConfig } from '../config/types'
import { applyEngineConfig, createEngine } from './engine'
import type { AppContext } from './types'
import { CameraModule } from '../modules/camera'
import { ControllerModule } from '../modules/controller'
import { LightsModule } from '../modules/lights'
import { ModelModule } from '../modules/model'
import { SceneModuleImpl } from '../modules/scene'
import { SettingsModule } from '../modules/settings'
import { SkyboxModule } from '../modules/skybox'

export class AppOrchestrator {
  private readonly canvas: HTMLCanvasElement
  private ctx: AppContext | null = null
  private config: SceneAppConfig = createDefaultConfig()
  private readonly sceneModule = new SceneModuleImpl()
  private readonly cameraModule = new CameraModule()
  private readonly controllerModule = new ControllerModule()
  private readonly lightsModule = new LightsModule()
  private readonly skyboxModule = new SkyboxModule()
  private readonly modelModule = new ModelModule()
  private readonly settingsModule = new SettingsModule()
  private resizeHandler: (() => void) | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.modelModule.setCameraModule(this.cameraModule)
  }

  async init(config: SceneAppConfig): Promise<void> {
    this.config = cloneConfig(config)
    const engine = createEngine(this.canvas, this.config.engine)
    const scene = new Scene(engine)

    this.ctx = {
      canvas: this.canvas,
      engine,
      scene,
      camera: null,
      config: this.config,
    }

    this.sceneModule.create(this.ctx, this.config.scene)
    this.cameraModule.create(this.ctx, this.config.camera)
    this.controllerModule.create(this.ctx, this.config.controller)
    this.lightsModule.create(this.ctx, this.config.lights)

    // 先开渲染循环，避免后续资源加载阻塞首帧
    engine.runRenderLoop(() => {
      scene.render()
    })
    this.resizeHandler = () => engine.resize()
    window.addEventListener('resize', this.resizeHandler)

    await this.settingsModule.create(this.ctx, this.config.settings)
    await this.skyboxModule.create(this.ctx, this.config.skybox)
    await this.modelModule.create(this.ctx, this.config.model)
  }

  getConfig(): SceneAppConfig {
    return this.config
  }

  getDebugInfo(): { meshCount: number; lightCount: number; hasEnv: boolean; cameraRadius: number } {
    const scene = this.ctx?.scene
    return {
      meshCount: scene?.meshes.length ?? 0,
      lightCount: scene?.lights.length ?? 0,
      hasEnv: !!scene?.environmentTexture,
      cameraRadius: this.ctx?.camera?.radius ?? 0,
    }
  }

  /** 供业务层调用的模型模块 */
  getModelModule(): ModelModule {
    return this.modelModule
  }

  async applySection<K extends keyof SceneAppConfig>(
    section: K,
    patch: SceneAppConfig[K],
    options?: { forceRecreate?: boolean },
  ): Promise<void> {
    if (!this.ctx) return

    if (section === 'version') {
      this.config.version = patch as number
      return
    }

    ;(this.config as unknown as Record<string, unknown>)[section] = structuredClone(patch)
    this.ctx.config = this.config

    switch (section) {
      case 'controlsModelName':
      case 'cameraRadiusFactor':
        this.modelModule.bindControlsAndCamera()
        break
      case 'engine':
        applyEngineConfig(this.ctx.engine, this.config.engine)
        if (options?.forceRecreate) {
          console.warn('[app] engine recreate is not supported at runtime; reload the page')
        }
        break
      case 'scene':
        this.sceneModule.apply(this.config.scene)
        break
      case 'camera':
        this.cameraModule.apply(this.config.camera)
        break
      case 'controller':
        this.controllerModule.apply(this.config.controller)
        break
      case 'lights':
        this.lightsModule.apply(this.config.lights)
        break
      case 'skybox':
        if (options?.forceRecreate) {
          this.skyboxModule.dispose()
          await this.skyboxModule.create(this.ctx, this.config.skybox)
        } else {
          await this.skyboxModule.apply(this.config.skybox)
        }
        break
      case 'model':
        if (options?.forceRecreate) {
          this.modelModule.dispose()
          this.modelModule.setCameraModule(this.cameraModule)
          await this.modelModule.create(this.ctx, this.config.model)
        } else {
          await this.modelModule.apply(this.config.model)
        }
        break
      case 'settings':
        await this.settingsModule.apply(this.config.settings)
        break
      default:
        break
    }
  }

  async resetToDefaults(): Promise<void> {
    const defaults = createDefaultConfig()
    this.config = defaults
    if (!this.ctx) return
    this.ctx.config = this.config

    applyEngineConfig(this.ctx.engine, this.config.engine)
    this.sceneModule.apply(this.config.scene)
    this.cameraModule.apply(this.config.camera)
    this.controllerModule.apply(this.config.controller)
    this.lightsModule.apply(this.config.lights)
    this.skyboxModule.dispose()
    await this.skyboxModule.create(this.ctx, this.config.skybox)
    this.modelModule.dispose()
    this.modelModule.setCameraModule(this.cameraModule)
    await this.modelModule.create(this.ctx, this.config.model)
    await this.settingsModule.apply(this.config.settings)
  }

  exportConfig(): string {
    return `${JSON.stringify(this.config, null, 2)}\n`
  }

  downloadConfig(filename = 'scene.json'): void {
    const blob = new Blob([this.exportConfig()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  resize(): void {
    this.ctx?.engine.resize()
  }

  dispose(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
    this.settingsModule.dispose()
    this.modelModule.dispose()
    this.skyboxModule.dispose()
    this.lightsModule.dispose()
    this.controllerModule.dispose()
    this.cameraModule.dispose()
    this.sceneModule.dispose()
    this.ctx?.scene.dispose()
    this.ctx?.engine.dispose()
    this.ctx = null
  }
}
