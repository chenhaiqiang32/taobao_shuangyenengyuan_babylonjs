import type { BusinessFeatures } from '../business/features'
import type { CameraPoseSnapshot } from '../modules/camera'

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

function formatVec3(v: [number, number, number]): string {
  return `[${v.join(', ')}]`
}

/** 生成可粘贴到 CAMERA_VIEW_PRESETS 的位姿片段 */
function formatPosePresetCode(snap: CameraPoseSnapshot): string {
  return [
    '{',
    `  position: ${formatVec3(snap.cameraPosition)},`,
    `  rotationDeg: ${formatVec3(snap.cameraRotationDeg)},`,
    `  target: ${formatVec3(snap.controllerTarget)},`,
    '}',
  ].join('\n')
}

// function showCameraPoseDialog(snap: CameraPoseSnapshot): void {
//   document.getElementById('biz-pose-dialog')?.remove()

//   const presetCode = formatPosePresetCode(snap)

//   const overlay = document.createElement('div')
//   overlay.id = 'biz-pose-dialog'
//   overlay.className = 'biz-pose-dialog'
//   overlay.innerHTML = `
//     <div class="biz-pose-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="biz-pose-title">
//       <div class="biz-pose-dialog__header">
//         <span id="biz-pose-title" class="biz-pose-dialog__title">当前相机 / 控制器位姿</span>
//         <button type="button" class="biz-pose-dialog__close" aria-label="关闭">×</button>
//       </div>
//       <div class="biz-pose-dialog__body">
//         <p class="biz-pose-dialog__hint">可复制下方代码到 features.ts 的 CAMERA_VIEW_PRESETS</p>
//         <pre class="biz-pose-dialog__code"></pre>
//         <dl class="biz-pose-dialog__meta">
//           <div><dt>相机位置</dt><dd></dd></div>
//           <div><dt>旋转 (°)</dt><dd></dd></div>
//           <div><dt>控制器 target</dt><dd></dd></div>
//           <div><dt>alpha / beta / radius</dt><dd></dd></div>
//         </dl>
//       </div>
//       <div class="biz-pose-dialog__footer">
//         <button type="button" class="biz-btn biz-pose-dialog__copy">复制预设代码</button>
//         <button type="button" class="biz-btn biz-pose-dialog__ok">关闭</button>
//       </div>
//     </div>
//   `

//   const codeEl = overlay.querySelector('.biz-pose-dialog__code') as HTMLPreElement
//   codeEl.textContent = presetCode

//   const dds = overlay.querySelectorAll('.biz-pose-dialog__meta dd')
//   dds[0].textContent = formatVec3(snap.cameraPosition)
//   dds[1].textContent = formatVec3(snap.cameraRotationDeg)
//   dds[2].textContent = formatVec3(snap.controllerTarget)
//   dds[3].textContent = `${snap.alpha} / ${snap.beta} / ${snap.radius}`

//   const close = (): void => {
//     overlay.remove()
//     window.removeEventListener('keydown', onKey)
//   }
//   const onKey = (e: KeyboardEvent): void => {
//     if (e.key === 'Escape') close()
//   }

//   overlay.querySelector('.biz-pose-dialog__close')?.addEventListener('click', close)
//   overlay.querySelector('.biz-pose-dialog__ok')?.addEventListener('click', close)
//   overlay.addEventListener('click', (e) => {
//     if (e.target === overlay) close()
//   })

//   const copyBtn = overlay.querySelector('.biz-pose-dialog__copy') as HTMLButtonElement
//   copyBtn.addEventListener('click', async () => {
//     try {
//       await navigator.clipboard.writeText(presetCode)
//       copyBtn.textContent = '已复制'
//       window.setTimeout(() => {
//         copyBtn.textContent = '复制预设代码'
//       }, 1500)
//     } catch {
//       // 降级：选中文本便于 Ctrl+C
//       const range = document.createRange()
//       range.selectNodeContents(codeEl)
//       const sel = window.getSelection()
//       sel?.removeAllRanges()
//       sel?.addRange(range)
//       copyBtn.textContent = '请手动复制'
//     }
//   })

//   window.addEventListener('keydown', onKey)
//   document.body.appendChild(overlay)
// }

/**
 * 右上角业务工具条：当前工况 + 屋顶显隐 + 视角切换 + 获取位姿
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

  // const poseBtn = document.createElement('button')
  // poseBtn.type = 'button'
  // poseBtn.className = 'biz-btn'
  // poseBtn.textContent = '获取当前视角'
  // poseBtn.title = '读取当前相机与控制器位姿，用于修改预设视角'
  // poseBtn.addEventListener('click', () => {
  //   const snap = business.getCameraPose()
  //   if (!snap) {
  //     window.alert('相机未就绪')
  //     return
  //   }
  //   business.printCameraPose()
  //   showCameraPoseDialog(snap)
  // })

  syncRoofLabel()
  // bar.append(conditionEl, roofBtn, energyBtn, terminalBtn, poseBtn)
  bar.append(conditionEl, roofBtn, energyBtn, terminalBtn)
  document.body.appendChild(bar)
  return { root: bar, setWorkingCondition }
}
