<h1 align="center">Promptreel</h1>

<p align="center">Turn an idea or a pile of material into an explainer video with an AI director.</p>

<p align="center">
  <b>English</b> · <a href="README.zh-CN.md">简体中文</a>
</p>

Promptreel is a local-first studio for explainer videos. Give it a sentence, a document, a PDF, a slide deck or a folder of notes. A director agent plans a storyboard for you to approve, writes and voices the narration, draws every page, checks its own work, and renders a 1080p MP4 with subtitles. You can also edit the finished pages by hand.

Everything runs on your machine: your material, API keys and projects stay local. It works with Anthropic, OpenAI, Google, DeepSeek, OpenRouter and other providers, or any OpenAI- or Anthropic-compatible endpoint.

> Promptreel is a fork of [Frametell](https://github.com/sitor-ai/frametell), licensed under AGPL-3.0. See [License](#license).

## What you need

| Requirement | Notes |
|---|---|
| **Node.js 22.19 or later** | Node 22 LTS is the safest choice. |
| **pnpm 10.5.2** | The repo pins it through `packageManager`; `corepack enable` is the simplest install. |
| **Chrome, Edge, Chromium or Brave** | Used to draw pages and render the film. Edge is preinstalled on Windows. |
| **Git** | Used for each project's version history and undo. |
| **FFmpeg** | Bundled through `ffmpeg-static`; you do not need a separate install. |
| **A model API key** | Anthropic, OpenAI, Google, DeepSeek, OpenRouter, Volcengine Ark, or a compatible endpoint. |
| **A TTS key (optional)** | Volcengine TTS (Chinese) or ElevenLabs. Without one the film can still be made without narration. |

## Platform support

| Platform | Browser studio from source | Desktop app |
|---|---|---|
| macOS (Apple Silicon and Intel) | Yes | Yes, built from source (macOS only) |
| Windows 10/11 (x64) | Yes | No installer; use the browser studio from source |
| Linux (x64) | Yes | No installer; use the browser studio from source |

The Windows and macOS source builds are covered by the CI workflow (`Build, typecheck and test`) on tags and manual runs; Linux runs on every push. If you hit a Windows-specific problem, please open an issue with the command and the full error.

The 3D styles (3D Micro World, 3D Miniature City, Globe, Cosmos) draw with WebGL. Use a recent Chrome or Edge with a working GPU: on a machine or CI runner without one they fall back to software rendering and can be very slow.

## Quick start

### macOS / Linux

```bash
git clone https://github.com/Gap-L/promptreel.git
cd promptreel

corepack enable
pnpm install
pnpm build

node apps/cli/dist/cli.js serve
```

The first `pnpm install` downloads Electron, FFmpeg and fonts, so it can take a few minutes. The studio then opens at `http://127.0.0.1:5317/?token=…`. Keep the terminal open while you use it.

If the browser does not open, copy the URL printed by the command, or start without opening a browser and visit the printed URL yourself:

```bash
node apps/cli/dist/cli.js serve --no-open
```

To use another port:

```bash
node apps/cli/dist/cli.js serve --port 5320
```

### Windows (PowerShell)

```powershell
git clone https://github.com/Gap-L/promptreel.git
cd promptreel

corepack enable
pnpm install
pnpm build

node .\apps\cli\dist\cli.js serve
```

If `corepack enable` asks for administrator rights, open PowerShell as Administrator once, or install pnpm directly:

```powershell
npm install -g pnpm@10.5.2
```

Then run `pnpm install`, `pnpm build` and `node .\apps\cli\dist\cli.js serve` again.

**Windows notes**

- Use a normal local folder such as `C:\Users\<you>\promptreel`. OneDrive, network shares and some antivirus tools can interfere with the junctions Promptreel creates inside each project.
- Chrome or Edge must be installed. Edge is enough and is usually preinstalled. If Promptreel cannot find it, set the path explicitly:
  ```powershell
  $env:CHROME_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  ```
- The Windows shell used by the agent is `cmd.exe`, not bash. Promptreel's file tools and its `node engine/tools/…` commands work there. The macOS/Linux process sandbox is not available on Windows; run films from trusted material and projects.
- There is no Windows desktop installer yet. Use the browser studio from source.
- `ffmpeg-static` ships a Windows x64 binary. On Windows on ARM, install an x64 FFmpeg and point `FFMPEG_PATH` at `ffmpeg.exe`.

### First run

1. Open the studio URL in your browser.
2. Go to **Settings → Model providers**, add a key for one provider and pick a default model.
3. Optional: add a **Volcengine TTS** or **ElevenLabs** key under **Settings → Voices**. You can also choose “No voice”.
4. On the home screen, type what the film should explain (or attach material), pick a length (10–15 seconds, 1, 2, 5 or 10 minutes), a style, language, subtitles and voice.
5. Start the film. The director writes a storyboard first; approve it or say what to change. Then it writes the narration, voices it, draws every page and renders the MP4.
6. Export the finished film from the workbench. Projects also keep their own `out/` folder.

## Use from the command line

The CLI runs the whole pipeline without the panel. API keys come from the environment.

### macOS / Linux

```bash
export ANTHROPIC_API_KEY=...          # or OPENAI_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY, …
export VOLCENGINE_TTS_API_KEY=...     # optional; ELEVENLABS_API_KEY also works

node apps/cli/dist/cli.js run notes.pdf --style warm-story --duration 60 --lang en
```

### Windows PowerShell

```powershell
$env:ANTHROPIC_API_KEY = "..."
$env:VOLCENGINE_TTS_API_KEY = "..."    # optional

node .\apps\cli\dist\cli.js run .\notes.pdf --style warm-story --duration 60 --lang en
```

Useful flags:

| Flag | Meaning |
|---|---|
| `--duration 15` | A 10–15 second film. `60`, `120`, `300`, `600` are the other lengths. |
| `--style warm-story` | A built-in style id or an installed style pack id (for example `molecule`, `diorama`, `chalkboard`). |
| `--lang zh` / `--lang en` | The film's language. |
| `--model provider/model` | The model to use, for example `anthropic/claude-opus-5-5`. |
| `--out <dir>` | Where to create the project. |

The CLI writes projects under `~/.promptreel/projects` by default and prints the final film path.

## Where things live

| What | macOS / Linux | Windows |
|---|---|---|
| Data directory | `~/.promptreel` | `%USERPROFILE%\.promptreel` |
| Settings | `~/.promptreel/config.json` | `%USERPROFILE%\.promptreel\config.json` |
| Projects | `~/.promptreel/projects/<id>` | `%USERPROFILE%\.promptreel\projects\<id>` |
| Film exports | `<project>/out/` | `<project>\out\` |

Set `PROMPTREEL_HOME` to keep the data somewhere else:

```bash
PROMPTREEL_HOME=/path/to/promptreel-data node apps/cli/dist/cli.js serve
```

```powershell
$env:PROMPTREEL_HOME = "D:\promptreel-data"
node .\apps\cli\dist\cli.js serve
```

## Environment variables

| Variable | Purpose |
|---|---|
| `PROMPTREEL_HOME` | Data directory (projects, config). |
| `CHROME_PATH` | A Chromium-based browser to use instead of auto-detection. |
| `FFMPEG_PATH` | An FFmpeg binary to use instead of the bundled one. |
| `PORT` | The studio port (default `5317`). |
| `NO_OPEN=1` | Do not open a browser when the studio starts. |
| `PROMPTREEL_SANDBOX_REQUIRED=1` | Refuse to run agent shell commands without a sandbox. Linux/macOS only. |
| `PROMPTREEL_SANDBOX_NONET=1` | Remove network access from agent shell commands. Linux/macOS only. |
| `ELECTRON_MIRROR` | Optional Electron download mirror when installing in mainland China. |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, `AI_GATEWAY_API_KEY`, `VOLCENGINE_ARK_API_KEY` | Model provider keys for the CLI. |
| `VOLCENGINE_TTS_API_KEY`, `ELEVENLABS_API_KEY` | Narration keys for the CLI. |

## Desktop app (macOS only)

The desktop app is an Electron shell around the same studio. It is built on macOS; there is no Windows or Linux installer in this repository.

```bash
corepack enable
pnpm install
pnpm build
pnpm package:desktop
```

The build writes `apps/desktop/release/Promptreel-<version>-<arch>.dmg` (or `.app` with `pnpm package:desktop --dir`). Packaging needs macOS and Chrome/Chromium; signing and notarization are optional and are configured in `apps/desktop/scripts/package.mjs`.

## Troubleshooting

**`pnpm: command not found`**  
Run `corepack enable`, or install pnpm: `npm install -g pnpm@10.5.2`.

**Node version errors**  
Check `node -v`. Promptreel needs Node 22.19 or later; Node 22 LTS is recommended.

**“Chrome / Edge not found”**  
Install Google Chrome, Microsoft Edge, Chromium or Brave. If it is installed in a non-standard place, set `CHROME_PATH` (macOS/Linux) or `$env:CHROME_PATH` (Windows).

**FFmpeg does not run**  
Reinstall dependencies with `pnpm install --force`, or set `FFMPEG_PATH` to a working FFmpeg binary. On Windows on ARM, use an x64 FFmpeg.

**The studio says the link is required / the panel is locked**  
Use the complete URL printed by `serve`, including `?token=…`.

**Port 5317 is already in use**  
Start with another port: `node apps/cli/dist/cli.js serve --port 5320`.

**A project will not start**  
Open **Settings → This computer** and check Chrome, FFmpeg, Git and Node. Then check the provider key and the selected model in **Settings → Model providers**.

**Windows: junction / symlink errors**  
Move the checkout to a normal local NTFS folder such as `C:\Users\<you>\promptreel`, outside OneDrive and network drives.

**Windows: the agent's shell command fails**  
The Windows shell is `cmd.exe`. Prefer the built-in file tools, and run the engine's `node engine/tools/…` commands directly. If a workflow needs POSIX shell features, run Promptreel in WSL2 or on Linux/macOS.

**Reset the app**  
Stop the studio, back up `~/.promptreel` (or `%USERPROFILE%\.promptreel`) if you need the projects, then delete it. Promptreel creates a fresh config on the next start.

## Development

```bash
pnpm install
pnpm build        # every package, including the panel and the CLI
pnpm typecheck    # TypeScript, no emit
pnpm test         # engine and package tests
```

Layout:

- `apps/cli` — the browser studio server and the headless `run` command.
- `apps/desktop` — the macOS Electron shell and packaging.
- `packages/core` — projects, settings, runs and events.
- `packages/agent` — the director: storyboard, narration, pages, review.
- `packages/engine` — the page runtime, styles, render and check tools.
- `packages/ui` — the React panel.
- `packages/models`, `packages/voice` — model catalog and narration providers.

## License

Promptreel is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). You may use, modify and run it, including commercially. If you offer a modified version to others over a network, you must make the modified source available under the same license. For a commercial license without these obligations, contact the original project's maintainers as described in the license and third-party notices.

Promptreel is derived from Frametell, © Sitor AI. Third-party components and style notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and in each style's `NOTICE.md`.
