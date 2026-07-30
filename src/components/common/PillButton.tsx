import styles from './PillButton.module.css';

interface PillButtonProps {
  variant?: 'primary' | 'secondary' | 'ar';
  icon?: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export default function PillButton({ variant = 'primary', icon, children, onClick, disabled }: PillButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
