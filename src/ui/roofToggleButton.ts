import type { BusinessFeatures } from '../business/features'

/**
 * 右上角业务按钮：隐藏/显示屋顶
 */
export function createRoofToggleButton(business: BusinessFeatures): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'biz-btn biz-btn-roof'
  btn.textContent = '隐藏屋顶'

  const syncLabel = (): void => {
    const visible = business.isRoofVisible()
    // null 视为当前可见（尚未隐藏）
    const isVisible = visible !== false
    btn.textContent = isVisible ? '隐藏屋顶' : '显示屋顶'
    btn.dataset.visible = isVisible ? '1' : '0'
  }

  btn.addEventListener('click', () => {
    const next = business.toggleRoofVisible()
    if (next === null) {
      btn.textContent = '未找到屋顶'
      return
    }
    syncLabel()
  })

  syncLabel()
  document.body.appendChild(btn)
  return btn
}
