// 全局类型定义

/** 热区坐标（归一化 0~1） */
export interface Hotspot {
  id: string;
  label: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
  arModelUrl?: string;
}

/** 绘本单页数据 */
export interface BookPage {
  pageId: string;
  /** 内联 SVG 场景，或图片 URL */
  sceneSvg: string;
  text: string;
  hotspots: Hotspot[];
}

/** 绘本整本数据 */
export interface BookData {
  bookId: string;
  title: string;
  subtitle: string;
  pages: BookPage[];
}

/** 阅读模式 */
export type ReadingMode = 'listen' | 'tell';

/** 语音状态 */
export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'unsupported';

/** LLM 返回 — 角色百科 */
export interface CharacterFactResult {
  factText: string;
  followUpQuestion?: string;
  emotionTag?: string;
}

/** LLM 返回 — 故事扩写 */
export interface StoryContinuationResult {
  storyContinuation: string;
  encouragement: string;
  nextQuestion: string;
  emotionTag?: string;
}

/** LLM 返回 — 角色对话 */
export interface CharacterChatResult {
  reply: string;
  emotionTag?: string;
}

/** LLM 返回 — 结尾总结 */
export interface StorySummaryResult {
  moralSummary: string;
  questions: string[];
}

/** LLM 返回 — 回答反馈 */
export interface AnswerFeedbackResult {
  feedbackText: string;
  emotionTag?: string;
}

/** 会话历史条目 */
export interface SessionHistoryEntry {
  child: string;
  storyContinuation: string;
  encouragement: string;
  nextQuestion: string;
}

/** LLM 返回 — 点击图片目标识别 */
export interface ClickedTargetResult {
  id?: string;
  name: string;
  type: 'animal' | 'object' | 'background';
  persona: string;
  encyclopedia: string;
  avatar: string;
  confidence?: number;
  arModelUrl?: string;
}

/** LLM 服务配置 */
export interface LLMConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}
