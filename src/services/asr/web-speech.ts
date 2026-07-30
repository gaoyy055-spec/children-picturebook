/**
 * ASR 服务 — Web Speech API 实现
 */

export interface ASRResult {
  transcript: string;
}

type ASRCallback = (result: ASRResult) => void;
type ASRErrorCallback = (error: string) => void;

let activeRecognizer: any = null;

/** 创建语音识别器 */
function createRecognizer(
  onResult: ASRCallback,
  onError: ASRErrorCallback,
): any | null {
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) return null;

  const recognizer = new SpeechRecognitionAPI();
  recognizer.lang = 'zh-CN';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult({ transcript });
  };

  recognizer.onerror = (event: any) => {
    onError(event.error);
  };

  return recognizer;
}

/** 开始语音识别 */
export function startListening(
  onResult: ASRCallback,
  onError: ASRErrorCallback,
): boolean {
  stopListening(); // 先停掉之前的
  const recognizer = createRecognizer(onResult, onError);
  if (!recognizer) return false;
  activeRecognizer = recognizer;
  recognizer.start();
  return true;
}

/** 停止语音识别 */
export function stopListening(): void {
  if (activeRecognizer) {
    activeRecognizer.stop();
    activeRecognizer = null;
  }
}

/** 是否支持 ASR */
export function isASRAvailable(): boolean {
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}
