# MOSS X · XMCL 美化与中文优化版

MOSS X 是基于 X Minecraft Launcher（XMCL）改造的美化与中文优化版本，本地仓库为 `Yilegendoflink/Mossx-minecraft-launcher`。保留 XMCL 原有功能、原作者 ci010 及贡献者署名、开源许可；使用 Moss 风格的界面和群系主题。

## 打开与运行

- 项目目录：当前仓库根目录。
- 编辑器工作区：`Moss.code-workspace`
- Windows 一键启动：双击 `Start-Moss.cmd`。
- 最新打包程序：`xmcl-electron-app/build/moss-release/0.72.0-moss.1/win-unpacked/MOSS X.exe`。

启动脚本使用 `.moss-local/appdata` 保存此工作区的应用配置，与普通 XMCL / 旧 Moss 的配置分开。首次进入时按原项目向导选择游戏目录。发行版直接启动时使用 `%APPDATA%\MOSS X\xmcl`，与原 XMCL 配置分开；需要继续使用工作区数据时，运行启动脚本。

## 本地部署

Node.js 22.16+，按仓库声明使用 pnpm 11.10。首次检出源码需要安装依赖。

```powershell
pnpm install --frozen-lockfile
pnpm build:renderer
pnpm --prefix=xmcl-electron-app compile
pnpm --prefix=xmcl-electron-app exec tsx build/package-moss.ts --release
node xmcl-electron-app/build/checksum-moss-release.cjs
```

发行模式输出到 `xmcl-electron-app/build/moss-release/0.72.0-moss.1`，包含 Windows x64 NSIS 安装程序、便携 ZIP、解压目录、SHA256SUMS.txt 和 release-manifest.json。安装向导可选目录，默认当前用户安装，卸载不删除配置。应用 EXE 写入 MOSS X 图标与名称，关闭代码签名。所有打包命令均使用 publish=never，不自动上传或公开发布。仅需本地解压版时，使用 `pnpm --prefix=xmcl-electron-app exec tsx build/package-moss.ts build/moss-flat`。

开发热更新仍采用原项目任务：

```powershell
# 终端一
pnpm dev:renderer

# 终端二
$env:XMCL_E2E_APP_DATA = "$PWD\.moss-local\appdata"
pnpm dev:main
```

正常开发页面为 `http://localhost:3000`；生产编译版通过 `http://xmcl.runtime` 加载本地页面。编译主进程后再回到开发模式时，需要重新启动 `dev:main`，以恢复开发服务器入口。

## 改造范围

- Moss 品牌、浅色森林绿默认主题，以及配套深色配色。
- MOSS X 使用自有森林绿 X/嫩叶 SVG，加载页、左上品牌、软件信息页、窗口与托盘图标同步替换，并生成 Windows 多尺寸 ICO。小字为“X-Launcher个人美化版本”；软件信息页保留 XMCL 原标识、作者、贡献者、赞助和许可。图标源文件与再生方法见 `xmcl-electron-app/icons/moss/README.md`。
- 界面图标采用无描边、无明暗折面的单色 X 与叶片，由 MossLogo 以 SVG mask 绑定当前主题主色。侧栏 32px、关于页 40px、加载页 64px；支持八套群系、深浅模式与自定义主色。加载页通过本地颜色提示沿用上次有效配色。EXE/窗口/托盘使用独立导出的平面化固定图标，避免系统图标缓存与可见性问题。
- 桌面宽侧栏：我的游戏、下载任务、账号与实例、资源市场、Agent、联机和设置。800×400 小窗口收为图标导航。
- 标题栏常驻“导航”菜单：随时进入页面、固定浮动导航或恢复默认左侧栏。切换导航样式默认取消自动隐藏，兼容已有隐藏配置；边缘唤出按钮支持键盘，经典布局恢复时会纠正无效的顶部/底部位置。
- 首页像素森林横幅，按钮直接调用原有实例创建和资源市场功能。
- 八套群系皮肤：森林、樱花、雪原、沙漠、海洋、沼泽、下界、末地。主页右上角皮肤菜单或“设置 → 外观”中切换，联动配色与主页像素场景；支持明暗模式、全局/实例主题持久化以及主题导入导出。
- “清新律动”替换原版 Halo / 粒子背景：低对比 CSS 方块漂移、群系横幅浮尘、页面淡入上移和操作悬停反馈。旧光环/粒子配置自动使用新效果；系统减少动态效果设置生效。“设置 → 外观 → 背景类型”仍可关闭背景或选择自定义图片/视频。
- “发现内容”接入 MC百科模组/整合包、MCBBS 2nd 公开目录，右侧列出真实条目并复用关键词、游戏版本和加载器筛选。提供作者原页面跳转及 ZIP / MRPACK 本地导入；保留原有 Modrinth / CurseForge / FTB 一键安装。
- 六个来源同组平级卡片，默认全部启用，均使用“点击排除／再次点击启用”的多选筛选；支持全关、纯社区及社区/国际混选。全部结果共用右侧卡片网格与分页，并保留来源标识。各源排名不直接比较，页内交错合并；社区不伪造下载量或安装按钮。筛选写入 URL 的 omitSources，刷新后保留，旧 community 单源链接继续兼容。
- 原有卡片、表单、菜单、对话框、账号/皮肤、市场筛选和设置统一视觉。
- 修正开发环境托盘图标依赖工作目录的问题，避免切换语言时的连带异常。

未重写路由、下载/安装/认证服务、游戏启动、整合包导入、联机、Agent 或存档逻辑。原有快捷键、手柄、拖拽排序、主题导入/导出和布局模式继续保留。

## 验证

- `pnpm check`：全工作区类型检查。
- `pnpm lint`：全工作区 lint；上游存在少量未涉及的警告。
- 主题序列化、八套皮肤持久化/兼容旧主题、Vuetify 图标注册与托盘路径回归测试：21 项通过。
- 隔离 Electron 测试覆盖首页、市场搜索入口、设置、账号与实例、创建向导，以及 1200×720 / 800×400 两种窗口。
- 打包后的 `Moss Launcher.exe` 已独立启动并确认从 `app.asar` 加载，资源市场、设置和账号页面导航通过；隔离测试退出和临时配置清理也已通过。
- 截图位于 `e2e/artifacts/screenshots/zh-CN/`，不提交到 Git。

中文来源调查与实现（2026-10-21）：[MC百科模组](https://www.mcmod.cn/modlist.html)、[整合包检索](https://www.mcmod.cn/modpack.html) 和 [MCBBS 2nd](https://www.mcbbs.app/resources/) 通过公开 HTML 目录导入，并非官方聚合 API。MC百科无关键词时使用站点版本/加载器筛选及原生翻页；关键词使用站内搜索，启用版本/加载器时以两路并发读取当前结果页详情，核验同一加载器下的游戏版本。不伪造全站筛选总数，空页仍可翻页继续搜索。MCBBS 读取公开模组与整合包分类（每类最多 5 页，截断有提示），搜索与筛选作用于已读取目录，版本/加载器按标题、简介、分类明确文字匹配；不推断版本区间。保留来源页面顺序；未提供的下载量排序、国际站专属分类不会冒充支持。请求有 15 秒超时、取消旧搜索和 10 分钟内存缓存，手动刷新清缓存。只提取文本及白名单 HTTPS 地址，不运行来源脚本，抓取失败提供重试及原站跳转。[MCIM 新仓库](https://github.com/mcmod-info-mirror/mcim-rust-api) 已公告 API 暂停、文件下载暂不提供，因此没有接为下载后端。BMCLAPI 原有游戏本体/加载器镜像设置继续保留。

本地验证没有使用真实 Microsoft 凭据登录，没有启动真实游戏，也没有把隔离测试中的演示实例当成真实已安装游戏。外部 XMCL 更新服务在验证期间返回过 500，项目映射数据库也出现过网络超时；这些不是 UI 路由被移除。

## 保持同步

UI 设计说明见 `design.md`，CSS 变量见根目录 `tokens.css`。主要改动在 `xmcl-keystone-ui/src/assets/moss.css`、Moss 品牌/首页组件、默认主题和原有侧栏组件。

原项目功能和许可说明继续见 `README.md`、`LICENSE`、`CONTRIBUTING.md`、`AGENTS.md`。MOSS X 发行包使用本仓库的手动更新入口，主进程拒绝原版 XMCL 的自动下载/安装更新，防止覆盖界面改造。二次开发请通过 Git 拉取和重新构建，或安装本仓库的新发行包。
