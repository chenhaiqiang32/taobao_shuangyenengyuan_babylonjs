import './style.css'
import { loadConfig } from './config/loadConfig'
import { AppOrchestrator } from './core/app'
// import { createParamsPanel } from './ui/paramsPanel'
import { createBusinessFeatures, type BusinessFeaturesGlobal } from './business/features'
import { createRoofToggleButton } from './ui/roofToggleButton'
import { startOnMessage } from './message/onMessage'
import { postOnLoaded, postOnLoading, postToParent } from './message/postMessage'
import { createDeviceInteraction } from './business/deviceInteraction'
import { createDeviceStatusOverlay } from './business/deviceStatusOverlay'
import { createPipeFlow, type PipeFlowApi } from './business/pipeFlow'
import { MSG_PIPE_FLOW_DEBUG } from './message/types'

function postPipeFlowState(pipeFlow: PipeFlowApi): void {
  postToParent('pipeFlowDebugState', {
    lineNames: pipeFlow.getLineNames(),
    activeLineName: pipeFlow.getActiveLineName(),
  })
}

async function bootstrap(): Promise<void> {
  const appRoot = document.querySelector('#app')
  if (!appRoot) {
    throw new Error('#app not found')
  }

  postOnLoading()

  const canvas = document.createElement('canvas')
  canvas.tabIndex = 0
  appRoot.appendChild(canvas)

  const config = await loadConfig()
  const app = new AppOrchestrator(canvas)
  await app.init(config)
  // createParamsPanel(app)

  // 业务功能：抛出给外部 / 控制台使用
  const business = createBusinessFeatures(app)
  const g = window as unknown as BusinessFeaturesGlobal & { __pipeFlow?: PipeFlowApi | null }
  g.__app = app
  g.__business = business

  // 右上角业务工具条：屋顶显隐 + 视角切换
  createRoofToggleButton(business)

  // 设备点击信息牌 + 父页面 MODEL_UPDATE
  const deviceUi = createDeviceInteraction(app)
  const statusOverlay = createDeviceStatusOverlay(app)
  const pipeFlow = await createPipeFlow(app)
  g.__pipeFlow = pipeFlow

  startOnMessage({
    onModelUpdate(objects) {
      statusOverlay?.applyFromUpdate(objects)
      pipeFlow?.applyFromUpdate(objects)
      for (const obj of objects) {
        deviceUi?.panel.refreshIfSame(obj.objectName, obj.metrics || {})
      }
      if (pipeFlow) postPipeFlowState(pipeFlow)
    },
    onPipeFlowDebug(msg) {
      if (!pipeFlow) return
      if (msg.action === 'setLine') {
        pipeFlow.setDebugLine(msg.lineName ?? null)
      } else if (msg.action === 'setMainModelVisible') {
        pipeFlow.setMainModelVisible(!!msg.visible)
      }
      postPipeFlowState(pipeFlow)
      console.info(`[message] handled ${MSG_PIPE_FLOW_DEBUG}`, msg)
    },
  })

  postOnLoaded()
  if (pipeFlow) postPipeFlowState(pipeFlow)

  window.addEventListener('keydown', (ev) => {
    if (ev.key.toLowerCase() === 'i' && ev.ctrlKey && ev.shiftKey) {
      const cfg = app.getConfig()
      cfg.settings.inspectorEnabled = !cfg.settings.inspectorEnabled
      void app.applySection('settings', cfg.settings)
    }
  })
}

bootstrap().catch((err) => {
  console.error('[bootstrap] failed', err)
})
