/**
 * 图片生成 Prompt — 根据绘本文字生成 DALL-E 卡通插画
 */

/** 构建单页绘本插画 Prompt */
export function buildIllustrationPrompt(
  bookTitle: string,
  pageText: string,
  characterNames: string[],
): string {
  const charHint = characterNames.length > 0
    ? `The main characters in this scene are: ${characterNames.join(', ')}. Make sure they are prominently featured as cute cartoon animals/objects.`
    : '';

  return `Create a children's picture book illustration in a warm, bright, and colorful cartoon style suitable for kids aged 3-6.

Book title: "${bookTitle}"
Scene description: ${pageText}

${charHint}

Style requirements:
- Soft, rounded shapes with thick outlines
- Warm, pastel color palette (light blues, soft greens, warm yellows, gentle pinks)
- Expressive, cute character faces with big eyes
- Simple, child-friendly composition with clear focal points
- Hand-drawn watercolor-like texture
- No text, words, or letters in the image
- Whimsical, magical atmosphere with subtle sparkle effects
- Background should be lush and detailed but not overwhelming

The illustration should feel like a page from a beloved children's picture book, full of wonder and warmth.`;
}
