import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Overlay.module.css';

interface OverlayProps {
  show: boolean;
  children: ReactNode;
  position?: 'bottom' | 'center';
  onClose: () => void;
}

export default function Overlay({ show, children, position = 'bottom', onClose }: OverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`${styles.overlay} ${position === 'center' ? styles.center : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
