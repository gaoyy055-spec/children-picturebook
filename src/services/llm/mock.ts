/**
 * LLM 服务 — Mock 数据（离线演示 / API 不可用时降级）
 */

import type {
  CharacterFactResult,
  StoryContinuationResult,
  CharacterChatResult,
  StorySummaryResult,
  AnswerFeedbackResult,
  ClickedTargetResult,
} from '../../types';

const MOCK_DELAY = 1200; // 模拟网络延迟

function delay(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockFacts: Record<string, CharacterFactResult> = {
  bear: {
    factText: '小熊是森林里最温暖的朋友！熊的鼻子特别灵敏，能闻到很远很远的地方飘来的蜂蜜香味呢！嘿嘿～',
    followUpQuestion: '你知道小熊最喜欢吃什么吗？',
    emotionTag: 'happy',
  },
  bird: {
    factText: '小鸟的翅膀可厉害啦！鸟的骨头里面是空的，所以它们身体很轻，能飞得高高的！叽叽～',
    followUpQuestion: '你觉得小鸟飞起来像什么呢？',
    emotionTag: 'curious',
  },
};

export async function mockCharacterFact(characterLabel: string): Promise<CharacterFactResult> {
  await delay();
  const key = characterLabel === '小熊' ? 'bear' : characterLabel === '小鸟' ? 'bird' : 'bear';
  return mockFacts[key] || mockFacts.bear;
}

export async function mockStoryContinuation(childText: string): Promise<StoryContinuationResult> {
  await delay();
  return {
    storyContinuation: `${childText}——就这样，小熊和小鸟在森林里开心地玩了起来。它们一起采了好多漂亮的花，还追着蝴蝶跑了好远好远！`,
    encouragement: `你说得太棒啦！小熊和小鸟都觉得你的故事特别有意思！`,
    nextQuestion: '接下来它们还会遇到什么有趣的事呢？',
    emotionTag: 'excited',
  };
}

export async function mockCharacterChat(characterLabel: string, childMessage: string): Promise<CharacterChatResult> {
  await delay();
  const replies: Record<string, string> = {
    bear: `嘿嘿，你说的"${childMessage}"太有意思啦！我小熊最喜欢跟朋友聊天了，来，我们再聊聊！`,
    bird: `叽叽！你问的"${childMessage}"好有趣呀！我飞过好多地方，让我想想怎么跟你说～`,
  };
  return {
    reply: replies[characterLabel === '小熊' ? 'bear' : 'bird'] || replies.bear,
    emotionTag: 'happy',
  };
}

export async function mockStorySummary(): Promise<StorySummaryResult> {
  await delay();
  return {
    moralSummary: '这个故事告诉我们：当朋友需要帮助的时候，伸出援手就是最最了不起的事情！帮助别人会让自己也很开心哦！',
    questions: ['如果你遇到受伤的小动物，你会怎么做呢？', '你有没有帮助过别人呀？说说看！'],
  };
}

export async function mockAnswerFeedback(childAnswer: string): Promise<AnswerFeedbackResult> {
  await delay();
  return {
    feedbackText: `哇，你说"${childAnswer}"——这也太棒了吧！你一定是个特别善良、特别有爱心的小朋友！小度给你竖大拇指！`,
    emotionTag: 'happy',
  };
}

/** Mock：阅读绘本页面 → 朗读画面 + 识别角色 */
export async function mockReadBookPage(
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
  await delay(1800);
  const isFirst = pageNumber === 1;
  const isLast = pageNumber === totalPages;
  return {
    storyText: isFirst
      ? '小朋友们，我们的绘本之旅开始啦！翻开第一页，哇，画面好漂亮呀！你看，那里有一个可爱的小家伙，正蹦蹦跳跳地跑过来呢！周围的草地绿油油的，还有五颜六色的小花在随风摇摆，好像在说"欢迎你来呀"！'
      : isLast
        ? '故事到这里就要结束啦！哇，最后一页的画面好温馨呀！小朋友们，你们喜欢这个故事吗？'
        : '再翻一页，咦，这一页又有什么新鲜事呢？哇，画面里好像发生了有趣的事情！让我们仔细看看，这里都有什么呢？',
    characters: [
      {
        id: 'c1',
        name: '小主角',
        type: 'animal',
        persona: '我是一个好奇又勇敢的小家伙，最喜欢探索新事物啦！',
        encyclopedia: '很多小动物生下来不久就会自己走路和吃东西，它们可厉害啦！',
        avatar: '🐾',
        position: { top: '35%', left: '25%', width: '25%', height: '35%' },
      },
    ],
  };
}

/** Mock：点击图片目标识别 */
export async function mockClickedTarget(): Promise<ClickedTargetResult> {
  await delay();
  return {
    name: '画面背景',
    type: 'background',
    persona: '我是这幅画里的背景，藏着好多故事线索呢！',
    encyclopedia: '背景能告诉我们故事发生在哪里，也能让故事更有画面感。',
    avatar: '🖼️',
    confidence: 0.5,
  };
}
