import {
  isModelUpdateMessage,
  isPipeFlowDebugMessage,
  MSG_MODEL_UPDATE,
  MSG_PIPE_FLOW_DEBUG,
  type CmdMessage,
  type PipeFlowDebugMessage,
} from './types'
import { upsertDeviceMetrics } from '../business/deviceMetrics'

export type ModelUpdateHandler = (objects: import('./types').ModelUpdateObject[]) => void
export type PipeFlowDebugHandler = (msg: PipeFlowDebugMessage) => void

/**
 * 三维侧监听父页面 message（参考 zhaotong onMessage.js）
 * 支持：
 * 1) { type: 'MODEL_UPDATE', objects: [...] }
 * 2) { cmd: 'MODEL_UPDATE', param: { objects: [...] } } 或 param 直接为 objects 数组
 * 3) { type: 'PIPE_FLOW_DEBUG', action, lineName?, visible? }
 */
export function startOnMessage(options?: {
  onModelUpdate?: ModelUpdateHandler
  onPipeFlowDebug?: PipeFlowDebugHandler
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

    if (isPipeFlowDebugMessage(data)) {
      options?.onPipeFlowDebug?.(data)
      console.info(`[message] ${MSG_PIPE_FLOW_DEBUG} action=${data.action}`)
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
      return
    }

    if (cmdMsg.cmd === MSG_PIPE_FLOW_DEBUG && cmdMsg.param && typeof cmdMsg.param === 'object') {
      const p = cmdMsg.param as PipeFlowDebugMessage
      options?.onPipeFlowDebug?.({
        type: MSG_PIPE_FLOW_DEBUG,
        action: p.action,
        lineName: p.lineName,
        visible: p.visible,
      })
      console.info(`[message] cmd ${MSG_PIPE_FLOW_DEBUG} action=${p.action}`)
    }
  }

  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
