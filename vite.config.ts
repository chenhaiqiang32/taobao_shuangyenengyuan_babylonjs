import { defineConfig } from 'vite'

// GitHub Pages 项目站：https://<user>.github.io/<repo>/
// 仓库名：taobao_shuangyenengyuan_babylonjs
export default defineConfig({
  base: '/taobao_shuangyenengyuan_babylonjs/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  // preview 时也按 docs 目录预览
  preview: {
    // vite preview 默认读 outDir
  },
})
