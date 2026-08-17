import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { PointLight } from '@babylonjs/core/Lights/pointLight'
import type { Light } from '@babylonjs/core/Lights/light'
import type { LightConfig } from '../config/types'
import type { AppContext, SceneModule } from '../core/types'

export class LightsModule implements SceneModule<LightConfig[]> {
  readonly name = 'lights'
  private ctx: AppContext | null = null
  private lights = new Map<string, Light>()

  create(ctx: AppContext, config: LightConfig[]): void {
    this.ctx = ctx
    this.apply(config)
  }

  apply(config: LightConfig[]): void {
    const scene = this.ctx?.scene
    if (!scene) return

    const nextIds = new Set(config.map((l) => l.id))
    for (const [id, light] of this.lights) {
      if (!nextIds.has(id)) {
        light.dispose()
        this.lights.delete(id)
      }
    }

    for (const lightCfg of config) {
      let light = this.lights.get(lightCfg.id)
      if (!light || light.getClassName().toLowerCase().indexOf(lightCfg.type) < 0) {
        light?.dispose()
        light = this.createLight(lightCfg)
        this.lights.set(lightCfg.id, light)
      }
      this.updateLight(light, lightCfg)
    }
  }

  private createLight(cfg: LightConfig): Light {
    const scene = this.ctx!.scene
    switch (cfg.type) {
      case 'hemispheric':
        return new HemisphericLight(
          cfg.id,
          Vector3.FromArray(cfg.direction ?? [0, 1, 0]),
          scene,
        )
      case 'directional':
        return new DirectionalLight(
          cfg.id,
          Vector3.FromArray(cfg.direction ?? [-1, -1, -1]),
          scene,
        )
      case 'point':
        return new PointLight(cfg.id, Vector3.FromArray(cfg.position ?? [0, 10, 0]), scene)
      default: {
        const _exhaustive: never = cfg.type
        throw new Error(`Unknown light type: ${String(_exhaustive)}`)
      }
    }
  }

  private updateLight(light: Light, cfg: LightConfig): void {
    light.setEnabled(cfg.enabled)
    light.intensity = cfg.intensity
    light.diffuse = Color3.FromArray(cfg.color)
    if (cfg.specular) {
      light.specular = Color3.FromArray(cfg.specular)
    }

    if (light instanceof HemisphericLight || light instanceof DirectionalLight) {
      if (cfg.direction) {
        light.direction = Vector3.FromArray(cfg.direction)
      }
    }
    if (light instanceof PointLight && cfg.position) {
      light.position = Vector3.FromArray(cfg.position)
    }
  }

  dispose(): void {
    for (const light of this.lights.values()) {
      light.dispose()
    }
    this.lights.clear()
    this.ctx = null
  }
}
