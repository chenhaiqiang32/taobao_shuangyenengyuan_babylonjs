/**
 * 设备指标内存仓库：由 MODEL_UPDATE 写入，信息牌读取
 */
import type { ModelUpdateObject } from '../message/types'

const store = new Map<string, Record<string, string | number>>()

/** 统一设备名：去掉尾部多余下划线，便于 BIM_主机_1 与 BIM_主机_1_ 匹配 */
export function normalizeDeviceName(name: string): string {
  return String(name || '')
    .trim()
    .replace(/_+$/g, '')
}

export function upsertDeviceMetrics(objects: ModelUpdateObject[]): void {
  for (const obj of objects) {
    if (!obj?.objectName) continue
    const key = normalizeDeviceName(obj.objectName)
    store.set(key, { ...(obj.metrics || {}) })
  }
}

export function getDeviceMetrics(objectName: string): Record<string, string | number> | null {
  const key = normalizeDeviceName(objectName)
  return store.get(key) ?? null
}

export function getAllDeviceMetrics(): Map<string, Record<string, string | number>> {
  return store
}

export function clearDeviceMetrics(): void {
  store.clear()
}
