import { motion } from 'framer-motion';
import type { Hotspot } from '../../types';
import styles from './Hotspot.module.css';

interface HotspotProps {
  hotspot: Hotspot;
  onClick: (hotspot: Hotspot) => void;
}

export default function HotspotComponent({ hotspot, onClick }: HotspotProps) {
  return (
    <motion.div
      className={styles.hotspot}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: `${hotspot.w * 100}%`,
        height: `${hotspot.h * 100}%`,
      }}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => onClick(hotspot)}
      role="button"
      aria-label={`点击了解${hotspot.label}`}
      tabIndex={0}
    >
      <div className={styles.ring} />
      <div className={styles.spark}>{hotspot.emoji}</div>
    </motion.div>
  );
}
