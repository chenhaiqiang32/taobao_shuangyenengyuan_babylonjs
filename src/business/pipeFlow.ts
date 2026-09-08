/**
 * 工况管线水流：根据 MODEL_UPDATE 判定工况线条，沿路径生成管道 + FlowLight 流光
 * （效果对齐 bl_tongfeng FlowLight2 tube shader）
 */
import '@babylonjs/loaders/glTF'
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { CreateTube } from '@babylonjs/core/Meshes/Builders/tubeBuilder'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
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
import { getDeviceMetrics } from './deviceMetrics'
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
const DEBUG_MARKER_SIZE = 4

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

export function resolveWorkingConditionLineName(): string | null {
  for (const rule of WORKING_CONDITION_RULES) {
    if (rule.checks.every(passesCheck)) return rule.lineName
  }
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
  return `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`
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

function stitchPolylines(segments: number[][]): number[][] {
  type Pt = [number, number, number]
  const adj = new Map<string, { pos: Pt; next: string[] }>()

  const ensure = (x: number, y: number, z: number): string => {
    const k = keyPoint(x, y, z)
    if (!adj.has(k)) adj.set(k, { pos: [x, y, z], next: [] })
    return k
  }

  for (const s of segments) {
    const ka = ensure(s[0]!, s[1]!, s[2]!)
    const kb = ensure(s[3]!, s[4]!, s[5]!)
    if (ka === kb) continue
    adj.get(ka)!.next.push(kb)
    adj.get(kb)!.next.push(ka)
  }

  const usedEdge = new Set<string>()
  const edgeKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`)
  const polylines: number[][] = []

  const walk = (start: string, prefer?: string): void => {
    const line: number[] = []
    let prev: string | null = null
    let cur = start
    let preferNext = prefer
    const pushPos = (k: string): void => {
      const p = adj.get(k)!.pos
      line.push(p[0], p[1], p[2])
    }
    pushPos(cur)

    while (true) {
      const node = adj.get(cur)!
      let nxt: string | null = null
      if (preferNext && node.next.includes(preferNext) && !usedEdge.has(edgeKey(cur, preferNext))) {
        nxt = preferNext
        preferNext = undefined
      } else {
        for (const cand of node.next) {
          if (cand === prev) continue
          if (usedEdge.has(edgeKey(cur, cand))) continue
          nxt = cand
          break
        }
      }
      if (!nxt) break
      usedEdge.add(edgeKey(cur, nxt))
      prev = cur
      cur = nxt
      pushPos(cur)
    }

    if (line.length >= 6) polylines.push(line)
  }

  const keys = [...adj.keys()]
  for (const k of keys) {
    if (adj.get(k)!.next.length === 1) {
      const n = adj.get(k)!.next[0]!
      if (!usedEdge.has(edgeKey(k, n))) walk(k)
    }
  }
  for (const k of keys) {
    for (const n of adj.get(k)!.next) {
      if (!usedEdge.has(edgeKey(k, n))) walk(k, n)
    }
  }

  return polylines.length ? polylines : segments
}

function resolveEndpoints(paths: number[][]): { start: Vector3; end: Vector3 } {
  const ends: Vector3[] = []
  for (const p of paths) {
    ends.push(new Vector3(p[0]!, p[1]!, p[2]!))
    ends.push(new Vector3(p[p.length - 3]!, p[p.length - 2]!, p[p.length - 1]!))
  }
  let start = ends[0]!
  let end = ends[ends.length - 1]!
  let far = -1
  for (let i = 0; i < ends.length; i++) {
    for (let j = i + 1; j < ends.length; j++) {
      const d = Vector3.DistanceSquared(ends[i]!, ends[j]!)
      if (d > far) {
        far = d
        start = ends[i]!
        end = ends[j]!
      }
    }
  }
  return { start, end }
}

function orientPathStartToEnd(pts: Vector3[], start: Vector3, end: Vector3): Vector3[] {
  if (pts.length < 2) return pts
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  const forward =
    Vector3.DistanceSquared(first, start) + Vector3.DistanceSquared(last, end)
  const reverse =
    Vector3.DistanceSquared(last, start) + Vector3.DistanceSquared(first, end)
  if (reverse < forward) {
    const copy = pts.slice()
    copy.reverse()
    return copy
  }
  return pts
}

function cleanPath(pts: Vector3[], minDist = 0.02): Vector3[] {
  if (pts.length < 2) return pts
  const out: Vector3[] = [pts[0]!]
  for (let i = 1; i < pts.length; i++) {
    if (Vector3.Distance(pts[i]!, out[out.length - 1]!) >= minDist) out.push(pts[i]!)
  }
  if (out.length === 1) out.push(pts[pts.length - 1]!)
  return out
}

/** 弧长等距重采样，使 CreateTube 的 V(按点索引) 近似真实距离 */
function resamplePathEvenly(pts: Vector3[], spacing: number): Vector3[] {
  const cleaned = cleanPath(pts)
  if (cleaned.length < 2) return cleaned

  const segLens: number[] = []
  let total = 0
  for (let i = 1; i < cleaned.length; i++) {
    const d = Vector3.Distance(cleaned[i - 1]!, cleaned[i]!)
    segLens.push(d)
    total += d
  }
  if (total < 1e-4) return cleaned

  const step = Math.max(spacing, total / 80)
  const count = Math.max(2, Math.ceil(total / step) + 1)
  const out: Vector3[] = []
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * total
    let acc = 0
    for (let s = 0; s < segLens.length; s++) {
      const next = acc + segLens[s]!
      if (target <= next || s === segLens.length - 1) {
        const t = segLens[s]! > 1e-8 ? (target - acc) / segLens[s]! : 0
        out.push(Vector3.Lerp(cleaned[s]!, cleaned[s + 1]!, Math.min(Math.max(t, 0), 1)))
        break
      }
      acc = next
    }
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

function createMarker(
  name: string,
  position: Vector3,
  color: Color3,
  parent: TransformNode | AbstractMesh | null,
  scene: Scene,
): Mesh {
  const box = CreateBox(name, { size: DEBUG_MARKER_SIZE }, scene)
  const mat = new StandardMaterial(`${name}_mat`, scene)
  mat.diffuseColor = color
  mat.emissiveColor = color.scale(0.85)
  mat.disableLighting = true
  box.material = mat
  box.position.copyFrom(position)
  box.isPickable = false
  if (parent) box.parent = parent
  box.setEnabled(false)
  return box
}

interface FlowLineEntry {
  lineName: string
  root: TransformNode
  baseTubes: Mesh[]
  flowTubes: Mesh[]
  flowMats: ShaderMaterial[]
  startMarker: Mesh
  endMarker: Mesh
  segmentCount: number
  polyCount: number
  tubeCount: number
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

  const baseMat = createPipeBaseMaterial(scene)
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
    const segments = extractLinePaths(mesh)
    mesh.setEnabled(false)
    mesh.isVisible = false
    if (!segments.length) {
      console.warn(`[pipeFlow] line "${lineName}" has no segments`)
      continue
    }

    const paths = stitchPolylines(segments)
    const { start, end } = resolveEndpoints(paths)
    const lineParent = (mesh.parent as TransformNode | null) ?? parent
    const group = new TransformNode(`flow_pipes_${lineName}`, scene)
    group.parent = lineParent
    group.setEnabled(false)

    const baseTubes: Mesh[] = []
    const flowTubes: Mesh[] = []
    const flowMats: ShaderMaterial[] = []
    for (let i = 0; i < paths.length; i++) {
      let pts = flatToVectors(paths[i]!)
      if (pts.length < 2) continue
      pts = orientPathStartToEnd(pts, start, end)
      pts = resamplePathEvenly(pts, PATH_RESAMPLE_SPACING)
      const len = pathLength(pts)
      if (pts.length < 2 || len < 0.05) continue

      try {
        const bandCount = len / FLOW_SEGMENT_SPACING
        const baseTube = CreateTube(
          `flow_base_${lineName}_${i}`,
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
        baseTube.parent = group
        baseTubes.push(baseTube)

        const flowMat = createFlowLightMaterial(scene, `flow_light_mat_${lineName}_${i}`, bandCount, {
          opacity: 1,
          glowBoost: 0.9,
          additive: false,
        })
        const flowTube = CreateTube(
          `flow_light_${lineName}_${i}`,
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
        flowTube.parent = group
        flowTube.alphaIndex = 1
        bindFlowDepthTestOff(flowTube)
        flowTubes.push(flowTube)
        flowMats.push(flowMat)

        // 外层加法柔光，近似原项目 SelectiveBloom
        const glowMat = createFlowLightMaterial(scene, `flow_glow_mat_${lineName}_${i}`, bandCount, {
          opacity: 0.45,
          glowBoost: 1.6,
          additive: true,
        })
        const glowTube = CreateTube(
          `flow_glow_${lineName}_${i}`,
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
        glowTube.parent = group
        glowTube.alphaIndex = 2
        bindFlowDepthTestOff(glowTube)
        flowTubes.push(glowTube)
        flowMats.push(glowMat)
      } catch (err) {
        console.warn(`[pipeFlow] tube create failed ${lineName}#${i}`, err)
      }
    }

    if (!baseTubes.length) {
      console.warn(`[pipeFlow] no tubes for "${lineName}"`)
      for (const mat of flowMats) mat.dispose()
      group.dispose()
      continue
    }

    const startMarker = createMarker(
      `flow_dbg_start_${lineName}`,
      start,
      new Color3(0.1, 1, 0.2),
      lineParent,
      scene,
    )
    const endMarker = createMarker(
      `flow_dbg_end_${lineName}`,
      end,
      new Color3(1, 0.15, 0.1),
      lineParent,
      scene,
    )

    entries.push({
      lineName,
      root: group,
      baseTubes,
      flowTubes,
      flowMats,
      startMarker,
      endMarker,
      segmentCount: segments.length,
      polyCount: paths.length,
      tubeCount: baseTubes.length,
    })
  }

  if (!entries.length) {
    console.warn('[pipeFlow] no working-condition lines found in', url)
  } else {
    console.info(
      `[pipeFlow] pipes ready: ${entries
        .map((e) => `${e.lineName}(tube=${e.tubeCount})`)
        .join(', ')}`,
    )
  }

  let activeName: string | null = null
  let debugLineOverride: string | null | undefined = undefined
  let elapseTime = 0

  const setActive = (lineName: string | null): void => {
    if (lineName === activeName) return
    activeName = lineName
    // 切换工况时重置时间，复现 FlowLight 沿路径逐渐显现
    elapseTime = 0
    for (const entry of entries) {
      const on = entry.lineName === lineName
      entry.root.setEnabled(on)
      entry.startMarker.setEnabled(on)
      entry.endMarker.setEnabled(on)
      if (on) {
        for (const mat of entry.flowMats) mat.setFloat('uElapseTime', 0)
      }
    }
    if (lineName) {
      const hit = entries.find((e) => e.lineName === lineName)
      console.info(
        `[pipeFlow] active line=${lineName} tubes=${hit?.tubeCount ?? 0}` +
          (debugLineOverride !== undefined ? ' (debug)' : ''),
      )
    } else {
      console.info('[pipeFlow] no matching working condition')
    }
  }

  const refreshAll = (): void => {
    if (debugLineOverride !== undefined) {
      setActive(debugLineOverride)
      return
    }
    setActive(resolveWorkingConditionLineName())
  }

  const setMainModelVisible = (visible: boolean): void => {
    model.setMainModelVisible(visible)
    console.info(`[pipeFlow] main model visible=${visible}`)
  }

  setMainModelVisible(false)

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    if (!activeName) return
    const dt = scene.getEngine().getDeltaTime() * 0.001
    elapseTime += dt
    const active = entries.find((e) => e.lineName === activeName)
    if (!active) return
    for (const mat of active.flowMats) {
      mat.setFloat('uElapseTime', elapseTime)
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
      if (!entries.some((e) => e.lineName === lineName)) {
        console.warn(`[pipeFlow] unknown debug line "${lineName}"`)
        return
      }
      debugLineOverride = lineName
      setActive(lineName)
    },
    getLineNames: () => entries.map((e) => e.lineName),
    setMainModelVisible,
    dispose() {
      scene.onBeforeRenderObservable.remove(renderObserver)
      for (const entry of entries) {
        for (const tube of entry.baseTubes) tube.dispose()
        for (const tube of entry.flowTubes) tube.dispose()
        for (const mat of entry.flowMats) mat.dispose()
        entry.root.dispose()
        entry.startMarker.dispose()
        entry.endMarker.dispose()
      }
      entries.length = 0
      baseMat.dispose()
      container?.removeAllFromScene()
      container?.dispose()
      container = null
      activeName = null
      debugLineOverride = undefined
    },
  }
}
