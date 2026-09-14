import type { BusinessFeatures } from '../business/features'

/** 工况内部名 → 展示名 */
const CONDITION_LABELS: Record<string, string> = {
  ZJDDGL主机单独供冷: '主机单独供冷',
  XSGGL蓄水罐供冷: '蓄水罐供冷',
  ZJXL主机蓄冷: '主机蓄冷',
  LHGL联合供冷: '联合供冷',
  BGBX边供边蓄: '边供边蓄',
}

export interface BizToolbarApi {
  root: HTMLDivElement
  setWorkingCondition: (conditionKey: string | null) => void
}

/**
 * 右上角业务工具条：当前工况 + 屋顶显隐 + 视角切换
 */
export function createRoofToggleButton(business: BusinessFeatures): BizToolbarApi {
  const bar = document.createElement('div')
  bar.className = 'biz-toolbar'

  const conditionEl = document.createElement('span')
  conditionEl.className = 'biz-condition'
  conditionEl.textContent = '工况：—'
  conditionEl.title = '根据 MODEL_UPDATE 匹配的当前工况'

  const setWorkingCondition = (conditionKey: string | null): void => {
    if (!conditionKey) {
      conditionEl.textContent = '工况：无匹配'
      conditionEl.dataset.active = '0'
      conditionEl.title = '未匹配到工况'
      return
    }
    const label = CONDITION_LABELS[conditionKey] ?? conditionKey
    conditionEl.textContent = `工况：${label}`
    conditionEl.dataset.active = '1'
    conditionEl.title = conditionKey
  }

  const roofBtn = document.createElement('button')
  roofBtn.type = 'button'
  roofBtn.className = 'biz-btn'
  roofBtn.textContent = '隐藏屋顶'

  const syncRoofLabel = (): void => {
    const visible = business.isRoofVisible()
    // null 视为当前可见（尚未隐藏）
    const isVisible = visible !== false
    roofBtn.textContent = isVisible ? '隐藏屋顶' : '显示屋顶'
    roofBtn.dataset.visible = isVisible ? '1' : '0'
  }

  roofBtn.addEventListener('click', () => {
    const next = business.toggleRoofVisible()
    if (next === null) {
      roofBtn.textContent = '未找到屋顶'
      return
    }
    syncRoofLabel()
  })

  const energyBtn = document.createElement('button')
  energyBtn.type = 'button'
  energyBtn.className = 'biz-btn'
  energyBtn.textContent = '切换到能源站视角'
  energyBtn.title = '切换到能源站视角'
  energyBtn.addEventListener('click', () => {
    business.setCameraView('energyStation')
  })

  const terminalBtn = document.createElement('button')
  terminalBtn.type = 'button'
  terminalBtn.className = 'biz-btn'
  terminalBtn.textContent = '切换到末端视角'
  terminalBtn.title = '切换到末端视角'
  terminalBtn.addEventListener('click', () => {
    business.setCameraView('terminal')
  })

  syncRoofLabel()
  bar.append(conditionEl, roofBtn, energyBtn, terminalBtn)
  document.body.appendChild(bar)
  return { root: bar, setWorkingCondition }
}
