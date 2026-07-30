import { useState, useCallback } from 'react';
import { generateStorySummary, generateAnswerFeedback } from '../services/llm';
import { speak } from '../services/tts';
import { startListening, isASRAvailable } from '../services/asr';
import type { StorySummaryResult, AnswerFeedbackResult } from '../types';

export function useSummary() {
  const [summaryResult, setSummaryResult] = useState<StorySummaryResult | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<AnswerFeedbackResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  /** 生成故事总结 */
  const generateSummary = useCallback(
    async (fullStoryText: string) => {
      setLoading(true);
      setFeedbackResult(null);
      try {
        const result = await generateStorySummary(fullStoryText);
        setSummaryResult(result);
        if (result.questions.length > 0) {
          setCurrentQuestion(result.questions[0]);
        }
        speak(`${result.moralSummary}。${result.questions[0] || ''}`);
      } catch {
        setSummaryResult({
          moralSummary: '这个故事告诉我们：遇到需要帮助的朋友，伸出手就是最棒的事情！',
          questions: ['你觉得帮助别人开心吗？'],
        });
        setCurrentQuestion('你觉得帮助别人开心吗？');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** 语音回答问题 */
  const answerByVoice = useCallback(() => {
    if (!isASRAvailable()) return false;
    return startListening(
      (result) => answerQuestion(result.transcript),
      () => {},
    );
  }, [currentQuestion]);

  /** 文字回答问题 */
  const answerByText = useCallback(
    (text: string) => {
      answerQuestion(text);
    },
    [currentQuestion],
  );

  const answerQuestion = useCallback(
    async (childAnswer: string) => {
      if (!currentQuestion) return;
      setLoading(true);
      try {
        const result = await generateAnswerFeedback(currentQuestion, childAnswer);
        setFeedbackResult(result);
        speak(result.feedbackText);
      } catch {
        setFeedbackResult({
          feedbackText: '你说得真棒，小度为你骄傲！',
          emotionTag: 'happy',
        });
      } finally {
        setLoading(false);
      }
    },
    [currentQuestion],
  );

  const reset = useCallback(() => {
    setSummaryResult(null);
    setFeedbackResult(null);
    setCurrentQuestion('');
  }, []);

  return {
    summaryResult,
    feedbackResult,
    currentQuestion,
    loading,
    generateSummary,
    answerByVoice,
    answerByText,
    reset,
  };
}
