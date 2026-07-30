import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <span className={styles.mascot}>🐻</span>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.mascot}>🐦</span>
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
