# HDR / 环境贴图

默认天空盒与 IBL 使用：

- `horn-koppe_spring_1k.hdr`

在 `public/config/scene.json` 中配置：

```json
"skybox": {
  "hdrUrl": "/hdr/horn-koppe_spring_1k.hdr",
  "format": "hdr",
  "asEnvironmentTexture": true,
  "showMesh": true
}
```

也可在右侧面板 **Skybox / HDR** 中切换预设或自定义路径。
