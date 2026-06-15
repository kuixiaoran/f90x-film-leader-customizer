export type Locale = "zh" | "en" | "ja";

export const LOCALES: Locale[] = ["zh", "en", "ja"];

export const DEFAULT_LOCALE: Locale = "zh";

const STORAGE_KEY = "f90x-locale-v2";

const messages: Record<string, Record<Locale, string>> = {
  "startup.1": {
    zh: "[i] 1、该软件操作相机EEPROM寄存器，存在一定风险，请务必保存好原始BIN文件。",
    en: "[i] 1. This tool writes camera EEPROM registers. There is risk — always keep the original BIN backup.",
    ja: "[i] 1. 本ツールはカメラ EEPROM レジスタを操作します。リスクがあるため、必ず元の BIN を保存してください。",
  },
  "startup.2": {
    zh: "[i] 2、正常写入完成后相机会闪烁ERR，这是正常现象，一般关闭再开启后可以恢复正常。",
    en: "[i] 2. After a successful write the camera may blink ERR — this is normal; power cycle usually clears it.",
    ja: "[i] 2. 正常書き込み後カメラが ERR 点滅することがあります—正常です。電源 OFF/ON で通常復帰します。",
  },
  "startup.3": {
    zh: "[i] 3、如果写入成功但是校验失败且相机持续ERR，可以选择DUMP后单独写入校验和，若失败可关闭相机电源，等待15s后再次重试。",
    en: "[i] 3. If write succeeds but verify fails and ERR persists: dump again, then write checksum only; if that fails, power off ~15s and retry.",
    ja: "[i] 3. 書き込み成功後も検証失敗で ERR が続く場合：再 Dump 後チェックサムのみ書き込み。失敗時は電源 OFF 15 秒後リトライ。",
  },
  "startup.4": {
    zh: "[i] 4、如果您遇到无法解决的ERR问题，请联系kuixiaoran@hotmail.com",
    en: "[i] 4. If ERR cannot be resolved, contact kuixiaoran@hotmail.com",
    ja: "[i] 4. ERR が解決しない場合：kuixiaoran@hotmail.com",
  },
  "log.ui_preview": {
    zh: "[i] UI 预览模式 — 后端未接入，交互为模拟",
    en: "[i] UI preview mode — backend not connected; interactions are simulated",
    ja: "[i] UI プレビューモード — バックエンド未接続、操作はシミュレーション",
  },
  "log.dump_not_saved": {
    zh: "[*] 未保存 Dump 文件；可稍后在「高级」区查看镜像",
    en: "[*] Dump file not saved; view the mirror later in Advanced",
    ja: "[*] Dump 未保存；後で「詳細」でミラーを確認できます",
  },
  "err.select_com": {
    zh: "请选择串口",
    en: "Please select a COM port",
    ja: "COM ポートを選択してください",
  },
  "err.connect_status": {
    zh: "连接成功但无法读取状态，请重试",
    en: "Connected but status read failed — retry",
    ja: "接続成功しましたが状態取得に失敗—リトライしてください",
  },
  "err.connect_first": {
    zh: "请先连接相机",
    en: "Connect to the camera first",
    ja: "先にカメラに接続してください",
  },
  "err.dump_first": {
    zh: "请先 Dump",
    en: "Dump EEPROM first",
    ja: "先に Dump してください",
  },
  "err.no_port_record": {
    zh: "未记录串口，请从连接页重新连接",
    en: "Port not recorded — reconnect from the connect screen",
    ja: "ポート未記録—接続画面から再接続してください",
  },
  "err.dump_status_stale": {
    zh: "Dump 完成但状态未更新，请重试",
    en: "Dump finished but status not updated — retry",
    ja: "Dump 完了しましたが状態未更新—リトライしてください",
  },
  "err.write_status_stale": {
    zh: "写入完成但状态未更新",
    en: "Write finished but status not updated",
    ja: "書き込み完了しましたが状態未更新",
  },
  "err.write_checksum_verify": {
    zh: "写入后校验和仍未通过，请查看日志或使用「仅写 0x017F」",
    en: "Checksum still invalid after write — check the log or use Write 0x017F only",
    ja: "書き込み後もチェックサム NG — ログ確認または「0x017F のみ」を使用",
  },
  "mock.open": {
    zh: "[*] [预览] 打开 %s …",
    en: "[*] [Preview] Opening %s …",
    ja: "[*] [プレビュー] %s を開く …",
  },
  "mock.wakeup": {
    zh: "[*] [预览] 0x00 唤醒 + 握手（模拟）",
    en: "[*] [Preview] 0x00 wake + handshake (simulated)",
    ja: "[*] [プレビュー] 0x00 ウエーク + ハンドシェイク（シミュレーション）",
  },
  "mock.connected": {
    zh: "[+] [预览] 已连接 %s",
    en: "[+] [Preview] Connected %s",
    ja: "[+] [プレビュー] %s に接続",
  },
  "mock.read_eeprom": {
    zh: "[*] [预览] 读取 EEPROM 512B …",
    en: "[*] [Preview] Reading EEPROM 512B …",
    ja: "[*] [プレビュー] EEPROM 512B 読取 …",
  },
  "mock.dump_done": {
    zh: "[+] [预览] Dump 完成，已断开",
    en: "[+] [Preview] Dump complete, disconnected",
    ja: "[+] [プレビュー] Dump 完了、切断",
  },
  "mock.post_dump": {
    zh: "[i] [预览] 可关机重启相机后再写入",
    en: "[i] [Preview] Power-cycle the camera before writing",
    ja: "[i] [プレビュー] 書き込み前にカメラの電源を入れ直してください",
  },
  "mock.write_reconnect": {
    zh: "[*] [预览] 重新连接 %s …",
    en: "[*] [Preview] Reconnecting %s …",
    ja: "[*] [プレビュー] %s に再接続 …",
  },
  "mock.refresh_dump": {
    zh: "[*] [预览] 刷新镜像：重新连接 %s …",
    en: "[*] [Preview] Refresh mirror: reconnecting %s …",
    ja: "[*] [プレビュー] ミラー更新：%s に再接続 …",
  },
  "mock.refresh_dump_done": {
    zh: "[+] [预览] 镜像已更新（未保存文件）",
    en: "[+] [Preview] Mirror updated (file not saved)",
    ja: "[+] [プレビュー] ミラー更新済み（ファイル未保存）",
  },
  "mock.write_leader": {
    zh: "[*] [预览] 写入 0x169 <- %s",
    en: "[*] [Preview] Write 0x169 <- %s",
    ja: "[*] [プレビュー] 0x169 <- %s 書き込み",
  },
  "mock.checksum_updated": {
    zh: "[+] [预览] 校验和已更新（模拟）",
    en: "[+] [Preview] Checksum updated (simulated)",
    ja: "[+] [プレビュー] チェックサム更新（シミュレーション）",
  },
  "mock.write_done": {
    zh: "[*] [预览] 写入完成，已断开",
    en: "[*] [Preview] Write done, disconnected",
    ja: "[*] [プレビュー] 書き込み完了、切断",
  },
  "mock.checksum_only": {
    zh: "[*] [预览] 单独写入校验和 0x017F …",
    en: "[*] [Preview] Writing checksum 0x017F only …",
    ja: "[*] [プレビュー] チェックサム 0x017F のみ …",
  },
  "mock.disconnected": {
    zh: "[*] [预览] 已断开",
    en: "[*] [Preview] Disconnected",
    ja: "[*] [プレビュー] 切断",
  },
  "mock.saved": {
    zh: "[+] [预览] 已保存 Dump",
    en: "[+] [Preview] Dump saved",
    ja: "[+] [プレビュー] Dump 保存済み",
  },
  "ui.log.title": {
    zh: "日志",
    en: "LOG",
    ja: "ログ",
  },
  "ui.log.aria": {
    zh: "日志",
    en: "Log",
    ja: "ログ",
  },
  "ui.log.minimize": {
    zh: "最小化",
    en: "Minimize",
    ja: "最小化",
  },
  "ui.log.close": {
    zh: "关闭",
    en: "Close",
    ja: "閉じる",
  },
  "ui.log.language": {
    zh: "日志语言",
    en: "Log language",
    ja: "ログ言語",
  },
  "ui.advanced.aria": {
    zh: "高级功能",
    en: "Advanced",
    ja: "詳細機能",
  },
  "ui.advanced.title": {
    zh: "高级",
    en: "Advanced",
    ja: "詳細",
  },
  "ui.advanced.refresh": {
    zh: "刷新",
    en: "Refresh",
    ja: "更新",
  },
  "ui.advanced.redump": {
    zh: "再次 Dump",
    en: "Re-Dump",
    ja: "再 Dump",
  },
  "ui.advanced.redump_hint": {
    zh: "重新读取 EEPROM 并更新 HxD 镜像（不保存文件）",
    en: "Re-read EEPROM and refresh the HxD mirror (no file save)",
    ja: "EEPROM を再読取して HxD ミラーを更新（ファイル保存なし）",
  },
  "ui.advanced.write_checksum": {
    zh: "仅写 0x017F",
    en: "Write 0x017F",
    ja: "0x017F のみ",
  },
  "ui.advanced.need_dump_hint": {
    zh: "需先连接并 Dump",
    en: "Connect and dump first",
    ja: "接続して Dump が必要",
  },
  "ui.advanced.empty": {
    zh: "Dump 后可查看 HxD 镜像与校验和",
    en: "After dump, view HxD mirror and checksum here",
    ja: "Dump 後に HxD ミラーとチェックサムを表示",
  },
  "ui.advanced.checksum_current": {
    zh: "0x017F 当前",
    en: "0x017F now",
    ja: "0x017F 現在",
  },
  "ui.advanced.checksum_expected": {
    zh: "0x017F 应为",
    en: "0x017F expect",
    ja: "0x017F 期待値",
  },
  "ui.advanced.verify": {
    zh: "校验",
    en: "Verify",
    ja: "検証",
  },
  "ui.advanced.verify_ok": {
    zh: "通过",
    en: "OK",
    ja: "OK",
  },
  "ui.advanced.verify_fail": {
    zh: "失败",
    en: "Failed",
    ja: "失敗",
  },
  "ui.advanced.sum_mod": {
    zh: " (Σ mod256=%s)",
    en: " (Σ mod256=%s)",
    ja: " (Σ mod256=%s)",
  },
  "ui.intro.connect_aria": {
    zh: "连接串口",
    en: "Connect serial port",
    ja: "シリアルポートに接続",
  },
  "ui.work.drag_film": {
    zh: "拖动胶片",
    en: "Drag film",
    ja: "フィルムをドラッグ",
  },
};

export function loadLocale(): Locale {
  if (typeof localStorage === "undefined") return DEFAULT_LOCALE;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "zh" || v === "en" || v === "ja") return v;
  } catch {
    // Storage blocked in some WebView privacy modes — fall back to zh.
  }
  return DEFAULT_LOCALE;
}

export function saveLocale(locale: Locale): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore — in-memory locale still updates for this session.
  }
}

export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  const entry = messages[key];
  let text = entry?.[locale] ?? entry?.zh ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`%${k}`, String(v));
    }
  }
  return text;
}

const STARTUP_KEYS = ["startup.1", "startup.2", "startup.3", "startup.4"] as const;

export function getStartupLogs(locale: Locale): string[] {
  return STARTUP_KEYS.map((k) => t(k, locale));
}

export const STARTUP_LOG_COUNT = STARTUP_KEYS.length;

export function isUiPreviewLine(line: string): boolean {
  return (
    line.includes("UI 预览模式") ||
    line.includes("UI preview mode") ||
    line.includes("UI プレビューモード")
  );
}
