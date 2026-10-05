# 小螃蟹剪辑国庆

项目仓库：[ssamj/CrabClipVideo](https://github.com/ssamj/CrabClipVideo)

用纯 JavaScript 和 Canvas 2D 制作的手绘动画：国庆照片涌入工作台，小螃蟹整理素材、制作转场，最后因一张清蒸螃蟹照片触发“当前剪辑额度不足”。

当前为 **46.6 秒精简版**，1920 × 1080、60 fps。共 24 张手绘素材；最终相册精选 16 张，常规画面半秒一拍，包含海边和“国庆快乐”。

![工作台画面](docs/cover.jpg)

## 本地直接查看

- 打开 `scene.html` 查看无声 Canvas 动画，点击画面暂停或继续。
- 打开 `预览.html` 播放带配音和音乐的成片。本次复制的目录附带 `out/小螃蟹剪国庆相册_精简版.mp4`。
- `out/` 不进入 Git；从 GitHub 克隆后，需要先执行下方导出命令才能播放成片。

如果浏览器限制本地字体加载，在项目目录执行 `python -m http.server 8000`，再打开 `http://localhost:8000/scene.html`。

## 文件结构

| 文件或目录 | 用途 |
| --- | --- |
| `scene.js` | 剧情、镜头、动作、转场、16 张照片的选择和时间轴 |
| `lib.js` | 小螃蟹造型、绘图及动画辅助函数 |
| `photos.js`、`photos-extra.js` | 24 张照片的 Canvas 手绘源码 |
| `dialogue.js`、`timeline.json` | 对白文本及实测音频时间 |
| `script.json` | 视频规格与音乐混音配置 |
| `audio/` | 配音 WAV、缓存 MP3 及语音边界数据 |
| `fonts/` | 原项目使用的三套字体 |
| `music/` | 配乐源音频、当前音乐轨及剪接记录 |
| `tools/` | 导出照片、帧渲染、配音、混音与校验脚本 |
| `docs/` | GitHub 页面使用的封面、抽帧与照片总览 |
| `asset-manifest.json` | 本次复制保留素材的 SHA-256 校验值 |
| `out/`、`preview/`、`photos/` | 可重新生成的输出，已被 Git 忽略 |

## 安装工具

需要 Node.js 20 或更新版本、Python 3.12 或更新版本、FFmpeg（`ffmpeg` 和 `ffprobe` 均需加入 PATH）。

在项目目录执行：

```powershell
npm install
npx playwright install chromium
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

下方 Python 命令使用 Windows 虚拟环境。macOS / Linux 将 `.\.venv\Scripts\python.exe` 换成 `.venv/bin/python`。

## 导出视频

从已经随项目保存的配音和音乐开始，无需重新请求语音服务：

```powershell
# 1. 导出手绘照片，可用于检查素材
npm run photos

# 2. 导出关键画面
npm run preview

# 3. 渲染 46.6 秒无声视频；可改为 --workers 2 降低并发
npm run render

# 4. 混合配音、音效和音乐，生成最终 MP4
.\.venv\Scripts\python.exe tools/mix.py

# 5. 检查音视频解码、帧数、对白时间、素材校验值和卡点
.\.venv\Scripts\python.exe tools/verify.py
```

成片输出为 `out/小螃蟹剪国庆相册_精简版.mp4`；检查报告为 `out/成片检查.json`。

渲染默认使用 npm 安装的 Playwright 及其 Chromium。也可设置 `CHROME_PATH` 指定已有 Chrome，设置 `PLAYWRIGHT_MODULE` 指定其他 Playwright 模块位置。项目没有写死本机用户名或 Codex 安装目录。

## 修改与重新生成

- 调整最终照片数量、选择或切点：修改 `scene.js` 的 `MONTAGE`，并同步片长、对白、配乐和校验条件。
- 调整对白：修改 `tools/voices.py` 的 `LINES`。脚本优先复用 `audio/` 内同 ID 的 MP3；修改文本后，请先备份并移走对应缓存 MP3，再运行脚本生成新语音。
- 重新构建对白 WAV、字幕与时间轴：`.\.venv\Scripts\python.exe tools/voices.py`。只有 MP3 缓存缺失时才会联网调用 Edge TTS。
- 重建音乐：`.\.venv\Scripts\python.exe tools/music.py`。
- 导出照片总览：先执行 `npm run photos`，再运行 `.\.venv\Scripts\python.exe tools/catalog.py`。

`asset-manifest.json` 固定的是本次复制版本的素材。主动修改字体、绘图或音频后，校验失败提示需要核对并更新清单；不影响渲染。

## 上传 GitHub

当前目录已准备 `.gitignore`。源码、字体、音频和文档进入版本管理；本地虚拟环境、依赖、历史版本、生成的 PNG、MP4 和渲染中间文件被排除。

在此目录执行以下命令建立本地仓库，然后使用 GitHub Desktop 发布，或按 GitHub 新建仓库页面给出的命令配置远程地址并推送：

```powershell
git init
git add .
git commit -m "Initial commit: crab National Day video"
```

## 素材说明

小螃蟹绘图函数、工作台风格、字体和配乐沿用原项目“小螃蟹修 bug”；国庆照片绘图、剧情和转场保存在本仓库中。本副本保留实际使用的素材，不额外指定开源许可证。

![成片抽帧](docs/contact-sheet.jpg)

![手绘照片总览](docs/photos.jpg)
