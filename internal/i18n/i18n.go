package i18n

import (
	"errors"
)

type Locale string

const (
	Zh Locale = "zh"
	En Locale = "en"
	Ja Locale = "ja"
)

func Parse(s string) Locale {
	switch s {
	case "en":
		return En
	case "ja":
		return Ja
	default:
		return Zh
	}
}

const (
	iZh = 0
	iEn = 1
	iJa = 2
)

func localeIndex(locale Locale) int {
	switch locale {
	case En:
		return iEn
	case Ja:
		return iJa
	default:
		return iZh
	}
}

// messages: zh, en, ja
var messages = map[string][3]string{
	"log.disconnected":          {"[*] 已断开", "[*] Disconnected", "[*] 切断しました"},
	"log.connected":             {"[+] 已连接 %s", "[+] Connected %s", "[+] %s に接続しました"},
	"log.wakeup_note":           {"    握手含一次 0x00 唤醒；会话期间不再发送唤醒", "    Handshake includes one 0x00 wake; no wake during session", "    ハンドシェイクに 0x00 ウエークが1回含まれます。セッション中はウエークしません"},
	"log.port_exclusive":        {"    请勿同时占用本串口", "    Do not open this port elsewhere", "    このポートを他で開かないでください"},
	"log.connect_retry":         {"[*] 连接重试 %d/%d: %v", "[*] Connect retry %d/%d: %v", "[*] 接続リトライ %d/%d: %v"},
	"log.read_eeprom":           {"[*] 读取 EEPROM …", "[*] Reading EEPROM …", "[*] EEPROM 読取中 …"},
	"log.dump_done":             {"[+] Dump 完成", "[+] Dump complete", "[+] Dump 完了"},
	"log.refresh_dump":          {"[*] 刷新镜像：重新连接 %s …", "[*] Refresh mirror: reconnecting %s …", "[*] ミラー更新：%s に再接続 …"},
	"log.refresh_dump_done":     {"[+] 镜像已更新（未保存文件）", "[+] Mirror updated (file not saved)", "[+] ミラー更新済み（ファイル未保存）"},
	"log.post_dump_hint":        {"已自动断开。写入时请直接点「写入」或「仅写 0x017F」— 工具会重新连接并立即执行（勿先手动连接后等待）。", "Auto-disconnected. To write, click Write or Write 0x017F only — the tool reconnects and runs immediately (do not connect manually and wait).", "自動切断しました。書き込みは「書き込み」または「0x017F のみ」を直接クリックしてください—ツールが再接続してすぐ実行します（手動接続後に待たないでください）。"},
	"log.saved":                 {"[+] 已保存 %s", "[+] Saved %s", "[+] 保存しました %s"},
	"log.write_reconnect":       {"[*] 写入：重新连接 %s …", "[*] Write: reconnecting %s …", "[*] 書き込み：%s に再接続 …"},
	"log.write_done_disconnect": {"[*] 写入完成，已断开", "[*] Write done, disconnected", "[*] 書き込み完了、切断しました"},
	"log.write_abort_disconnect": {"[!] 写入未完成，已断开", "[!] Write incomplete, disconnected", "[!] 書き込み未完了、切断しました"},
	"log.feb_timeout_recovery_checksum": {"[!] 请开关相机，检查是否 ERR：若 ERR，请重新「仅写 0x017F」。", "[!] Power-cycle the camera and check ERR: if ERR, retry Write 0x017F only.", "[!] カメラの電源 ON/OFF 後 ERR を確認：ERR なら「0x017F のみ」を再実行。"},
	"log.write_leader_recovery":         {"[!] 请检查相机侧关闭开机后是否 ERR：若无 ERR 说明未成功写入，请重新 MODIFY；若 ERR 说明数据已写入但校验和未写入，请开关相机后 Dump，再写入正确校验和。", "[!] Power-cycle the camera and check ERR on the body: no ERR means write failed — retry MODIFY; ERR means data was written but checksum was not — power-cycle, Dump, then write the correct checksum.", "[!] カメラ電源 OFF/ON 後 ERR を確認：ERR なし＝未書き込み→MODIFY 再実行；ERR あり＝データ書き込み済み・チェックサム未更新→電源 OFF/ON 後 Dump→正しいチェックサムを書き込み。"},
	"log.write_addr":            {"[*] 写入 0x%04X <- 0x%02X", "[*] Write 0x%04X <- 0x%02X", "[*] 書き込み 0x%04X <- 0x%02X"},
	"log.leader_written":        {"[+] 0x169 已写入并更新校验和", "[+] 0x169 written; checksum updated", "[+] 0x169 書き込み、チェックサム更新済み"},
	"log.auto_checksum":         {"[*] 自动重算并写入校验和 …", "[*] Recomputing and writing checksum …", "[*] チェックサム再計算・書き込み …"},
	"log.checksum_updated":      {"[+] 校验和已更新 (0x017F=0x%02X)", "[+] Checksum updated (0x017F=0x%02X)", "[+] チェックサム更新 (0x017F=0x%02X)"},
	"log.advanced_reconnect":    {"[*] 高级：重新连接 %s，单独写入校验和 …", "[*] Advanced: reconnect %s, checksum only …", "[*] 詳細：%s に再接続、チェックサムのみ …"},
	"log.feb_wait":              {"[*] 读完成后等待 FEB 空闲 (%s) …", "[*] Waiting for FEB idle after read (%s) …", "[*] 読取後 FEB アイドル待ち (%s) …"},
	"log.retry_addr":            {"    重试 %d/%d @0x%04X: %v", "    Retry %d/%d @0x%04X: %v", "    リトライ %d/%d @0x%04X: %v"},
	"log.retry_no_ack":          {"    重试 %d/%d @0x%04X (无响应/校验失败)", "    Retry %d/%d @0x%04X (no response/check failed)", "    リトライ %d/%d @0x%04X (応答なし/検証失敗)"},
	"log.chunk_progress":        {"    [%d/%d] 0x%04X–0x%04X", "    [%d/%d] 0x%04X–0x%04X", "    [%d/%d] 0x%04X–0x%04X"},
	"log.data_confirmed":        {"[+] 数据已写入并读回确认", "[+] Data written and read back verified", "[+] データ書き込み・読戻し確認済み"},
	"log.queue":                 {"[*] 队列 0x%04X (%d B) …", "[*] Queue 0x%04X (%d B) …", "[*] キュー 0x%04X (%d B) …"},
	"log.fe4e":                  {"[*] 提交保存 (FE4E) …", "[*] Commit save (FE4E) …", "[*] 保存実行 (FE4E) …"},
	"log.readback_ok":           {"[+] 读回 OK (0x%04X = 0x%02X)", "[+] Readback OK (0x%04X = 0x%02X)", "[+] 読戻し OK (0x%04X = 0x%02X)"},
	"log.data_confirm_feb":      {"[*] 数据已确认，等待 FEB 空闲后更新校验和 …", "[*] Data confirmed; waiting for FEB idle before checksum …", "[*] データ確認済み、FEB アイドル後にチェックサム更新 …"},
	"log.feb_checksum":          {"[*] 等待 FEB 空闲后更新校验和 …", "[*] Waiting for FEB idle before checksum …", "[*] FEB アイドル後にチェックサム更新 …"},
	"log.write_checksum":        {"[*] 写入校验和 0x%04X <- 0x%02X", "[*] Write checksum 0x%04X <- 0x%02X", "[*] チェックサム書き込み 0x%04X <- 0x%02X"},

	"action.dump":           {"Dump", "Dump", "Dump"},
	"action.write":          {"写入", "Write", "書き込み"},
	"action.read_byte":      {"读字节", "Read byte", "バイト読取"},
	"action.read_checksum":  {"读校验区", "Read checksum region", "チェックサム領域読取"},
	"action.write_checksum": {"写入校验和", "Write checksum", "チェックサム書き込み"},

	"err.select_port":           {"请选择串口", "Please select a COM port", "COM ポートを選択してください"},
	"err.connect_first":         {"请先连接相机", "Connect to the camera first", "先にカメラに接続してください"},
	"err.dump_first":            {"请先 Dump", "Dump EEPROM first", "先に Dump してください"},
	"err.no_save_path":          {"未选择保存路径", "No save path selected", "保存先が選択されていません"},
	"err.save_failed":           {"保存失败: %v", "Save failed: %v", "保存失敗: %v"},
	"err.leader_range":          {"留片头长度仅允许 %d–%d（0x169）", "Leader length must be %d–%d (0x169)", "リーダー長は %d–%d（0x169）のみ"},
	"err.no_port_record":        {"未记录串口，请从连接页重新连接", "Port not recorded — reconnect from the connect screen", "ポート未記録—接続画面から再接続してください"},
	"err.checksum_before":       {"校验和前", "Before checksum", "チェックサム前"},
	"err.readback_169_mismatch": {"读回 0x169 不匹配（期望 0x%02X，实际 0x%02X）", "Readback 0x169 mismatch (expected 0x%02X, got 0x%02X)", "読戻し 0x169 不一致（期待 0x%02X、実際 0x%02X）"},
	"err.region_verify_failed":  {"全区校验仍失败", "Full-region checksum still failed", "全区チェックサムがまだ失敗"},
	"err.region_verify_eeprom":  {"相机 EEPROM 全区校验失败 (Σ mod256=%d)", "Camera EEPROM full-region checksum failed (Σ mod256=%d)", "カメラ EEPROM 全区チェックサム失敗 (Σ mod256=%d)"},
	"err.read_failed":           {"读取失败 @0x%04X，请断开重连后重试", "Read failed @0x%04X — disconnect, reconnect, and retry", "読取失敗 @0x%04X—切断して再接続後リトライ"},
	"err.need_fast_link":        {"需要 9600 快链路", "9600 fast link required", "9600 高速リンクが必要です"},
	"err.read_eeprom_addr":      {"读 EEPROM 0x%04X 失败", "Read EEPROM 0x%04X failed", "EEPROM 0x%04X 読取失敗"},
	"err.expect_actual":         {"期望 0x%02X, 实际 0x%02X", "Expected 0x%02X, got 0x%02X", "期待 0x%02X, 実際 0x%02X"},
	"err.readback_delayed":      {"读回 0x%04X: %v（队列已提交，可能是机身读回延迟）", "Readback 0x%04X: %v (queue committed; body readback may be delayed)", "読戻し 0x%04X: %v（キュー送信済み、ボディ読戻し遅延の可能性）"},
	"err.readback_comm_fail":    {"读回 0x%04X: %v（队列已提交，可能是通信瞬时失败）", "Readback 0x%04X: %v (queue committed; possible transient comm failure)", "読戻し 0x%04X: %v（キュー送信済み、通信瞬断の可能性）"},
	"err.readback_failed":       {"读回 0x%04X 失败（队列已提交）", "Readback 0x%04X failed (queue committed)", "読戻し 0x%04X 失敗（キュー送信済み）"},
	"err.addr_oob":              {"地址越界", "Address out of range", "アドレス範囲外"},
	"err.queue_addr":            {"队列 0x%04X: %v", "Queue 0x%04X: %v", "キュー 0x%04X: %v"},
	"err.verify_mismatch":       {"0x%04X: 期望 0x%02X, 实际 0x%02X（队列/FE4E 已完成但 EEPROM 未更新）", "0x%04X: expected 0x%02X, got 0x%02X (queue/FE4E done but EEPROM not updated)", "0x%04X: 期待 0x%02X, 実際 0x%02X（キュー/FE4E 完了だが EEPROM 未更新）"},
	"err.checksum_retry_hint":   {"%v；若仍失败请关机等待约 10 秒后再单独写 0x017F", "%v; if it still fails, power off ~10s then write 0x017F only", "%v；失敗時は電源 OFF ~10 秒後 0x017F のみ書き込み"},
	"err.before_action":         {"%s 前: %v", "Before %s: %v", "%s 前: %v"},
	"err.settle_after":          {"读后 settle (%s): %v", "Post-read settle (%s): %v", "読取後 settle (%s): %v"},

	"dialog.save.title":   {"保存 EEPROM Dump", "Save EEPROM Dump", "EEPROM Dump を保存"},
	"dialog.save.message": {"请将 Dump 备份保存到安全位置，然后进入 MODIFY", "Save the dump backup to a safe location, then enter MODIFY", "Dump を安全な場所に保存してから MODIFY へ"},
	"dialog.save.filter":  {"BIN 文件 (*.bin)", "BIN files (*.bin)", "BIN ファイル (*.bin)"},
}

func Format(locale Locale, key string, args ...any) string {
	triple, ok := messages[key]
	if !ok {
		if len(args) > 0 {
			return expandTemplate(key, args...)
		}
		return key
	}
	tmpl := triple[localeIndex(locale)]
	if len(args) == 0 {
		return tmpl
	}
	return expandTemplate(tmpl, args...)
}

// Err returns a localized error (no fmt.Errorf — safe for vet printf checks).
func Err(locale Locale, key string, args ...any) error {
	return errors.New(Format(locale, key, args...))
}

// ActionLabel localizes a known action.* key for error messages.
func ActionLabel(locale Locale, actionKey string) string {
	switch actionKey {
	case "action.dump":
		return Format(locale, "action.dump")
	case "action.write":
		return Format(locale, "action.write")
	case "action.read_byte":
		return Format(locale, "action.read_byte")
	case "action.read_checksum":
		return Format(locale, "action.read_checksum")
	case "action.write_checksum":
		return Format(locale, "action.write_checksum")
	default:
		return actionKey
	}
}
