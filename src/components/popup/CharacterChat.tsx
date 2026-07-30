import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Overlay from '../common/Overlay';
import LoadingDots from '../common/LoadingDots';
import { isASRAvailable } from '../../services/asr';
import type { CharacterChatResult } from '../../types';
import styles from './CharacterChat.module.css';

interface CharacterChatProps {
  show: boolean;
  characterLabel: string;
  emoji: string;
  result: CharacterChatResult | null;
  chatHistory: { role: string; text: string }[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onVoiceInput: () => boolean;
  onClose: () => void;
}

export default function CharacterChat({
  show,
  characterLabel,
  emoji,
  result,
  chatHistory,
  loading,
  onSendMessage,
  onVoiceInput,
  onClose,
}: CharacterChatProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleVoice = () => {
    const started = onVoiceInput();
    if (started) setIsListening(true);
  };

  return (
    <Overlay show={show} onClose={onClose}>
      <motion.div
        className={styles.card}
        initial={{ y: 30 }}
        animate={{ y: 0 }}
      >
        <div className={styles.head}>
          <div className={styles.avatar}>{emoji}</div>
          <div>
            <div className={styles.title}>和{characterLabel}聊天</div>
            <div className={styles.sub}>{characterLabel}想跟你说话呢！</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.chatArea}>
          {chatHistory.length === 0 && !result && (
            <div className={styles.hint}>
              👋 跟{characterLabel}打个招呼吧！可以说你好，也可以问问题哦～
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${msg.role === 'child' ? styles.childMsg : styles.charMsg}`}>
              <span className={styles.msgRole}>{msg.role === 'child' ? '你' : characterLabel}</span>
              <span className={styles.msgText}>{msg.text}</span>
            </div>
          ))}
          {loading && <LoadingDots text={`${characterLabel}在想`} />}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input
            className={styles.input}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`跟${characterLabel}说点什么...`}
          />
          <button className={styles.sendBtn} onClick={handleSend}>发送</button>
          {isASRAvailable() && (
            <button
              className={`${styles.voiceBtn} ${isListening ? styles.voiceListening : ''}`}
              onClick={handleVoice}
            >
              🎙️
            </button>
          )}
        </div>
      </motion.div>
    </Overlay>
  );
}
