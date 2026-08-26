import { isModelUpdateMessage, MSG_MODEL_UPDATE, type CmdMessage } from './types'
import { upsertDeviceMetrics } from '../business/deviceMetrics'

export type ModelUpdateHandler = (objects: import('./types').ModelUpdateObject[]) => void

/**
 * 三维侧监听父页面 message（参考 zhaotong onMessage.js）
 * 支持：
 * 1) { type: 'MODEL_UPDATE', objects: [...] }
 * 2) { cmd: 'MODEL_UPDATE', param: { objects: [...] } } 或 param 直接为 objects 数组
 */
export function startOnMessage(options?: {
  onModelUpdate?: ModelUpdateHandler
}): () => void {
  const handler = (event: MessageEvent): void => {
    const data = event.data
    if (!data || typeof data !== 'object') return

    // 格式 A：type + objects
    if (isModelUpdateMessage(data)) {
      upsertDeviceMetrics(data.objects)
      options?.onModelUpdate?.(data.objects)
      console.info(`[message] ${MSG_MODEL_UPDATE} objects=${data.objects.length}`)
      return
    }

    // 格式 B：cmd 信封
    const cmdMsg = data as CmdMessage
    if (cmdMsg.cmd === MSG_MODEL_UPDATE) {
      const param = cmdMsg.param
      let objects: import('./types').ModelUpdateObject[] = []
      if (Array.isArray(param)) {
        objects = param
      } else if (param && typeof param === 'object' && Array.isArray((param as { objects?: unknown }).objects)) {
        objects = (param as { objects: import('./types').ModelUpdateObject[] }).objects
      }
      if (objects.length) {
        upsertDeviceMetrics(objects)
        options?.onModelUpdate?.(objects)
        console.info(`[message] cmd ${MSG_MODEL_UPDATE} objects=${objects.length}`)
      }
    }
  }

  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
