import { emitDevLog } from "@/lib/devLog";
import { buildMockEeprom, formatDumpHex, mockChecksumInfo } from "@/lib/dumpHex";
import { t } from "@/lib/i18n";
import { LEADER_MAX, LEADER_MIN, clampLeader } from "@/lib/leader";
import type { StatusDTO, StudioBridge } from "@/lib/studioTypes";
import { useStudioStore } from "@/store/useStudioStore";

type MockState = {
  connected: boolean;
  port: string;
  hasDump: boolean;
  leader: number;
  checksumOk: boolean;
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const loc = () => useStudioStore.getState().locale;

let state: MockState = {
  connected: false,
  port: "",
  hasDump: false,
  leader: 6,
  checksumOk: false,
};

function status(): StatusDTO {
  return {
    connected: state.connected,
    port: state.port,
    hasDump: state.hasDump,
    leader: state.leader,
    leaderMin: LEADER_MIN,
    leaderMax: LEADER_MAX,
    checksumOk: state.checksumOk,
  };
}

function resetMockState(partial?: Partial<MockState>): void {
  state = {
    connected: false,
    port: "",
    hasDump: false,
    leader: 6,
    checksumOk: false,
    ...partial,
  };
}

export function seedMockIntro(): void {
  resetMockState({ leader: 6 });
}

export function seedMockWorkDump(): void {
  resetMockState({ connected: true, port: "COM2", leader: 6 });
}

export function seedMockWorkEdit(): void {
  resetMockState({
    connected: false,
    port: "COM2",
    hasDump: true,
    leader: 6,
    checksumOk: true,
  });
}

function downloadMockBin(filename: string, bytes: Uint8Array) {
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const mockApi: StudioBridge = {
  async ListPorts() {
    await delay(80);
    return ["COM2", "COM3", "COM4"];
  },

  async Connect(port) {
    await delay(900);
    if (!port) throw new Error(t("err.select_com", loc()));
    emitDevLog(t("mock.open", loc(), { s: port }));
    emitDevLog(t("mock.wakeup", loc()));
    state.connected = true;
    state.port = port;
    state.hasDump = false;
    state.checksumOk = false;
    emitDevLog(t("mock.connected", loc(), { s: port }));
  },

  async GetStatus() {
    await delay(40);
    return status();
  },

  async Dump() {
    await delay(1400);
    if (!state.connected) throw new Error(t("err.connect_first", loc()));
    emitDevLog(t("mock.read_eeprom", loc()));
    await delay(600);
    state.hasDump = true;
    state.leader = 6;
    state.checksumOk = true;
    state.connected = false;
    emitDevLog(t("mock.dump_done", loc()));
    emitDevLog(t("mock.post_dump", loc()));
  },

  async WriteLeader(length) {
    await delay(1100);
    if (!state.hasDump) throw new Error(t("err.dump_first", loc()));
    if (!state.port) throw new Error(t("err.no_port_record", loc()));
    const dec = clampLeader(length);
    emitDevLog(t("mock.write_reconnect", loc(), { s: state.port }));
    await delay(400);
    emitDevLog(t("mock.write_leader", loc(), { s: String(dec) }));
    await delay(400);
    state.leader = dec;
    state.checksumOk = true;
    emitDevLog(t("mock.checksum_updated", loc()));
    emitDevLog(t("mock.write_done", loc()));
  },

  async GetChecksumInfo() {
    await delay(40);
    return mockChecksumInfo(state.hasDump, state.leader, state.checksumOk);
  },

  async GetDumpHex() {
    await delay(40);
    if (!state.hasDump) return "";
    return formatDumpHex(buildMockEeprom(state.leader, state.checksumOk));
  },

  async WriteChecksumOnly() {
    await delay(900);
    if (!state.hasDump) throw new Error(t("err.dump_first", loc()));
    if (!state.port) throw new Error(t("err.no_port_record", loc()));
    emitDevLog(t("mock.write_reconnect", loc(), { s: state.port }));
    await delay(300);
    emitDevLog(t("mock.checksum_only", loc()));
    await delay(300);
    state.checksumOk = true;
    emitDevLog(t("mock.checksum_updated", loc()));
    emitDevLog(t("mock.disconnected", loc()));
  },

  async RefreshDump() {
    await delay(1100);
    if (!state.port) throw new Error(t("err.no_port_record", loc()));
    emitDevLog(t("mock.refresh_dump", loc(), { s: state.port }));
    await delay(400);
    emitDevLog(t("mock.read_eeprom", loc()));
    await delay(600);
    const bytes = buildMockEeprom(state.leader, state.checksumOk);
    state.leader = bytes[0x169] ?? state.leader;
    state.hasDump = true;
    state.checksumOk = true;
    state.connected = false;
    emitDevLog(t("mock.disconnected", loc()));
    emitDevLog(t("mock.refresh_dump_done", loc()));
  },

  async PromptSaveDump() {
    await delay(80);
    if (!state.hasDump) return false;
    downloadMockBin("f90x_eeprom_dump_space01.bin", buildMockEeprom(state.leader, state.checksumOk));
    emitDevLog(t("mock.saved", loc()));
    return true;
  },
};
