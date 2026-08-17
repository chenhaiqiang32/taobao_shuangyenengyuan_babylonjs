import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Scene } from '@babylonjs/core/scene'
import type { SceneConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

const FOG_MODE: Record<SceneConfig['fog']['mode'], number> = {
  none: Scene.FOGMODE_NONE,
  exp: Scene.FOGMODE_EXP,
  exp2: Scene.FOGMODE_EXP2,
  linear: Scene.FOGMODE_LINEAR,
}

export class SceneModuleImpl implements SceneModule<SceneConfig> {
  readonly name = 'scene'
  private ctx: AppContext | null = null

  create(ctx: AppContext, config: SceneConfig): void {
    this.ctx = ctx
    this.apply(config)
  }

  apply(config: SceneConfig): void {
    const scene = this.ctx?.scene
    if (!scene) return

    const [r, g, b, a] = config.clearColor
    scene.clearColor = new Color4(r, g, b, a)
    scene.ambientColor = Color3.FromArray(config.ambientColor)
    scene.environmentIntensity = config.environmentIntensity

    const fog = config.fog
    scene.fogEnabled = fog.enabled
    scene.fogMode = FOG_MODE[fog.mode] ?? Scene.FOGMODE_NONE
    scene.fogColor = Color3.FromArray(fog.color)
    scene.fogDensity = fog.density
    scene.fogStart = fog.start
    scene.fogEnd = fog.end
  }

  dispose(): void {
    this.ctx = null
  }
}
