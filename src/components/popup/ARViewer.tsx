import { motion } from 'framer-motion';
import Overlay from '../common/Overlay';
import { getARModelUrl } from '../../services/ar';
import styles from './ARViewer.module.css';

interface ARViewerProps {
  show: boolean;
  characterId: string;
  characterLabel: string;
  onClose: () => void;
}

export default function ARViewer({ show, characterId, characterLabel, onClose }: ARViewerProps) {
  const modelUrl = getARModelUrl(characterId);

  return (
    <Overlay show={show} position="center" onClose={onClose}>
      <motion.div
        className={styles.card}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.head}>
          <div className={styles.avatar}>🪄</div>
          <div>
            <div className={styles.title}>AR 小魔法</div>
            <div className={styles.sub}>把{characterLabel}请到你的房间里</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* model-viewer：需要在 index.html 引入 script */}
        <div className={styles.viewer} id="ar-viewer-container">
          {typeof window !== 'undefined' && customElements.get('model-viewer') ? (
            // @ts-ignore — model-viewer 是 Web Component
            <model-viewer
              src={modelUrl}
              alt={`${characterLabel}的3D模型`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px', borderRadius: '18px', background: '#EAF6FF' }}
            >
              <button slot="ar-button" className={styles.arBtn}>
                📱 让{characterLabel}出现在我房间里！
              </button>
            </model-viewer>
          ) : (
            <div className={styles.fallback}>
              <div className={styles.fallbackEmoji}>{characterId === 'bear' ? '🐻' : '🐦'}</div>
              <div className={styles.fallbackText}>3D 模型加载中...<br />请确保浏览器支持 WebXR</div>
            </div>
          )}
        </div>

        <div className={styles.note}>
          演示环境使用示例 3D 模型，正式版将替换为{characterLabel}的定制模型
        </div>
      </motion.div>
    </Overlay>
  );
}
