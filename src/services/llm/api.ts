/**
 * LLM 服务 — 真实 API 调用
 * 文字对话：使用 Anthropic Claude（VITE_LLM_API_KEY）
 * 图片解读：使用 OpenAI GPT-4o（VITE_OPENAI_API_KEY）
 */

interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  /** 图片 base64 列表（用于视觉识别，走 GPT-4o） */
  images?: string[];
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getAnthropicConfig() {
  const override = (window as any).__LLM_CONFIG;
  return {
    apiUrl: override?.apiUrl || import.meta.env.VITE_LLM_API_URL || 'https://api.anthropic.com/v1/messages',
    apiKey: override?.apiKey || import.meta.env.VITE_LLM_API_KEY || '',
    model: override?.model || import.meta.env.VITE_LLM_MODEL || 'claude-sonnet-4-6',
  };
}

function getOpenAIConfig() {
  return {
    apiUrl: import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_IMAGE_MODEL || 'gpt-4o',
  };
}

/** 调用 OpenAI GPT-4o 视觉 API（带图片） */
async function callOpenAIVision({ systemPrompt, userPrompt, maxTokens, images }: Required<LLMRequest>): Promise<string> {
  const config = getOpenAIConfig();
  if (!config.apiKey) throw new Error('OpenAI API Key 未配置，请设置 VITE_OPENAI_API_KEY 环境变量');

  const imageBlocks = images.map((img) => ({
    type: 'image_url',
    image_url: { url: `data:image/jpeg;base64,${img}`, detail: 'high' },
  }));

  const res = await fetchWithTimeout(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [...imageBlocks, { type: 'text', text: userPrompt }] },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI 请求失败 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/** 调用 Anthropic Claude API（纯文字） */
async function callAnthropicApi({ systemPrompt, userPrompt, maxTokens }: Omit<LLMRequest, 'images'>): Promise<string> {
  const config = getAnthropicConfig();
  if (!config.apiKey) throw new Error('LLM API Key 未配置，请设置 VITE_LLM_API_KEY 环境变量');

  const res = await fetchWithTimeout(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens || 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: [{ type: 'text', text: userPrompt }] }],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LLM 请求失败 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return (data.content || []).map((b: any) => b.text || '').join('\n');
}

/** 调用 OpenAI 兼容文本 API（纯文字） */
async function callOpenAIText({ systemPrompt, userPrompt, maxTokens }: Omit<LLMRequest, 'images'>): Promise<string> {
  const config = getOpenAIConfig();
  if (!config.apiKey) throw new Error('OpenAI API Key 未配置');

  const res = await fetchWithTimeout(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens || 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI 文本请求失败 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/** 统一入口：有图片走 OpenAI 兼容视觉；无图片优先 Claude，没有 Claude key 时走 OpenAI 兼容文本 */
export async function callLLMApi({ systemPrompt, userPrompt, maxTokens = 600, images }: LLMRequest): Promise<string> {
  if (images && images.length > 0) {
    return callOpenAIVision({ systemPrompt, userPrompt, maxTokens, images });
  }

  const anthropicConfig = getAnthropicConfig();
  if (anthropicConfig.apiKey) {
    return callAnthropicApi({ systemPrompt, userPrompt, maxTokens });
  }
  return callOpenAIText({ systemPrompt, userPrompt, maxTokens });
}

/**
 * 专用：用 gpt-5.5 对单张绘本图片生成儿童讲解文字（直接返回文本，不解析 JSON）
 */
export async function explainPageWithGPT(imageBase64: string): Promise<string> {
  const config = getOpenAIConfig();
  if (!config.apiKey) throw new Error('OpenAI API Key 未配置');

  const res = await fetchWithTimeout(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
            },
            {
              type: 'text',
              text: '假设你是一位儿童故事大王，针对当前页面的这一页的绘本图片，为儿童生成讲解内容，100-150字，用富有童趣的话讲述。只输出讲解正文，不要加任何前缀或说明。',
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`请求失败 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

/** 从 LLM 返回文本中解析 JSON */
export function parseLLMJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('无法解析 LLM 输出为 JSON');
  }
}
