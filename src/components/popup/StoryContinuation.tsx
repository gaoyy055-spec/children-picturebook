import { useState } from 'react';
import { motion } from 'framer-motion';
import Overlay from '../common/Overlay';
import LoadingDots from '../common/LoadingDots';
import { isASRAvailable } from '../../services/asr';
import type { StoryContinuationResult, SessionHistoryEntry } from '../../types';
import styles from './StoryContinuation.module.css';

interface StoryContinuationProps {
  show: boolean;
  result: StoryContinuationResult | null;
  loading: boolean;
  sessionHistory: SessionHistoryEntry[];
  fallbackText: string;
  onVoiceInput: () => void;
  onTextSubmit: (text: string) => void;
  onClose: () => void;
}

export default function StoryContinuation({
  show,
  result,
  loading,
  sessionHistory,
  onTextSubmit,
  onClose,
}: StoryContinuationProps) {
  const [textInput, setTextInput] = useState('');

  return (
    <Overlay show={show} onClose={onClose}>
      <motion.div
        className={styles.card}
        initial={{ y: 30 }}
        animate={{ y: 0 }}
      >
        <div className={styles.head}>
          <div className={styles.avatar}>🎨</div>
          <div>
            <div className={styles.title}>故事接龙</div>
            <div className={styles.sub}>大胆说出你的想法吧</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <LoadingDots text="小度正在编故事啦" />
          ) : result ? (
            <>
              <div className={styles.story}>{result.storyContinuation}</div>
              <div className={styles.encouragement}>{result.encouragement}</div>
            </>
          ) : (
            <LoadingDots text="正在聆听你的故事" />
          )}
        </div>

        {result?.nextQuestion && (
          <div className={styles.question}>
            💬 {result.nextQuestion}
          </div>
        )}

        {/* 续编历史 */}
        {sessionHistory.length > 0 && (
          <div className={styles.history}>
            {sessionHistory.map((h, i) => (
              <div key={i} className={styles.historyItem}>
                <span className={styles.who}>你说：</span>{h.child}
                <br />
                <span className={styles.storyLabel}>📖</span> {h.storyContinuation}
              </div>
            ))}
          </div>
        )}

        {/* 文字输入兜底 */}
        {!isASRAvailable() && (
          <div className={styles.inputArea}>
            <input
              className={styles.input}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && textInput.trim() && onTextSubmit(textInput.trim())}
              placeholder="在这里输入你想说的话..."
            />
            <button
              className={styles.sendBtn}
              onClick={() => { if (textInput.trim()) { onTextSubmit(textInput.trim()); setTextInput(''); } }}
            >
              发送
            </button>
          </div>
        )}
      </motion.div>
    </Overlay>
  );
}
