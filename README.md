# F90X/N90s Film Leader Customizer

[English](#english) · [中文](#中文) · [日本語](#日本語)

Pre-built Windows app: [Releases](https://github.com/kuixiaoran/f90x-film-leader-customizer/releases)

---

## English

**F90X/N90s Film Leader Customizer** is a Windows desktop tool that adjusts how much film is left outside the canister after rewind (film leader length) on the Nikon **F90X / N90s** (same camera, regional names). It writes EEPROM address **0x169** over a serial link.

**What it does**

- Read a 512-byte EEPROM dump for backup
- Set leader length (**DEC 6–31**, about **55 mm–5 mm**)
- UI and logs: Chinese / English / Japanese

**Before you start**

- This **modifies camera EEPROM**. Use at your own risk.
- **Dump first** and keep the file as a backup.
- Connect only when the camera is ready; do not open the same COM port in other software while this app is connected.
- Requires a working **F90X / N90s** serial/EEPROM link (correct cable, adapter, and port).

**Serial adapter (especially CH340)**

If you use a USB–serial module, **turn off the Windows FIFO receive/transmit buffers** for that COM port. Buffered UART data can break the camera protocol timing.

1. **Device Manager** → **Ports (COM & LPT)** → your adapter (e.g. **USB-SERIAL CH340**)
2. **Properties** → **Port Settings** → **Advanced**
3. Set **Receive Buffer** and **Transmit Buffer** to the **minimum**, or disable **Use FIFO buffers** if shown
4. Click **OK**, then reconnect the port in the app

---

## 中文

**F90X/N90s 胶片回卷长度定制工具**，用于调整尼康 **F90X / N90s**（同一机型，不同地区命名）倒片后留在片盒外的胶片长度（留片头）。通过串口写入 EEPROM 地址 **0x169**。

**能做什么**

- 读取 512 字节 EEPROM 镜像，便于备份
- 设置留片头长度（**DEC 6–31**，约 **55 mm–5 mm**）
- 界面与日志支持中文 / 英文 / 日文

**注意事项**

- 本工具会**修改相机 EEPROM**，请自行承担风险。
- 操作前请先 **Dump** 并保存备份文件。
- 请在相机状态正常时连接；软件运行期间**不要用其他程序占用同一串口**。
- 需确保 **F90X / N90s** 串口/EEPROM 连接正常（线缆、转接模块、端口均正确）。

**串口模块（尤其 CH340）**

使用 USB 转串口模块时，请在 Windows 中**关闭该 COM 口的 FIFO 收发缓冲区**。缓冲区可能打乱与机身通信的时序，导致读写失败。

1. 打开 **设备管理器** → **端口 (COM 和 LPT)** → 对应设备（如 **USB-SERIAL CH340**）
2. **属性** → **端口设置** → **高级**
3. 将 **接收缓冲区**、**发送缓冲区** 调到**最小**，如有 **使用 FIFO 缓冲区** 选项则**取消勾选**
4. 确认后，在软件中重新选择并连接该串口

---

## 日本語

**F90X/N90s フィルムリーダー調整ツール**は、Nikon **F90X / N90s**（同一機種、地域による名称差）の巻き戻し後にカートリッジ外へ出すフィルム余長（リーダー長）を変更する Windows 用アプリです。シリアル経由で EEPROM アドレス **0x169** に書き込みます。

**できること**

- 512 バイト EEPROM ダンプの読み取り（バックアップ用）
- リーダー長の設定（**DEC 6–31**、約 **55 mm–5 mm**）
- UI とログ：中国語 / 英語 / 日本語

**注意事項**

- カメラの **EEPROM を変更**します。自己責任でご利用ください。
- 作業前に必ず **Dump** してバックアップを保存してください。
- カメラの状態が整ってから接続し、本アプリ使用中は**同じ COM ポートを他のソフトで開かない**でください。
- **F90X / N90s** のシリアル/EEPROM 接続（ケーブル、アダプタ、ポート）が正常である必要があります。

**シリアルアダプタ（特に CH340）**

USB シリアルモジュールを使う場合、その COM ポートの **Windows FIFO 送受信バッファを無効化または最小化**してください。バッファによりボディとの通信タイミングが崩れ、読み書きに失敗することがあります。

1. **デバイス マネージャー** → **ポート (COM と LPT)** → 該当デバイス（例：**USB-SERIAL CH340**）
2. **プロパティ** → **ポートの設定** → **詳細設定**
3. **受信バッファ**・**送信バッファ**を**最小**にするか、**FIFO バッファを使用する**があれば**オフ**
4. 設定後、アプリでポートを選び直して再接続してください
