/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_USE_WAILS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
