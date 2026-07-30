/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TTS_API_URL?: string;
  readonly VITE_TTS_API_KEY?: string;
  readonly VITE_TTS_VOICE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS Modules 类型声明
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
