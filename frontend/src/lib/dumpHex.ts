import type { ChecksumInfoDTO } from "@/lib/studioTypes";

const EEPROM_SIZE = 512;
const CHECKSUM_ADDR = 0x17f;
const CHECKSUM_DATA_END = 0x17f;
const BYTES_PER_LINE = 16;

function sumMod256(data: Uint8Array, end: number): number {
  let s = 0;
  for (let i = 0; i < end; i++) s = (s + data[i]) & 0xff;
  return s;
}

function checksumByteForRegion(data: Uint8Array): number {
  const s = sumMod256(data, CHECKSUM_DATA_END);
  return (-s) & 0xff;
}

function formatLine(offset: number, row: Uint8Array, highlight?: number): string {
  let hex = `${offset.toString(16).padStart(8, "0").toUpperCase()}  `;
  for (let i = 0; i < BYTES_PER_LINE; i++) {
    if (i === 8) hex += " ";
    if (i < row.length) {
      const addr = offset + i;
      const hit = highlight === addr;
      hex += hit ? "[" : "";
      hex += row[i].toString(16).padStart(2, "0").toUpperCase();
      hex += hit ? "]" : "";
    } else {
      hex += "..";
    }
    hex += " ";
  }
  let ascii = "  ";
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    ascii += c >= 0x20 && c <= 0x7e ? String.fromCharCode(c) : ".";
  }
  return hex + ascii;
}

export function formatDumpHex(data: Uint8Array, highlightAddr = CHECKSUM_ADDR): string {
  const limit = Math.min(data.length, EEPROM_SIZE);
  if (limit <= 0) return "";
  const header =
    " Offset    00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F   ASCII";
  const col = "         ^^ ^^ ^^ ^^ ^^ ^^ ^^ ^^  ^^ ^^ ^^ ^^ ^^ ^^ ^^ ^^";
  const lines: string[] = [header, col];
  for (let off = 0; off < limit; off += BYTES_PER_LINE) {
    const n = Math.min(BYTES_PER_LINE, limit - off);
    const marker =
      highlightAddr >= off && highlightAddr < off + n ? ">" : " ";
    lines.push(marker + formatLine(off, data.subarray(off, off + n), highlightAddr));
  }
  return lines.join("\n");
}

export function buildMockEeprom(leader: number, checksumOk: boolean): Uint8Array {
  const buf = new Uint8Array(EEPROM_SIZE);
  buf[0x169] = leader & 0xff;
  buf[CHECKSUM_ADDR] = checksumByteForRegion(buf);
  if (!checksumOk) {
    buf[CHECKSUM_ADDR] ^= 0x01;
  }
  return buf;
}

export function mockChecksumInfo(
  hasDump: boolean,
  leader: number,
  checksumOk: boolean,
): ChecksumInfoDTO {
  if (!hasDump) {
    return {
      hasDump: false,
      ok: false,
      current: -1,
      expected: -1,
      sumMod: -1,
      leader,
    };
  }
  const expectedBuf = buildMockEeprom(leader, true);
  const expected = checksumByteForRegion(expectedBuf);
  const buf = buildMockEeprom(leader, checksumOk);
  const sumMod = sumMod256(buf, 0x180);
  return {
    hasDump: true,
    ok: checksumOk,
    current: buf[CHECKSUM_ADDR],
    expected,
    sumMod,
    leader,
  };
}
