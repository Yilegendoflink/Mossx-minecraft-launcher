# MOSS X 0.72.0-moss.1

基于 X Minecraft Launcher（XMCL）0.72.0 的 X-Launcher个人美化版本。
保留 ci010、原项目贡献者署名与 MIT 许可，原项目信息在“设置 → 关于”中展示。

## 本版内容

- MOSS 桌面界面、平面 X/叶片标识和与主题联动的界面图标。
- 森林、樱花、雪原、沙漠、海洋、沼泽、下界、末地八套明暗配色与主页场景。
- 清爽页面动效、标题栏导航菜单、浮动导航固定显示及默认布局恢复。
- Modrinth、CurseForge、FTB、MC百科模组、MC百科整合包、MCBBS 2nd 六来源平级筛选及混合资源列表。
- 中文社区支持目录、关键词、版本/加载器筛选，社区卡片访问作者原页面；没有冒充支持未实现的一键下载。
- 保留原有游戏版本、实例、账号、模组、整合包导入、联机及其他运行功能。

## Windows x64 安装与运行

- 安装程序：`MOSS-X-0.72.0-moss.1-windows-x64-setup.exe`，按向导选择目录，当前用户安装。
- 便携包：`MOSS-X-0.72.0-moss.1-windows-x64.zip`，完整解压后运行 `MOSS X.exe`，保留所有 DLL 与资源文件。
- 默认配置独立保存在 `%APPDATA%\MOSS X\xmcl`，不会自动迁移或删除原 XMCL 配置。游戏目录仍由用户选择。
- 开发工作区的 `Start-Moss.cmd` 继续使用 `.moss-local/appdata`，与发行版默认配置分开。
- 卸载不删除配置和游戏目录。更新请使用本仓库的 MOSS X 发行包；禁止用原版 XMCL 更新覆盖当前改造。
- 发布包未做代码签名；可用同目录 `SHA256SUMS.txt` 核对下载完整性。

## 能力边界

MC百科的带关键词兼容性筛选以当前搜索页详情为依据，可翻页继续检索；MCBBS 依据公开目录中的明确文字匹配，不推断版本区间。站点验证、访问限制或结构变化可能影响读取，可重试或打开原页面。原有平台下载仍取决于网络、平台接口可用性及作者分发设置。发行验证不使用真实 Microsoft 凭据，也不宣称已完成所有游戏组合的真实下载与启动。

项目：https://github.com/Yilegendoflink/Mossx-minecraft-launcher

原项目：https://github.com/voxelum/x-minecraft-launcher
