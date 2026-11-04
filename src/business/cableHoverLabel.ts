/**
 * 「设备_电揽」分组悬停浮窗：鼠标经过强弱电/母线槽/电缆箱等 mesh 时，
 * 在指针旁显示节点名；移开即隐藏。不做悬停高亮。
 */
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Node } from '@babylonjs/core/node'
import type { AppOrchestrator } from '../core/app'
import { CABLE_GROUP_NAME } from './features'

interface CableEntry {
  /** 展示用节点名（分组下第一层设备名） */
  name: string
  node: AbstractMesh | TransformNode
  meshes: AbstractMesh[]
}

export interface CableHoverLabelApi {
  dispose: () => void
}

function isMeshNode(node: Node): node is AbstractMesh {
  const mesh = node as AbstractMesh
  return typeof mesh.getTotalVertices === 'function' && typeof mesh.isPickable === 'boolean'
}

function collectMeshes(node: Node): AbstractMesh[] {
  const meshes: AbstractMesh[] = []
  const seen = new Set<AbstractMesh>()

  const tryAdd = (m: AbstractMesh): void => {
    if (seen.has(m)) return
    if (typeof m.getTotalVertices === 'function' && m.getTotalVertices() <= 0) return
    seen.add(m)
    meshes.push(m)
  }

  if (isMeshNode(node)) tryAdd(node)
  if ('getChildMeshes' in node && typeof node.getChildMeshes === 'function') {
    for (const child of (node as TransformNode).getChildMeshes(false)) {
      tryAdd(child)
    }
  }
  return meshes
}

function buildCableIndex(
  app: AppOrchestrator,
): {
  entries: CableEntry[]
  meshToEntry: Map<AbstractMesh, CableEntry>
} {
  const model = app.getModelModule()
  const groups = model.findPartNodes(CABLE_GROUP_NAME)
  const entries: CableEntry[] = []
  const meshToEntry = new Map<AbstractMesh, CableEntry>()
  const seenNames = new Set<string>()

  for (const group of groups) {
    for (const child of group.getChildren()) {
      const name = String(child.name || '').trim()
      if (!name || seenNames.has(name)) continue

      const meshes = collectMeshes(child)
      if (!meshes.length) continue

      seenNames.add(name)
      const entry: CableEntry = {
        name,
        node: child as AbstractMesh | TransformNode,
        meshes,
      }
      entries.push(entry)
      for (const mesh of meshes) {
        mesh.isPickable = true
        meshToEntry.set(mesh, entry)
      }
    }
  }

  return { entries, meshToEntry }
}

export function createCableHoverLabel(app: AppOrchestrator): CableHoverLabelApi | null {
  const ctx = app.getContext()
  if (!ctx?.scene) {
    console.warn('[cableHoverLabel] scene 未就绪')
    return null
  }

  const scene = ctx.scene
  const canvas = ctx.canvas
  const { entries, meshToEntry } = buildCableIndex(app)
  if (!entries.length) {
    console.warn(`[cableHoverLabel] group "${CABLE_GROUP_NAME}" 下未找到可拾取设备`)
    return null
  }

  const tip = document.createElement('div')
  tip.className = 'cable-hover-tip'
  tip.hidden = true
  tip.setAttribute('aria-hidden', 'true')
  tip.innerHTML = `<span class="cable-hover-tip__title"></span>`
  document.body.appendChild(tip)
  const titleEl = tip.querySelector('.cable-hover-tip__title') as HTMLElement

  let currentName: string | null = null
  let hovering = false

  const hide = (): void => {
    if (tip.hidden) return
    tip.hidden = true
    tip.setAttribute('aria-hidden', 'true')
    currentName = null
  }

  const showAt = (name: string, clientX: number, clientY: number): void => {
    if (currentName !== name) {
      currentName = name
      titleEl.textContent = name
      tip.title = name
    }
    tip.hidden = false
    tip.setAttribute('aria-hidden', 'false')
    // 跟鼠标，略向右下偏移，避免挡住指针
    tip.style.left = `${clientX + 14}px`
    tip.style.top = `${clientY + 14}px`
  }

  const pickCableAtPointer = (): CableEntry | null => {
    if (!meshToEntry.size) return null
    const hits = scene.multiPick(
      scene.pointerX,
      scene.pointerY,
      (mesh) => meshToEntry.has(mesh),
    )
    if (!hits?.length) return null
    const picked = hits[0]?.pickedMesh
    if (!picked) return null
    return meshToEntry.get(picked) ?? null
  }

  const observer = scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) return

    const entry = pickCableAtPointer()
    if (!entry) {
      // 移开不改 cursor：deviceInteraction 已先按 BIM 悬停设好 pointer/default
      // 本模块在其后注册，仅在命中电缆时覆盖为小手
      if (hovering) {
        hovering = false
        hide()
      }
      return
    }

    hovering = true
    canvas.style.cursor = 'pointer'
    const ev = pointerInfo.event as PointerEvent
    showAt(entry.name, ev.clientX, ev.clientY)
  })

  console.info(
    `[cableHoverLabel] ready, devices=${entries.length}` +
      ` (e.g. ${entries
        .slice(0, 4)
        .map((e) => e.name)
        .join(', ')})`,
  )

  return {
    dispose() {
      scene.onPointerObservable.remove(observer)
      hide()
      if (hovering) canvas.style.cursor = 'default'
      hovering = false
      tip.remove()
      meshToEntry.clear()
      entries.length = 0
    },
  }
}
