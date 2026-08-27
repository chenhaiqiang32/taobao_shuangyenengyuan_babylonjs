import type { BusinessFeatures } from '../business/features'

/**
 * 右上角业务工具条：屋顶显隐 + 视角切换（紧凑横排）
 */
export function createRoofToggleButton(business: BusinessFeatures): HTMLDivElement {
  const bar = document.createElement('div')
  bar.className = 'biz-toolbar'

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

  const printBtn = document.createElement('button')
  printBtn.type = 'button'
  printBtn.className = 'biz-btn'
  printBtn.textContent = '打印位姿'
  printBtn.title = '打印当前相机位置与控制器位置到控制台'
  printBtn.addEventListener('click', () => {
    business.printCameraPose()
  })

  syncRoofLabel()
  bar.append(roofBtn, energyBtn, terminalBtn)
  document.body.appendChild(bar)
  return bar
}
