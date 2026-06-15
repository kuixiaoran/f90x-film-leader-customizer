import { LOCALES, type Locale } from "@/lib/i18n";

type Tri = Record<Locale, string>;

const EXACT: Tri[] = [
  {
    zh: "[*] 读取 EEPROM …",
    en: "[*] Reading EEPROM …",
    ja: "[*] EEPROM 読取中 …",
  },
  {
    zh: "[+] Dump 完成",
    en: "[+] Dump complete",
    ja: "[+] Dump 完了",
  },
  {
    zh: "[+] 镜像已更新（未保存文件）",
    en: "[+] Mirror updated (file not saved)",
    ja: "[+] ミラー更新済み（ファイル未保存）",
  },
  {
    zh: "[*] 已断开",
    en: "[*] Disconnected",
    ja: "[*] 切断しました",
  },
  {
    zh: "已自动断开。写入时请直接点「写入」或「仅写 0x017F」— 工具会重新连接并立即执行（勿先手动连接后等待）。",
    en: "Auto-disconnected. To write, click Write or Write 0x017F only — the tool reconnects and runs immediately (do not connect manually and wait).",
    ja: "自動切断しました。書き込みは「書き込み」または「0x017F のみ」を直接クリックしてください—ツールが再接続してすぐ実行します（手動接続後に待たないでください）。",
  },
  {
    zh: "[*] 未保存 Dump 文件；可稍后在「高级」区查看镜像",
    en: "[*] Dump file not saved; view the mirror later in Advanced",
    ja: "[*] Dump 未保存；後で「詳細」でミラーを確認できます",
  },
  {
    zh: "[i] UI 预览模式 — 后端未接入，交互为模拟",
    en: "[i] UI preview mode — backend not connected; interactions are simulated",
    ja: "[i] UI プレビューモード — バックエンド未接続、操作はシミュレーション",
  },
  {
    zh: "    握手含一次 0x00 唤醒；会话期间不再发送唤醒",
    en: "    Handshake includes one 0x00 wake; no wake during session",
    ja: "    ハンドシェイクに 0x00 ウエークが1回含まれます。セッション中はウエークしません",
  },
  {
    zh: "    请勿同时占用本串口",
    en: "    Do not open this port elsewhere",
    ja: "    このポートを他で開かないでください",
  },
  {
    zh: "[+] 数据已写入并读回确认",
    en: "[+] Data written and read back verified",
    ja: "[+] データ書き込み・読戻し確認済み",
  },
  {
    zh: "[*] 提交保存 (FE4E) …",
    en: "[*] Commit save (FE4E) …",
    ja: "[*] 保存実行 (FE4E) …",
  },
  {
    zh: "[*] 自动重算并写入校验和 …",
    en: "[*] Recomputing and writing checksum …",
    ja: "[*] チェックサム再計算・書き込み …",
  },
  {
    zh: "[*] 写入完成，已断开",
    en: "[*] Write done, disconnected",
    ja: "[*] 書き込み完了、切断しました",
  },
  {
    zh: "[!] 写入未完成，已断开",
    en: "[!] Write incomplete, disconnected",
    ja: "[!] 書き込み未完了、切断しました",
  },
  {
    zh: "[!] 请检查相机侧关闭开机后是否 ERR：若无 ERR 说明未成功写入，请重新 MODIFY；若 ERR 说明数据已写入但校验和未写入，请开关相机后 Dump，再写入正确校验和。",
    en: "[!] Power-cycle the camera and check ERR on the body: no ERR means write failed — retry MODIFY; ERR means data was written but checksum was not — power-cycle, Dump, then write the correct checksum.",
    ja: "[!] カメラ電源 OFF/ON 後 ERR を確認：ERR なし＝未書き込み→MODIFY 再実行；ERR あり＝データ書き込み済み・チェックサム未更新→電源 OFF/ON 後 Dump→正しいチェックサムを書き込み。",
  },
  {
    zh: "[!] 请开关相机，检查是否 ERR：若 ERR，请重新「仅写 0x017F」。",
    en: "[!] Power-cycle the camera and check ERR: if ERR, retry Write 0x017F only.",
    ja: "[!] カメラの電源 ON/OFF 後 ERR を確認：ERR なら「0x017F のみ」を再実行。",
  },
  {
    zh: "[+] 0x169 已写入并更新校验和",
    en: "[+] 0x169 written; checksum updated",
    ja: "[+] 0x169 書き込み、チェックサム更新済み",
  },
  {
    zh: "[*] 数据已确认，等待 FEB 空闲后更新校验和 …",
    en: "[*] Data confirmed; waiting for FEB idle before checksum …",
    ja: "[*] データ確認済み、FEB アイドル後にチェックサム更新 …",
  },
  {
    zh: "[*] 等待 FEB 空闲后更新校验和 …",
    en: "[*] Waiting for FEB idle before checksum …",
    ja: "[*] FEB アイドル後にチェックサム更新 …",
  },
  {
    zh: "[*] [预览] 0x00 唤醒 + 握手（模拟）",
    en: "[*] [Preview] 0x00 wake + handshake (simulated)",
    ja: "[*] [プレビュー] 0x00 ウエーク + ハンドシェイク（シミュレーション）",
  },
  {
    zh: "[*] [预览] 读取 EEPROM 512B …",
    en: "[*] [Preview] Reading EEPROM 512B …",
    ja: "[*] [プレビュー] EEPROM 512B 読取 …",
  },
  {
    zh: "[+] [预览] Dump 完成，已断开",
    en: "[+] [Preview] Dump complete, disconnected",
    ja: "[+] [プレビュー] Dump 完了、切断",
  },
  {
    zh: "[i] [预览] 可关机重启相机后再写入",
    en: "[i] [Preview] Power-cycle the camera before writing",
    ja: "[i] [プレビュー] 書き込み前にカメラの電源を入れ直してください",
  },
  {
    zh: "[+] [预览] 校验和已更新（模拟）",
    en: "[+] [Preview] Checksum updated (simulated)",
    ja: "[+] [プレビュー] チェックサム更新（シミュレーション）",
  },
  {
    zh: "[*] [预览] 写入完成，已断开",
    en: "[*] [Preview] Write done, disconnected",
    ja: "[*] [プレビュー] 書き込み完了、切断",
  },
  {
    zh: "[*] [预览] 单独写入校验和 0x017F …",
    en: "[*] [Preview] Writing checksum 0x017F only …",
    ja: "[*] [プレビュー] チェックサム 0x017F のみ …",
  },
  {
    zh: "[*] [预览] 已断开",
    en: "[*] [Preview] Disconnected",
    ja: "[*] [プレビュー] 切断",
  },
  {
    zh: "[+] [预览] 已保存 Dump",
    en: "[+] [Preview] Dump saved",
    ja: "[+] [プレビュー] Dump 保存済み",
  },
];

type LineRule = {
  patterns: Record<Locale, RegExp>;
  format: Record<Locale, (...caps: string[]) => string>;
};

const LINE_RULES: LineRule[] = [
  {
    patterns: {
      zh: /^\[\+\] 已连接 (.+)$/,
      en: /^\[\+\] Connected (.+)$/,
      ja: /^\[\+\] (.+) に接続しました$/,
    },
    format: {
      zh: (port) => `[+] 已连接 ${port}`,
      en: (port) => `[+] Connected ${port}`,
      ja: (port) => `[+] ${port} に接続しました`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 读完成后等待 FEB 空闲 \((.+)\) …$/,
      en: /^\[\*\] Waiting for FEB idle after read \((.+)\) …$/,
      ja: /^\[\*\] 読取後 FEB アイドル待ち \((.+)\) …$/,
    },
    format: {
      zh: (phase) => `[*] 读完成后等待 FEB 空闲 (${phase}) …`,
      en: (phase) => `[*] Waiting for FEB idle after read (${phase}) …`,
      ja: (phase) => `[*] 読取後 FEB アイドル待ち (${phase}) …`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 连接重试 (\d+)\/(\d+): (.+)$/,
      en: /^\[\*\] Connect retry (\d+)\/(\d+): (.+)$/,
      ja: /^\[\*\] 接続リトライ (\d+)\/(\d+): (.+)$/,
    },
    format: {
      zh: (a, b, err) => `[*] 连接重试 ${a}/${b}: ${err}`,
      en: (a, b, err) => `[*] Connect retry ${a}/${b}: ${err}`,
      ja: (a, b, err) => `[*] 接続リトライ ${a}/${b}: ${err}`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 写入：重新连接 (.+) …$/,
      en: /^\[\*\] Write: reconnecting (.+) …$/,
      ja: /^\[\*\] 書き込み：(.+) に再接続 …$/,
    },
    format: {
      zh: (port) => `[*] 写入：重新连接 ${port} …`,
      en: (port) => `[*] Write: reconnecting ${port} …`,
      ja: (port) => `[*] 書き込み：${port} に再接続 …`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 刷新镜像：重新连接 (.+) …$/,
      en: /^\[\*\] Refresh mirror: reconnecting (.+) …$/,
      ja: /^\[\*\] ミラー更新：(.+) に再接続 …$/,
    },
    format: {
      zh: (port) => `[*] 刷新镜像：重新连接 ${port} …`,
      en: (port) => `[*] Refresh mirror: reconnecting ${port} …`,
      ja: (port) => `[*] ミラー更新：${port} に再接続 …`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 高级：重新连接 (.+)，单独写入校验和 …$/,
      en: /^\[\*\] Advanced: reconnect (.+), checksum only …$/,
      ja: /^\[\*\] 詳細：(.+) に再接続、チェックサムのみ …$/,
    },
    format: {
      zh: (port) => `[*] 高级：重新连接 ${port}，单独写入校验和 …`,
      en: (port) => `[*] Advanced: reconnect ${port}, checksum only …`,
      ja: (port) => `[*] 詳細：${port} に再接続、チェックサムのみ …`,
    },
  },
  {
    patterns: {
      zh: /^\[\+\] 已保存 (.+)$/,
      en: /^\[\+\] Saved (.+)$/,
      ja: /^\[\+\] 保存しました (.+)$/,
    },
    format: {
      zh: (path) => `[+] 已保存 ${path}`,
      en: (path) => `[+] Saved ${path}`,
      ja: (path) => `[+] 保存しました ${path}`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 队列 0x([0-9A-Fa-f]+) \((\d+) B\) …$/,
      en: /^\[\*\] Queue 0x([0-9A-Fa-f]+) \((\d+) B\) …$/,
      ja: /^\[\*\] キュー 0x([0-9A-Fa-f]+) \((\d+) B\) …$/,
    },
    format: {
      zh: (addr, n) => `[*] 队列 0x${addr} (${n} B) …`,
      en: (addr, n) => `[*] Queue 0x${addr} (${n} B) …`,
      ja: (addr, n) => `[*] キュー 0x${addr} (${n} B) …`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 写入 0x([0-9A-Fa-f]+) <- 0x([0-9A-Fa-f]+)$/,
      en: /^\[\*\] Write 0x([0-9A-Fa-f]+) <- 0x([0-9A-Fa-f]+)$/,
      ja: /^\[\*\] 書き込み 0x([0-9A-Fa-f]+) <- 0x([0-9A-Fa-f]+)$/,
    },
    format: {
      zh: (addr, val) => `[*] 写入 0x${addr} <- 0x${val}`,
      en: (addr, val) => `[*] Write 0x${addr} <- 0x${val}`,
      ja: (addr, val) => `[*] 書き込み 0x${addr} <- 0x${val}`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] 写入校验和 0x([0-9A-Fa-f]+) <- 0x([0-9A-Fa-f]+)$/,
      en: /^\[\*\] Write checksum 0x([0-9A-Fa-f]+) <- 0x([0-9A-Fa-f]+)$/,
      ja: /^\[\*\] チェックサム書き込み 0x([0-9A-Fa-f]+) <- 0x([0-9A-Fa-f]+)$/,
    },
    format: {
      zh: (addr, val) => `[*] 写入校验和 0x${addr} <- 0x${val}`,
      en: (addr, val) => `[*] Write checksum 0x${addr} <- 0x${val}`,
      ja: (addr, val) => `[*] チェックサム書き込み 0x${addr} <- 0x${val}`,
    },
  },
  {
    patterns: {
      zh: /^\[\+\] 校验和已更新 \(0x017F=0x([0-9A-Fa-f]+)\)$/,
      en: /^\[\+\] Checksum updated \(0x017F=0x([0-9A-Fa-f]+)\)$/,
      ja: /^\[\+\] チェックサム更新 \(0x017F=0x([0-9A-Fa-f]+)\)$/,
    },
    format: {
      zh: (val) => `[+] 校验和已更新 (0x017F=0x${val})`,
      en: (val) => `[+] Checksum updated (0x017F=0x${val})`,
      ja: (val) => `[+] チェックサム更新 (0x017F=0x${val})`,
    },
  },
  {
    patterns: {
      zh: /^\[\+\] 读回 OK \(0x([0-9A-Fa-f]+) = 0x([0-9A-Fa-f]+)\)$/,
      en: /^\[\+\] Readback OK \(0x([0-9A-Fa-f]+) = 0x([0-9A-Fa-f]+)\)$/,
      ja: /^\[\+\] 読戻し OK \(0x([0-9A-Fa-f]+) = 0x([0-9A-Fa-f]+)\)$/,
    },
    format: {
      zh: (addr, val) => `[+] 读回 OK (0x${addr} = 0x${val})`,
      en: (addr, val) => `[+] Readback OK (0x${addr} = 0x${val})`,
      ja: (addr, val) => `[+] 読戻し OK (0x${addr} = 0x${val})`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] \[预览\] 打开 (.+) …$/,
      en: /^\[\*\] \[Preview\] Opening (.+) …$/,
      ja: /^\[\*\] \[プレビュー\] (.+) を開く …$/,
    },
    format: {
      zh: (port) => `[*] [预览] 打开 ${port} …`,
      en: (port) => `[*] [Preview] Opening ${port} …`,
      ja: (port) => `[*] [プレビュー] ${port} を開く …`,
    },
  },
  {
    patterns: {
      zh: /^\[\+\] \[预览\] 已连接 (.+)$/,
      en: /^\[\+\] \[Preview\] Connected (.+)$/,
      ja: /^\[\+\] \[プレビュー\] (.+) に接続$/,
    },
    format: {
      zh: (port) => `[+] [预览] 已连接 ${port}`,
      en: (port) => `[+] [Preview] Connected ${port}`,
      ja: (port) => `[+] [プレビュー] ${port} に接続`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] \[预览\] 重新连接 (.+) …$/,
      en: /^\[\*\] \[Preview\] Reconnecting (.+) …$/,
      ja: /^\[\*\] \[プレビュー\] (.+) に再接続 …$/,
    },
    format: {
      zh: (port) => `[*] [预览] 重新连接 ${port} …`,
      en: (port) => `[*] [Preview] Reconnecting ${port} …`,
      ja: (port) => `[*] [プレビュー] ${port} に再接続 …`,
    },
  },
  {
    patterns: {
      zh: /^\[\*\] \[预览\] 写入 0x169 <- (.+)$/,
      en: /^\[\*\] \[Preview\] Write 0x169 <- (.+)$/,
      ja: /^\[\*\] \[プレビュー\] 0x169 <- (.+) 書き込み$/,
    },
    format: {
      zh: (val) => `[*] [预览] 写入 0x169 <- ${val}`,
      en: (val) => `[*] [Preview] Write 0x169 <- ${val}`,
      ja: (val) => `[*] [プレビュー] 0x169 <- ${val} 書き込み`,
    },
  },
];

/** Translate one log line to the target locale; unknown lines are kept as-is. */
export function translateLogLine(line: string, to: Locale): string {
  for (const tri of EXACT) {
    for (const from of LOCALES) {
      if (line === tri[from]) return tri[to];
    }
  }
  for (const rule of LINE_RULES) {
    for (const from of LOCALES) {
      const m = line.match(rule.patterns[from]);
      if (m) return rule.format[to](...m.slice(1));
    }
  }
  return line;
}

export function translateLogLines(lines: string[], to: Locale): string[] {
  return lines.map((line) => translateLogLine(line, to));
}
