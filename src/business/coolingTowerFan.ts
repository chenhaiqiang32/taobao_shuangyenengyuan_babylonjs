/**
 * 冷却塔扇叶动画：由 MODEL_UPDATE 的运行信号驱动
 * BIM_冷却塔_1_ → 扇叶Action
 * BIM_冷却塔_2_ → 扇叶.001Action
 * 运行信号 1 开 / 0 关
 */
import type { AppOrchestrator } from '../core/app'
import { getDeviceMetrics } from './deviceMetrics'

export const COOLING_TOWER_FAN_BINDINGS = [
  { objectName: 'BIM_冷却塔_1_', animationName: '扇叶Action' },
  { objectName: 'BIM_冷却塔_2_', animationName: '扇叶.001Action' },
] as const

export function isCoolingTowerFanAnimation(name: string): boolean {
  return COOLING_TOWER_FAN_BINDINGS.some((b) => b.animationName === name)
}

function isRunningSignalOn(objectName: string): boolean {
  const metrics = getDeviceMetrics(objectName)
  if (!metrics) return false
  if ('运行信号' in metrics) return Number(metrics['运行信号']) === 1
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith('运行信号')) return Number(value) === 1
  }
  return false
}

/** 按当前指标仓库同步两台冷却塔扇叶动画 */
export function syncCoolingTowerFans(app: AppOrchestrator): void {
  const model = app.getModelModule()
  for (const { objectName, animationName } of COOLING_TOWER_FAN_BINDINGS) {
    const play = isRunningSignalOn(objectName)
    model.setAnimationPlaying(animationName, play)
  }
}

/** 模型加载后先停住，等待 MODEL_UPDATE */
export function resetCoolingTowerFans(app: AppOrchestrator): void {
  const model = app.getModelModule()
  for (const { animationName } of COOLING_TOWER_FAN_BINDINGS) {
    model.setAnimationPlaying(animationName, false)
  }
}
