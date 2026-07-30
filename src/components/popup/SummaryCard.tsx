import { useState } from 'react';
import { motion } from 'framer-motion';
import Overlay from '../common/Overlay';
import LoadingDots from '../common/LoadingDots';
import PillButton from '../common/PillButton';
import { isASRAvailable } from '../../services/asr';
import { useReadingStore } from '../../stores/readingStore';
import type { StorySummaryResult, AnswerFeedbackResult } from '../../types';
import styles from './SummaryCard.module.css';

interface SummaryCardProps {
  show: boolean;
  summaryResult: StorySummaryResult | null;
  feedbackResult: AnswerFeedbackResult | null;
  currentQuestion: string;
  loading: boolean;
  onAnswerByVoice: () => void;
  onAnswerByText: (text: string) => void;
  onRestart: () => void;
  onClose: () => void;
}

export default function SummaryCard({
  show,
  summaryResult,
  feedbackResult,
  currentQuestion,
  loading,
  onAnswerByVoice,
  onAnswerByText,
  onRestart,
  onClose,
}: SummaryCardProps) {
  const [answerInput, setAnswerInput] = useState('');
  const sessionHistory = useReadingStore((s) => s.sessionHistory);

  return (
    <Overlay show={show} position="center" onClose={onClose}>
      <motion.div
        className={styles.card}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.stars}>🌟🌟🌟</div>
        <h2 className={styles.heading}>故事读完啦！</h2>

        <div className={styles.moral}>
          {loading && !summaryResult ? (
            <LoadingDots text="小度正在总结故事呢" />
          ) : summaryResult ? (
            summaryResult.moralSummary
          ) : null}
        </div>

        {currentQuestion && (
          <div className={styles.question}>
            💬 {currentQuestion}
          </div>
        )}

        {/* 回答区域 */}
        {currentQuestion && !feedbackResult && (
          <div className={styles.answerArea}>
            {isASRAvailable() ? (
              <PillButton variant="primary" icon="🎙️" onClick={onAnswerByVoice}>
                语音回答
              </PillButton>
            ) : null}
            <div className={styles.textInput}>
              <input
                className={styles.input}
                type="text"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && answerInput.trim()) {
                    onAnswerByText(answerInput.trim());
                    setAnswerInput('');
                  }
                }}
                placeholder="说说你的想法..."
              />
              <button
                className={styles.sendBtn}
                onClick={() => {
                  if (answerInput.trim()) {
                    onAnswerByText(answerInput.trim());
                    setAnswerInput('');
                  }
                }}
              >
                发送
              </button>
            </div>
          </div>
        )}

        {loading && !feedbackResult && summaryResult && (
          <LoadingDots text="小度正在给你鼓励" />
        )}

        {feedbackResult && (
          <div className={styles.feedback}>
            🌈 {feedbackResult.feedbackText}
          </div>
        )}

        {/* 续编历史 */}
        {sessionHistory.length > 0 && (
          <div className={styles.history}>
            {sessionHistory.map((h, i) => (
              <div key={i} className={styles.historyItem}>
                <span className={styles.who}>你说：</span>{h.child}
                <br />
                📖 {h.storyContinuation}
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <PillButton variant="secondary" icon="🔄" onClick={onRestart}>
            再读一遍
          </PillButton>
          <PillButton variant="ar" icon="👍" onClick={onClose}>
            好的
          </PillButton>
        </div>
      </motion.div>
    </Overlay>
  );
}
