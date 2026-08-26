/** 父页面 → 三维：设备指标更新 */
export const MSG_MODEL_UPDATE = 'MODEL_UPDATE' as const

/** 三维 → 父页面：常用回传 cmd（与参考项目风格一致） */
export type PostCmd =
  | 'onLoading'
  | 'onLoaded'
  | 'web3dDeviceClick'
  | 'web3dDevicePanelClose'

export interface ModelUpdateObject {
  /** 与模型「设备_指定名称」下 BIM_* 节点名匹配（可带或不带尾部下划线） */
  objectName: string
  /** 信息牌展示的键值对 */
  metrics: Record<string, string | number>
}

export interface ModelUpdateMessage {
  type: typeof MSG_MODEL_UPDATE
  objects: ModelUpdateObject[]
}

/** 兼容参考项目的 cmd 信封格式 */
export interface CmdMessage<T = unknown> {
  cmd: string
  param?: T
}

export function isModelUpdateMessage(data: unknown): data is ModelUpdateMessage {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return d.type === MSG_MODEL_UPDATE && Array.isArray(d.objects)
}
