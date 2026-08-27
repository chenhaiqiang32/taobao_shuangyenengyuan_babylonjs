import './style.css'
import { loadConfig } from './config/loadConfig'
import { AppOrchestrator } from './core/app'
// import { createParamsPanel } from './ui/paramsPanel'
import { createBusinessFeatures, type BusinessFeaturesGlobal } from './business/features'
import { createRoofToggleButton } from './ui/roofToggleButton'
import { startOnMessage } from './message/onMessage'
import { postOnLoaded, postOnLoading } from './message/postMessage'
import { createDeviceInteraction } from './business/deviceInteraction'
import { createDeviceStatusOverlay } from './business/deviceStatusOverlay'
import { createPipeFlow } from './business/pipeFlow'

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
  const g = window as unknown as BusinessFeaturesGlobal
  g.__app = app
  g.__business = business

  // 右上角业务工具条：屋顶显隐 + 视角切换
  createRoofToggleButton(business)

  // 设备点击信息牌 + 父页面 MODEL_UPDATE
  const deviceUi = createDeviceInteraction(app)
  const statusOverlay = createDeviceStatusOverlay(app)
  const pipeFlow = createPipeFlow(app)
  startOnMessage({
    onModelUpdate(objects) {
      statusOverlay?.applyFromUpdate(objects)
      pipeFlow?.applyFromUpdate(objects)
      for (const obj of objects) {
        deviceUi?.panel.refreshIfSame(obj.objectName, obj.metrics || {})
      }
    },
  })

  postOnLoaded()

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
