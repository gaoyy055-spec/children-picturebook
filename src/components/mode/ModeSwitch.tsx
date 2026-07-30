import { useReadingStore } from '../../stores/readingStore';
import styles from './ModeSwitch.module.css';

export default function ModeSwitch() {
  const mode = useReadingStore((s) => s.mode);
  const setMode = useReadingStore((s) => s.setMode);

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.btn} ${mode === 'listen' ? styles.active : ''}`}
        onClick={() => setMode('listen')}
      >
        🎧 听一听
      </button>
      <button
        className={`${styles.btn} ${mode === 'tell' ? styles.active : ''}`}
        onClick={() => setMode('tell')}
      >
        🎙️ 说一说
      </button>
    </div>
  );
}
