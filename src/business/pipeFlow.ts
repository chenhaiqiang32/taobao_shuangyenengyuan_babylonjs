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
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { Effect } from '@babylonjs/core/Materials/effect'
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
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

/** 流光管半径 */
const PIPE_RADIUS = 0.32
/** 外层柔光（模拟 SelectiveBloom 光晕） */
const FLOW_GLOW_RADIUS_SCALE = 0.05
/**
 * 流光渲染组：晚于管道外壳（组 1），且保留组 0 实体深度
 * → 不被管道遮挡，仍被厂房/设备等实体遮挡
 */
const FLOW_RENDERING_GROUP = 2
/** 管道截面边数 */
const PIPE_TESSELLATION = 12
/** 路径重采样间距（保证 UV 均匀） */
const PATH_RESAMPLE_SPACING = 1.0
/**
 * 流光段波长（场景单位）：每段流光占用的弧长，所有管子统一
 * 原项目为 length/200 段 → 波长约 200
 */
const FLOW_SEGMENT_SPACING = 4
/** 流光速度（对齐 FlowLight2 uniform speed，片元内再 * 0.04） */
const FLOW_SPEED = 10
/** 流光不透明度 */
const FLOW_OPACITY = 0.4
/** 流光浅色（只保留亮段，暗底透明） */
const FLOW_COLOR1 = new Color3(0.9647, 0.9647, 0.9333)

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

  // uv.x=0.5 为正上方；uv.y = 中心线弧长 / FLOW_SEGMENT_SPACING
  // 只在管顶画一支箭头（线身 + 两翼）
  Effect.ShadersStore[`${FLOW_LIGHT_SHADER}FragmentShader`] = `
precision highp float;
uniform float uElapseTime;
uniform float uCount;
uniform vec3 uColor1;
uniform float uOpacity;
uniform float uSpeed;
uniform float uGlowBoost;
uniform float uSpacing;
uniform float uRadius;
varying vec2 vUV;

#define TAU 6.28318530718

float lineDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float denom = dot(ba, ba);
  float h = denom > 1e-8 ? clamp(dot(pa, ba) / denom, 0.0, 1.0) : 0.0;
  return length(pa - ba * h);
}

float lineMask(vec2 p, vec2 a, vec2 b, float stroke) {
  float distN = lineDist(p, a, b) / max(stroke, 1e-4);
  float core = 1.0 - smoothstep(0.22, 0.82, distN);
  float halo = exp(-distN * distN * 1.6) * 0.4;
  return clamp(core + halo, 0.0, 1.0);
}

float arrowMask(vec2 p, vec2 a, vec2 b, float stroke, float barbLen) {
  vec2 dir = normalize(b - a);
  vec2 side = vec2(-dir.y, dir.x);
  float body = lineMask(p, a, b, stroke);
  vec2 leftDir = normalize(side * 0.5403 + (-dir) * 0.8415);
  vec2 rightDir = normalize(-side * 0.5403 + (-dir) * 0.8415);
  float left = lineMask(p, b, b + leftDir * barbLen, stroke);
  float right = lineMask(p, b, b + rightDir * barbLen, stroke);
  return max(body, max(left, right));
}

void main(void) {
  float scroll = uElapseTime * uSpeed * 0.04;
  float al = fract(vUV.y - scroll);
  float along = al * uSpacing;
  // uv.x=0.5 为正上方，左右为沿管周的弧长偏移
  float r = max(uRadius, 1e-4);
  float across = (vUV.x - 0.5) * TAU * r;
  // 箭头总宽约管径 1/4（不是 1/2）；翼尖侧向分量约 0.54
  float stroke = r * 0.22;
  float tailY = uSpacing * 0.58;
  float headY = uSpacing * 0.90;
  float barb = (r * 0.25) / 0.5403;
  vec2 head = vec2(0.0, headY);
  vec2 tail = vec2(0.0, tailY);
  float d = arrowMask(vec2(across, along), tail, head, stroke, barb);

  float arrowGlow = d * (0.5 + 0.5 * d + d * d);
  float intensity = clamp(min(arrowGlow, 2.0) * 0.85, 0.0, 1.0);

  float pathT = uCount > 1e-4 ? clamp(vUV.y / uCount, 0.0, 1.0) : 0.0;
  float alpha = intensity * uOpacity * step(pathT, uElapseTime);
  vec3 color = uColor1 * (0.8 + d * uGlowBoost);
  gl_FragColor = vec4(color, alpha);
}`
}

const PUMP_1 = 'BIM_放冷泵_1'
const PUMP_2 = 'BIM_放冷泵_2'
const SV_1 = 'BIM_开关阀_1'
const SV_2 = 'BIM_开关阀_2'
const SV_5 = 'BIM_开关阀_5'
const CV_3 = 'BIM_调节阀_3'
const CV_4 = 'BIM_调节阀_4'
// const CV_6 = 'BIM_调节阀_6'
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
      // { type: 'closed', device: CV_6, kind: 'controlValve' }, // BIM_调节阀_6
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
      // { type: 'open', device: CV_6, kind: 'controlValve' }, // BIM_调节阀_6
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
      // { type: 'closed', device: CV_6, kind: 'controlValve' }, // BIM_调节阀_6
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
      // { type: 'open', device: CV_6, kind: 'controlValve' }, // BIM_调节阀_6
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
      // { type: 'closed', device: CV_6, kind: 'controlValve' }, // BIM_调节阀_6
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

/**
 * 设备开/运行判定字段（工况与支管共用）
 * - eq1：任一字段 === 1
 * - anyNonZero：任一字段 !== 0
 * - gt0First：按 fields 顺序取第一个有值的字段，判定 > 0
 */
type DeviceOpenMetricRule =
  | { match: RegExp; mode: 'eq1'; fields: string[] }
  | { match: RegExp; mode: 'anyNonZero'; fields: string[] }
  | { match: RegExp; mode: 'gt0First'; fields: string[] }

const DEVICE_OPEN_METRIC_RULES: DeviceOpenMetricRule[] = [
  { match: /加药装置/, mode: 'anyNonZero', fields: ['加药泵1运行', '加药泵2运行'] },
  { match: /开关阀|压差旁通阀/, mode: 'eq1', fields: ['开到位状态'] },
  { match: /卧式风柜|调节阀/, mode: 'gt0First', fields: ['阀门开度', '阀门开度反馈'] },
  { match: /主机/, mode: 'eq1', fields: ['整机组运行状态'] },
  { match: /射流风机/, mode: 'eq1', fields: ['运行状态'] },
  { match: /冷却泵|冷却塔|冷冻泵|放冷泵/, mode: 'eq1', fields: ['运行信号'] },
]

function evalDeviceOpenRule(
  metrics: Record<string, string | number>,
  rule: DeviceOpenMetricRule,
): boolean {
  if (rule.mode === 'eq1') {
    return rule.fields.some((f) => readMetric(metrics, f) === 1)
  }
  if (rule.mode === 'anyNonZero') {
    return rule.fields.some((f) => Number(readMetric(metrics, f) ?? 0) !== 0)
  }
  for (const f of rule.fields) {
    const v = readMetric(metrics, f)
    if (v !== null) return v > 0
  }
  return false
}

/** 按设备名匹配开/运行字段（工况判定与支管联通共用） */
function isDeviceOpen(deviceName: string): boolean {
  const metrics = getDeviceMetrics(deviceName)
  if (!metrics) return false
  const name = normalizeDeviceName(deviceName)
  for (const rule of DEVICE_OPEN_METRIC_RULES) {
    if (rule.match.test(name)) return evalDeviceOpenRule(metrics, rule)
  }
  return false
}

/** 工况判定：与支管共用 DEVICE_OPEN_METRIC_RULES */
function passesCheck(check: RuleCheck): boolean {
  if (check.type === 'open') return isDeviceOpen(check.device)
  if (check.type === 'closed') return !isDeviceOpen(check.device)
  if (check.type === 'allClosed') {
    return check.devices.every((name) => !isDeviceOpen(name))
  }
  return check.devices.some((name) => isDeviceOpen(name))
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

/** 支管绑定设备联通判断（与工况共用判定字段） */
function isBoundDeviceConnected(deviceName: string): boolean {
  return isDeviceOpen(deviceName)
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

/** 拐角处两段切向点积低于此值时，视为需要单独的平切截面 */
const CORNER_TANGENT_DOT = 0.9995

function perpendicularNormal(tangent: Vector3): Vector3 {
  const helper = Math.abs(tangent.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
  return Vector3.Cross(tangent, helper).normalize()
}

interface TubeRing {
  center: Vector3
  tangent: Vector3
  distance: number
}

/**
 * 每个直段上的截面都垂直于该段，拐角处叠两圈（进入/离开方向）。
 * CreateTube 用角平分线做法线，并且按每条经线各自归一化 V，弯管上亮头会被切斜。
 */
function buildTubeRings(pts: Vector3[]): TubeRing[] {
  const rings: TubeRing[] = []
  let distance = 0

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    const delta = b.subtract(a)
    const segLen = delta.length()
    if (segLen < 1e-6) continue
    const tangent = delta.scale(1 / segLen)
    const last = rings[rings.length - 1]

    if (!last) {
      rings.push({ center: a.clone(), tangent: tangent.clone(), distance })
    } else if (Vector3.Dot(last.tangent, tangent) < CORNER_TANGENT_DOT) {
      rings.push({ center: a.clone(), tangent: tangent.clone(), distance })
    }

    distance += segLen
    rings.push({ center: b.clone(), tangent: tangent.clone(), distance })
  }

  return rings
}

/**
 * 流光管：uv.y 取中心线弧长 / spacing，同一圈截面完全相同，亮头是垂直于管轴的平切面。
 * 双面顶点与原先 CreateTube(DOUBLESIDE) 一致，避免发光强度变化。
 */
function createFlatHeadFlowTube(
  scene: Scene,
  name: string,
  pts: Vector3[],
  radius: number,
  tessellation: number,
  spacing: number,
): Mesh | null {
  const rings = buildTubeRings(pts)
  if (rings.length < 2) return null

  const slices = Math.max(3, tessellation | 0)
  const stride = slices + 1
  const frontCount = rings.length * stride
  const positions = new Float32Array(frontCount * 3)
  const uvs = new Float32Array(frontCount * 2)
  const indices: number[] = []
  const invSpacing = 1 / Math.max(spacing, 1e-4)

  const worldUp = new Vector3(0, 1, 0)
  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r]!
    // 每圈对齐世界「上」，使 uv.x=0.5 始终在管顶；接缝落在管底
    let top = worldUp.subtract(ring.tangent.scale(Vector3.Dot(worldUp, ring.tangent)))
    if (top.lengthSquared() < 1e-8) top = perpendicularNormal(ring.tangent)
    else top.normalize()
    let side = Vector3.Cross(ring.tangent, top)
    if (side.lengthSquared() < 1e-12) side = perpendicularNormal(ring.tangent)
    else side.normalize()
    top = Vector3.Cross(side, ring.tangent).normalize()

    const v = ring.distance * invSpacing
    const base = r * stride
    for (let s = 0; s <= slices; s++) {
      // ang=0 管底（接缝），ang=π 正上方
      const ang = (s / slices) * Math.PI * 2
      const cos = Math.cos(ang)
      const sin = Math.sin(ang)
      const vi = base + s
      positions[vi * 3] = ring.center.x + (-top.x * cos + side.x * sin) * radius
      positions[vi * 3 + 1] = ring.center.y + (-top.y * cos + side.y * sin) * radius
      positions[vi * 3 + 2] = ring.center.z + (-top.z * cos + side.z * sin) * radius
      uvs[vi * 2] = s / slices
      uvs[vi * 2 + 1] = v
    }
  }

  for (let r = 0; r < rings.length - 1; r++) {
    const rowA = r * stride
    const rowB = (r + 1) * stride
    for (let s = 0; s < slices; s++) {
      const i0 = rowA + s
      const i1 = rowA + s + 1
      const i2 = rowB + s
      const i3 = rowB + s + 1
      indices.push(i0, i2, i1, i1, i2, i3)
    }
  }

  const positionsOut = new Float32Array(frontCount * 2 * 3)
  const uvsOut = new Float32Array(frontCount * 2 * 2)
  positionsOut.set(positions)
  positionsOut.set(positions, positions.length)
  uvsOut.set(uvs)
  uvsOut.set(uvs, uvs.length)

  const indicesOut = new Array<number>(indices.length * 2)
  for (let i = 0; i < indices.length; i++) indicesOut[i] = indices[i]!
  for (let i = 0; i < indices.length; i += 3) {
    const o = indices.length + i
    indicesOut[o] = indices[i + 2]! + frontCount
    indicesOut[o + 1] = indices[i + 1]! + frontCount
    indicesOut[o + 2] = indices[i]! + frontCount
  }

  const mesh = new Mesh(name, scene)
  const vertexData = new VertexData()
  vertexData.positions = positionsOut
  vertexData.uvs = uvsOut
  vertexData.indices = indicesOut
  vertexData.applyToMesh(mesh, false)
  mesh.refreshBoundingInfo()
  return mesh
}

/** FlowLight 材质；uCount = pathLength/spacing（仅用于显现进度） */
function createFlowLightMaterial(
  scene: Scene,
  name: string,
  pathBandCount: number,
  options?: { opacity?: number; glowBoost?: number; additive?: boolean; radius?: number },
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
        'uOpacity',
        'uSpeed',
        'uGlowBoost',
        'uSpacing',
        'uRadius',
      ],
      needAlphaBlending: true,
    },
  )
  mat.backFaceCulling = false
  // 深度测试保留：被厂房/设备遮挡；不写深度以免干扰其它透明物
  mat.disableDepthWrite = true
  mat.transparencyMode = Material.MATERIAL_ALPHABLEND
  mat.alphaMode = options?.additive ? Constants.ALPHA_ADD : Constants.ALPHA_COMBINE
  mat.setFloat('uElapseTime', 0)
  mat.setFloat('uCount', Math.max(pathBandCount, 1e-4))
  mat.setColor3('uColor1', FLOW_COLOR1)
  mat.setFloat('uOpacity', options?.opacity ?? FLOW_OPACITY)
  mat.setFloat('uSpeed', FLOW_SPEED)
  mat.setFloat('uGlowBoost', options?.glowBoost ?? 0.85)
  mat.setFloat('uSpacing', FLOW_SEGMENT_SPACING)
  mat.setFloat('uRadius', options?.radius ?? PIPE_RADIUS)
  return mat
}

interface FlowSegment {
  id: string
  conditionKey: string
  kind: 'main' | 'branch'
  binding: BranchBinding | null
  root: TransformNode
  flowTubes: Mesh[]
  flowMats: ShaderMaterial[]
}

function buildTubesForPath(
  scene: Scene,
  parent: TransformNode,
  id: string,
  ptsIn: Vector3[],
): { flowTubes: Mesh[]; flowMats: ShaderMaterial[] } | null {
  // 保持 line 顶点顺序，流向与线段方向一致
  const pts = resamplePathEvenly(ptsIn, PATH_RESAMPLE_SPACING)
  const len = pathLength(pts)
  if (pts.length < 2 || len < 0.05) return null

  const flowTubes: Mesh[] = []
  const flowMats: ShaderMaterial[] = []
  const bandCount = len / FLOW_SEGMENT_SPACING

  try {
    const flowMat = createFlowLightMaterial(scene, `flow_light_mat_${id}`, bandCount, {
      opacity: 1,
      glowBoost: 0.9,
      additive: false,
      radius: PIPE_RADIUS,
    })
    const flowTube = createFlatHeadFlowTube(
      scene,
      `flow_light_${id}`,
      pts,
      PIPE_RADIUS,
      PIPE_TESSELLATION,
      FLOW_SEGMENT_SPACING,
    )
    if (!flowTube) throw new Error('empty flow tube')
    flowTube.material = flowMat
    flowTube.isPickable = false
    flowTube.parent = parent
    flowTube.renderingGroupId = FLOW_RENDERING_GROUP
    flowTube.alphaIndex = 1
    flowTubes.push(flowTube)
    flowMats.push(flowMat)

    const glowMat = createFlowLightMaterial(scene, `flow_glow_mat_${id}`, bandCount, {
      opacity: 0.45,
      glowBoost: 1.6,
      additive: true,
      radius: PIPE_RADIUS * FLOW_GLOW_RADIUS_SCALE,
    })
    const glowTube = createFlatHeadFlowTube(
      scene,
      `flow_glow_${id}`,
      pts,
      PIPE_RADIUS * FLOW_GLOW_RADIUS_SCALE,
      PIPE_TESSELLATION,
      FLOW_SEGMENT_SPACING,
    )
    if (!glowTube) throw new Error('empty glow tube')
    glowTube.material = glowMat
    glowTube.isPickable = false
    glowTube.parent = parent
    glowTube.renderingGroupId = FLOW_RENDERING_GROUP
    glowTube.alphaIndex = 2
    flowTubes.push(glowTube)
    flowMats.push(glowMat)
  } catch (err) {
    console.warn(`[pipeFlow] tube create failed ${id}`, err)
    for (const m of flowMats) m.dispose()
    for (const t of flowTubes) t.dispose()
    return null
  }

  return { flowTubes, flowMats }
}

export async function createPipeFlow(app: AppOrchestrator): Promise<PipeFlowApi | null> {
  const ctx = app.getContext()
  if (!ctx?.scene) return null

  const scene = ctx.scene
  const model = app.getModelModule()
  const parent = model.getModelPivot()
  const url = withBase(LINES_MODEL_URL)

  // 组 2 不清理深度：沿用组 0 实体深度，流光仍被厂房/设备遮挡
  scene.setRenderingAutoClearDepthStencil(FLOW_RENDERING_GROUP, false, false, false)

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

      const flowTubes: Mesh[] = []
      const flowMats: ShaderMaterial[] = []

      for (let pi = 0; pi < paths.length; pi++) {
        const pts = flatToVectors(paths[pi]!)
        if (pts.length < 2) continue
        const built = buildTubesForPath(scene, segRoot, `${mesh.name}_${pi}`, pts)
        if (!built) continue
        flowTubes.push(...built.flowTubes)
        flowMats.push(...built.flowMats)
      }

      if (!flowTubes.length) {
        segRoot.dispose()
        continue
      }

      segments.push({
        id: mesh.name,
        conditionKey,
        kind,
        binding,
        root: segRoot,
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
        for (const tube of seg.flowTubes) tube.dispose()
        for (const mat of seg.flowMats) mat.dispose()
        seg.root.dispose()
      }
      segments.length = 0
      container?.removeAllFromScene()
      container?.dispose()
      container = null
      activeName = null
      debugLineOverride = undefined
    },
  }
}
