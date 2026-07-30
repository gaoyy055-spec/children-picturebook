import VoiceWave from './VoiceWave';
import styles from './StatusPill.module.css';

interface StatusPillProps {
  show: boolean;
  text: string;
}

export default function StatusPill({ show, text }: StatusPillProps) {
  return (
    <div className={`${styles.pill} ${show ? styles.show : ''}`}>
      <VoiceWave />
      <span className={styles.text}>{text}</span>
    </div>
  );
}
