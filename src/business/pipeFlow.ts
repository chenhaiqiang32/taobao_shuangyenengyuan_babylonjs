/**
 * 工况管线水流：根据 MODEL_UPDATE 判定工况线条，沿路径生成管道 + 表面贴图滚动模拟水流
 */
import '@babylonjs/loaders/glTF'
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { CreateTube } from '@babylonjs/core/Meshes/Builders/tubeBuilder'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
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

/** 管道半径 */
const PIPE_RADIUS = 0.85
/** 管道截面边数 */
const PIPE_TESSELLATION = 12
/** 路径重采样间距（保证 UV 均匀） */
const PATH_RESAMPLE_SPACING = 1.0
/** 贴图滚动速度（纹理周期 / 秒） */
const FLOW_SCROLL_SPEED = 0.55
/** 每多少场景单位重复一节水流贴图 */
const FLOW_BAND_SPACING = 4.0
const DEBUG_MARKER_SIZE = 4

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

/** CreateTube：U 环绕、V 沿路径 0~1 → 乘以管长，使贴图按真实距离均匀重复 */
function scaleTubeUvByPathLength(tube: Mesh, length: number): void {
  const uvs = tube.getVerticesData(VertexBuffer.UVKind)
  if (!uvs?.length) return
  const len = Math.max(length, 0.01)
  for (let i = 1; i < uvs.length; i += 2) {
    uvs[i] = uvs[i]! * len
  }
  tube.setVerticesData(VertexBuffer.UVKind, uvs, false)
}

/** 生成蓝色水流条纹贴图（沿 V 滚动） */
function createWaterFlowTexture(scene: Scene): DynamicTexture {
  const w = 128
  const h = 256
  const tex = new DynamicTexture('pipeWaterFlowTex', { width: w, height: h }, scene, false)
  const ctx = tex.getContext()

  for (let y = 0; y < h; y++) {
    const t = y / h
    // 深蓝底 + 青色亮带
    const wave = 0.5 + 0.5 * Math.sin(t * Math.PI * 2)
    const wave2 = 0.5 + 0.5 * Math.sin(t * Math.PI * 4 + 0.8)
    const foam = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2)), 8)
    const r = 10 + wave * 30 + foam * 140
    const g = 70 + wave * 90 + wave2 * 40 + foam * 100
    const b = 150 + wave * 70 + foam * 50
    ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`
    ctx.fillRect(0, y, w, 1)
  }

  // 环向轻微高光，增加管体立体感
  const grad = ctx.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, 'rgba(0,0,0,0.25)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.12)')
  grad.addColorStop(0.65, 'rgba(0,0,0,0.05)')
  grad.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  tex.hasAlpha = false
  tex.wrapU = Texture.WRAP_ADDRESSMODE
  tex.wrapV = Texture.WRAP_ADDRESSMODE
  tex.update()
  return tex
}

function createWaterPipeMaterial(scene: Scene, texture: DynamicTexture): StandardMaterial {
  const mat = new StandardMaterial('pipeWaterMat', scene)
  // V 为场景距离时：1 / FLOW_BAND_SPACING = 每节水流对应的纹理重复
  texture.vScale = 1 / FLOW_BAND_SPACING
  texture.uScale = 1
  mat.diffuseTexture = texture
  mat.emissiveTexture = texture
  mat.emissiveColor = new Color3(0.45, 0.65, 0.95)
  mat.specularColor = new Color3(0.25, 0.35, 0.45)
  mat.diffuseColor = new Color3(0.85, 0.9, 1.0)
  mat.backFaceCulling = true
  return mat
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
  tubes: Mesh[]
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

  const waterTex = createWaterFlowTexture(scene)
  const waterMat = createWaterPipeMaterial(scene, waterTex)
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

    const tubes: Mesh[] = []
    for (let i = 0; i < paths.length; i++) {
      let pts = flatToVectors(paths[i]!)
      if (pts.length < 2) continue
      pts = orientPathStartToEnd(pts, start, end)
      pts = resamplePathEvenly(pts, PATH_RESAMPLE_SPACING)
      const len = pathLength(pts)
      if (pts.length < 2 || len < 0.05) continue

      try {
        const tube = CreateTube(
          `flow_tube_${lineName}_${i}`,
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
        scaleTubeUvByPathLength(tube, len)
        tube.material = waterMat
        tube.isPickable = false
        tube.parent = group
        tubes.push(tube)
      } catch (err) {
        console.warn(`[pipeFlow] tube create failed ${lineName}#${i}`, err)
      }
    }

    if (!tubes.length) {
      console.warn(`[pipeFlow] no tubes for "${lineName}"`)
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
      tubes,
      startMarker,
      endMarker,
      segmentCount: segments.length,
      polyCount: paths.length,
      tubeCount: tubes.length,
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
  let scroll = 0

  const setActive = (lineName: string | null): void => {
    if (lineName === activeName) return
    activeName = lineName
    for (const entry of entries) {
      const on = entry.lineName === lineName
      entry.root.setEnabled(on)
      entry.startMarker.setEnabled(on)
      entry.endMarker.setEnabled(on)
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
    // CreateTube V 沿路径：滚动 vOffset → 贴图从起点流向终点
    scroll = (scroll + FLOW_SCROLL_SPEED * dt) % 1
    waterTex.vOffset = scroll
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
        for (const tube of entry.tubes) tube.dispose()
        entry.root.dispose()
        entry.startMarker.dispose()
        entry.endMarker.dispose()
      }
      entries.length = 0
      waterMat.dispose()
      waterTex.dispose()
      container?.removeAllFromScene()
      container?.dispose()
      container = null
      activeName = null
      debugLineOverride = undefined
    },
  }
}
