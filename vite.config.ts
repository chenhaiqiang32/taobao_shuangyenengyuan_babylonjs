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
  server: {
    // 忽略浏览器下载中的临时文件，避免 EBUSY 弄崩 file watcher
    watch: {
      ignored: ['**/*.crdownload', '**/docs/**'],
    },
  },
})
