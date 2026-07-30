import styles from './ControlBar.module.css';
import MicButton from '../voice/MicButton';
import type { ReadingMode } from '../../types';

interface ControlBarProps {
  mode: ReadingMode;
  onMicPress: () => void;
  onReplay: () => void;
  onSummary: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export default function ControlBar({
  mode,
  onMicPress,
  onReplay,
  onSummary,
  onNextPage,
  onPrevPage,
  canGoPrev,
  canGoNext,
}: ControlBarProps) {
  return (
    <div className={styles.bar}>
      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onPrevPage}
        disabled={!canGoPrev}
        aria-label="上一页"
      >
        ◀
      </button>
      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onReplay}
        aria-label="重新朗读"
      >
        🔁
      </button>
      <MicButton active={mode === 'tell'} onPress={onMicPress} />
      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onNextPage}
        disabled={!canGoNext}
        aria-label="下一页"
      >
        ▶
      </button>
      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onSummary}
        aria-label="故事总结"
      >
        📖
      </button>
    </div>
  );
}
