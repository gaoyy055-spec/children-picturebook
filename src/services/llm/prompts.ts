/**
 * LLM 服务 — Prompt 模板
 * 所有 Prompt 内置儿童安全护栏
 */

export const CHILD_SAFETY_SYSTEM = `你是绘本APP里的智能助手"小度"，正在和一个3-8岁的小朋友对话。
要求：
1. 用极简单、生动、口语化的中文，句子不超过2-3句，避免复杂词汇。
2. 语气亲切、充满鼓励，可以用一些拟声词和感叹号。
3. 内容必须绝对安全，不涉及暴力、恐怖、悲伤死亡、成人话题。
4. 只输出要求的JSON格式，不要输出多余文字，不要用Markdown代码块包裹。`;

/** 场景1：点击角色热区 → 小度百科知识 */
export function buildCharacterFactPrompt(characterLabel: string, pageText: string): string {
  return `绘本当前页内容："${pageText}"
小朋友点击了角色："${characterLabel}"
请生成一段关于"${characterLabel}"的趣味小知识（结合当前故事情节，适合3-8岁儿童），并生成1个简单的引导性小问题。

请严格只输出如下结构的JSON：
{"factText": "趣味知识正文", "followUpQuestion": "引导小问题", "emotionTag": "happy或curious或gentle"}`;
}

/** 场景2：角色对话 — 以角色人格回答 */
export function buildCharacterChatPrompt(
  characterLabel: string,
  characterPersonality: string,
  pageText: string,
  childMessage: string,
  chatHistory: string[]
): string {
  return `你现在不是小度，你是绘本里的角色"${characterLabel}"。
角色性格设定：${characterPersonality}
当前绘本页内容："${pageText}"
之前的对话：${chatHistory.length > 0 ? JSON.stringify(chatHistory.slice(-4)) : '无'}
小朋友对你说："${childMessage}"

请用"${characterLabel}"的语气和口吻回答小朋友（要符合角色性格设定，语言简单可爱），同时输出一个emotionTag。

请严格只输出如下结构的JSON：
{"reply": "角色的回答内容", "emotionTag": "happy或curious或gentle或excited"}`;
}

/** 场景3：说一说模式 — 语音续编故事 */
export function buildStoryContinuationPrompt(
  currentPageText: string,
  childSpeechText: string,
  sessionHistory: string[]
): string {
  return `绘本原文（当前进度）："${currentPageText}"
小朋友用语音说了接下来的想法："${childSpeechText}"
最近的故事扩写历史：${sessionHistory.length > 0 ? JSON.stringify(sessionHistory.slice(-3)) : '无'}

请：
1. 结合小朋友的想法，自然地扩写接下来的故事情节（3-4句话，生动有画面感）。
2. 给小朋友一句真诚具体的夸奖（要针对TA说的内容，不要泛泛而谈）。
3. 生成一个新的开放式引导问题，邀请小朋友继续编故事。

请严格只输出如下结构的JSON：
{"storyContinuation": "扩写故事内容", "encouragement": "夸奖语", "nextQuestion": "下一个引导问题", "emotionTag": "happy或curious或excited"}`;
}

/** 场景4：结尾总结 + 互动问题 */
export function buildStorySummaryPrompt(fullStoryText: string): string {
  return `请先阅读下面这本绘本的内容，再从3-8岁小朋友的角度总结故事道理。

绘本内容："${fullStoryText}"

请完成两个任务：

【任务1：小度道理】
用“小度”的口吻，告诉小朋友这本绘本讲了什么道理。要求：
- 只写1个最核心的道理，不要列很多点
- 2-3句话，每句话都要短，像对小朋友说话
- 用通俗易懂的话，不要用“品质、价值观、启发”等大词
- 必须结合绘本内容，不能写空泛鸡汤
- 语气温暖、鼓励、适合直接显示在“小度道理”页面

【任务2：互动问题】
生成1个小朋友容易回答的问题。要求：
- 和故事道理相关
- 让小朋友说说自己会怎么做
- 句子短，不要超过25个字

请严格只输出如下结构的JSON：
{"moralSummary": "小度道理正文", "questions": ["互动问题"]}`;
}

/** 场景5：对儿童回答做正向反馈 */
export function buildAnswerFeedbackPrompt(question: string, childAnswer: string): string {
  return `提出的问题："${question}"
小朋友的回答："${childAnswer}"
请给出真诚、具体、充满鼓励的反馈，即使回答很简单也要找到闪光点夸奖，语气要非常温暖。

请严格只输出如下结构的JSON：
{"feedbackText": "鼓励反馈内容", "emotionTag": "happy或gentle"}`;
}

/** 角色人格设定 */
export const CHARACTER_PERSONALITIES: Record<string, string> = {
  bear: '小熊是森林里最温暖善良的朋友，说话慢悠悠的，喜欢用"嘿嘿"笑，特别关心朋友，经常分享蜂蜜。',
  bird: '小鸟活泼机灵，说话快快的，喜欢叽叽喳喳唱歌，对世界充满好奇，飞到哪里都要探索一番。',
};

/** 场景7：小度助手 — 自由问答 */
export function buildXiaoduChatPrompt(
  childMessage: string,
  chatHistory: string[],
  contextText?: string,
): string {
  return `${contextText ? `当前绘本内容："${contextText}"\n` : ''}之前的对话：${chatHistory.length > 0 ? JSON.stringify(chatHistory.slice(-6)) : '无'}
小朋友说："${childMessage}"

请以"小度"的身份回答小朋友的问题。小度是一个温暖、聪明、充满好奇心的小助手，喜欢用简单有趣的方式解答小朋友的各种问题。
要求：
1. 用简单生动的语言回答，句子不要太长。
2. 语气亲切可爱，可以用一些拟声词和感叹号。
3. 如果小朋友的问题和当前绘本有关，结合绘本内容来回答。
4. 可以在回答末尾加一个小问题引导小朋友继续思考。
5. 如果小朋友没有问具体问题，就主动聊聊绘本里的有趣内容。

请严格只输出如下结构的JSON：
{"reply": "小度的回答", "emotionTag": "happy或curious或gentle或excited"}`;
}

/**
 * 场景6：阅读绘本页面 → 看图朗读 + 识别角色
 * 把图片内容绘声绘色地讲出来，让孩子只听不看也能知道画面
 */
export function buildReadBookPagePrompt(
  bookTitle: string,
  previousStory: string[],
  pageNumber: number,
  totalPages: number,
): string {
  const isFirst = pageNumber === 1;
  const isLast = pageNumber === totalPages;

  const contextBlock = previousStory.length > 0
    ? `【故事背景（前面已经讲过的内容，仅供参考角色名字和故事走向）】\n${previousStory.map((t, i) => `第${i + 1}页：${t}`).join('\n')}\n`
    : '';

  const positionNote = isFirst
    ? '这是故事第一页，请重点介绍主人公和场景，激发小朋友的好奇心。'
    : isLast
      ? '这是故事最后一页，请给故事一个温暖圆满的结尾。'
      : `这是第 ${pageNumber} 页，请自然承接前面的故事情节。`;

  return `你正在讲《${bookTitle}》这本绘本的第 ${pageNumber} / ${totalPages} 页。

${contextBlock}
${positionNote}

**任务1：绘本讲解**
假设你是一位儿童故事大王，针对绘本当前展示的这一页的图片内容和图片中的文字信息，为儿童生成绘本讲解，200字以内，要求：绘声绘色地为儿童读者讲解绘本的内容，用富有童趣的风格讲述。

**任务2：识别图中角色**
只列出这张图中实际出现的角色或物品（1-3个）：
- name: 角色名称
- type: "animal" 或 "object"
- persona: 1句话的角色性格（用角色自己的口吻）
- encyclopedia: 关于这个角色的1句趣味知识
- avatar: 最贴切的emoji
- position: 角色在画面中的位置（百分比 top/left/width/height）

内容安全：不涉及暴力、恐怖、死亡、成人内容。

请只输出如下JSON，不要输出其他文字：
{
  "storyText": "这一页的绘本讲解（200字以内，基于当前页图片内容和图片中的文字信息，绘声绘色、富有童趣）",
  "characters": [
    {
      "id": "c1",
      "name": "角色名",
      "type": "animal",
      "persona": "角色性格",
      "encyclopedia": "趣味知识",
      "avatar": "emoji",
      "position": { "top": "30%", "left": "20%", "width": "25%", "height": "30%" }
    }
  ]
}`;
}

/** 场景8：点击绘本画面 → 识别点击目标 */
export function buildClickedTargetPrompt(
  x: number,
  y: number,
  pageText?: string,
  bookTitle?: string,
): string {
  return `你正在看一本儿童绘本${bookTitle ? `《${bookTitle}》` : ''}的一页图片。
小朋友点击了图片中的一个位置：横向 ${x}%，纵向 ${y}%。
${pageText ? `当前页已有讲解/文字："${pageText}"` : ''}

请仔细观察图片，并判断小朋友点击的位置最可能是什么：
- 如果点在动物、人物或拟人角色上，识别具体角色，例如"小猫"、"野猪"、"小女孩"。
- 如果点在物品上，识别具体物品，例如"蘑菇"、"小火车"、"月亮"。
- 如果点在天空、森林、海底、房间、草地等环境区域上，请识别为背景，例如"森林背景"、"天空背景"。
- 如果不确定，请选择最接近点击位置的可见主体或背景，不要编造图片里没有的东西。

请为这个点击目标生成：
1. name：适合孩子理解的中文名称
2. type：只能是 "animal"、"object" 或 "background"
3. persona：一句角色/目标自我介绍，方便后续"聊一聊"
4. encyclopedia：一句适合3-8岁儿童的小百科
5. avatar：一个最贴切的emoji
6. confidence：0到1之间的置信度

请严格只输出如下JSON，不要输出其他文字：
{"name":"点击目标名称","type":"animal","persona":"一句角色口吻设定","encyclopedia":"一句儿童百科","avatar":"emoji","confidence":0.9}`;
}
