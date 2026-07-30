/**
 * LLM 服务 — 统一门面
 * 优先调用真实 API，失败时自动降级到 Mock
 */

import { CHILD_SAFETY_SYSTEM, buildCharacterFactPrompt, buildCharacterChatPrompt, buildStoryContinuationPrompt, buildStorySummaryPrompt, buildAnswerFeedbackPrompt, buildReadBookPagePrompt, buildXiaoduChatPrompt, buildClickedTargetPrompt, CHARACTER_PERSONALITIES } from './prompts';
import { callLLMApi, parseLLMJson } from './api';
import {
  mockCharacterFact,
  mockStoryContinuation,
  mockCharacterChat,
  mockStorySummary,
  mockAnswerFeedback,
  mockReadBookPage,
  mockClickedTarget,
} from './mock';
import type {
  CharacterFactResult,
  StoryContinuationResult,
  CharacterChatResult,
  StorySummaryResult,
  AnswerFeedbackResult,
  ClickedTargetResult,
} from '../../types';

/** 是否有可用的文本 API Key（Claude 或 OpenAI 兼容接口） */
function hasApiKey(): boolean {
  const key = import.meta.env.VITE_LLM_API_KEY || (window as any).__LLM_CONFIG?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  return !!key;
}

/** 是否有可用的 OpenAI API Key（用于图片看图场景） */
function hasOpenAIKey(): boolean {
  return !!(import.meta.env.VITE_OPENAI_API_KEY);
}

/** 通用调用：API 优先，失败降级 Mock */
async function callWithFallback<T>(
  apiCall: () => Promise<string>,
  mockCall: () => Promise<T>,
  parse: (raw: string) => T,
): Promise<T> {
  if (!hasApiKey()) return mockCall();
  try {
    const raw = await apiCall();
    return parse(raw);
  } catch (err) {
    console.warn('LLM API 调用失败，降级到 Mock:', err);
    return mockCall();
  }
}

/** 场景1：点击角色 → 小度百科知识 */
export async function fetchCharacterFact(
  characterLabel: string,
  pageText: string,
): Promise<CharacterFactResult> {
  return callWithFallback(
    () => callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildCharacterFactPrompt(characterLabel, pageText),
    }),
    () => mockCharacterFact(characterLabel),
    (raw) => parseLLMJson<CharacterFactResult>(raw),
  );
}

/** 场景2：角色对话 */
export async function chatWithCharacter(
  characterLabel: string,
  pageText: string,
  childMessage: string,
  chatHistory: string[] = [],
  characterPersonality?: string,
): Promise<CharacterChatResult> {
  const characterKey = characterLabel === '小熊' ? 'bear' : characterLabel === '小鸟' ? 'bird' : '';
  const personality = characterPersonality || CHARACTER_PERSONALITIES[characterKey] || `我是${characterLabel}，一个友善温暖、喜欢和小朋友聊天的绘本伙伴。`;

  return callWithFallback(
    () => callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildCharacterChatPrompt(characterLabel, personality, pageText, childMessage, chatHistory),
    }),
    () => mockCharacterChat(characterLabel, childMessage),
    (raw) => parseLLMJson<CharacterChatResult>(raw),
  );
}

/** 场景3：说一说 → 故事扩写 */
export async function continueStoryFromSpeech(
  currentPageText: string,
  childSpeechText: string,
  sessionHistory: string[] = [],
): Promise<StoryContinuationResult> {
  return callWithFallback(
    () => callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildStoryContinuationPrompt(currentPageText, childSpeechText, sessionHistory),
    }),
    () => mockStoryContinuation(childSpeechText),
    (raw) => parseLLMJson<StoryContinuationResult>(raw),
  );
}

/** 场景4：结尾总结 + 问题 */
export async function generateStorySummary(
  fullStoryText: string,
): Promise<StorySummaryResult> {
  const compactStoryText = fullStoryText.length > 6000
    ? `${fullStoryText.slice(0, 3000)}\n……\n${fullStoryText.slice(-2500)}`
    : fullStoryText;

  return callWithFallback(
    () => callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildStorySummaryPrompt(compactStoryText),
      maxTokens: 350,
    }),
    () => mockStorySummary(),
    (raw) => parseLLMJson<StorySummaryResult>(raw),
  );
}

/** 场景5：回答正向反馈 */
export async function generateAnswerFeedback(
  question: string,
  childAnswer: string,
): Promise<AnswerFeedbackResult> {
  return callWithFallback(
    () => callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildAnswerFeedbackPrompt(question, childAnswer),
    }),
    () => mockAnswerFeedback(childAnswer),
    (raw) => parseLLMJson<AnswerFeedbackResult>(raw),
  );
}

/** 场景7：小度助手 — 自由问答 */
export async function chatWithXiaodu(
  childMessage: string,
  chatHistory: string[] = [],
  contextText?: string,
): Promise<CharacterChatResult> {
  return callWithFallback(
    () => callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildXiaoduChatPrompt(childMessage, chatHistory, contextText),
    }),
    () => mockCharacterChat('小度', childMessage),
    (raw) => parseLLMJson<CharacterChatResult>(raw),
  );
}

/** 场景6：阅读绘本页面 → 看图讲故事 + 识别角色（使用 OpenAI 兼容视觉模型） */
export async function readBookPage(
  imageBase64: string,
  bookTitle: string,
  previousStory: string[],
  pageNumber: number,
  totalPages: number,
): Promise<{
  storyText: string;
  characters: Array<{
    id: string;
    name: string;
    type: 'animal' | 'object';
    persona: string;
    encyclopedia: string;
    avatar: string;
    position: { top: string; left: string; width: string; height: string };
  }>;
}> {
  if (!hasOpenAIKey()) return mockReadBookPage(pageNumber, totalPages);
  try {
    const raw = await callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildReadBookPagePrompt(bookTitle, previousStory, pageNumber, totalPages),
      images: [imageBase64],
      maxTokens: 1200,
    });
    return parseLLMJson(raw);
  } catch (err) {
    console.warn('绘本页面阅读 API 调用失败，降级到 Mock:', err);
    return mockReadBookPage(pageNumber, totalPages);
  }
}

/** 场景8：点击绘本画面 → 识别点击目标 */
export async function identifyClickedTarget(params: {
  imageBase64: string;
  x: number;
  y: number;
  pageText?: string;
  bookTitle?: string;
}): Promise<ClickedTargetResult> {
  if (!hasOpenAIKey()) return mockClickedTarget();
  try {
    const raw = await callLLMApi({
      systemPrompt: CHILD_SAFETY_SYSTEM,
      userPrompt: buildClickedTargetPrompt(params.x, params.y, params.pageText, params.bookTitle),
      images: [params.imageBase64],
      maxTokens: 500,
    });
    return parseLLMJson<ClickedTargetResult>(raw);
  } catch (err) {
    console.warn('点击目标识别失败，降级到 Mock:', err);
    return mockClickedTarget();
  }
}
