import { useCallback } from 'react';
import { useReadingStore } from '../stores/readingStore';
import { useVoiceStore } from '../stores/voiceStore';
import { continueStoryFromSpeech } from '../services/llm';
import { speak, stopSpeaking } from '../services/tts';
import { startListening, stopListening, isASRAvailable } from '../services/asr';
import type { StoryContinuationResult } from '../types';

export function useVoiceStory() {
  const { addHistoryEntry } = useReadingStore();
  const voiceStore = useVoiceStore();

  /** 开始语音续编 */
  const startVoiceStory = useCallback(
    (currentPageText: string) => {
      if (!isASRAvailable()) {
        voiceStore.setStatus('unsupported');
        return false;
      }

      voiceStore.setStatus('listening');
      const started = startListening(
        (result) => {
          voiceStore.setRecognizedText(result.transcript);
          processStoryContinuation(currentPageText, result.transcript);
        },
        () => {
          voiceStore.setStatus('idle');
        },
      );
      return started;
    },
    [voiceStore],
  );

  /** 文字输入续编（语音不支持时的兜底） */
  const submitTextStory = useCallback(
    (currentPageText: string, text: string) => {
      voiceStore.setRecognizedText(text);
      processStoryContinuation(currentPageText, text);
    },
    [voiceStore],
  );

  /** 处理故事扩写 */
  const processStoryContinuation = useCallback(
    async (currentPageText: string, childText: string) => {
      voiceStore.setStatus('thinking');
      const historyTexts = useReadingStore.getState().sessionHistory.map((h) => h.storyContinuation);

      try {
        const result: StoryContinuationResult = await continueStoryFromSpeech(
          currentPageText,
          childText,
          historyTexts,
        );

        addHistoryEntry({
          child: childText,
          ...result,
        });

        voiceStore.setStatus('speaking');
        speak(`${result.storyContinuation}。${result.encouragement}。${result.nextQuestion}`);

        // TTS 播完后回到 idle
        setTimeout(() => voiceStore.setStatus('idle'), 5000);
      } catch {
        voiceStore.setStatus('idle');
      }
    },
    [addHistoryEntry, voiceStore],
  );

  /** 停止语音 */
  const stopVoice = useCallback(() => {
    stopListening();
    stopSpeaking();
    voiceStore.setStatus('idle');
  }, [voiceStore]);

  return {
    voiceStatus: voiceStore.status,
    lastRecognizedText: voiceStore.lastRecognizedText,
    startVoiceStory,
    submitTextStory,
    stopVoice,
  };
}
