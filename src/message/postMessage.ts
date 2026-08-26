import type { PostCmd } from './types'

/**
 * 三维 → 父页面 postMessage（参考 zhaotong postMessage.js）
 */
export function postToParent(cmd: PostCmd, param?: unknown, targetOrigin = '*'): void {
  if (window.parent === window) return
  window.parent.postMessage({ cmd, param }, targetOrigin)
}

export const postOnLoading = (): void => {
  postToParent('onLoading')
}

export const postOnLoaded = (): void => {
  postToParent('onLoaded')
}

/** 点击设备后通知父页面 */
export const postDeviceClick = (data: {
  objectName: string
  metrics: Record<string, string | number>
}): void => {
  postToParent('web3dDeviceClick', data)
}

/** 关闭设备信息牌 */
export const postDevicePanelClose = (objectName: string): void => {
  postToParent('web3dDevicePanelClose', { objectName })
}
