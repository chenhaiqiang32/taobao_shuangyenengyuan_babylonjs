import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration'
import type { SettingsConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

export class SettingsModule implements SceneModule<SettingsConfig> {
  readonly name = 'settings'
  private ctx: AppContext | null = null
  private fpsEl: HTMLDivElement | null = null
  private inspectorLoaded = false
  private fpsObserver: { remove: () => void } | null = null

  async create(ctx: AppContext, config: SettingsConfig): Promise<void> {
    this.ctx = ctx
    this.ensureFpsElement()
    await this.apply(config)
  }

  async apply(config: SettingsConfig): Promise<void> {
    const scene = this.ctx?.scene
    if (!scene) return

    scene.imageProcessingConfiguration.exposure = config.exposure
    scene.imageProcessingConfiguration.contrast = config.contrast
    scene.imageProcessingConfiguration.toneMappingEnabled = config.toneMappingEnabled
    scene.imageProcessingConfiguration.toneMappingType =
      config.toneMappingType === 'aces'
        ? ImageProcessingConfiguration.TONEMAPPING_ACES
        : ImageProcessingConfiguration.TONEMAPPING_STANDARD

    scene.shadowsEnabled = config.shadowsEnabled

    if (this.fpsEl) {
      this.fpsEl.hidden = !config.showFps
    }

    await this.applyInspector(config.inspectorEnabled)
  }

  private ensureFpsElement(): void {
    if (this.fpsEl || !this.ctx) return
    const el = document.createElement('div')
    el.className = 'fps-overlay'
    el.textContent = 'FPS: --'
    document.body.appendChild(el)
    this.fpsEl = el

    const engine = this.ctx.engine
    const observer = this.ctx.scene.onBeforeRenderObservable.add(() => {
      if (this.fpsEl && !this.fpsEl.hidden) {
        this.fpsEl.textContent = `FPS: ${engine.getFps().toFixed(1)}`
      }
    })
    this.fpsObserver = {
      remove: () => this.ctx?.scene.onBeforeRenderObservable.remove(observer),
    }
  }

  private async applyInspector(enabled: boolean): Promise<void> {
    const scene = this.ctx?.scene
    if (!scene) return

    if (enabled) {
      if (!this.inspectorLoaded) {
        await import('@babylonjs/core/Debug/debugLayer')
        await import('@babylonjs/inspector')
        this.inspectorLoaded = true
      }
      if (!scene.debugLayer.isVisible()) {
        await scene.debugLayer.show({ embedMode: true })
      }
      return
    }

    // 未启用时不要触碰 debugLayer getter，避免无谓初始化 / 动态加载卡住
    if (this.inspectorLoaded && scene.debugLayer.isVisible()) {
      scene.debugLayer.hide()
    }
  }

  dispose(): void {
    if (this.inspectorLoaded) {
      const scene = this.ctx?.scene
      if (scene?.debugLayer.isVisible()) {
        scene.debugLayer.hide()
      }
    }
    this.fpsObserver?.remove()
    this.fpsObserver = null
    this.fpsEl?.remove()
    this.fpsEl = null
    this.ctx = null
  }
}
