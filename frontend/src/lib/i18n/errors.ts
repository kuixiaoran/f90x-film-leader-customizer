import { LOCALES, type Locale } from "@/lib/i18n";

type Tri = Record<Locale, string>;

/** Static error strings from Go i18n + frontend-only keys (all locales). */
const EXACT: Tri[] = [
  {
    zh: "请选择串口",
    en: "Please select a COM port",
    ja: "COM ポートを選択してください",
  },
  {
    zh: "请先连接相机",
    en: "Connect to the camera first",
    ja: "先にカメラに接続してください",
  },
  {
    zh: "请先 Dump",
    en: "Dump EEPROM first",
    ja: "先に Dump してください",
  },
  {
    zh: "未选择保存路径",
    en: "No save path selected",
    ja: "保存先が選択されていません",
  },
  {
    zh: "未记录串口，请从连接页重新连接",
    en: "Port not recorded — reconnect from the connect screen",
    ja: "ポート未記録—接続画面から再接続してください",
  },
  {
    zh: "全区校验仍失败",
    en: "Full-region checksum still failed",
    ja: "全区チェックサムがまだ失敗",
  },
  {
    zh: "需要 9600 快链路",
    en: "9600 fast link required",
    ja: "9600 高速リンクが必要です",
  },
  {
    zh: "地址越界",
    en: "Address out of range",
    ja: "アドレス範囲外",
  },
  {
    zh: "连接成功但无法读取状态，请重试",
    en: "Connected but status read failed — retry",
    ja: "接続成功しましたが状態取得に失敗—リトライしてください",
  },
  {
    zh: "Dump 完成但状态未更新，请重试",
    en: "Dump finished but status not updated — retry",
    ja: "Dump 完了しましたが状態未更新—リトライしてください",
  },
  {
    zh: "写入完成但状态未更新",
    en: "Write finished but status not updated",
    ja: "書き込み完了しましたが状態未更新",
  },
  {
    zh: "Serial port busy",
    en: "Serial port busy",
    ja: "シリアルポートがビジーです",
  },
];

type ErrorRule = {
  patterns: Record<Locale, RegExp>;
  format: Record<Locale, (...caps: string[]) => string>;
};

const RULES: ErrorRule[] = [
  {
    patterns: {
      zh: /^保存失败: (.+)$/,
      en: /^Save failed: (.+)$/,
      ja: /^保存失敗: (.+)$/,
    },
    format: {
      zh: (d) => `保存失败: ${d}`,
      en: (d) => `Save failed: ${d}`,
      ja: (d) => `保存失敗: ${d}`,
    },
  },
  {
    patterns: {
      zh: /^留片头长度仅允许 (\d+)–(\d+)（0x169）$/,
      en: /^Leader length must be (\d+)–(\d+) \(0x169\)$/,
      ja: /^リーダー長は (\d+)–(\d+)（0x169）のみ$/,
    },
    format: {
      zh: (a, b) => `留片头长度仅允许 ${a}–${b}（0x169）`,
      en: (a, b) => `Leader length must be ${a}–${b} (0x169)`,
      ja: (a, b) => `リーダー長は ${a}–${b}（0x169）のみ`,
    },
  },
  {
    patterns: {
      zh: /^读取失败 @(0x[0-9A-Fa-f]+)，请断开重连后重试$/,
      en: /^Read failed @(0x[0-9A-Fa-f]+) — disconnect, reconnect, and retry$/,
      ja: /^読取失敗 @(0x[0-9A-Fa-f]+)—切断して再接続後リトライ$/,
    },
    format: {
      zh: (a) => `读取失败 @${a}，请断开重连后重试`,
      en: (a) => `Read failed @${a} — disconnect, reconnect, and retry`,
      ja: (a) => `読取失敗 @${a}—切断して再接続後リトライ`,
    },
  },
  {
    patterns: {
      zh: /^读 EEPROM (0x[0-9A-Fa-f]+) 失败$/,
      en: /^Read EEPROM (0x[0-9A-Fa-f]+) failed$/,
      ja: /^EEPROM (0x[0-9A-Fa-f]+) 読取失敗$/,
    },
    format: {
      zh: (a) => `读 EEPROM ${a} 失败`,
      en: (a) => `Read EEPROM ${a} failed`,
      ja: (a) => `EEPROM ${a} 読取失敗`,
    },
  },
  {
    patterns: {
      zh: /^校验和前: (.+)$/,
      en: /^Before checksum: (.+)$/,
      ja: /^チェックサム前: (.+)$/,
    },
    format: {
      zh: (d) => `校验和前: ${d}`,
      en: (d) => `Before checksum: ${d}`,
      ja: (d) => `チェックサム前: ${d}`,
    },
  },
  {
    patterns: {
      zh: /^读后 settle \((.+)\): (.+)$/,
      en: /^Post-read settle \((.+)\): (.+)$/,
      ja: /^読取後 settle \((.+)\): (.+)$/,
    },
    format: {
      zh: (p, d) => `读后 settle (${p}): ${d}`,
      en: (p, d) => `Post-read settle (${p}): ${d}`,
      ja: (p, d) => `読取後 settle (${p}): ${d}`,
    },
  },
  {
    patterns: {
      zh: /^期望 (0x[0-9A-Fa-f]+), 实际 (0x[0-9A-Fa-f]+)$/,
      en: /^Expected (0x[0-9A-Fa-f]+), got (0x[0-9A-Fa-f]+)$/,
      ja: /^期待 (0x[0-9A-Fa-f]+), 実際 (0x[0-9A-Fa-f]+)$/,
    },
    format: {
      zh: (e, a) => `期望 ${e}, 实际 ${a}`,
      en: (e, a) => `Expected ${e}, got ${a}`,
      ja: (e, a) => `期待 ${e}, 実際 ${a}`,
    },
  },
  {
    patterns: {
      zh: /^(0x[0-9A-Fa-f]+): 期望 (0x[0-9A-Fa-f]+), 实际 (0x[0-9A-Fa-f]+)（队列\/FE4E 已完成但 EEPROM 未更新）$/,
      en: /^(0x[0-9A-Fa-f]+): expected (0x[0-9A-Fa-f]+), got (0x[0-9A-Fa-f]+) \(queue\/FE4E done but EEPROM not updated\)$/,
      ja: /^(0x[0-9A-Fa-f]+): 期待 (0x[0-9A-Fa-f]+), 実際 (0x[0-9A-Fa-f]+)（キュー\/FE4E 完了だが EEPROM 未更新）$/,
    },
    format: {
      zh: (addr, e, a) =>
        `${addr}: 期望 ${e}, 实际 ${a}（队列/FE4E 已完成但 EEPROM 未更新）`,
      en: (addr, e, a) =>
        `${addr}: expected ${e}, got ${a} (queue/FE4E done but EEPROM not updated)`,
      ja: (addr, e, a) =>
        `${addr}: 期待 ${e}, 実際 ${a}（キュー/FE4E 完了だが EEPROM 未更新）`,
    },
  },
  {
    patterns: {
      zh: /^读回 (0x[0-9A-Fa-f]+) 失败（队列已提交）$/,
      en: /^Readback (0x[0-9A-Fa-f]+) failed \(queue committed\)$/,
      ja: /^読戻し (0x[0-9A-Fa-f]+) 失敗（キュー送信済み）$/,
    },
    format: {
      zh: (a) => `读回 ${a} 失败（队列已提交）`,
      en: (a) => `Readback ${a} failed (queue committed)`,
      ja: (a) => `読戻し ${a} 失敗（キュー送信済み）`,
    },
  },
  {
    patterns: {
      zh: /^队列 (0x[0-9A-Fa-f]+): (.+)$/,
      en: /^Queue (0x[0-9A-Fa-f]+): (.+)$/,
      ja: /^キュー (0x[0-9A-Fa-f]+): (.+)$/,
    },
    format: {
      zh: (a, d) => `队列 ${a}: ${d}`,
      en: (a, d) => `Queue ${a}: ${d}`,
      ja: (a, d) => `キュー ${a}: ${d}`,
    },
  },
  {
    patterns: {
      zh: /^(.+) 前: (.+)$/,
      en: /^Before (.+): (.+)$/,
      ja: /^(.+) 前: (.+)$/,
    },
    format: {
      zh: (action, detail) => `${action} 前: ${detail}`,
      en: (action, detail) => `Before ${action}: ${detail}`,
      ja: (action, detail) => `${action} 前: ${detail}`,
    },
  },
  {
    patterns: {
      zh: /^(.+)；若仍失败请关机等待约 10 秒后再单独写 0x017F$/,
      en: /^(.+); if it still fails, power off ~10s then write 0x017F only$/,
      ja: /^(.+)；失敗時は電源 OFF ~10 秒後 0x017F のみ書き込み$/,
    },
    format: {
      zh: (d) => `${d}；若仍失败请关机等待约 10 秒后再单独写 0x017F`,
      en: (d) => `${d}; if it still fails, power off ~10s then write 0x017F only`,
      ja: (d) => `${d}；失敗時は電源 OFF ~10 秒後 0x017F のみ書き込み`,
    },
  },
];

/** Re-translate a backend or cached error banner line on locale switch. */
export function translateErrorLine(line: string, to: Locale): string {
  for (const tri of EXACT) {
    for (const from of LOCALES) {
      if (line === tri[from]) return tri[to];
    }
  }
  for (const rule of RULES) {
    for (const from of LOCALES) {
      const m = line.match(rule.patterns[from]);
      if (m) return rule.format[to](...m.slice(1));
    }
  }
  return line;
}
