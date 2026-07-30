/**
 * 视觉识别服务 — Mock（演示用预置坐标）
 * 后续可替换为视觉大模型 Grounding 接口
 */

import type { Hotspot } from '../../types';

/** 预置角色坐标（由视觉大模型离线预处理生成） */
export function getPresetHotspots(): Hotspot[] {
  return [
    { id: 'bear', label: '小熊', emoji: '🐻', x: 0.145, y: 0.58, w: 0.175, h: 0.3 },
    { id: 'bird', label: '小鸟', emoji: '🐦', x: 0.68, y: 0.36, w: 0.12, h: 0.18 },
  ];
}

/** 模拟视觉识别延迟 */
export async function detectHotspots(_imageUrl: string): Promise<Hotspot[]> {
  await new Promise((r) => setTimeout(r, 800));
  return getPresetHotspots();
}
