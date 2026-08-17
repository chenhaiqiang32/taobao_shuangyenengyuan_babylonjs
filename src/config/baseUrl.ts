/** Vite / GitHub Pages base，如 `/taobao_shuangyenengyuan_babylonjs/` */
export function getBaseUrl(): string {
  return import.meta.env.BASE_URL || '/'
}

/**
 * 将站点相对路径拼到 base 下。
 * - 已是 http(s) 绝对地址则原样返回
 * - `/models/a.glb` → `/repo/models/a.glb`
 */
export function withBase(path: string): string {
  if (!path) return path
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  const base = getBaseUrl()
  const clean = path.replace(/^\/+/, '')
  return `${base}${clean}`
}
