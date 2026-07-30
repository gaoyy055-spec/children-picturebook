/**
 * TTS 服务 — 门面
 * 当前使用 Web Speech API，后续可替换为云端 TTS
 */

export { speak, stopSpeaking, isTTSAvailable } from './web-speech';
