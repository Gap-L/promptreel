<h1 align="center">Promptreel</h1>

<p align="center">把一个想法或一堆资料，交给 AI 导演，做成一条讲解视频。</p>

<p align="center">
  <a href="README.md">English</a> · <b>简体中文</b>
</p>

Promptreel 是一个本地运行的讲解视频工作室。给它一句话、一份文档、PDF、PPT 或一个笔记文件夹，导演 Agent 会先写分镜给你确认，再写口播、配音、逐页作画并自检，最后渲染成 1080p MP4，带字幕。做好的页面也可以手动修改。

所有东西都在你自己的电脑上运行：资料、API Key 和项目都留在本地。支持 Anthropic、OpenAI、Google、DeepSeek、OpenRouter 等服务，也可以接任意 OpenAI / Anthropic 兼容接口。

> Promptreel 是 [Frametell](https://github.com/sitor-ai/frametell) 的复刻分支，使用 AGPL-3.0 许可。详见[许可证](#许可证)。

## 运行需要什么

| 依赖 | 说明 |
|---|---|
| **Node.js 22.19 或更新** | 推荐 Node 22 LTS。 |
| **pnpm 10.5.2** | 仓库通过 `packageManager` 固定版本；用 `corepack enable` 最省事。 |
| **Chrome、Edge、Chromium 或 Brave** | 用来画页面和渲染视频。Windows 通常自带 Edge。 |
| **Git** | 用来保存每个项目的版本历史和撤销。 |
| **FFmpeg** | 已通过 `ffmpeg-static` 内置，不需要另外安装。 |
| **模型 API Key** | Anthropic、OpenAI、Google、DeepSeek、OpenRouter、火山方舟，或兼容接口。 |
| **TTS Key（可选）** | 火山引擎 TTS（中文）或 ElevenLabs；没有 Key 也可以做无配音视频。 |

## 平台支持

| 平台 | 从源码启动网页版 | 桌面应用 |
|---|---|---|
| macOS（Apple 芯片 / Intel） | 支持 | 支持，仅限 macOS 自行打包 |
| Windows 10/11（x64） | 支持 | 暂无安装包，使用源码启动网页版 |
| Linux（x64） | 支持 | 暂无安装包，使用源码启动网页版 |

CI 工作流会在打 tag 或手动运行时，在 Linux、macOS、Windows 三套环境执行构建和测试；Linux 每次 push 都会跑。Windows 遇到问题，请带上命令和完整报错提 Issue。

3D 风格（3D 微观世界、3D 微缩城市、3D 地球、3D 宇宙）用 WebGL 绘制。请使用较新的 Chrome 或 Edge，并确保 GPU 可用；在没有 GPU 的机器或 CI runner 上会退回软件渲染，可能非常慢。

## 快速开始

### macOS / Linux

```bash
git clone https://github.com/Gap-L/promptreel.git
cd promptreel

corepack enable
pnpm install
pnpm build

node apps/cli/dist/cli.js serve
```

第一次 `pnpm install` 会下载 Electron、FFmpeg 和字体，可能要几分钟。启动后会自动打开 `http://127.0.0.1:5317/?token=…` 的工作室。终端不要关，关掉服务就停了。

如果没有自动打开浏览器，复制终端打印的完整 URL 访问；也可以不自动打开：

```bash
node apps/cli/dist/cli.js serve --no-open
```

换端口：

```bash
node apps/cli/dist/cli.js serve --port 5320
```

### Windows（PowerShell）

```powershell
git clone https://github.com/Gap-L/promptreel.git
cd promptreel

corepack enable
pnpm install
pnpm build

node .\apps\cli\dist\cli.js serve
```

如果 `corepack enable` 提示需要管理员权限，先以管理员身份打开 PowerShell 执行一次，或者直接安装 pnpm：

```powershell
npm install -g pnpm@10.5.2
```

然后重新执行 `pnpm install`、`pnpm build` 和 `node .\apps\cli\dist\cli.js serve`。

**Windows 注意事项**

- 建议放在普通本地目录，例如 `C:\Users\<你>\promptreel`。OneDrive、网络盘和部分杀毒软件可能干扰 Promptreel 在项目里创建的 junction 链接。
- 必须安装 Chrome 或 Edge。Windows 通常自带 Edge，够用。如果程序找不到浏览器，手动指定：
  ```powershell
  $env:CHROME_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  ```
- Windows 上 Agent 的 shell 是 `cmd.exe`，不是 bash。内置文件工具和 `node engine/tools/…` 命令可以正常用；macOS/Linux 的进程沙箱在 Windows 上不可用，请只使用可信资料和项目。
- 目前没有 Windows 桌面安装包，请使用源码启动网页版。
- `ffmpeg-static` 自带 Windows x64 的 FFmpeg。Windows on ARM 请安装 x64 版 FFmpeg，并用 `FFMPEG_PATH` 指向 `ffmpeg.exe`。

### 第一次使用

1. 在浏览器打开启动时打印的完整 URL（含 `?token=…`）。
2. 进入 **设置 → 模型服务**，添加一个模型服务商的 Key，并选好默认模型。
3. 可选：在 **设置 → 配音** 里添加火山引擎 TTS 或 ElevenLabs 的 Key；也可以选「无配音」。
4. 在首页输入要讲什么（或附上资料），选择时长（10–15 秒、1、2、5、10 分钟）、风格、语言、字幕和配音。
5. 开始制作。导演会先出分镜，你确认或提出修改；之后它写口播、配音、逐页作画并渲染 MP4。
6. 在工作台导出成片。项目自己的 `out/` 目录里也会保留一份。

## 命令行用法

命令行会跑完整条制作流程，不需要打开面板。API Key 从环境变量读取。

### macOS / Linux

```bash
export ANTHROPIC_API_KEY=...          # 也可以换成 OPENAI_API_KEY、GEMINI_API_KEY、DEEPSEEK_API_KEY 等
export VOLCENGINE_TTS_API_KEY=...     # 可选；也可以用 ELEVENLABS_API_KEY

node apps/cli/dist/cli.js run notes.pdf --style warm-story --duration 60 --lang en
```

### Windows PowerShell

```powershell
$env:ANTHROPIC_API_KEY = "..."
$env:VOLCENGINE_TTS_API_KEY = "..."    # 可选

node .\apps\cli\dist\cli.js run .\notes.pdf --style warm-story --duration 60 --lang en
```

常用参数：

| 参数 | 说明 |
|---|---|
| `--duration 15` | 10–15 秒短片；其他可选值为 `60`、`120`、`300`、`600`。 |
| `--style warm-story` | 内置风格或已安装风格包的 id，例如 `molecule`、`diorama`、`chalkboard`。 |
| `--lang zh` / `--lang en` | 成片语言。 |
| `--model provider/model` | 指定模型，例如 `anthropic/claude-opus-5-5`。 |
| `--out <dir>` | 项目创建到哪个目录。 |

默认项目会写到 `~/.promptreel/projects`，结束时打印成片路径。

## 数据放在哪里

| 内容 | macOS / Linux | Windows |
|---|---|---|
| 数据目录 | `~/.promptreel` | `%USERPROFILE%\.promptreel` |
| 设置 | `~/.promptreel/config.json` | `%USERPROFILE%\.promptreel\config.json` |
| 项目 | `~/.promptreel/projects/<id>` | `%USERPROFILE%\.promptreel\projects\<id>` |
| 成片导出 | `<项目>/out/` | `<项目>\out\` |

可以用 `PROMPTREEL_HOME` 改数据目录：

```bash
PROMPTREEL_HOME=/path/to/promptreel-data node apps/cli/dist/cli.js serve
```

```powershell
$env:PROMPTREEL_HOME = "D:\promptreel-data"
node .\apps\cli\dist\cli.js serve
```

## 环境变量

| 变量 | 用途 |
|---|---|
| `PROMPTREEL_HOME` | 数据目录（项目、配置）。 |
| `CHROME_PATH` | 指定 Chromium 内核浏览器，跳过自动查找。 |
| `FFMPEG_PATH` | 指定 FFmpeg，替代内置版本。 |
| `PORT` | 工作室端口，默认 `5317`。 |
| `NO_OPEN=1` | 启动时不自动打开浏览器。 |
| `PROMPTREEL_SANDBOX_REQUIRED=1` | 没有沙箱时拒绝执行 Agent shell 命令。仅 Linux/macOS。 |
| `PROMPTREEL_SANDBOX_NONET=1` | 去掉 Agent shell 命令的网络访问。仅 Linux/macOS。 |
| `ELECTRON_MIRROR` | 在国内安装时可选，指定 Electron 下载镜像。 |
| `ANTHROPIC_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`DEEPSEEK_API_KEY`、`OPENROUTER_API_KEY`、`AI_GATEWAY_API_KEY`、`VOLCENGINE_ARK_API_KEY` | 命令行使用的模型 Key。 |
| `VOLCENGINE_TTS_API_KEY`、`ELEVENLABS_API_KEY` | 命令行使用的配音 Key。 |

## 桌面应用（仅 macOS）

桌面版是同一套工作室的 Electron 外壳，目前只在 macOS 上打包；本仓库没有 Windows/Linux 安装包。

```bash
corepack enable
pnpm install
pnpm build
pnpm package:desktop
```

产物在 `apps/desktop/release/Promptreel-<version>-<arch>.dmg`（加 `--dir` 则只生成 `.app`）。打包需要在 macOS 上运行，并需要 Chrome/Chromium；签名和公证是可选步骤，配置在 `apps/desktop/scripts/package.mjs`。

## 常见问题

**提示 `pnpm: command not found`**  
执行 `corepack enable`，或者安装 pnpm：`npm install -g pnpm@10.5.2`。

**Node 版本不对**  
执行 `node -v` 检查。需要 Node 22.19 或更新，推荐 Node 22 LTS。

**提示找不到 Chrome / Edge**  
安装 Google Chrome、Microsoft Edge、Chromium 或 Brave。装在非默认路径时，设置 `CHROME_PATH`（Windows 用 `$env:CHROME_PATH`）。

**内置 FFmpeg 不可用**  
先执行 `pnpm install --force` 重装依赖；仍然不行时，用 `FFMPEG_PATH` 指向一个可用的 FFmpeg。Windows on ARM 请使用 x64 版 FFmpeg。

**页面提示链接无效 / 面板打不开**  
使用 `serve` 打印的完整 URL，必须包含 `?token=…`。

**5317 端口被占用**  
换端口启动：`node apps/cli/dist/cli.js serve --port 5320`。

**项目启动不了**  
到 **设置 → 这台电脑** 检查 Chrome、FFmpeg、Git、Node；再到 **设置 → 模型服务** 检查 Key 和所选模型。

**Windows 报 junction / symlink 错误**  
把代码放到普通本地 NTFS 目录，例如 `C:\Users\<你>\promptreel`，不要放在 OneDrive 或网络盘。

**Windows 上 Agent 的 shell 命令失败**  
Windows 用的是 `cmd.exe`。优先使用内置文件工具，直接运行引擎的 `node engine/tools/…` 命令。如果某个流程确实需要 POSIX shell，请在 WSL2 或 Linux/macOS 上运行。

**想重置应用**  
先停掉工作室，备份 `~/.promptreel`（Windows 为 `%USERPROFILE%\.promptreel`）里的项目，然后删除该目录。下次启动会生成新的配置。

## 开发

```bash
pnpm install
pnpm build        # 构建所有包，包括面板和 CLI
pnpm typecheck    # TypeScript 类型检查
pnpm test         # 引擎与各包测试
```

目录：

- `apps/cli` — 网页版工作室服务端和无界面的 `run` 命令。
- `apps/desktop` — macOS Electron 外壳与打包。
- `packages/core` — 项目、设置、运行与事件。
- `packages/agent` — 导演：分镜、口播、页面、检查。
- `packages/engine` — 页面运行时、风格、渲染与检查工具。
- `packages/ui` — React 面板。
- `packages/models`、`packages/voice` — 模型目录与配音服务。

## 许可证

Promptreel 使用 [GNU Affero 通用公共许可证 v3.0](LICENSE)（AGPL-3.0）开源。你可以自由使用、修改和运行，包括商用。如果你把修改后的版本通过网络提供给其他人使用，需要以同样的许可证公开修改后的源码。需要不带这些义务的商业授权时，请按许可证和第三方声明中的方式联系原项目维护者。

Promptreel 复刻自 Frametell，© Sitor AI。第三方组件和风格包声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 以及各风格目录下的 `NOTICE.md`。
