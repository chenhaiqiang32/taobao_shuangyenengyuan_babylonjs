import { CONFIG_VERSION, createDefaultConfig } from './defaults'
import { withBase } from './baseUrl'
import type { SceneAppConfig } from './types'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? structuredClone(patch) : structuredClone(base)) as T
  }
  if (!isObject(base)) {
    return (patch === undefined ? base : (patch as T))
  }
  const result: Record<string, unknown> = { ...base }
  if (!isObject(patch)) {
    return result as T
  }
  for (const key of Object.keys(base)) {
    const baseVal = (base as Record<string, unknown>)[key]
    const patchVal = patch[key]
    if (patchVal === undefined) {
      continue
    }
    if (isObject(baseVal) && isObject(patchVal)) {
      result[key] = deepMerge(baseVal, patchVal)
    } else if (Array.isArray(baseVal)) {
      result[key] = Array.isArray(patchVal) ? structuredClone(patchVal) : structuredClone(baseVal)
    } else {
      result[key] = patchVal
    }
  }
  return result as T
}

export async function loadConfig(url = 'config/scene.json'): Promise<SceneAppConfig> {
  const defaults = createDefaultConfig()
  const resolvedUrl = withBase(url)
  try {
    const res = await fetch(resolvedUrl)
    if (!res.ok) {
      console.warn(`[config] Failed to load ${resolvedUrl} (${res.status}), using defaults`)
      return defaults
    }
    const json: unknown = await res.json()
    const merged = deepMerge(defaults, json)
    if (merged.version !== CONFIG_VERSION) {
      console.warn(
        `[config] version mismatch: got ${String((json as { version?: number }).version)}, expected ${CONFIG_VERSION}. Merged with defaults.`,
      )
    }
    return merged
  } catch (err) {
    console.warn('[config] load error, using defaults', err)
    return defaults
  }
}

export function cloneConfig(config: SceneAppConfig): SceneAppConfig {
  return structuredClone(config)
}
