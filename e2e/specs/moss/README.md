# MOSS X 发行验证

使用真实发行 EXE 和隔离临时配置，不访问用户实际账号或游戏目录。
验证原生图标、主题图标、八套配色、深色模式、启动画面和原项目署名。
不要求 Microsoft 登录或真实游戏下载。

在仓库根目录运行：

```powershell
$env:XMCL_E2E_PACKAGED_EXECUTABLE = "$PWD/xmcl-electron-app/build/moss-release/0.72.0-moss.1/win-unpacked/MOSS X.exe"
pnpm --prefix=e2e exec playwright test specs/moss --output=artifacts/moss-release-results
```

依赖与 FFmpeg 的一次性准备方式见 e2e/README.md。截图、视频与测试配置不提交 Git。
