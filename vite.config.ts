import { defineConfig } from 'vite'

// 使用相对路径，docs 部署到任意目录/域名根路径均可打开
export default defineConfig({
  base: './',
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
