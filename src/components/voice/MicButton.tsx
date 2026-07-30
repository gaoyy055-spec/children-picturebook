import { motion } from 'framer-motion';
import styles from './MicButton.module.css';

interface MicButtonProps {
  active: boolean;
  isListening?: boolean;
  onPress: () => void;
}

export default function MicButton({ active, isListening = false, onPress }: MicButtonProps) {
  return (
    <motion.button
      className={`${styles.btn} ${isListening ? styles.listening : ''}`}
      onClick={onPress}
      whileTap={{ scale: 0.9 }}
      animate={isListening ? { boxShadow: ['0 0 0 0 rgba(79,190,135,0.5)', '0 0 0 18px rgba(79,190,135,0)', '0 0 0 0 rgba(79,190,135,0.5)'] } : {}}
      transition={isListening ? { duration: 1.1, repeat: Infinity } : { duration: 0.15 }}
      aria-label={active ? '按下说出你的故事' : '按住可提问小度'}
    >
      🎙️
    </motion.button>
  );
}
