import { useState, useCallback } from 'react';
import { fetchCharacterFact, chatWithCharacter } from '../services/llm';
import { speak } from '../services/tts';
import { startListening, stopListening, isASRAvailable } from '../services/asr';
import type { Hotspot, CharacterFactResult, CharacterChatResult } from '../types';

type HotspotAction = 'fact' | 'ar' | 'chat';

interface HotspotState {
  action: HotspotAction | null;
  characterId: string | null;
  characterLabel: string;
  emoji: string;
  factResult: CharacterFactResult | null;
  chatResult: CharacterChatResult | null;
  chatHistory: string[];
  loading: boolean;
}

export function useHotspot() {
  const [state, setState] = useState<HotspotState>({
    action: null,
    characterId: null,
    characterLabel: '',
    emoji: '',
    factResult: null,
    chatResult: null,
    chatHistory: [],
    loading: false,
  });

  /** 点击热区 → 小度百科 */
  const showFact = useCallback(async (hotspot: Hotspot, pageText: string) => {
    setState((prev) => ({
      ...prev,
      action: 'fact',
      characterId: hotspot.id,
      characterLabel: hotspot.label,
      emoji: hotspot.emoji,
      factResult: null,
      loading: true,
    }));

    try {
      const result = await fetchCharacterFact(hotspot.label, pageText);
      setState((prev) => ({ ...prev, factResult: result, loading: false }));
      speak(result.factText);
    } catch {
      setState((prev) => ({
        ...prev,
        factResult: {
          factText: '哎呀，小度这次没听清，我们再试一次好不好？',
          emotionTag: 'gentle',
        },
        loading: false,
      }));
    }
  }, []);

  /** 点击热区 → AR 查看 */
  const showAR = useCallback((hotspot: Hotspot) => {
    setState((prev) => ({
      ...prev,
      action: 'ar',
      characterId: hotspot.id,
      characterLabel: hotspot.label,
      emoji: hotspot.emoji,
    }));
  }, []);

  /** 点击热区 → 角色对话 */
  const startChat = useCallback((hotspot: Hotspot, _pageText: string) => {
    setState((prev) => ({
      ...prev,
      action: 'chat',
      characterId: hotspot.id,
      characterLabel: hotspot.label,
      emoji: hotspot.emoji,
      chatResult: null,
      chatHistory: [],
    }));
  }, []);

  /** 发送对话消息 */
  const sendChatMessage = useCallback(
    async (pageText: string, childMessage: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const result = await chatWithCharacter(
          state.characterLabel,
          pageText,
          childMessage,
          state.chatHistory,
        );
        setState((prev) => ({
          ...prev,
          chatResult: result,
          chatHistory: [...prev.chatHistory, childMessage, result.reply],
          loading: false,
        }));
        speak(result.reply);
      } catch {
        setState((prev) => ({
          ...prev,
          chatResult: { reply: '我好像卡住了，我们再说一次好不好？', emotionTag: 'gentle' },
          loading: false,
        }));
      }
    },
    [state.characterLabel, state.chatHistory],
  );

  /** 语音输入对话 */
  const sendVoiceChat = useCallback(
    (pageText: string) => {
      if (!isASRAvailable()) return false;
      return startListening(
        (result) => sendChatMessage(pageText, result.transcript),
        () => {},
      );
    },
    [sendChatMessage],
  );

  /** 关闭弹窗 */
  const close = useCallback(() => {
    stopListening();
    setState((prev) => ({
      ...prev,
      action: null,
      factResult: null,
      chatResult: null,
      loading: false,
    }));
  }, []);

  return {
    hotspotState: state,
    showFact,
    showAR,
    startChat,
    sendChatMessage,
    sendVoiceChat,
    close,
  };
}
