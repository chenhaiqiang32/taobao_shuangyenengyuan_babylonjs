import './style.css'
import { loadConfig } from './config/loadConfig'
import { AppOrchestrator } from './core/app'
// import { createParamsPanel } from './ui/paramsPanel'
import { createBusinessFeatures, type BusinessFeaturesGlobal } from './business/features'
import { createRoofToggleButton } from './ui/roofToggleButton'

async function bootstrap(): Promise<void> {
  const appRoot = document.querySelector('#app')
  if (!appRoot) {
    throw new Error('#app not found')
  }

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

  // 右上角「隐藏屋顶」按钮
  createRoofToggleButton(business)

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
