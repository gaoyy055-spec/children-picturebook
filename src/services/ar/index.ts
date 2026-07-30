/**
 * AR 服务 — model-viewer 管理
 */

interface ARTarget {
  name: string;
  avatar: string;
  type: 'animal' | 'object' | 'background';
}

/** AR 模型 URL（演示用占位） */
const DEMO_MODEL_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

const AR_MODELS: Record<string, string> = {
  bear: DEMO_MODEL_URL,
  bird: DEMO_MODEL_URL,
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function textToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

function createTargetTexture(target: ARTarget): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const color = target.type === 'animal' ? '#FDBA74' : target.type === 'object' ? '#A7F3D0' : '#BFDBFE';
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#FDF2F8');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, 1024, 1024, 120);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.beginPath();
  ctx.arc(512, 380, 245, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '260px Arial, sans-serif';
  ctx.fillText(target.avatar || (target.type === 'background' ? '🖼️' : '✨'), 512, 390);

  ctx.fillStyle = '#5B3418';
  ctx.font = '800 92px Arial, sans-serif';
  ctx.fillText(target.name.slice(0, 8), 512, 750);

  ctx.fillStyle = '#7C2D12';
  ctx.font = '42px Arial, sans-serif';
  ctx.fillText('我的3D/AR形象', 512, 850);

  return canvas.toDataURL('image/png');
}

/**
 * 为点击目标动态生成一个轻量 3D 卡片模型。
 * 不是图库素材检索，而是把识别出的目标名和 emoji 做成可旋转/AR 的 3D 展示牌。
 */
function createTargetCardModel(target: ARTarget): string {
  const textureUrl = createTargetTexture(target);
  if (!textureUrl) return DEMO_MODEL_URL;

  const positions = new Float32Array([
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0,
    -1, 1, 0,
  ]);
  const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ]);
  const uvs = new Float32Array([
    0, 1,
    1, 1,
    1, 0,
    0, 0,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const positionOffset = 0;
  const normalOffset = positionOffset + positions.byteLength;
  const uvOffset = normalOffset + normals.byteLength;
  const indexOffset = uvOffset + uvs.byteLength;
  const totalLength = indexOffset + indices.byteLength;

  const buffer = new ArrayBuffer(totalLength);
  new Float32Array(buffer, positionOffset, positions.length).set(positions);
  new Float32Array(buffer, normalOffset, normals.length).set(normals);
  new Float32Array(buffer, uvOffset, uvs.length).set(uvs);
  new Uint16Array(buffer, indexOffset, indices.length).set(indices);

  const gltf = {
    asset: { version: '2.0', generator: 'children-picturebook' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, scale: [1.25, 1.25, 1.25] }],
    meshes: [{
      primitives: [{
        attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
        indices: 3,
        material: 0,
      }],
    }],
    materials: [{
      doubleSided: true,
      pbrMetallicRoughness: {
        baseColorTexture: { index: 0 },
        metallicFactor: 0,
        roughnessFactor: 0.35,
      },
    }],
    textures: [{ source: 0 }],
    images: [{ uri: textureUrl }],
    buffers: [{
      uri: `data:application/octet-stream;base64,${bytesToBase64(new Uint8Array(buffer))}`,
      byteLength: totalLength,
    }],
    bufferViews: [
      { buffer: 0, byteOffset: positionOffset, byteLength: positions.byteLength, target: 34962 },
      { buffer: 0, byteOffset: normalOffset, byteLength: normals.byteLength, target: 34962 },
      { buffer: 0, byteOffset: uvOffset, byteLength: uvs.byteLength, target: 34962 },
      { buffer: 0, byteOffset: indexOffset, byteLength: indices.byteLength, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [-1, -1, 0], max: [1, 1, 0] },
      { bufferView: 1, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 4, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 6, type: 'SCALAR' },
    ],
  };

  return `data:model/gltf+json;base64,${textToBase64(JSON.stringify(gltf))}`;
}

export function getARModelUrl(characterId: string, target?: ARTarget): string {
  if (AR_MODELS[characterId]) return AR_MODELS[characterId];
  if (target) return createTargetCardModel(target);
  return DEMO_MODEL_URL;
}

/** 检测浏览器是否支持 WebXR AR */
export function isARSupported(): boolean {
  return 'xr' in navigator;
}
