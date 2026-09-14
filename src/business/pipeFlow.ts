/**
 * 工况管线水流：根据 MODEL_UPDATE 判定工况，按 GLB 分组下的主管/支管生成 FlowLight
 * - 主管：工况开启即流动
 * - 支管：工况开启 + shebei / shebei_and（串联）/ shebei_or（并联）设备联通
 */
import '@babylonjs/loaders/glTF'
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { CreateTube } from '@babylonjs/core/Meshes/Builders/tubeBuilder'
import { Effect } from '@babylonjs/core/Materials/effect'
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Material } from '@babylonjs/core/Materials/material'
import { Constants } from '@babylonjs/core/Engines/constants'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { AssetContainer } from '@babylonjs/core/assetContainer'
import type { Scene } from '@babylonjs/core/scene'
import { withBase } from '../config/baseUrl'
import type { AppOrchestrator } from '../core/app'
import { getDeviceMetrics, normalizeDeviceName } from './deviceMetrics'
import type { ModelUpdateObject } from '../message/types'

const LINES_MODEL_URL = '/models/广州双叶厂房_工况Lines.glb'

/** 管道半径（底管，对齐巷道本体着色） */
const PIPE_RADIUS = 0.05
/** 流光管略粗，避免与底管 z-fight */
const FLOW_RADIUS_SCALE = 1.08
/** 外层柔光（模拟 SelectiveBloom 光晕） */
const FLOW_GLOW_RADIUS_SCALE = 1.55
/** 管道截面边数 */
const PIPE_TESSELLATION = 12
/** 路径重采样间距（保证 UV 均匀） */
const PATH_RESAMPLE_SPACING = 1.0
/**
 * 流光段波长（场景单位）：每段流光占用的弧长，所有管子统一
 * 原项目为 length/200 段 → 波长约 200
 */
const FLOW_SEGMENT_SPACING = 8
/** 流光速度（对齐 FlowLight2 uniform speed，片元内再 * 0.04） */
const FLOW_SPEED = 22
/** 流光不透明度 */
const FLOW_OPACITY = 0.4
/** 亮色 / 暗色（对齐巷道进风流光默认色） */
const FLOW_COLOR1 = new Color3(0.0235, 0.9647, 0.9333)
const FLOW_COLOR2 = new Color3(0.0196, 0.3373, 0.4824)

const FLOW_LIGHT_SHADER = 'pipeFlowLight'

let flowLightShaderRegistered = false

function ensureFlowLightShader(): void {
  if (flowLightShaderRegistered) return
  flowLightShaderRegistered = true

  Effect.ShadersStore[`${FLOW_LIGHT_SHADER}VertexShader`] = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUV;
void main(void) {
  vUV = uv;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}`

  // CreateTube：uv.y 经弧长烘焙后为「距离 / spacing」，各管流光波长一致
  Effect.ShadersStore[`${FLOW_LIGHT_SHADER}FragmentShader`] = `
precision highp float;
uniform float uElapseTime;
uniform float uCount;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uOpacity;
uniform float uSpeed;
uniform float uGlowBoost;
varying vec2 vUV;
void main(void) {
  // vUV.y：沿管弧长 / FLOW_SEGMENT_SPACING，单位波长在世界空间恒定
  float al = fract(vUV.y - uElapseTime * uSpeed * 0.04);
  float flash = pow(al, 4.0);
  vec3 color = mix(uColor2, uColor1, flash);
  color += uColor1 * pow(al, 8.0) * uGlowBoost;
  float a = al * al;
  float pathT = uCount > 1e-4 ? clamp(vUV.y / uCount, 0.0, 1.0) : 0.0;
  float final_a = a * step(pathT, uElapseTime);
  gl_FragColor = vec4(color, final_a * uOpacity);
}`
}

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
  lineName: string
  checks: RuleCheck[]
}

export const WORKING_CONDITION_LINE_NAMES = [
  'ZJDDGL主机单独供冷',
  'XSGGL蓄水罐供冷',
  'ZJXL主机蓄冷',
  'LHGL联合供冷',
  'BGBX边供边蓄',
] as const

/** GLB 最外层分组名 → 工况全名（与 WORKING_CONDITION_RULES.lineName 一致） */
const CONDITION_GROUPS: { groupName: string; conditionKey: string }[] = [
  { groupName: 'ZJDDGL', conditionKey: 'ZJDDGL主机单独供冷' },
  { groupName: 'XSGGL', conditionKey: 'XSGGL蓄水罐供冷' },
  { groupName: 'ZJXL', conditionKey: 'ZJXL主机蓄冷' },
  { groupName: 'LHGL', conditionKey: 'LHGL联合供冷' },
  { groupName: 'BGBX', conditionKey: 'BGBX边供边蓄' },
]

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
  setDebugLine: (lineName: string | null) => void
  getLineNames: () => string[]
  setMainModelVisible: (visible: boolean) => void
  dispose: () => void
}

function readMetric(metrics: Record<string, string | number>, name: string): number | null {
  if (name in metrics) return Number(metrics[name])
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith(name)) return Number(value)
  }
  return null
}

/** 工况判定用（与 1.xlsx / 历史规则一致） */
function isDeviceOpenForCondition(objectName: string, kind: DeviceKind): boolean {
  const metrics = getDeviceMetrics(objectName)
  if (!metrics) return false
  if (kind === 'pump') return readMetric(metrics, '运行信号') === 1
  if (kind === 'switchValve') return readMetric(metrics, '阀门开到位信号') === 1
  const feedback = readMetric(metrics, '阀门开度反馈')
  return feedback !== null && feedback > 0
}

function passesCheck(check: RuleCheck): boolean {
  if (check.type === 'open') return isDeviceOpenForCondition(check.device, check.kind)
  if (check.type === 'closed') return !isDeviceOpenForCondition(check.device, check.kind)
  if (check.type === 'allClosed') {
    return check.devices.every((name) => !isDeviceOpenForCondition(name, check.kind))
  }
  return check.devices.some((name) => isDeviceOpenForCondition(name, check.kind))
}

export function resolveWorkingConditionLineName(): string | null {
  for (const rule of WORKING_CONDITION_RULES) {
    if (rule.checks.every(passesCheck)) return rule.lineName
  }
  return null
}

type BranchMode = 'and' | 'or'

interface BranchBinding {
  mode: BranchMode
  devices: string[]
}

/** 支管绑定设备联通判断（按设备类型字段） */
function isBoundDeviceConnected(deviceName: string): boolean {
  const metrics = getDeviceMetrics(deviceName)
  if (!metrics) return false
  const name = normalizeDeviceName(deviceName)

  if (/加药装置/.test(name)) {
    const p1 = readMetric(metrics, '加药泵1运行') ?? 0
    const p2 = readMetric(metrics, '加药泵2运行') ?? 0
    return Number(p1) !== 0 || Number(p2) !== 0
  }
  if (/开关阀|压差旁通阀/.test(name)) {
    return readMetric(metrics, '阀门开控制') === 1
  }
  if (/卧式风柜|调节阀/.test(name)) {
    const open = readMetric(metrics, '阀门开度')
    if (open !== null) return open > 0
    const feedback = readMetric(metrics, '阀门开度反馈')
    return feedback !== null && feedback > 0
  }
  // 主机 / 冷却泵 / 冷冻泵 / 冷却塔 / 射流风机 / 放冷泵 等
  if (/主机|冷却泵|冷冻泵|冷却塔|射流风机|放冷泵/.test(name)) {
    return readMetric(metrics, '启停控制') === 1
  }
  return false
}

function parseDeviceList(raw: string): string[] {
  return String(raw)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseBranchBinding(extras: Record<string, unknown> | null | undefined): BranchBinding | null {
  if (!extras) return null
  const orRaw = extras.shebei_or
  if (typeof orRaw === 'string' && orRaw.trim()) {
    return { mode: 'or', devices: parseDeviceList(orRaw) }
  }
  const andRaw = extras.shebei_and ?? extras.shebei
  if (typeof andRaw === 'string' && andRaw.trim()) {
    return { mode: 'and', devices: parseDeviceList(andRaw) }
  }
  return null
}

function isBranchBindingConnected(binding: BranchBinding | null): boolean {
  if (!binding || !binding.devices.length) return false
  if (binding.mode === 'or') return binding.devices.some(isBoundDeviceConnected)
  return binding.devices.every(isBoundDeviceConnected)
}

function getNodeExtras(node: { metadata?: unknown; name?: string }): Record<string, unknown> {
  const md = node.metadata as Record<string, unknown> | undefined
  if (!md) return {}
  if (md.shebei || md.shebei_and || md.shebei_or) return md
  const gltf = md.gltf as { extras?: Record<string, unknown> } | undefined
  if (gltf?.extras) return gltf.extras
  if (md.extras && typeof md.extras === 'object') return md.extras as Record<string, unknown>
  return md
}

/** 从 GLB JSON chunk 读取节点 extras（比 runtime metadata 更可靠） */
async function loadGltfNodeExtrasByName(url: string): Promise<Map<string, Record<string, unknown>>> {
  const map = new Map<string, Record<string, unknown>>()
  try {
    const res = await fetch(url)
    if (!res.ok) return map
    const buf = new Uint8Array(await res.arrayBuffer())
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    const jsonLen = view.getUint32(12, true)
    const jsonText = new TextDecoder().decode(buf.subarray(20, 20 + jsonLen))
    const json = JSON.parse(jsonText) as {
      nodes?: Array<{ name?: string; extras?: Record<string, unknown> }>
    }
    for (const node of json.nodes ?? []) {
      if (!node.name || !node.extras) continue
      map.set(node.name, node.extras)
      // Babylon 偶发把 `.` 变成 `_`
      map.set(node.name.replace(/\./g, '_'), node.extras)
    }
  } catch (err) {
    console.warn('[pipeFlow] failed to parse glTF extras', err)
  }
  return map
}

function resolveLineExtras(
  mesh: AbstractMesh,
  extrasByName: Map<string, Record<string, unknown>>,
): Record<string, unknown> {
  const fromMeta = getNodeExtras(mesh)
  if (fromMeta.shebei || fromMeta.shebei_and || fromMeta.shebei_or) return fromMeta
  const byName =
    extrasByName.get(mesh.name) ||
    extrasByName.get(mesh.name.replace(/_/g, '.')) ||
    extrasByName.get(mesh.name.replace(/\./g, '_'))
  return byName ?? fromMeta
}

function classifyLineKind(name: string): 'main' | 'branch' | null {
  if (name.includes('主管')) return 'main'
  if (name.includes('支管')) return 'branch'
  return null
}

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

function keyPoint(x: number, y: number, z: number): string {
  // 精度过低会把转角两侧点合并，导致折线缺角
  return `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`
}

function flatToVectors(flat: number[]): Vector3[] {
  const pts: Vector3[] = []
  for (let i = 0; i + 2 < flat.length; i += 3) {
    pts.push(new Vector3(flat[i], flat[i + 1], flat[i + 2]))
  }
  return pts
}

function pathLength(pts: Vector3[]): number {
  let len = 0
  for (let i = 1; i < pts.length; i++) {
    len += Vector3.Distance(pts[i - 1]!, pts[i]!)
  }
  return len
}

/** 按 line 索引方向（a→b）拼接折线，保持流向 */
function stitchPolylines(segments: number[][]): number[][] {
  type Pt = [number, number, number]
  const outAdj = new Map<string, { pos: Pt; next: string[] }>()
  const inDegree = new Map<string, number>()

  const ensure = (x: number, y: number, z: number): string => {
    const k = keyPoint(x, y, z)
    if (!outAdj.has(k)) {
      outAdj.set(k, { pos: [x, y, z], next: [] })
      inDegree.set(k, 0)
    }
    return k
  }

  for (const s of segments) {
    const ka = ensure(s[0]!, s[1]!, s[2]!)
    const kb = ensure(s[3]!, s[4]!, s[5]!)
    if (ka === kb) continue
    outAdj.get(ka)!.next.push(kb)
    inDegree.set(kb, (inDegree.get(kb) ?? 0) + 1)
  }

  const usedEdge = new Set<string>()
  const edgeKey = (a: string, b: string): string => `${a}>${b}`
  const polylines: number[][] = []

  const walk = (start: string): void => {
    const line: number[] = []
    let cur = start
    const pushPos = (k: string): void => {
      const p = outAdj.get(k)!.pos
      line.push(p[0], p[1], p[2])
    }
    pushPos(cur)

    while (true) {
      const node = outAdj.get(cur)!
      let nxt: string | null = null
      for (const cand of node.next) {
        if (usedEdge.has(edgeKey(cur, cand))) continue
        nxt = cand
        break
      }
      if (!nxt) break
      usedEdge.add(edgeKey(cur, nxt))
      cur = nxt
      pushPos(cur)
    }

    if (line.length >= 6) polylines.push(line)
  }

  const keys = [...outAdj.keys()]
  for (const k of keys) {
    if ((inDegree.get(k) ?? 0) === 0 && outAdj.get(k)!.next.some((n) => !usedEdge.has(edgeKey(k, n)))) {
      walk(k)
    }
  }
  for (const k of keys) {
    for (const n of outAdj.get(k)!.next) {
      if (!usedEdge.has(edgeKey(k, n))) walk(k)
    }
  }

  return polylines.length ? polylines : segments
}

function cleanPath(pts: Vector3[], minDist = 0.001): Vector3[] {
  if (pts.length < 2) return pts
  const out: Vector3[] = [pts[0]!]
  for (let i = 1; i < pts.length; i++) {
    if (Vector3.Distance(pts[i]!, out[out.length - 1]!) >= minDist) out.push(pts[i]!)
  }
  if (out.length === 1) out.push(pts[pts.length - 1]!)
  return out
}

/**
 * 沿折线分段加密：必须保留所有原顶点（尤其是直角转角），
 * 只在相邻两点之间按 spacing 插点，避免弧长全局重采样切角。
 */
function resamplePathEvenly(pts: Vector3[], spacing: number): Vector3[] {
  const cleaned = cleanPath(pts)
  if (cleaned.length < 2) return cleaned

  const step = Math.max(spacing, 1e-4)
  const out: Vector3[] = [cleaned[0]!.clone()]

  for (let i = 1; i < cleaned.length; i++) {
    const a = cleaned[i - 1]!
    const b = cleaned[i]!
    const dist = Vector3.Distance(a, b)
    if (dist < 1e-8) continue
    const divisions = Math.max(1, Math.ceil(dist / step))
    for (let d = 1; d < divisions; d++) {
      out.push(Vector3.Lerp(a, b, d / divisions))
    }
    out.push(b.clone())
  }

  return out
}

/** 将 CreateTube 的 V(0~1) 转为弧长/spacing，保证各管流光波长一致 */
function bakeTubeUvByArcLength(tube: Mesh, pathLength: number, spacing: number): void {
  const uvs = tube.getVerticesData(VertexBuffer.UVKind)
  if (!uvs?.length) return
  const bands = Math.max(pathLength, 1e-4) / Math.max(spacing, 1e-4)
  for (let i = 1; i < uvs.length; i += 2) {
    uvs[i] = uvs[i]! * bands
  }
  tube.setVerticesData(VertexBuffer.UVKind, uvs, false)
}

/** 底管材质：对齐原巷道着色 color2 */
function createPipeBaseMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('pipeFlowBaseMat', scene)
  mat.diffuseColor = FLOW_COLOR2.clone()
  mat.emissiveColor = FLOW_COLOR2.scale(0.85)
  mat.specularColor = Color3.Black()
  mat.disableLighting = true
  mat.backFaceCulling = true
  return mat
}

/** FlowLight 材质；uCount = pathLength/spacing（仅用于显现进度） */
function createFlowLightMaterial(
  scene: Scene,
  name: string,
  pathBandCount: number,
  options?: { opacity?: number; glowBoost?: number; additive?: boolean },
): ShaderMaterial {
  ensureFlowLightShader()
  const mat = new ShaderMaterial(
    name,
    scene,
    { vertex: FLOW_LIGHT_SHADER, fragment: FLOW_LIGHT_SHADER },
    {
      attributes: ['position', 'uv'],
      uniforms: [
        'worldViewProjection',
        'uElapseTime',
        'uCount',
        'uColor1',
        'uColor2',
        'uOpacity',
        'uSpeed',
        'uGlowBoost',
      ],
      needAlphaBlending: true,
    },
  )
  mat.backFaceCulling = false
  mat.disableDepthWrite = true
  mat.transparencyMode = Material.MATERIAL_ALPHABLEND
  mat.alphaMode = options?.additive ? Constants.ALPHA_ADD : Constants.ALPHA_COMBINE
  mat.setFloat('uElapseTime', 0)
  mat.setFloat('uCount', Math.max(pathBandCount, 1e-4))
  mat.setColor3('uColor1', FLOW_COLOR1)
  mat.setColor3('uColor2', FLOW_COLOR2)
  mat.setFloat('uOpacity', options?.opacity ?? FLOW_OPACITY)
  mat.setFloat('uSpeed', FLOW_SPEED)
  mat.setFloat('uGlowBoost', options?.glowBoost ?? 0.85)
  return mat
}

/** 对齐原版 depthTest:false：绘制流光时关闭深度测试 */
function bindFlowDepthTestOff(mesh: Mesh): void {
  const engine = mesh.getScene().getEngine()
  mesh.onBeforeRenderObservable.add(() => {
    engine.setDepthBuffer(false)
  })
  mesh.onAfterRenderObservable.add(() => {
    engine.setDepthBuffer(true)
  })
}

interface FlowSegment {
  id: string
  conditionKey: string
  kind: 'main' | 'branch'
  binding: BranchBinding | null
  root: TransformNode
  baseTubes: Mesh[]
  flowTubes: Mesh[]
  flowMats: ShaderMaterial[]
}

function buildTubesForPath(
  scene: Scene,
  parent: TransformNode,
  id: string,
  ptsIn: Vector3[],
  baseMat: StandardMaterial,
): { baseTubes: Mesh[]; flowTubes: Mesh[]; flowMats: ShaderMaterial[] } | null {
  // 保持 line 顶点顺序，流向与线段方向一致
  const pts = resamplePathEvenly(ptsIn, PATH_RESAMPLE_SPACING)
  const len = pathLength(pts)
  if (pts.length < 2 || len < 0.05) return null

  const baseTubes: Mesh[] = []
  const flowTubes: Mesh[] = []
  const flowMats: ShaderMaterial[] = []
  const bandCount = len / FLOW_SEGMENT_SPACING

  try {
    const baseTube = CreateTube(
      `flow_base_${id}`,
      {
        path: pts,
        radius: PIPE_RADIUS,
        tessellation: PIPE_TESSELLATION,
        cap: Mesh.NO_CAP,
        updatable: false,
        sideOrientation: Mesh.FRONTSIDE,
      },
      scene,
    )
    baseTube.material = baseMat
    baseTube.isPickable = false
    baseTube.parent = parent
    baseTubes.push(baseTube)

    const flowMat = createFlowLightMaterial(scene, `flow_light_mat_${id}`, bandCount, {
      opacity: 1,
      glowBoost: 0.9,
      additive: false,
    })
    const flowTube = CreateTube(
      `flow_light_${id}`,
      {
        path: pts,
        radius: PIPE_RADIUS * FLOW_RADIUS_SCALE,
        tessellation: PIPE_TESSELLATION,
        cap: Mesh.NO_CAP,
        updatable: false,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      scene,
    )
    bakeTubeUvByArcLength(flowTube, len, FLOW_SEGMENT_SPACING)
    flowTube.material = flowMat
    flowTube.isPickable = false
    flowTube.parent = parent
    flowTube.alphaIndex = 1
    bindFlowDepthTestOff(flowTube)
    flowTubes.push(flowTube)
    flowMats.push(flowMat)

    const glowMat = createFlowLightMaterial(scene, `flow_glow_mat_${id}`, bandCount, {
      opacity: 0.45,
      glowBoost: 1.6,
      additive: true,
    })
    const glowTube = CreateTube(
      `flow_glow_${id}`,
      {
        path: pts,
        radius: PIPE_RADIUS * FLOW_GLOW_RADIUS_SCALE,
        tessellation: PIPE_TESSELLATION,
        cap: Mesh.NO_CAP,
        updatable: false,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      scene,
    )
    bakeTubeUvByArcLength(glowTube, len, FLOW_SEGMENT_SPACING)
    glowTube.material = glowMat
    glowTube.isPickable = false
    glowTube.parent = parent
    glowTube.alphaIndex = 2
    bindFlowDepthTestOff(glowTube)
    flowTubes.push(glowTube)
    flowMats.push(glowMat)
  } catch (err) {
    console.warn(`[pipeFlow] tube create failed ${id}`, err)
    for (const m of flowMats) m.dispose()
    for (const t of [...baseTubes, ...flowTubes]) t.dispose()
    return null
  }

  return { baseTubes, flowTubes, flowMats }
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

  const extrasByName = await loadGltfNodeExtrasByName(url)
  const baseMat = createPipeBaseMaterial(scene)
  const segments: FlowSegment[] = []

  const findGroupNode = (groupName: string): TransformNode | null => {
    for (const node of container!.rootNodes) {
      const stack: TransformNode[] = [node as TransformNode]
      while (stack.length) {
        const cur = stack.pop()!
        if (cur.name === groupName) return cur
        for (const child of cur.getChildren()) {
          if (child instanceof TransformNode) stack.push(child)
        }
      }
    }
    return null
  }

  const collectLineMeshes = (groupNode: TransformNode): AbstractMesh[] => {
    const out: AbstractMesh[] = []
    for (const child of groupNode.getChildren()) {
      if (child instanceof Mesh || (child as AbstractMesh).getTotalVertices) {
        const m = child as AbstractMesh
        if (typeof m.getTotalVertices === 'function' && m.getTotalVertices() > 0) {
          out.push(m)
          continue
        }
      }
      if (child instanceof TransformNode) {
        for (const n of child.getChildMeshes(false)) {
          if (n.getTotalVertices() > 0) out.push(n)
        }
      }
    }
    return out
  }

  for (const { groupName, conditionKey } of CONDITION_GROUPS) {
    const groupNode = findGroupNode(groupName)
    if (!groupNode) {
      console.warn(`[pipeFlow] condition group "${groupName}" not found`)
      continue
    }

    const lineMeshes = collectLineMeshes(groupNode)
    let mainCount = 0
    let branchCount = 0

    for (let li = 0; li < lineMeshes.length; li++) {
      const mesh = lineMeshes[li]!
      const kind = classifyLineKind(mesh.name)
      if (!kind) {
        mesh.setEnabled(false)
        mesh.isVisible = false
        continue
      }

      mesh.computeWorldMatrix(true)
      const rawSegments = extractLinePaths(mesh)
      mesh.setEnabled(false)
      mesh.isVisible = false
      if (!rawSegments.length) {
        console.warn(`[pipeFlow] line "${mesh.name}" has no segments`)
        continue
      }

      const extras = resolveLineExtras(mesh, extrasByName)
      const binding = kind === 'branch' ? parseBranchBinding(extras) : null
      if (kind === 'branch' && !binding) {
        console.warn(`[pipeFlow] branch "${mesh.name}" missing shebei/shebei_and/shebei_or`)
      }

      const paths = stitchPolylines(rawSegments)
      const lineParent = (mesh.parent as TransformNode | null) ?? groupNode
      const segRoot = new TransformNode(`flow_seg_${mesh.name}`, scene)
      segRoot.parent = lineParent
      segRoot.setEnabled(false)

      const baseTubes: Mesh[] = []
      const flowTubes: Mesh[] = []
      const flowMats: ShaderMaterial[] = []

      for (let pi = 0; pi < paths.length; pi++) {
        const pts = flatToVectors(paths[pi]!)
        if (pts.length < 2) continue
        const built = buildTubesForPath(scene, segRoot, `${mesh.name}_${pi}`, pts, baseMat)
        if (!built) continue
        baseTubes.push(...built.baseTubes)
        flowTubes.push(...built.flowTubes)
        flowMats.push(...built.flowMats)
      }

      if (!baseTubes.length) {
        segRoot.dispose()
        continue
      }

      segments.push({
        id: mesh.name,
        conditionKey,
        kind,
        binding,
        root: segRoot,
        baseTubes,
        flowTubes,
        flowMats,
      })
      if (kind === 'main') mainCount++
      else branchCount++
    }

    console.info(
      `[pipeFlow] group ${groupName} (${conditionKey}): main=${mainCount} branch=${branchCount}`,
    )
  }

  if (!segments.length) {
    console.warn('[pipeFlow] no working-condition lines found in', url)
  } else {
    console.info(`[pipeFlow] segments ready: ${segments.length}`)
  }

  let activeName: string | null = null
  let debugLineOverride: string | null | undefined = undefined
  let elapseTime = 0

  const shouldSegmentFlow = (seg: FlowSegment, conditionKey: string | null): boolean => {
    if (!conditionKey || seg.conditionKey !== conditionKey) return false
    if (seg.kind === 'main') return true
    return isBranchBindingConnected(seg.binding)
  }

  const applyVisibility = (conditionKey: string | null, resetTime: boolean): void => {
    activeName = conditionKey
    if (resetTime) elapseTime = 0
    let onCount = 0
    for (const seg of segments) {
      const on = shouldSegmentFlow(seg, conditionKey)
      seg.root.setEnabled(on)
      if (on) {
        onCount++
        if (resetTime) {
          for (const mat of seg.flowMats) mat.setFloat('uElapseTime', 0)
        }
      }
    }
    if (conditionKey) {
      console.info(
        `[pipeFlow] active=${conditionKey} flowing=${onCount}/${segments.filter((s) => s.conditionKey === conditionKey).length}` +
          (debugLineOverride !== undefined ? ' (debug)' : ''),
      )
    } else {
      console.info('[pipeFlow] no matching working condition')
    }
  }

  const refreshAll = (): void => {
    if (debugLineOverride !== undefined) {
      applyVisibility(debugLineOverride, debugLineOverride !== activeName)
      return
    }
    const next = resolveWorkingConditionLineName()
    applyVisibility(next, next !== activeName)
  }

  const setMainModelVisible = (visible: boolean): void => {
    model.setMainModelVisible(visible)
    console.info(`[pipeFlow] main model visible=${visible}`)
  }

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    if (!activeName) return
    const dt = scene.getEngine().getDeltaTime() * 0.001
    elapseTime += dt
    for (const seg of segments) {
      if (!seg.root.isEnabled()) continue
      for (const mat of seg.flowMats) mat.setFloat('uElapseTime', elapseTime)
    }
  })

  refreshAll()

  return {
    applyFromUpdate(_objects) {
      refreshAll()
    },
    refreshAll,
    getActiveLineName: () => activeName,
    setDebugLine(lineName) {
      if (lineName === null) {
        debugLineOverride = undefined
        refreshAll()
        return
      }
      if (!CONDITION_GROUPS.some((g) => g.conditionKey === lineName)) {
        console.warn(`[pipeFlow] unknown debug line "${lineName}"`)
        return
      }
      debugLineOverride = lineName
      applyVisibility(lineName, true)
    },
    getLineNames: () => CONDITION_GROUPS.map((g) => g.conditionKey),
    setMainModelVisible,
    dispose() {
      scene.onBeforeRenderObservable.remove(renderObserver)
      for (const seg of segments) {
        for (const tube of seg.baseTubes) tube.dispose()
        for (const tube of seg.flowTubes) tube.dispose()
        for (const mat of seg.flowMats) mat.dispose()
        seg.root.dispose()
      }
      segments.length = 0
      baseMat.dispose()
      container?.removeAllFromScene()
      container?.dispose()
      container = null
      activeName = null
      debugLineOverride = undefined
    },
  }
}
