# 前端接入三维（调用说明）

父页面用 iframe 嵌入三维，通过 `postMessage` 推送数据、接收回传。参考：[`../demo.html`](../demo.html)。

## 1. 嵌入

```html
<iframe id="viewer" src="https://你的三维地址/" allow="fullscreen"></iframe>
```

同域部署可用相对路径：`src="./index.html"`。

## 2. 推送设备数据 `MODEL_UPDATE`

```js
iframe.contentWindow.postMessage(
  {
    type: 'MODEL_UPDATE',
    objects: [
      {
        objectName: 'BIM_冷冻泵_1_', // 与模型 BIM 设备名匹配，尾部 _ 可有可无
        metrics: {
          运行信号: 1,
          频率反馈: 42,
        },
      },
    ],
  },
  '*', // 生产环境请改为精确 origin
)
```

兼容写法：

```js
iframe.contentWindow.postMessage(
  { cmd: 'MODEL_UPDATE', param: { objects: [/* 同上 */] } },
  '*',
)
```

**时机建议**：收到 `onLoaded` 后立刻推一次，之后按业务周期定时推送。

## 3. 监听三维回传

```js
window.addEventListener('message', (event) => {
  if (event.source !== iframe.contentWindow) return
  const { cmd, param } = event.data || {}

  if (cmd === 'onLoaded') {
    // 三维就绪 → 首次推送 MODEL_UPDATE
  }
  if (cmd === 'onLoading') {
    // 加载中
  }
  if (cmd === 'web3dDeviceClick') {
    // 点击设备：param = { objectName, metrics }
  }
  if (cmd === 'web3dDevicePanelClose') {
    // 关牌：param = { objectName }
  }
})
```

| cmd | param | 说明 |
|-----|--------|------|
| `onLoading` | — | 开始加载 |
| `onLoaded` | — | 就绪，可推数据 |
| `web3dDeviceClick` | `{ objectName, metrics }` | 点击设备 |
| `web3dDevicePanelClose` | `{ objectName }` | 关闭信息牌 |

## 4. 最小示例

```html
<iframe id="viewer" src="https://你的三维地址/" allow="fullscreen"></iframe>
<script>
  const iframe = document.getElementById('viewer')

  function push(objects) {
    iframe.contentWindow?.postMessage({ type: 'MODEL_UPDATE', objects }, '*')
  }

  window.addEventListener('message', (e) => {
    if (e.source !== iframe.contentWindow) return
    if (e.data?.cmd === 'onLoaded') {
      push([{ objectName: 'BIM_冷冻泵_1_', metrics: { 运行信号: 1 } }])
    }
  })
</script>
```

样例数据见 [`../model-update.json`](../model-update.json)。
