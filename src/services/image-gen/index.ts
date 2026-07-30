/**
 * DALL-E 3 图片生成服务
 * 调用 OpenAI Images API，为绘本每一页生成卡通插画
 */

import { buildIllustrationPrompt } from './prompts';

export interface ImageGenResult {
  url: string;           // 生成图片的临时 URL
  revisedPrompt?: string; // DALL-E 修正后的 prompt
}

export interface ImageGenProgress {
  current: number;       // 当前第几页（从 1 开始）
  total: number;         // 总页数
  pageId: number;        // 对应 BookPageData.id
  url: string;           // 生成结果 URL
}

// ---- 配置 ----

function getConfig() {
  const override = (window as any).__OPENAI_CONFIG;
  return {
    apiUrl: override?.apiUrl || import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1',
    apiKey: override?.apiKey || import.meta.env.VITE_OPENAI_API_KEY || '',
    model: override?.model || import.meta.env.VITE_IMAGE_MODEL || 'dall-e-3',
  };
}

export function hasImageGenKey(): boolean {
  return !!getConfig().apiKey;
}

// ---- 单页生成 ----

export async function generatePageImage(
  bookTitle: string,
  pageText: string,
  characterNames: string[],
  size: '1024x1024' | '1024x1792' | '1792x1024' = '1792x1024',
): Promise<ImageGenResult> {
  const config = getConfig();
  if (!config.apiKey) {
    throw new Error('OpenAI API Key 未配置，请设置 VITE_OPENAI_API_KEY');
  }

  const prompt = buildIllustrationPrompt(bookTitle, pageText, characterNames);

  const res = await fetch(`${config.apiUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      prompt,
      n: 1,
      size,
      quality: 'standard',
      style: 'vivid',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`DALL-E 请求失败 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const imageData = data.data?.[0];
  if (!imageData?.url) {
    throw new Error('DALL-E 返回数据异常：缺少图片 URL');
  }

  return {
    url: imageData.url,
    revisedPrompt: imageData.revised_prompt,
  };
}

// ---- 整本生成（逐页） ----

export interface PageInput {
  id: number;
  text: string;
  characterNames: string[];
}

/**
 * 为绘本所有页面生成插画，逐页回调进度
 */
export async function generateBookIllustrations(
  bookTitle: string,
  pages: PageInput[],
  onProgress?: (progress: ImageGenProgress) => void,
  size: '1024x1024' | '1024x1792' | '1792x1024' = '1792x1024',
): Promise<Map<number, string>> {
  const result = new Map<number, string>(); // pageId → imageUrl
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    try {
      const gen = await generatePageImage(bookTitle, page.text, page.characterNames, size);
      result.set(page.id, gen.url);
      onProgress?.({ current: i + 1, total, pageId: page.id, url: gen.url });
    } catch (err) {
      console.warn(`第 ${page.id} 页图片生成失败:`, err);
      // 单页失败跳过，保留原图
      onProgress?.({ current: i + 1, total, pageId: page.id, url: '' });
    }
  }

  return result;
}
