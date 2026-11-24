# 清页 (Qingye)

NotebookLM 风格：网页 → 净文档来源库 → Studio（简报 / FAQ / 音频概览 / 视频概览）→ 问答。

## 目标平台

| 平台 | 方式 | 产出 |
|------|------|------|
| 🍎 iOS | Capacitor → Xcode | IPA |
| 🤖 Android | Capacitor → Gradle | APK |
| ⌚ 手表 | 触屏 + 窄屏 CSS | 同 APK |
| 💍 智能戒指 | 上下倾切换来源 / 摇一摇转音频 | DeviceOrientation |
| 🦯 智能手杖 | 轻点转视频 / 摆动切换来源 | DeviceMotion |

## Studio

| 能力 | 说明 |
|------|------|
| 音频概览 | 双人对谈脚本；设备 TTS，或云端 OpenAI `tts-1-hd` / ElevenLabs 合成可下载 MP3 |
| 视频概览 | Canvas 幻灯片 + MediaRecorder 导出 WebM/MP4（字幕承载叙述） |
| 简报 / FAQ | 抽取式摘要与问答 |
| 问答 | 基于来源句子的本地检索作答 |

### 云端 TTS

顶部 **TTS 设置**：选择 OpenAI 或 ElevenLabs，填写 API Key（仅存本机）。支持自定义 Base URL（兼容中转）。主持 A/B 使用不同音色。真机走 CapacitorHttp；浏览器直连若遇 CORS 请用 APK 或中转。

## 命令

```bash
npm install
npm test
npm start          # 本地预览 www/ :5191
npm run apk:debug  # Android debug APK
```

浏览器预览若遇 CORS，可用「粘贴 HTML」；真机走 CapacitorHttp 直连抓取。

## Harness / Loop（助手）

- 遵循根 `/Users/skat/AGENTS.md`：**Harness Engineering** + **Loop Engineering**
- Guide = 本文件；Sensor = 下方验证命令；同类失误第二次须沉淀规则或测试（棘轮）
- 开干前写清 **Done**；每切片过验证环；显式停止（成功 / 上限 / 无进展 / 人审）
- 详解：`docs/HARNESS_ENGINEERING.md`、`docs/LOOP_ENGINEERING.md`

## 验证环 / Done

```bash
npm install
npm test          # 若有
npm run build     # 或 build:web
npx cap sync android   # 若有 android/
# 可选：JAVA_HOME=…/openjdk@17 npm run apk:debug
```

**Done 示例**：测试通过（若有）+ web 产物进 `www/`/`dist/` + `cap sync` 无报错。可选穿戴未做可搁置，不纳入强制 Done。
