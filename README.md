# F90X Film Leader Customizer

**F90X 胶片回卷长度定制工具** — Wails v3 桌面应用，通过串口写入 EEPROM **0x169** 调整留片头长度（DEC 6–31，对应约 55 mm–5 mm）。

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面壳 | [Wails v3](https://v3alpha.wails.io) |
| 前端 | React 19、TypeScript、Vite 6 |
| 动画 | [Motion](https://motion.dev) |
| 状态 | Zustand 5 |
| 后端 | Go 1.25、串口 EEPROM 协议 |

## 要求

- Windows x64
- Go 1.25+
- [Node.js 20+](https://nodejs.org/)
- [Wails v3 CLI](https://v3alpha.wails.io)

### 安装 Wails v3（国内网络）

```powershell
.\install-wails.ps1
```

## 开发

### 纯前端（Mock API，无需串口）

```powershell
npm run dev
```

浏览器打开 `http://localhost:5173/`。

### Wails 窗口（Go 后端）

```powershell
.\dev-wails.ps1
```

### 清理 rsrc 冲突

```powershell
.\clean-rsrc.ps1
```

## 发布构建

```powershell
.\build-wails.ps1
```

产物：`bin\f90x-film-leader-customizer.exe`

应用图标已提交在 `build/appicon.png` 与 `build/windows/icon.ico`。

## 功能

- **Dump**：读取 512B EEPROM 镜像
- **MODIFY**：写入 **0x169** 留片头并更新校验和
- **高级**：HxD 镜像、校验和、再次 Dump、仅写 0x017F
- **日志**：中 / EN / JP

| DEC | 留片头 |
|-----|--------|
| **6** | **55 mm**（最长） |
| **31** | **5 mm**（最短） |

## 目录

```
├── main.go
├── studio_service.go
├── internal/           # Go 协议与业务
├── frontend/
│   ├── src/assets/ui/  # 运行时 UI 素材
│   └── bindings/       # Wails 绑定
└── build/              # Wails 配置与图标
```

## 测试

```powershell
go test ./internal/...
```
