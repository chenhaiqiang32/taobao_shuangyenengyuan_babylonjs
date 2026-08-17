import type { Engine } from '@babylonjs/core/Engines/engine'
import type { Scene } from '@babylonjs/core/scene'
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import type { SceneAppConfig } from '../config/types'

export interface AppContext {
  canvas: HTMLCanvasElement
  engine: Engine
  scene: Scene
  camera: ArcRotateCamera | null
  config: SceneAppConfig
}

export interface SceneModule<TConfig> {
  readonly name: string
  create(ctx: AppContext, config: TConfig): void | Promise<void>
  apply(config: TConfig): void | Promise<void>
  dispose(): void
}
