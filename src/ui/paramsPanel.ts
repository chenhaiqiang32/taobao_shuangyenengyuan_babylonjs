import GUI from 'lil-gui'
import type { AppOrchestrator } from '../core/app'
import type { LightConfig, SceneAppConfig } from '../config/types'

export function createParamsPanel(app: AppOrchestrator): GUI {
  const gui = new GUI({ title: 'Scene Params' })
  const config = app.getConfig()

  const bindingFolder = gui.addFolder('Controls Binding')
  bindingFolder.add(config, 'controlsModelName').name('controlsModelName').onFinishChange(() => {
    void app.applySection('controlsModelName', config.controlsModelName)
  })
  bindingFolder.add(config, 'cameraRadiusFactor', 0.1, 5, 0.1).name('cameraRadiusFactor').onChange(() => {
    void app.applySection('cameraRadiusFactor', config.cameraRadiusFactor)
  })
  bindingFolder
    .add(
      {
        rebind: () => {
          void app.applySection('controlsModelName', config.controlsModelName)
        },
      },
      'rebind',
    )
    .name('Rebind Now')

  const engineFolder = gui.addFolder('Engine')
  engineFolder.add(config.engine, 'hardwareScalingLevel', 0.5, 2, 0.05).onChange(() => {
    void app.applySection('engine', config.engine)
  })
  engineFolder.add(config.engine, 'antialias').onChange(() => {
    console.info('[gui] antialias applies on next page reload')
  })
  engineFolder.add(config.engine, 'adaptToDeviceRatio').onChange(() => {
    console.info('[gui] adaptToDeviceRatio applies on next page reload')
  })

  const sceneFolder = gui.addFolder('Scene')
  sceneFolder.addColor(asColorProxy(config.scene, 'clearColor'), 'value').name('clearColor').onChange(() => {
    void app.applySection('scene', config.scene)
  })
  sceneFolder.addColor(asColorProxy(config.scene, 'ambientColor'), 'value').name('ambientColor').onChange(() => {
    void app.applySection('scene', config.scene)
  })
  sceneFolder.add(config.scene, 'environmentIntensity', 0, 4, 0.01).onChange(() => {
    void app.applySection('scene', config.scene)
  })
  const fogFolder = sceneFolder.addFolder('Fog')
  fogFolder.add(config.scene.fog, 'enabled').onChange(() => void app.applySection('scene', config.scene))
  fogFolder
    .add(config.scene.fog, 'mode', ['none', 'exp', 'exp2', 'linear'])
    .onChange(() => void app.applySection('scene', config.scene))
  fogFolder.add(config.scene.fog, 'density', 0, 0.1, 0.001).onChange(() => void app.applySection('scene', config.scene))
  fogFolder.add(config.scene.fog, 'start', 0, 500, 1).onChange(() => void app.applySection('scene', config.scene))
  fogFolder.add(config.scene.fog, 'end', 0, 2000, 1).onChange(() => void app.applySection('scene', config.scene))

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(config.camera, 'alpha', -Math.PI * 2, Math.PI * 2, 0.01).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  cameraFolder.add(config.camera, 'beta', 0.01, Math.PI - 0.01, 0.01).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  cameraFolder.add(config.camera, 'radius', 1, 50000, 1).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  cameraFolder.add(config.camera, 'minZ', 0.01, 50, 0.01).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  cameraFolder.add(config.camera, 'maxZ', 100, 200000, 100).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  cameraFolder.add(config.camera, 'upperRadiusLimit', 10, 100000, 10).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  cameraFolder.add(config.camera, 'fov', 0.2, 1.8, 0.01).onChange(() => {
    void app.applySection('camera', config.camera)
  })
  addVec3(cameraFolder, config.camera.target, 'target', () => {
    void app.applySection('camera', config.camera)
  })

  const ctrlFolder = gui.addFolder('Controller')
  ctrlFolder.add(config.controller, 'attachControl').onChange(() => void app.applySection('controller', config.controller))
  addVec3(ctrlFolder, config.controller.target, 'target (默认坐标)', () => {
    void app.applySection('controller', config.controller)
  })
  ctrlFolder.add(config.controller, 'inertia', 0, 0.99, 0.01).onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder
    .add(config.controller, 'panningSensibility', 1, 2000, 1)
    .name('panSens (越小越快)')
    .onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder
    .add(config.controller, 'wheelDeltaPercentage', 0, 0.1, 0.001)
    .name('wheel% (大场景缩放)')
    .onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'wheelPrecision', 0.5, 50, 0.5).onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'angularSensibilityX', 50, 5000, 10).onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'angularSensibilityY', 50, 5000, 10).onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'useCtrlForPanning').onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder
    .add(config.controller, 'panningMouseButton', { Left: 0, Middle: 1, Right: 2 })
    .onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'allowPan').onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'allowZoom').onChange(() => void app.applySection('controller', config.controller))
  ctrlFolder.add(config.controller, 'allowRotate').onChange(() => void app.applySection('controller', config.controller))

  const lightsFolder = gui.addFolder('Lights')
  for (const light of config.lights) {
    bindLightFolder(lightsFolder, light, config, app)
  }

  const skyFolder = gui.addFolder('Skybox / HDR')
  skyFolder.add(config.skybox, 'enabled').name('启用天空盒').onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder
    .add(config.skybox, 'showMesh')
    .name('显示天空盒网格')
    .onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder
    .add(config.skybox, 'asEnvironmentTexture')
    .name('作为HDR环境贴图(IBL)')
    .onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder
    .add(config.skybox, 'format', ['hdr', 'env'])
    .name('格式')
    .onFinishChange(() => {
      void app.applySection('skybox', config.skybox, { forceRecreate: true })
    })

  const hdrPresets: Record<string, string> = {
    '本地 horn-koppe': '/hdr/rural_evening_road_1k.hdr',
    'Babylon env(CDN)': 'https://assets.babylonjs.com/environments/environmentSpecular.env',
    自定义: config.skybox.hdrUrl,
  }
  const skyPresetState = {
    preset:
      Object.entries(hdrPresets).find(([, url]) => url === config.skybox.hdrUrl)?.[0] ?? '自定义',
  }
  skyFolder
    .add(skyPresetState, 'preset', Object.keys(hdrPresets))
    .name('贴图预设')
    .onChange((name: string) => {
      const url = hdrPresets[name]
      if (!url || name === '自定义') return
      config.skybox.hdrUrl = url
      config.skybox.format = url.endsWith('.hdr') ? 'hdr' : 'env'
      void app.applySection('skybox', config.skybox, { forceRecreate: true })
      gui.controllersRecursive().forEach((c) => c.updateDisplay())
    })

  skyFolder
    .add(config.skybox, 'hdrUrl')
    .name('hdrUrl 路径')
    .onFinishChange(() => {
      skyPresetState.preset = '自定义'
      if (config.skybox.hdrUrl.endsWith('.hdr')) config.skybox.format = 'hdr'
      else if (config.skybox.hdrUrl.endsWith('.env')) config.skybox.format = 'env'
      void app.applySection('skybox', config.skybox, { forceRecreate: true })
      gui.controllersRecursive().forEach((c) => c.updateDisplay())
    })
  skyFolder.add(config.skybox, 'size', 10, 20000, 10).name('天空盒尺寸').onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder.add(config.skybox, 'blur', 0, 1, 0.01).name('模糊').onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder.add(config.skybox, 'rotationY', -Math.PI, Math.PI, 0.01).name('旋转Y').onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder.add(config.skybox, 'level', 0, 4, 0.01).name('强度 level').onChange(() => void app.applySection('skybox', config.skybox))
  skyFolder
    .add(config.skybox, 'hdrSize', 64, 512, 64)
    .name('HDR立方体尺寸')
    .onFinishChange(() => {
      void app.applySection('skybox', config.skybox, { forceRecreate: true })
    })

  const modelFolder = gui.addFolder('Model')
  modelFolder.add(config.model, 'enabled').onChange(() => void app.applySection('model', config.model))
  modelFolder.add(config.model, 'url').onFinishChange(() => {
    void app.applySection('model', config.model, { forceRecreate: true })
  })
  addVec3(modelFolder, config.model.position, 'position', () => void app.applySection('model', config.model))
  addVec3(modelFolder, config.model.rotation, 'rotation', () => void app.applySection('model', config.model))
  addVec3(modelFolder, config.model.scaling, 'scaling', () => void app.applySection('model', config.model))
  modelFolder.add(config.model, 'autoCenter').onChange(() => void app.applySection('model', config.model))
  modelFolder.add(config.model, 'autoFitCamera').onChange(() => void app.applySection('model', config.model))
  modelFolder
    .add(config.model, 'fixTransparentDepth')
    .name('修复透明深度叠加')
    .onChange(() => {
      void app.applySection('model', config.model, { forceRecreate: true })
    })

  const animFolder = modelFolder.addFolder('Animations')
  animFolder
    .add(config.model, 'playAnimationsByDefault')
    .name('默认全部播放')
    .onChange(() => {
      for (const anim of config.model.animations) {
        anim.play = config.model.playAnimationsByDefault
      }
      void app.applySection('model', config.model)
      gui.controllersRecursive().forEach((c) => c.updateDisplay())
    })
  animFolder
    .add(
      {
        playAll: () => {
          for (const anim of config.model.animations) {
            anim.play = true
            anim.loop = true
          }
          config.model.playAnimationsByDefault = true
          void app.applySection('model', config.model)
          gui.controllersRecursive().forEach((c) => c.updateDisplay())
        },
      },
      'playAll',
    )
    .name('Play All')
  animFolder
    .add(
      {
        stopAll: () => {
          for (const anim of config.model.animations) {
            anim.play = false
          }
          void app.applySection('model', config.model)
          gui.controllersRecursive().forEach((c) => c.updateDisplay())
        },
      },
      'stopAll',
    )
    .name('Stop All')

  if (config.model.animations.length === 0) {
    animFolder.add({ tip: '(加载后自动写入动画清单)' }, 'tip').name('status').disable()
  } else {
    for (const anim of config.model.animations) {
      const sub = animFolder.addFolder(anim.name || '(unnamed)')
      sub.add(anim, 'play').onChange(() => void app.applySection('model', config.model))
      sub.add(anim, 'loop').onChange(() => void app.applySection('model', config.model))
      sub.add(anim, 'speedRatio', 0.05, 3, 0.05).onChange(() => void app.applySection('model', config.model))
    }
  }
  const settingsFolder = gui.addFolder('Settings')
  settingsFolder.add(config.settings, 'exposure', 0, 4, 0.01).onChange(() => void app.applySection('settings', config.settings))
  settingsFolder.add(config.settings, 'contrast', 0, 4, 0.01).onChange(() => void app.applySection('settings', config.settings))
  settingsFolder.add(config.settings, 'toneMappingEnabled').onChange(() => void app.applySection('settings', config.settings))
  settingsFolder
    .add(config.settings, 'toneMappingType', ['standard', 'aces'])
    .onChange(() => void app.applySection('settings', config.settings))
  settingsFolder.add(config.settings, 'shadowsEnabled').onChange(() => void app.applySection('settings', config.settings))
  settingsFolder.add(config.settings, 'showFps').onChange(() => void app.applySection('settings', config.settings))
  settingsFolder.add(config.settings, 'inspectorEnabled').onChange(() => void app.applySection('settings', config.settings))

  const actions = {
    exportJson: () => app.downloadConfig(),
    copyJson: async () => {
      await navigator.clipboard.writeText(app.exportConfig())
      console.info('[gui] config copied to clipboard')
    },
    resetDefaults: async () => {
      await app.resetToDefaults()
      gui.controllersRecursive().forEach((c) => c.updateDisplay())
    },
  }
  const actionsFolder = gui.addFolder('Actions')
  actionsFolder.add(actions, 'exportJson').name('Export JSON')
  actionsFolder.add(actions, 'copyJson').name('Copy JSON')
  actionsFolder.add(actions, 'resetDefaults').name('Reset Defaults')

  gui.open()
  return gui
}

function bindLightFolder(
  parent: GUI,
  light: LightConfig,
  config: SceneAppConfig,
  app: AppOrchestrator,
): void {
  const folder = parent.addFolder(light.id)
  const apply = () => void app.applySection('lights', config.lights)
  folder.add(light, 'enabled').onChange(apply)
  folder.add(light, 'intensity', 0, 5, 0.01).onChange(apply)
  folder.addColor(asColorProxy(light, 'color'), 'value').name('color').onChange(apply)
  if (light.direction) {
    addVec3(folder, light.direction, 'direction', apply)
  }
  if (light.position) {
    addVec3(folder, light.position, 'position', apply)
  }
}

function addVec3(folder: GUI, vec: [number, number, number], name: string, onChange: () => void): void {
  const sub = folder.addFolder(name)
  sub.add(vec, '0', -500, 500, 0.01).name('x').onChange(onChange)
  sub.add(vec, '1', -500, 500, 0.01).name('y').onChange(onChange)
  sub.add(vec, '2', -500, 500, 0.01).name('z').onChange(onChange)
}

/** lil-gui color helper for tuple colors */
function asColorProxy(
  obj: object,
  key: string,
): { value: number[] } {
  const record = obj as Record<string, number[]>
  return {
    get value() {
      return [...record[key]]
    },
    set value(next: number[]) {
      const target = record[key]
      for (let i = 0; i < next.length; i++) {
        target[i] = next[i]
      }
    },
  }
}
