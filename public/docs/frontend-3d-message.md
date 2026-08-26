# 前端与三维交互文档（postMessage）

本文说明父页面（如 `demo.html` / 业务前端）与三维场景（Babylon.js）之间的 `window.postMessage` 协议。通讯风格参考昭通项目 `onMessage.js` / `postMessage.js`：父 → 子用数据载荷或 `cmd` 信封，子 → 父统一用 `{ cmd, param }`。

## 1. 嵌入方式

```html
<iframe id="viewer" src="./index.html"></iframe>
```

- 开发：`http://localhost:5173/demo.html`（Vite 将 `public/demo.html` 挂到站点根）
- 生产 / GitHub Pages：与三维同目录，例如 `.../taobao_shuangyenengyuan_babylonjs/demo.html`，iframe 使用相对路径 `./index.html`

## 2. 父页面 → 三维

### 2.1 设备信息更新 `MODEL_UPDATE`（推荐）

每隔一段时间（演示页为 **10 秒**）向 iframe 推送设备指标。三维侧缓存数据；用户点击对应 BIM 设备后弹出 CSS2D 风格信息牌。

```json
{
  "type": "MODEL_UPDATE",
  "objects": [
    {
      "objectName": "BIM_主机_1",
      "metrics": {
        "压缩机运行电流": 550,
        "冷凝压力": 35.2,
        "冷凝器进水温度": 29.3,
        "冷凝器出水温度": 33.2,
        "蒸发压力": 6.8
      }
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 固定 `MODEL_UPDATE` |
| `objects` | array | 一批设备 |
| `objects[].objectName` | string | 与模型设备名匹配，见 §3 |
| `objects[].metrics` | object | 信息牌左右两列：键=标签，值=展示内容 |

父页面发送示例：

```js
iframe.contentWindow.postMessage(
  {
    type: 'MODEL_UPDATE',
    objects: [{ objectName: 'BIM_主机_1', metrics: { 压缩机运行电流: 550 } }],
  },
  '*',
)
```

### 2.2 兼容 `cmd` 信封

与参考项目一致，也可使用：

```js
iframe.contentWindow.postMessage(
  {
    cmd: 'MODEL_UPDATE',
    param: {
      objects: [{ objectName: 'BIM_主机_1', metrics: { 冷凝压力: 35.2 } }],
    },
  },
  '*',
)
```

`param` 也可直接为 `objects` 数组。

## 3. 设备名匹配规则

- 模型中 **`设备_指定名称`** 组下、名称以 **`BIM_`** 开头的节点为可交互设备。
- 父页面 `objectName` 与节点名按 **规范化名** 匹配：去掉尾部多余 `_`。
  - `BIM_主机_1` ↔ `BIM_主机_1_` ✅
  - `BIM_冷冻泵_1` ↔ `BIM_冷冻泵_1_` ✅
- 点击任意子网格时，向上追溯到所属 `BIM_*` 根节点再查指标。

常见设备名示例（以实际 GLB 为准）：

- `BIM_主机_1` / `BIM_主机_2`
- `BIM_冷冻泵_1` … `BIM_冷冻泵_3`
- `BIM_冷却塔_1` / `BIM_冷却塔_2`
- `BIM_冷却泵_1` … `BIM_冷却泵_3`
- `BIM_冷水机组_1` / `BIM_冷水机组_2`
- `BIM_加药装置_*`、`BIM_卧式风柜_*`、`BIM_压力_*` 等

## 4. 三维 → 父页面

三维通过 `window.parent.postMessage({ cmd, param }, '*')` 回传。

| cmd | param | 说明 |
|-----|--------|------|
| `onLoading` | — | 三维开始初始化 |
| `onLoaded` | — | 模型与场景就绪（父页可据此首次推送数据） |
| `web3dDeviceClick` | `{ objectName, metrics }` | 用户点击设备并打开信息牌 |
| `web3dDevicePanelClose` | `{ objectName }` | 关闭信息牌 |

父页监听示例：

```js
window.addEventListener('message', (event) => {
  if (event.source !== iframe.contentWindow) return
  const { cmd, param } = event.data || {}
  if (cmd === 'onLoaded') {
    // 首次推送 MODEL_UPDATE
  }
  if (cmd === 'web3dDeviceClick') {
    console.log('点击设备', param.objectName, param.metrics)
  }
})
```

## 5. 信息牌交互

1. 父页推送 `MODEL_UPDATE` → 三维写入指标仓库（可覆盖更新）。
2. 用户在场景中 **点击** 已匹配的 BIM 设备 → 弹出深色半透明、青色描边信息牌（标题 + 关闭 + 键值列表）。
3. 再次点击同一设备或点关闭按钮 → 关闭牌子。
4. 若牌子已打开且同一设备收到新指标 → **原地刷新** 数值，无需重点。

实现位置：

- 监听：`src/message/onMessage.ts`
- 回传：`src/message/postMessage.ts`
- 指标仓：`src/business/deviceMetrics.ts`
- 拾取与牌子：`src/business/deviceInteraction.ts`、`src/ui/deviceInfoPanel.ts`
- 设备查找：`ModelModule.findDeviceByObjectName` / `resolveDeviceFromPickedMesh`

## 6. 演示页

打开 `demo.html`：

1. iframe 加载三维，收到 `onLoaded` 后立即推送一次设备数据。
2. 之后 **每 10 秒** 自动推送（数值带小幅抖动便于观察刷新）。
3. 可点「立即推送一次」手动触发。
4. 左下角日志显示收发摘要。

## 7. 安全说明

演示使用 `targetOrigin = '*'`。正式环境建议改为业务前端精确 origin，并在三维侧校验 `event.origin`。
