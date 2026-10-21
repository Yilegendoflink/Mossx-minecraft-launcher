# MOSS X 图标

规范源文件：`xmcl-keystone-ui/src/assets/moss-x.svg`。

单色平面 X 和叶片组成 MOSS X 的独立标识，界面以 SVG mask 跟随主题主色。
原生图标额外添加森林绿圆角底板保证系统界面可见性。light/dark
PNG 用于窗口与内置图标协议，ICO 包含 16/24/32/48/64/128/256 像素，
透明托盘图标提供明暗两种前景色。原 XMCL 图标文件仍保留在上级目录，
并在软件信息页的原项目区展示原项目标识。

重新生成（在仓库根目录运行，需要可用的 sharp 模块）：

```powershell
node xmcl-electron-app/build/generate-moss-icons.cjs "<sharp 模块路径>"
```

不传路径时使用 Node.js 默认模块查找。生成脚本不修改工作区依赖或上游构建策略。
