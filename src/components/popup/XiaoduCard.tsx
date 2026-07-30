import { motion } from 'framer-motion';
import Overlay from '../common/Overlay';
import LoadingDots from '../common/LoadingDots';
import PillButton from '../common/PillButton';
import { speak } from '../../services/tts';
import type { CharacterFactResult } from '../../types';
import styles from './XiaoduCard.module.css';

interface XiaoduCardProps {
  show: boolean;
  characterLabel: string;
  emoji: string;
  result: CharacterFactResult | null;
  loading: boolean;
  onAR: () => void;
  onClose: () => void;
}

export default function XiaoduCard({ show, characterLabel, result, loading, onAR, onClose }: XiaoduCardProps) {
  return (
    <Overlay show={show} onClose={onClose}>
      <motion.div
        className={styles.card}
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.head}>
          <div className={styles.avatar}>🤖</div>
          <div>
            <div className={styles.title}>小度百科</div>
            <div className={styles.sub}>关于{characterLabel}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <LoadingDots text="小度正在想呢" />
          ) : result ? (
            result.factText
          ) : null}
        </div>

        {result?.followUpQuestion && (
          <div className={styles.question}>
            💬 {result.followUpQuestion}
          </div>
        )}

        <div className={styles.actions}>
          <PillButton variant="secondary" icon="🔊" onClick={() => result && speak(result.factText)}>
            再听一次
          </PillButton>
          <PillButton variant="ar" icon="📱" onClick={onAR}>
            看看AR
          </PillButton>
        </div>
      </motion.div>
    </Overlay>
  );
}
