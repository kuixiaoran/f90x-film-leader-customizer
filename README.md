# F90X Film Leader Customizer

[English](#english) · [中文](#中文) · [日本語](#日本語)

---

## English

Desktop app for adjusting **F90X** film leader (rewind) length by writing EEPROM address **0x169** over serial (DEC 6–31, approx. 55 mm–5 mm).

### Tech stack

| Layer | Stack |
|-------|-------|
| Desktop | [Wails v3](https://v3alpha.wails.io) |
| Frontend | React 19, TypeScript, Vite 6 |
| Animation | [Motion](https://motion.dev) |
| State | Zustand 5 |
| Backend | Go 1.25, serial EEPROM protocol |

### Requirements

- Windows x64
- Go 1.25+
- [Node.js 20+](https://nodejs.org/)
- [Wails v3 CLI](https://v3alpha.wails.io)

Install Wails v3 CLI:

```powershell
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-alpha.79
```

### Development

**Frontend only (mock API, no serial port)**

```powershell
npm run dev
```

Open `http://localhost:5173/` in a browser.

**Wails window (Go backend)**

```powershell
.\dev-wails.ps1
```

**Clean rsrc conflicts**

```powershell
.\clean-rsrc.ps1
```

### Build

```powershell
.\build-wails.ps1
```

Output: `bin\f90x-film-leader-customizer.exe`

App icons: `build/appicon.png`, `build/windows/icon.ico`

### Features

- **Dump** — read 512-byte EEPROM image
- **MODIFY** — write leader length at **0x169** and update checksum
- **Advanced** — HxD image, checksum, re-dump, write **0x017F** only
- **Logs** — Chinese / English / Japanese

| DEC | Leader length |
|-----|---------------|
| **6** | **55 mm** (longest) |
| **31** | **5 mm** (shortest) |

### Project layout

```
├── main.go
├── studio_service.go
├── internal/           # Go protocol & business logic
├── frontend/
│   ├── src/assets/ui/  # runtime UI assets
│   └── bindings/       # Wails bindings
└── build/              # Wails config & icons
```

### Tests

```powershell
go test ./internal/...
```

### Releases

1. Bump `version` in `build/config.yml` if needed (currently `1.0.0`).
2. Build a production binary:

   ```powershell
   .\build-wails.ps1
   ```

3. On GitHub, open **Releases** → **Draft a new release**.
4. Create a tag such as `v1.0.0` (match the config version).
5. Set the release title (e.g. `v1.0.0`) and add release notes.
6. Upload `bin\f90x-film-leader-customizer.exe` as a release asset.
7. Click **Publish release**.

**Command line (optional)**

```powershell
git tag v1.0.0
git push origin v1.0.0
```

Then create the release on GitHub and attach the `.exe`, or use [GitHub CLI](https://cli.github.com/):

```powershell
gh release create v1.0.0 bin\f90x-film-leader-customizer.exe --title "v1.0.0" --notes "Initial release"
```

---

## 中文

通过串口写入 EEPROM **0x169**，调整 **F90X** 胶片回卷（留片头）长度的桌面工具（DEC 6–31，约 55 mm–5 mm）。

### 技术栈

| 层 | 技术 |
|----|------|
| 桌面壳 | [Wails v3](https://v3alpha.wails.io) |
| 前端 | React 19、TypeScript、Vite 6 |
| 动画 | [Motion](https://motion.dev) |
| 状态 | Zustand 5 |
| 后端 | Go 1.25、串口 EEPROM 协议 |

### 要求

- Windows x64
- Go 1.25+
- [Node.js 20+](https://nodejs.org/)
- [Wails v3 CLI](https://v3alpha.wails.io)

安装 Wails v3 CLI：

```powershell
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-alpha.79
```

### 开发

**纯前端（Mock API，无需串口）**

```powershell
npm run dev
```

浏览器打开 `http://localhost:5173/`。

**Wails 窗口（Go 后端）**

```powershell
.\dev-wails.ps1
```

**清理 rsrc 冲突**

```powershell
.\clean-rsrc.ps1
```

### 构建

```powershell
.\build-wails.ps1
```

产物：`bin\f90x-film-leader-customizer.exe`

应用图标：`build/appicon.png`、`build/windows/icon.ico`

### 功能

- **Dump**：读取 512B EEPROM 镜像
- **MODIFY**：写入 **0x169** 留片头并更新校验和
- **高级**：HxD 镜像、校验和、再次 Dump、仅写 0x017F
- **日志**：中 / EN / JP

| DEC | 留片头 |
|-----|--------|
| **6** | **55 mm**（最长） |
| **31** | **5 mm**（最短） |

### 目录

```
├── main.go
├── studio_service.go
├── internal/           # Go 协议与业务
├── frontend/
│   ├── src/assets/ui/  # 运行时 UI 素材
│   └── bindings/       # Wails 绑定
└── build/              # Wails 配置与图标
```

### 测试

```powershell
go test ./internal/...
```

### 发布 Releases

1. 如需新版本，修改 `build/config.yml` 中的 `version`（当前为 `1.0.0`）。
2. 构建正式版：

   ```powershell
   .\build-wails.ps1
   ```

3. 在 GitHub 仓库打开 **Releases** → **Draft a new release**。
4. 创建标签，例如 `v1.0.0`（与 config 版本一致）。
5. 填写发布标题（如 `v1.0.0`）和更新说明。
6. 将 `bin\f90x-film-leader-customizer.exe` 上传为附件。
7. 点击 **Publish release** 发布。

**命令行（可选）**

```powershell
git tag v1.0.0
git push origin v1.0.0
```

然后在 GitHub 上创建 Release 并上传 `.exe`，或使用 [GitHub CLI](https://cli.github.com/)：

```powershell
gh release create v1.0.0 bin\f90x-film-leader-customizer.exe --title "v1.0.0" --notes "Initial release"
```

---

## 日本語

シリアル経由で EEPROM アドレス **0x169** に書き込み、**F90X** のフィルムリーダー（巻き戻し余長）を調整するデスクトップアプリ（DEC 6–31、約 55 mm–5 mm）。

### 技術スタック

| 層 | 技術 |
|----|------|
| デスクトップ | [Wails v3](https://v3alpha.wails.io) |
| フロントエンド | React 19、TypeScript、Vite 6 |
| アニメーション | [Motion](https://motion.dev) |
| 状態管理 | Zustand 5 |
| バックエンド | Go 1.25、シリアル EEPROM プロトコル |

### 必要条件

- Windows x64
- Go 1.25+
- [Node.js 20+](https://nodejs.org/)
- [Wails v3 CLI](https://v3alpha.wails.io)

Wails v3 CLI のインストール：

```powershell
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-alpha.79
```

### 開発

**フロントエンドのみ（モック API、シリアル不要）**

```powershell
npm run dev
```

ブラウザで `http://localhost:5173/` を開く。

**Wails ウィンドウ（Go バックエンド）**

```powershell
.\dev-wails.ps1
```

**rsrc 競合のクリーンアップ**

```powershell
.\clean-rsrc.ps1
```

### ビルド

```powershell
.\build-wails.ps1
```

出力：`bin\f90x-film-leader-customizer.exe`

アプリアイコン：`build/appicon.png`、`build/windows/icon.ico`

### 機能

- **Dump** — 512 バイト EEPROM イメージを読み取り
- **MODIFY** — **0x169** にリーダー長を書き込み、チェックサムを更新
- **高度** — HxD イメージ、チェックサム、再 Dump、**0x017F** のみ書き込み
- **ログ** — 中国語 / 英語 / 日本語

| DEC | リーダー長 |
|-----|-----------|
| **6** | **55 mm**（最長） |
| **31** | **5 mm**（最短） |

### ディレクトリ構成

```
├── main.go
├── studio_service.go
├── internal/           # Go プロトコルとビジネスロジック
├── frontend/
│   ├── src/assets/ui/  # 実行時 UI アセット
│   └── bindings/       # Wails バインディング
└── build/              # Wails 設定とアイコン
```

### テスト

```powershell
go test ./internal/...
```

### Releases の公開

1. 必要に応じて `build/config.yml` の `version` を更新（現在 `1.0.0`）。
2. 本番ビルドを実行：

   ```powershell
   .\build-wails.ps1
   ```

3. GitHub リポジトリで **Releases** → **Draft a new release** を開く。
4. `v1.0.0` などのタグを作成（config のバージョンと一致させる）。
5. リリースタイトル（例：`v1.0.0`）とリリースノートを記入。
6. `bin\f90x-film-leader-customizer.exe` をアセットとしてアップロード。
7. **Publish release** をクリックして公開。

**コマンドライン（任意）**

```powershell
git tag v1.0.0
git push origin v1.0.0
```

その後 GitHub で Release を作成して `.exe` を添付するか、[GitHub CLI](https://cli.github.com/) を使用：

```powershell
gh release create v1.0.0 bin\f90x-film-leader-customizer.exe --title "v1.0.0" --notes "Initial release"
```
