import styles from './StoryBubble.module.css';

interface StoryBubbleProps {
  pageLabel: string;
  text: string;
}

export default function StoryBubble({ pageLabel, text }: StoryBubbleProps) {
  return (
    <div className={styles.bubble}>
      <span className={styles.tag}>{pageLabel}</span>
      <div className={styles.text}>{text}</div>
    </div>
  );
}
