/**
 * TTS 服务
 * 优先使用自定义音色克隆接口；未配置时回退到 Web Speech API。
 */

const REFERENCE_VOICE_URL = '/voices/child-girl-traveler.mp4';
const REFERENCE_VOICE_NAME = '小女孩-旅行者';

let childVoice: SpeechSynthesisVoice | null = null;
let currentAudio: HTMLAudioElement | null = null;
let referenceAudioBase64Promise: Promise<string> | null = null;

function pickChildVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const zhVoices = voices.filter((voice) => voice.lang?.toLowerCase().includes('zh'));

  // 当前没有真正的音色克隆接口时，强制优先选电脑里最像“小女孩”的中文女声。
  const preferredNames = [
    'Google 普通话（中国大陆）',
    'Google 普通话（中国大陆）',
    '语舒',
    '婷婷',
    'Li-Mu',
    'Flo (中文（中国大陆）)',
    'Shelley (中文（中国大陆）)',
    'Eddy (中文（中国大陆）)',
    'Sandy (中文（中国大陆）)',
  ];

  childVoice = preferredNames
    .map((name) => voices.find((voice) => voice.name === name))
    .find(Boolean) || null;

  if (childVoice) return;

  childVoice = zhVoices.find((voice) => {
    const name = voice.name.toLowerCase();
    return (
      name.includes('child') ||
      name.includes('kid') ||
      name.includes('children') ||
      voice.name.includes('儿童') ||
      voice.name.includes('童声') ||
      voice.name.includes('小朋友') ||
      voice.name.includes('女孩')
    );
  }) || zhVoices[0] || null;

  if (!childVoice) {
    console.warn('当前浏览器/系统没有找到可用中文声线。可用声线：', voices.map((v) => `${v.name} / ${v.lang}`));
  }
}

if (window.speechSynthesis) {
  pickChildVoice();
  window.speechSynthesis.onvoiceschanged = pickChildVoice;
}

function stopCustomAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.src = '';
  currentAudio = null;
}

function speakWithBrowserVoice(text: string, rate = 1, pitch = 1): void {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  pickChildVoice();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = Math.min(Math.max(rate, 0.9), 0.96);
  utter.pitch = Math.min(Math.max(pitch, 1.04), 1.1);
  if (childVoice) {
    utter.voice = childVoice;
    console.info('当前绘本朗读声线:', childVoice.name, childVoice.lang);
  }
  window.speechSynthesis.speak(utter);
}

async function getReferenceAudioBase64(): Promise<string> {
  if (!referenceAudioBase64Promise) {
    referenceAudioBase64Promise = fetch(REFERENCE_VOICE_URL)
      .then((res) => {
        if (!res.ok) throw new Error('参考音频加载失败');
        return res.blob();
      })
      .then((blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      }));
  }
  return referenceAudioBase64Promise;
}

async function playAudioUrl(audioUrl: string): Promise<void> {
  stopCustomAudio();
  window.speechSynthesis?.cancel();
  currentAudio = new Audio(audioUrl);
  await currentAudio.play();
}

async function playAudioBlob(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  await playAudioUrl(url);
  currentAudio?.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
}

async function speakWithCustomVoice(text: string, rate: number, pitch: number): Promise<boolean> {
  const apiUrl = import.meta.env.VITE_TTS_API_URL;
  if (!apiUrl || !text) return false;

  const apiKey = import.meta.env.VITE_TTS_API_KEY;
  const voiceId = import.meta.env.VITE_TTS_VOICE_ID || REFERENCE_VOICE_NAME;
  const referenceAudioBase64 = await getReferenceAudioBase64();
  const referenceAudioUrl = new URL(REFERENCE_VOICE_URL, window.location.href).href;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      text,
      rate,
      pitch,
      voiceId,
      voiceName: REFERENCE_VOICE_NAME,
      referenceAudioUrl,
      referenceAudioBase64,
      referenceAudioMimeType: 'audio/mp4',
    }),
  });

  if (!res.ok) throw new Error(`自定义 TTS 请求失败 (${res.status})`);

  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.startsWith('audio/')) {
    await playAudioBlob(await res.blob());
    return true;
  }

  const data = await res.json();
  const audioUrl = data.audioUrl || data.url || data.data?.audioUrl;
  const audioBase64 = data.audioBase64 || data.audio || data.data?.audioBase64 || data.data?.audio;
  if (audioUrl) {
    await playAudioUrl(audioUrl);
    return true;
  }
  if (audioBase64) {
    await playAudioUrl(`data:audio/mpeg;base64,${audioBase64}`);
    return true;
  }
  throw new Error('自定义 TTS 响应中没有音频');
}

/** 朗读文本：优先使用“小女孩-旅行者”参考音频对应的自定义声线 */
export function speak(text: string, rate = 1, pitch = 1): void {
  if (!text) return;
  stopSpeaking();

  if (!import.meta.env.VITE_TTS_API_URL) {
    speakWithBrowserVoice(text, rate, pitch);
    return;
  }

  void speakWithCustomVoice(text, rate, pitch).then((played) => {
    if (!played) speakWithBrowserVoice(text, rate, pitch);
  }).catch((err) => {
    console.warn('自定义声线不可用，回退到浏览器朗读:', err);
    speakWithBrowserVoice(text, rate, pitch);
  });
}

/** 停止朗读 */
export function stopSpeaking(): void {
  stopCustomAudio();
  window.speechSynthesis?.cancel();
}

/** 是否支持 TTS */
export function isTTSAvailable(): boolean {
  return !!(import.meta.env.VITE_TTS_API_URL || window.speechSynthesis);
}
