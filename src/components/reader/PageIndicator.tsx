import styles from './PageIndicator.module.css';

interface PageIndicatorProps {
  current: number;
  total: number;
}

export default function PageIndicator({ current, total }: PageIndicatorProps) {
  return (
    <div className={styles.wrap}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`${styles.dot} ${i === current ? styles.active : ''}`}
        />
      ))}
    </div>
  );
}
