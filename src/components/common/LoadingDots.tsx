import styles from './LoadingDots.module.css';

export default function LoadingDots({ text = '小度正在想呢' }: { text?: string }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.dot} />
      <span className={styles.text}>{text}...</span>
    </div>
  );
}
