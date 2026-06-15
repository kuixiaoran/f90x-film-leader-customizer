export type StatusDTO = {
  connected: boolean;
  port: string;
  hasDump: boolean;
  leader: number;
  leaderMin: number;
  leaderMax: number;
  checksumOk: boolean;
};

export type ChecksumInfoDTO = {
  hasDump: boolean;
  ok: boolean;
  current: number;
  expected: number;
  sumMod: number;
  leader: number;
};

export type StudioBridge = {
  ListPorts(): Promise<string[]>;
  Connect(port: string): Promise<void>;
  GetStatus(): Promise<StatusDTO>;
  Dump(): Promise<void>;
  WriteLeader(length: number): Promise<void>;
  GetChecksumInfo(): Promise<ChecksumInfoDTO>;
  GetDumpHex(): Promise<string>;
  WriteChecksumOnly(): Promise<void>;
  RefreshDump(): Promise<void>;
  PromptSaveDump(): Promise<boolean>;
};
