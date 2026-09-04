/**
 * 工况管线水流：根据 MODEL_UPDATE 判定工况线条，沿路径生成 GreasedLine 着色器流动效果
 */
import '@babylonjs/loaders/glTF'
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { CreateGreasedLine } from '@babylonjs/core/Meshes/Builders/greasedLineBuilder'
import {
  GreasedLineMeshMaterialType,
  type IGreasedLineMaterial,
} from '@babylonjs/core/Materials/GreasedLine/greasedLineMaterialInterfaces'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { AssetContainer } from '@babylonjs/core/assetContainer'
import type { GreasedLineBaseMesh } from '@babylonjs/core/Meshes/GreasedLine/greasedLineBaseMesh'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { withBase } from '../config/baseUrl'
import type { AppOrchestrator } from '../core/app'
import { getDeviceMetrics } from './deviceMetrics'
import type { ModelUpdateObject } from '../message/types'

const LINES_MODEL_URL = '/models/广州双叶厂房_工况Lines.glb'

/** 虚线滚动速度（dashOffset / 秒） */
const FLOW_DASH_SPEED = 0.35
const FLOW_LINE_WIDTH = 0.35
const FLOW_COLOR = new Color3(0.15, 0.75, 1)

const PUMP_1 = 'BIM_放冷泵_1'
const PUMP_2 = 'BIM_放冷泵_2'
const SV_1 = 'BIM_开关阀_1'
const SV_2 = 'BIM_开关阀_2'
const SV_5 = 'BIM_开关阀_5'
const CV_3 = 'BIM_调节阀_3'
const CV_4 = 'BIM_调节阀_4'
const CV_6 = 'BIM_调节阀_6'
const CV_7 = 'BIM_调节阀_7'
const CV_8 = 'BIM_调节阀_8'
const CV_9 = 'BIM_调节阀_9'
const CV_10 = 'BIM_调节阀_10'
const CV_11 = 'BIM_调节阀_11'

type DeviceKind = 'pump' | 'switchValve' | 'controlValve'

type RuleCheck =
  | { type: 'allClosed'; devices: string[]; kind: DeviceKind }
  | { type: 'atLeastOneOpen'; devices: string[]; kind: DeviceKind }
  | { type: 'open'; device: string; kind: DeviceKind }
  | { type: 'closed'; device: string; kind: DeviceKind }

interface WorkingConditionRule {
  /** 与 GLB 中线条节点名一致 */
  lineName: string
  checks: RuleCheck[]
}

/** 与 public/1.xlsx 工况判定表一致 */
const WORKING_CONDITION_RULES: WorkingConditionRule[] = [
  {
    lineName: 'ZJDDGL主机单独供冷',
    checks: [
      { type: 'allClosed', devices: [PUMP_1, PUMP_2], kind: 'pump' },
      { type: 'atLeastOneOpen', devices: [SV_1, SV_2], kind: 'switchValve' },
      { type: 'allClosed', devices: [CV_3, CV_4], kind: 'controlValve' },
      { type: 'closed', device: SV_5, kind: 'switchValve' },
      { type: 'closed', device: CV_6, kind: 'controlValve' },
      { type: 'closed', device: CV_7, kind: 'controlValve' },
      { type: 'closed', device: CV_8, kind: 'controlValve' },
      { type: 'open', device: CV_9, kind: 'controlValve' },
      { type: 'open', device: CV_10, kind: 'controlValve' },
      { type: 'open', device: CV_11, kind: 'controlValve' },
    ],
  },
  {
    lineName: 'XSGGL蓄水罐供冷',
    checks: [
      { type: 'atLeastOneOpen', devices: [PUMP_1, PUMP_2], kind: 'pump' },
      { type: 'closed', device: SV_1, kind: 'switchValve' },
      { type: 'closed', device: SV_2, kind: 'switchValve' },
      { type: 'atLeastOneOpen', devices: [CV_3, CV_4], kind: 'controlValve' },
      { type: 'closed', device: SV_5, kind: 'switchValve' },
      { type: 'open', device: CV_6, kind: 'controlValve' },
      { type: 'atLeastOneOpen', devices: [CV_7, CV_8], kind: 'controlValve' },
      { type: 'open', device: CV_9, kind: 'controlValve' },
      { type: 'open', device: CV_10, kind: 'controlValve' },
      { type: 'open', device: CV_11, kind: 'controlValve' },
    ],
  },
  {
    lineName: 'ZJXL主机蓄冷',
    checks: [
      { type: 'allClosed', devices: [PUMP_1, PUMP_2], kind: 'pump' },
      { type: 'atLeastOneOpen', devices: [SV_1, SV_2], kind: 'switchValve' },
      { type: 'atLeastOneOpen', devices: [CV_3, CV_4], kind: 'controlValve' },
      { type: 'open', device: SV_5, kind: 'switchValve' },
      { type: 'closed', device: CV_6, kind: 'controlValve' },
      { type: 'atLeastOneOpen', devices: [CV_7, CV_8], kind: 'controlValve' },
      { type: 'closed', device: CV_9, kind: 'controlValve' },
      { type: 'closed', device: CV_10, kind: 'controlValve' },
      { type: 'closed', device: CV_11, kind: 'controlValve' },
    ],
  },
  {
    lineName: 'LHGL联合供冷',
    checks: [
      { type: 'atLeastOneOpen', devices: [PUMP_1, PUMP_2], kind: 'pump' },
      { type: 'atLeastOneOpen', devices: [SV_1, SV_2], kind: 'switchValve' },
      { type: 'atLeastOneOpen', devices: [CV_3, CV_4], kind: 'controlValve' },
      { type: 'closed', device: SV_5, kind: 'switchValve' },
      { type: 'open', device: CV_6, kind: 'controlValve' },
      { type: 'atLeastOneOpen', devices: [CV_7, CV_8], kind: 'controlValve' },
      { type: 'open', device: CV_9, kind: 'controlValve' },
      { type: 'open', device: CV_10, kind: 'controlValve' },
      { type: 'open', device: CV_11, kind: 'controlValve' },
    ],
  },
  {
    lineName: 'BGBX边供边蓄',
    checks: [
      { type: 'allClosed', devices: [PUMP_1, PUMP_2], kind: 'pump' },
      { type: 'atLeastOneOpen', devices: [SV_1, SV_2], kind: 'switchValve' },
      { type: 'atLeastOneOpen', devices: [CV_3, CV_4], kind: 'controlValve' },
      { type: 'open', device: SV_5, kind: 'switchValve' },
      { type: 'closed', device: CV_6, kind: 'controlValve' },
      { type: 'atLeastOneOpen', devices: [CV_7, CV_8], kind: 'controlValve' },
      { type: 'open', device: CV_9, kind: 'controlValve' },
      { type: 'open', device: CV_10, kind: 'controlValve' },
      { type: 'open', device: CV_11, kind: 'controlValve' },
    ],
  },
]

export interface PipeFlowApi {
  applyFromUpdate: (objects: ModelUpdateObject[]) => void
  refreshAll: () => void
  getActiveLineName: () => string | null
  dispose: () => void
}

function readMetric(metrics: Record<string, string | number>, name: string): number | null {
  if (name in metrics) return Number(metrics[name])
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith(name)) return Number(value)
  }
  return null
}

function isDeviceOpen(objectName: string, kind: DeviceKind): boolean {
  const metrics = getDeviceMetrics(objectName)
  if (!metrics) return false
  if (kind === 'pump') return readMetric(metrics, '运行信号') === 1
  if (kind === 'switchValve') return readMetric(metrics, '阀门开到位信号') === 1
  const feedback = readMetric(metrics, '阀门开度反馈')
  return feedback !== null && feedback > 0
}

function passesCheck(check: RuleCheck): boolean {
  if (check.type === 'open') return isDeviceOpen(check.device, check.kind)
  if (check.type === 'closed') return !isDeviceOpen(check.device, check.kind)
  if (check.type === 'allClosed') {
    return check.devices.every((name) => !isDeviceOpen(name, check.kind))
  }
  return check.devices.some((name) => isDeviceOpen(name, check.kind))
}

/** 按表匹配当前工况线条名；无匹配返回 null */
export function resolveWorkingConditionLineName(): string | null {
  for (const rule of WORKING_CONDITION_RULES) {
    if (rule.checks.every(passesCheck)) return rule.lineName
  }
  return null
}

/** 从 LINES 网格提取线段路径（每条线段 2 点） */
function extractLinePaths(mesh: AbstractMesh): number[][] {
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind)
  const indices = mesh.getIndices()
  if (!positions || !indices?.length) return []

  const paths: number[][] = []
  for (let i = 0; i + 1 < indices.length; i += 2) {
    const a = indices[i]!
    const b = indices[i + 1]!
    paths.push([
      positions[a * 3]!,
      positions[a * 3 + 1]!,
      positions[a * 3 + 2]!,
      positions[b * 3]!,
      positions[b * 3 + 1]!,
      positions[b * 3 + 2]!,
    ])
  }
  return paths
}

function asFlowMaterial(mesh: GreasedLineBaseMesh): IGreasedLineMaterial | null {
  const mat = mesh.material as unknown as IGreasedLineMaterial | null
  return mat && typeof (mat as { dashOffset?: unknown }).dashOffset === 'number' ? mat : null
}

interface FlowLineEntry {
  lineName: string
  mesh: GreasedLineBaseMesh
  material: IGreasedLineMaterial
}

export async function createPipeFlow(app: AppOrchestrator): Promise<PipeFlowApi | null> {
  const ctx = app.getContext()
  if (!ctx?.scene) return null

  const scene = ctx.scene
  const model = app.getModelModule()
  const parent = model.getModelPivot()
  const url = withBase(LINES_MODEL_URL)

  let container: AssetContainer | null = null
  try {
    container = await LoadAssetContainerAsync(url, scene)
    container.addAllToScene()
  } catch (err) {
    console.error('[pipeFlow] failed to load lines model', url, err)
    return null
  }

  const root = (container.rootNodes[0] as TransformNode | undefined) ?? null
  if (root && parent) {
    root.parent = parent
  }

  const entries: FlowLineEntry[] = []
  const expectedNames = WORKING_CONDITION_RULES.map((r) => r.lineName)

  const findLineMesh = (lineName: string): AbstractMesh | null => {
    for (const mesh of container!.meshes) {
      if (mesh.name === lineName) return mesh
    }
    for (const node of container!.rootNodes) {
      const stack = [node]
      while (stack.length) {
        const cur = stack.pop()!
        if (cur.name === lineName) {
          if ('getTotalVertices' in cur) {
            const m = cur as AbstractMesh
            if (typeof m.getTotalVertices === 'function' && m.getTotalVertices() > 0) return m
          }
          if ('getChildMeshes' in cur && typeof (cur as TransformNode).getChildMeshes === 'function') {
            const children = (cur as TransformNode).getChildMeshes(false)
            const withVerts = children.find((c) => c.getTotalVertices() > 0)
            if (withVerts) return withVerts
          }
        }
        for (const child of cur.getChildren()) stack.push(child)
      }
    }
    return null
  }

  for (const lineName of expectedNames) {
    const mesh = findLineMesh(lineName)
    if (!mesh) {
      console.warn(`[pipeFlow] line node "${lineName}" not found`)
      continue
    }
    mesh.computeWorldMatrix(true)
    const paths = extractLinePaths(mesh)
    mesh.setEnabled(false)
    mesh.isVisible = false
    if (!paths.length) {
      console.warn(`[pipeFlow] line "${lineName}" has no segments`)
      continue
    }

    const flowMesh = CreateGreasedLine(
      `flow_${lineName}`,
      { points: paths },
      {
        width: FLOW_LINE_WIDTH,
        color: FLOW_COLOR,
        useDash: true,
        dashCount: 48,
        dashRatio: 0.45,
        dashOffset: 0,
        materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_SIMPLE,
      },
      scene,
    ) as GreasedLineBaseMesh

    // 与源线条同级，顶点局部坐标一致，并随厂房 pivot 一起变换
    flowMesh.parent = mesh.parent
    flowMesh.isPickable = false
    flowMesh.setEnabled(false)

    const material = asFlowMaterial(flowMesh)
    if (!material) {
      console.warn(`[pipeFlow] line "${lineName}" missing greased material`)
      flowMesh.dispose()
      continue
    }

    entries.push({ lineName, mesh: flowMesh, material })
  }

  if (!entries.length) {
    console.warn('[pipeFlow] no working-condition lines found in', url)
  } else {
    console.info(
      `[pipeFlow] lines ready: ${entries.map((e) => e.lineName).join(', ')}`,
    )
  }

  let activeName: string | null = null
  let dashOffset = 0

  const setActive = (lineName: string | null): void => {
    if (lineName === activeName) return
    activeName = lineName
    for (const entry of entries) {
      entry.mesh.setEnabled(entry.lineName === lineName)
    }
    if (lineName) {
      console.info(`[pipeFlow] active line=${lineName}`)
    } else {
      console.info('[pipeFlow] no matching working condition')
    }
  }

  const refreshAll = (): void => {
    setActive(resolveWorkingConditionLineName())
  }

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    if (!activeName) return
    const dt = scene.getEngine().getDeltaTime() * 0.001
    dashOffset = (dashOffset + FLOW_DASH_SPEED * dt) % 1
    for (const entry of entries) {
      if (entry.lineName !== activeName) continue
      entry.material.dashOffset = dashOffset
    }
  })

  refreshAll()

  return {
    applyFromUpdate(_objects) {
      refreshAll()
    },
    refreshAll,
    getActiveLineName: () => activeName,
    dispose() {
      scene.onBeforeRenderObservable.remove(renderObserver)
      for (const entry of entries) {
        entry.mesh.dispose()
      }
      entries.length = 0
      container?.removeAllFromScene()
      container?.dispose()
      container = null
      activeName = null
    },
  }
}
