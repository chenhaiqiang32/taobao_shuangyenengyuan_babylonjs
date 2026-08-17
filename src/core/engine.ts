import { Engine } from '@babylonjs/core/Engines/engine'
import type { EngineConfig } from '../config/types'

export function createEngine(canvas: HTMLCanvasElement, config: EngineConfig): Engine {
  const engine = new Engine(canvas, config.antialias, {
    adaptToDeviceRatio: config.adaptToDeviceRatio,
    preserveDrawingBuffer: true,
    stencil: true,
  })
  engine.setHardwareScalingLevel(config.hardwareScalingLevel)
  return engine
}

export function applyEngineConfig(engine: Engine, config: EngineConfig): void {
  engine.setHardwareScalingLevel(config.hardwareScalingLevel)
}
