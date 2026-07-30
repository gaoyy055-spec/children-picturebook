import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen, PlayCircle, PauseCircle, ChevronRight, ChevronLeft,
  Mic, MessageCircle, Info, ScanFace, X, Send, Sparkles, Volume2,
  ArrowLeft, Wand2, Loader2,
} from 'lucide-react';

import { type BookMeta, type Character } from './data/books';
import { chatWithCharacter, generateStorySummary, generateAnswerFeedback, chatWithXiaodu, identifyClickedTarget } from './services/llm';
import { explainPageWithGPT } from './services/llm/api';
import { speak, stopSpeaking } from './services/tts';
import { startListening, stopListening, isASRAvailable } from './services/asr';
import { getARModelUrl } from './services/ar';
import { loadUploadedBooks, saveBook, deleteBook as deleteBookFromDB, updateBookMeta } from './services/storage/indexeddb';

import BookShelf from './components/BookShelf';
import UploadBook from './components/UploadBook';

import './index.css';

type Page = 'shelf' | 'upload' | 'reader';
type InteractionMode = 'menu' | 'ask' | 'chat' | 'ar' | null;

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const XiaoduMascot = () => (
  <div className="relative h-56 w-48 shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
    <img
      src="/xiaodu-mascot.png"
      alt="小度"
      className="h-full w-full object-contain drop-shadow-xl"
      draggable={false}
    />
  </div>
);

const IdeaBookIcon = () => (
  <svg viewBox="0 0 100 100" className="h-16 w-16 drop-shadow-md" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="4" />
    <path d="M30 60 Q50 70 70 60 L70 40 Q50 50 30 40 Z" fill="white" stroke="#F59E0B" strokeWidth="3" strokeLinejoin="round" />
    <path d="M50 45 L50 65" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    <path d="M45 25 Q50 15 55 25 Q60 35 50 40 Q40 35 45 25 Z" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
    <path d="M50 40 L50 45" stroke="#EAB308" strokeWidth="2" />
    <path d="M35 50 L45 53 M65 50 L55 53" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <path d="M43 32 Q50 38 57 32" stroke="#F59E0B" strokeWidth="2" fill="none" />
  </svg>
);

export default function App() {
  // 页面路由
  const [page, setPage] = useState<Page>('shelf');
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [activeBook, setActiveBook] = useState<BookMeta | null>(null);

  // 启动时从 IndexedDB 加载书架书籍
  useEffect(() => {
    loadUploadedBooks().then((uploaded) => {
      setBooks(uploaded);
    }).catch((err) => {
      console.warn('IndexedDB 加载失败:', err);
    });
  }, []);

  // --- 阅读器状态 ---
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const [summaryMoral, setSummaryMoral] = useState('');
  const [summaryQuestion, setSummaryQuestion] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryAnswered, setSummaryAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);

  // AI解读状态
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  // 存储每页的 AI 解读文字（key: pageIndex），避免重复请求
  const [aiExplainMap, setAiExplainMap] = useState<Record<number, string>>({});

  // 点击图片识别状态
  const [clickIdentifyLoading, setClickIdentifyLoading] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 小度助手状态
  const [xiaoduOpen, setXiaoduOpen] = useState(false);
  const [xiaoduMessages, setXiaoduMessages] = useState<ChatMessage[]>([]);
  const [xiaoduInput, setXiaoduInput] = useState('');
  const [xiaoduLoading, setXiaoduLoading] = useState(false);
  const xiaoduBottomRef = useRef<HTMLDivElement>(null);

  // 书架选择绘本
  const handleSelectBook = (book: BookMeta) => {
    setActiveBook(book);
    setCurrentPage(0);
    setPage('reader');
    resetReaderStates();
  };

  // 上传完成
  const handleBookCreated = (book: BookMeta) => {
    setBooks((prev) => [book, ...prev]);
    saveBook(book).catch((err) => console.warn('保存到 IndexedDB 失败:', err));
    setActiveBook(book);
    setCurrentPage(0);
    setPage('reader');
    resetReaderStates();
  };

  const resetReaderStates = () => {
    setSelectedChar(null);
    setInteractionMode(null);
    setChatMessages([]);
    setIsPlaying(false);
    setIsRecording(false);
    setSummaryAnswered(false);
    setAnswerFeedback('');
    setSummaryMoral('');
    setSummaryQuestion('');
    setAiExplainMap({});
    setClickedPoint(null);
    setClickIdentifyLoading(false);
    stopSpeaking();
  };

  // 翻页时停止朗读（独立 effect，确保每次 currentPage 变化都执行）
  useEffect(() => {
    stopSpeaking();
    setIsPlaying(false);
  }, [currentPage]);

  // 重命名绘本
  const handleRenameBook = (bookId: string, newTitle: string) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.bookId === bookId
          ? { ...b, title: newTitle, description: `${newTitle} · ${b.pages.length}页` }
          : b
      )
    );
    setActiveBook((prev) =>
      prev && prev.bookId === bookId
        ? { ...prev, title: newTitle, description: `${newTitle} · ${prev.pages.length}页` }
        : prev
    );
    updateBookMeta(bookId, {
      title: newTitle,
      description: `${newTitle} · 页`,
    }).catch((err) => console.warn('重命名保存失败:', err));
  };

  // 删除绘本
  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.bookId !== bookId));
    if (activeBook?.bookId === bookId) {
      setPage('shelf');
      setActiveBook(null);
    }
    deleteBookFromDB(bookId).catch((err) => console.warn('从 IndexedDB 删除失败:', err));
  };

  // 当前阅读数据（提前声明，供小度等回调使用）
  const bookPages = activeBook?.pages || [];
  const moralPageIndex = bookPages.length;
  const interactionPageIndex = bookPages.length + 1;
  const totalReaderPages = bookPages.length + 2;
  const isMoralPage = currentPage === moralPageIndex;
  const isInteractionPage = currentPage === interactionPageIndex;
  const isEndPage = isMoralPage || isInteractionPage;
  const currentData = bookPages[currentPage];

  const getImageBase64 = async (imgSrc: string): Promise<string> => {
    if (imgSrc.startsWith('data:')) {
      return imgSrc.split(',')[1];
    }
    const resp = await fetch(imgSrc);
    const blob = await resp.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  };

  const getNormalizedImagePoint = (event: React.MouseEvent<HTMLImageElement>): { x: number; y: number } | null => {
    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();
    if (!img.naturalWidth || !img.naturalHeight) return null;

    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = rect.width / rect.height;
    let renderedWidth = rect.width;
    let renderedHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (boxRatio > naturalRatio) {
      renderedHeight = rect.height;
      renderedWidth = renderedHeight * naturalRatio;
      offsetX = (rect.width - renderedWidth) / 2;
    } else {
      renderedWidth = rect.width;
      renderedHeight = renderedWidth / naturalRatio;
      offsetY = (rect.height - renderedHeight) / 2;
    }

    const localX = event.clientX - rect.left - offsetX;
    const localY = event.clientY - rect.top - offsetY;
    if (localX < 0 || localY < 0 || localX > renderedWidth || localY > renderedHeight) return null;

    return {
      x: Math.round((localX / renderedWidth) * 100),
      y: Math.round((localY / renderedHeight) * 100),
    };
  };

  const handleImageClick = useCallback(async (event: React.MouseEvent<HTMLImageElement>) => {
    if (!currentData || clickIdentifyLoading || interactionMode) return;
    const point = getNormalizedImagePoint(event);
    if (!point) return;

    setClickedPoint(point);
    setClickIdentifyLoading(true);
    setChatMessages([]);
    setInputText('');

    try {
      const base64 = await getImageBase64(currentData.image);
      const pageText = currentData.originalText || aiExplainMap[currentPage] || '';
      const result = await identifyClickedTarget({
        imageBase64: base64,
        x: point.x,
        y: point.y,
        pageText,
        bookTitle: activeBook?.title || '',
      });

      const char: Character = {
        id: result.id || `clicked-${Date.now()}`,
        name: result.name,
        type: result.type,
        avatar: result.avatar || '✨',
        persona: result.persona || `我是${result.name}，很高兴和你聊天！`,
        encyclopedia: result.encyclopedia || `${result.name}藏在这幅图画里，等着小朋友来发现。`,
        position: {
          top: `${Math.max(0, point.y - 5)}%`,
          left: `${Math.max(0, point.x - 5)}%`,
          width: '10%',
          height: '10%',
        },
        arModelUrl: result.arModelUrl,
      };
      handleCharClick(char);
    } catch (err) {
      console.error('点击识别失败:', err);
    } finally {
      setClickIdentifyLoading(false);
      setClickedPoint(null);
    }
  }, [currentData, clickIdentifyLoading, interactionMode, aiExplainMap, currentPage, activeBook]);

  // 小度助手
  const handleOpenXiaodu = () => {
    setXiaoduOpen(true);
    if (xiaoduMessages.length === 0) {
      const greeting = '你好呀，小朋友！我是小度，你的智能小助手！有什么问题都可以问我哦！我可以陪你聊天、讲故事、解答各种好奇的问题～';
      setXiaoduMessages([{ sender: 'ai', text: greeting }]);
    }
  };

  const handleXiaoduSend = useCallback(async () => {
    if (!xiaoduInput.trim() || xiaoduLoading) return;
    const userMsg = xiaoduInput.trim();
    setXiaoduInput('');
    setXiaoduMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setXiaoduLoading(true);
    try {
      const contextText = currentData?.originalText || '';
      const history = xiaoduMessages.map((m) => m.text);
      const result = await chatWithXiaodu(userMsg, history, contextText);
      setXiaoduMessages((prev) => [...prev, { sender: 'ai', text: result.reply }]);
      speak(result.reply);
    } catch {
      setXiaoduMessages((prev) => [...prev, { sender: 'ai', text: '嗯，让我想想……你可以换个方式再问我一次吗？' }]);
    } finally {
      setXiaoduLoading(false);
    }
  }, [xiaoduInput, xiaoduLoading, xiaoduMessages, currentData]);

  const handleXiaoduVoiceInput = useCallback(() => {
    if (!isASRAvailable()) {
      setXiaoduInput('你好！');
      return;
    }
    setIsRecording(true);
    startListening(
      (result) => {
        setIsRecording(false);
        const text = result.transcript;
        if (text) {
          setXiaoduInput(text);
          // 自动发送
          setXiaoduMessages((prev) => [...prev, { sender: 'user', text }]);
          setXiaoduLoading(true);
          const contextText = currentData?.originalText || '';
          const history = xiaoduMessages.map((m) => m.text);
          chatWithXiaodu(text, history, contextText)
            .then((res) => {
              setXiaoduMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
              speak(res.reply);
            })
            .catch(() => {
              setXiaoduMessages((prev) => [...prev, { sender: 'ai', text: '嗯，让我想想……你可以换个方式再问我一次吗？' }]);
            })
            .finally(() => setXiaoduLoading(false));
        }
      },
      () => setIsRecording(false),
    );
  }, [xiaoduMessages, currentData]);

  const goToPage = (targetPage: number) => {
    setPagePickerOpen(false);
    if (targetPage < 0 || targetPage >= totalReaderPages || targetPage === currentPage) return;
    if (targetPage === moralPageIndex) {
      void handleEnterSummary();
      return;
    }
    stopSpeaking();
    setCurrentPage(targetPage);
    if (targetPage <= moralPageIndex) {
      resetReaderStates();
    } else {
      setSelectedChar(null);
      setInteractionMode(null);
      setChatMessages([]);
      setInputText('');
      setIsPlaying(false);
      setIsRecording(false);
    }
  };

  const nextPage = () => {
    if (currentPage < bookPages.length - 1) {
      setCurrentPage((p) => p + 1);
      resetReaderStates();
    } else if (currentPage === bookPages.length - 1) {
      void handleEnterSummary();
    } else if (currentPage < interactionPageIndex) {
      setCurrentPage((p) => p + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      if (currentPage <= moralPageIndex) {
        resetReaderStates();
      }
    }
  };

  const PageWheelPicker = ({ tone = 'light' }: { tone?: 'light' | 'orange' }) => {
    const currentLabel = currentPage < bookPages.length
      ? `P${currentPage + 1}`
      : currentPage === moralPageIndex ? '道理' : '互动';
    const buttonClass = tone === 'orange'
      ? 'bg-white/95 text-orange-600 focus:ring-white/70'
      : 'bg-white/95 text-orange-600 focus:ring-white/70';

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setPagePickerOpen((open) => !open)}
          className={`flex h-9 min-w-20 items-center justify-center rounded-full px-3 text-xs font-black shadow-sm outline-none transition hover:bg-white focus:ring-2 ${buttonClass}`}
          aria-haspopup="listbox"
          aria-expanded={pagePickerOpen}
        >
          {currentLabel}
        </button>
        {pagePickerOpen && (
          <div className="absolute right-0 top-11 z-50 w-24 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-orange-100">
            <div className="max-h-44 snap-y snap-mandatory overflow-y-auto py-1">
              {Array.from({ length: totalReaderPages }).map((_, i) => {
                const label = i < bookPages.length ? `P${i + 1}` : i === moralPageIndex ? '道理' : '互动';
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToPage(i)}
                    className={`block h-10 w-full snap-center text-center text-sm font-black transition-colors ${i === currentPage ? 'bg-orange-400 text-white' : 'text-orange-700 hover:bg-orange-50'}`}
                    role="option"
                    aria-selected={i === currentPage}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 点击角色
  const handleCharClick = (char: Character) => {
    setSelectedChar(char);
    setInteractionMode('menu');
  };

  // 小度百科问答
  const handleShowFact = useCallback(() => {
    if (!selectedChar) return;
    const greeting = `我是小度百科！你点到的是“${selectedChar.name}”。${selectedChar.encyclopedia} 你还想问我什么呀？`;
    setInteractionMode('ask');
    setInputText('');
    setChatMessages([{ sender: 'ai', text: greeting }]);
    speak(greeting);
  }, [selectedChar]);

  const handleAskXiaoduSend = useCallback(async () => {
    if (!inputText.trim() || !selectedChar || chatLoading) return;
    const userMsg = inputText.trim();
    setInputText('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const pageText = aiExplainMap[currentPage] || currentData?.originalText || '';
      const contextText = [
        pageText ? `当前绘本内容：${pageText}` : '',
        `小朋友点击的目标：${selectedChar.name}`,
        `目标类型：${selectedChar.type}`,
        `目标百科：${selectedChar.encyclopedia}`,
      ].filter(Boolean).join('\n');
      const history = chatMessages.map((m) => m.text);
      const result = await chatWithXiaodu(userMsg, history, contextText);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: result.reply }]);
      speak(result.reply);
    } catch {
      const fallback = `这个问题真有趣！${selectedChar.encyclopedia}`;
      setChatMessages((prev) => [...prev, { sender: 'ai', text: fallback }]);
      speak(fallback);
    } finally {
      setChatLoading(false);
    }
  }, [inputText, selectedChar, chatLoading, aiExplainMap, currentPage, currentData, chatMessages]);

  // 角色对话
  const handleStartChat = () => {
    if (!selectedChar) return;
    setInteractionMode('chat');
    const greeting = `你好呀，小朋友！${selectedChar.persona}`;
    setChatMessages([{ sender: 'ai', text: greeting }]);
    speak(greeting);
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !selectedChar) return;
    const userMsg = inputText.trim();
    setInputText('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const pageText = aiExplainMap[currentPage] || currentData?.originalText || '';
      const history = chatMessages.map((m) => m.text);
      const result = await chatWithCharacter(selectedChar.name, pageText, userMsg, history, selectedChar.persona);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: result.reply }]);
      speak(result.reply);
    } catch {
      const fallback = `哈哈，你说的话好有趣！${selectedChar.persona}`;
      setChatMessages((prev) => [...prev, { sender: 'ai', text: fallback }]);
      speak(fallback);
    } finally {
      setChatLoading(false);
    }
  }, [inputText, selectedChar, currentData, chatMessages, aiExplainMap, currentPage]);

  // 语音输入
  const handleVoiceInput = useCallback((isSummary = false) => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      return;
    }

    if (!isASRAvailable()) {
      if (isSummary) {
        setSummaryAnswered(true);
        setAnswerFeedback('你真是一个好孩子！给你点个大大的赞！👍');
        speak('你真是一个好孩子！');
      }
      return;
    }
    setIsRecording(true);
    const listeningStarted = startListening(
      (result) => {
        setIsRecording(false);
        if (isSummary) {
          submitSummaryAnswer(result.transcript);
        } else {
          setInputText(result.transcript);
          setTimeout(() => {
            const text = result.transcript;
            if (selectedChar && text) {
              setChatMessages((prev) => [...prev, { sender: 'user', text }]);
              setChatLoading(true);
              const pageText = aiExplainMap[currentPage] || currentData?.originalText || '';
              if (interactionMode === 'ask') {
                const contextText = [
                  pageText ? `当前绘本内容：${pageText}` : '',
                  `小朋友点击的目标：${selectedChar.name}`,
                  `目标类型：${selectedChar.type}`,
                  `目标百科：${selectedChar.encyclopedia}`,
                ].filter(Boolean).join('\n');
                chatWithXiaodu(text, chatMessages.map((m) => m.text), contextText)
                  .then((res) => {
                    setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
                    speak(res.reply);
                  })
                  .catch(() => {
                    const fallback = `这个问题真有趣！${selectedChar?.encyclopedia || ''}`;
                    setChatMessages((prev) => [...prev, { sender: 'ai', text: fallback }]);
                    speak(fallback);
                  })
                  .finally(() => setChatLoading(false));
              } else {
                chatWithCharacter(selectedChar.name, pageText, text, chatMessages.map((m) => m.text), selectedChar.persona)
                  .then((res) => {
                    setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
                    speak(res.reply);
                  })
                  .catch(() => {
                    const fallback = `哈哈，你说的话好有趣！${selectedChar?.persona || ''}`;
                    setChatMessages((prev) => [...prev, { sender: 'ai', text: fallback }]);
                    speak(fallback);
                  })
                  .finally(() => setChatLoading(false));
              }
            }
          }, 100);
        }
      },
      () => setIsRecording(false),
    );

    if (!listeningStarted) {
      setIsRecording(false);
    }
  }, [selectedChar, currentData, chatMessages, aiExplainMap, currentPage, interactionMode, isRecording]);

  // 结尾总结
  const handleEnterSummary = useCallback(async () => {
    stopSpeaking();
    setCurrentPage(bookPages.length);
    setSelectedChar(null);
    setInteractionMode(null);
    setChatMessages([]);
    setInputText('');
    setIsPlaying(false);
    setIsRecording(false);
    setSummaryAnswered(false);
    setAnswerFeedback('');
    setSummaryLoading(true);
    try {
      const fullStory = bookPages
        .map((p) => [p.originalText, p.expandedText].filter(Boolean).join(' '))
        .filter(Boolean)
        .join('\n')
        .slice(0, 6000);
      const result = await generateStorySummary(fullStory || activeBook?.title || '这个绘本故事');
      setSummaryMoral(result.moralSummary || '小度读完这个故事啦：它告诉我们，遇到事情可以勇敢一点，也可以和朋友一起想办法。把温暖分享给别人，快乐也会变多。');
      setSummaryQuestion(result.questions[0] || '你会怎么帮助朋友呢？');
    } catch {
      setSummaryMoral('小度发现了一个暖暖的小秘密：故事里的朋友互相关心、一起想办法，快乐就会变得更多！我们也可以像他们一样，做一个会分享、会帮助人的小朋友。');
      setSummaryQuestion('如果你是故事里的小朋友，你最想帮助谁呢？');
    } finally {
      setSummaryLoading(false);
    }
  }, [bookPages, aiExplainMap, activeBook]);

  const submitSummaryAnswer = useCallback(async (childAnswer: string) => {
    setSummaryAnswered(true);
    setAnswerLoading(true);
    try {
      const result = await generateAnswerFeedback(summaryQuestion, childAnswer);
      setAnswerFeedback(result.feedbackText);
      speak(result.feedbackText);
    } catch {
      setAnswerFeedback('你真是一个好孩子！给你点个大大的赞！👍');
      speak('你真是一个好孩子！');
    } finally {
      setAnswerLoading(false);
    }
  }, [summaryQuestion]);

  // 聊天滚动
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 小度聊天滚动
  useEffect(() => {
    xiaoduBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [xiaoduMessages]);

  // ===== 角色交互弹窗 =====
  const renderCharacterModal = () => {
    if (!selectedChar || !interactionMode) return null;
    return (
      <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 rounded-3xl backdrop-blur-sm transition-all">
        <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
              <span className="text-4xl">{selectedChar.avatar}</span>
              {selectedChar.name}
            </h3>
            <button onClick={() => { setInteractionMode(null); stopSpeaking(); }}
              className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-500">
              <X size={24} />
            </button>
          </div>

          {interactionMode === 'menu' && (
            <div className="grid grid-cols-1 gap-4">
              <button onClick={handleShowFact}
                className="flex items-center gap-4 bg-blue-100 hover:bg-blue-200 p-4 rounded-2xl text-blue-700 font-bold text-xl transition-colors">
                <div className="bg-blue-500 text-white p-3 rounded-full"><Info size={28} /></div>
                <div className="text-left">
                  <div>问一问</div>
                  <div className="text-sm font-medium text-blue-500">请小度百科回答问题</div>
                </div>
              </button>
              <button onClick={handleStartChat}
                className="flex items-center gap-4 bg-green-100 hover:bg-green-200 p-4 rounded-2xl text-green-700 font-bold text-xl transition-colors">
                <div className="bg-green-500 text-white p-3 rounded-full"><MessageCircle size={28} /></div>
                <div className="text-left">
                  <div>聊一聊</div>
                  <div className="text-sm font-medium text-green-500">和 {selectedChar.name} 说说话</div>
                </div>
              </button>
              <button onClick={() => setInteractionMode('ar')}
                className="flex items-center gap-4 bg-purple-100 hover:bg-purple-200 p-4 rounded-2xl text-purple-700 font-bold text-xl transition-colors">
                <div className="bg-purple-500 text-white p-3 rounded-full"><ScanFace size={28} /></div>
                <div className="text-left">
                  <div>看一看</div>
                  <div className="text-sm font-medium text-purple-500">查看3D立体 AR</div>
                </div>
              </button>
            </div>
          )}

          {interactionMode === 'ask' && (
            <div className="flex flex-col h-80">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-lg ${
                        msg.sender === 'user' ? 'bg-blue-400 text-white rounded-br-sm' : 'bg-blue-50 text-blue-800 rounded-bl-sm border-2 border-blue-100'
                      }`}>{msg.text}</div>
                    </div>
                  ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-2xl rounded-bl-sm border-2 border-blue-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <span className="text-lg">小度百科正在想...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleVoiceInput(false)}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${isRecording ? 'bg-red-500 text-white animate-mic-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Mic size={24} />
                </button>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskXiaoduSend()}
                  placeholder={`问问小度百科关于${selectedChar.name}的问题...`}
                  className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300" />
                <button onClick={handleAskXiaoduSend} disabled={chatLoading}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50">
                  <Send size={20} />
                </button>
              </div>
              <button onClick={() => setInteractionMode('menu')} className="w-full text-center text-blue-500 font-bold mt-4">返回菜单</button>
            </div>
          )}

          {interactionMode === 'chat' && (
            <div className="flex flex-col h-80">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-lg ${
                      msg.sender === 'user' ? 'bg-orange-400 text-white rounded-br-sm' : 'bg-green-100 text-green-800 rounded-bl-sm border-2 border-green-200'
                    }`}>{msg.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-green-100 text-green-800 p-3 rounded-2xl rounded-bl-sm border-2 border-green-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
                      <span className="text-lg">{selectedChar.name}正在想...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleVoiceInput(false)}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${isRecording ? 'bg-red-500 text-white animate-mic-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Mic size={24} />
                </button>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="或者输入文字..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300" />
                <button onClick={handleSendMessage} disabled={chatLoading}
                  className="p-3 bg-orange-400 text-white rounded-full hover:bg-orange-500 disabled:opacity-50">
                  <Send size={20} />
                </button>
              </div>
              <button onClick={() => setInteractionMode('menu')} className="w-full text-center text-green-600 font-bold mt-4">返回菜单</button>
            </div>
          )}

          {interactionMode === 'ar' && (
            <div className="flex flex-col items-center py-4">
              {typeof window !== 'undefined' && customElements.get('model-viewer') ? (
                <div className="w-full" style={{ height: '260px' }}>
                  {/* @ts-ignore */}
                  <model-viewer
                    src={selectedChar.arModelUrl || getARModelUrl(selectedChar.id, selectedChar)}
                    alt={`${selectedChar.name}的3D模型`}
                    ar ar-modes="webxr scene-viewer quick-look"
                    camera-controls auto-rotate shadow-intensity="1"
                    style={{ width: '100%', height: '100%', borderRadius: '18px', background: '#f3e8ff' }}>
                    <button slot="ar-button" className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                      📱 让{selectedChar.name}出现在我房间里！
                    </button>
                  </model-viewer>
                </div>
              ) : (
                <div className="w-48 h-48 bg-purple-100 rounded-full flex items-center justify-center border-4 border-purple-300 border-dashed animate-spin-slow">
                  <span className="text-8xl animate-bounce">{selectedChar.avatar}</span>
                </div>
              )}
              <p className="mt-4 text-purple-600 font-bold text-lg text-center">
                {customElements.get('model-viewer') ? `系统已根据“${selectedChar.name}”生成专属3D/AR形象，可以旋转查看或开启AR` : `先用${selectedChar.avatar}看看${selectedChar.name}吧`}
              </p>
              <button onClick={() => setInteractionMode('menu')} className="mt-4 text-gray-500 font-bold">返回菜单</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== 渲染 =====
  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 font-sans selection:bg-orange-200">
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white relative flex flex-col">

        {/* 顶部导航条 */}
        <div className="h-16 bg-gradient-to-r from-orange-300 to-yellow-400 flex items-center justify-between px-6 text-white shrink-0">
          <button
            onClick={() => { setPage('shelf'); stopSpeaking(); }}
            className="flex items-center gap-2 font-bold text-lg hover:text-white/80 transition-colors"
          >
            {page !== 'shelf' && <ArrowLeft size={24} />}
            <BookOpen size={28} />
            <h2>绘本奇妙之旅</h2>
          </button>
          {page === 'reader' && activeBook && (
            <div className="flex items-center gap-3">
              {totalReaderPages <= 8 && (
                <div className="hidden items-center gap-2 sm:flex">
                  {Array.from({ length: totalReaderPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`h-2 w-8 rounded-full transition-all ${i <= currentPage ? 'bg-white' : 'bg-white/30 hover:bg-white/60'}`}
                      aria-label={`跳转到第 ${i + 1} 页`}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                <span>页</span>
                <PageWheelPicker />
              </div>
            </div>
          )}
          {page === 'shelf' && <div />}
        </div>
        <div className="flex-1 relative overflow-hidden">

          {/* ===== 书架页 ===== */}
          {page === 'shelf' && (
            <div className="relative h-full">
              <BookShelf
                books={books}
                onSelectBook={handleSelectBook}
                onUploadClick={() => setPage('upload')}
                onRenameBook={handleRenameBook}
                onDeleteBook={handleDeleteBook}
              />
            </div>
          )}

          {/* ===== 上传页 ===== */}
          {page === 'upload' && (
            <UploadBook
              onBookCreated={handleBookCreated}
              onBack={() => setPage('shelf')}
            />
          )}

          {/* ===== 阅读页 ===== */}
          {page === 'reader' && activeBook && (
            <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">

              {/* 阅读模式 (非结尾页) */}
              {!isEndPage && currentData && (
                <div className="h-full flex flex-col overflow-y-auto">
                  {/* 图片区域 — 占大部分高度 */}
                  <div className="relative w-full bg-gray-100 shrink-0" style={{ minHeight: '60vh' }}>
                    <img
                      ref={imageRef}
                      src={currentData.image}
                      alt="绘本画面"
                      onClick={handleImageClick}
                      className="w-full h-full object-contain cursor-crosshair"
                      style={{ minHeight: '60vh', maxHeight: '70vh' }}
                    />
                    {clickIdentifyLoading && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-white rounded-full px-5 py-3 shadow-xl flex items-center gap-2 text-orange-500 font-bold">
                          <Loader2 size={20} className="animate-spin" />
                          系统正在看看你点了哪里...
                        </div>
                      </div>
                    )}
                    {clickedPoint && (
                      <div
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-orange-400 bg-orange-200/40 animate-ping pointer-events-none z-10"
                        style={{ left: `${clickedPoint.x}%`, top: `${clickedPoint.y}%` }}
                      />
                    )}
                  </div>

                  {/* 底部区域：AI解读按钮 + 讲解内容 */}
                  <div className="bg-white rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] p-5 shrink-0">
                    {/* 标题栏 */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Volume2 size={16} /> 绘本讲解
                      </span>
                      <div className="flex items-center gap-2">
                        {/* AI 解读按钮 */}
                        <button
                          onClick={async () => {
                            if (aiExplainLoading || aiExplainMap[currentPage] !== undefined) return;
                            setAiExplainLoading(true);
                            try {
                              const base64 = await getImageBase64(currentData.image);
                              const text = await explainPageWithGPT(base64);
                              setAiExplainMap((prev) => ({ ...prev, [currentPage]: text }));
                              speak(text);
                              setIsPlaying(true);
                            } catch (err) {
                              console.error('AI 解读失败:', err);
                              // 失败时不写入 map，允许用户重新点击
                            } finally {
                              setAiExplainLoading(false);
                            }
                          }}
                          disabled={aiExplainLoading || aiExplainMap[currentPage] !== undefined}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all shadow ${
                            aiExplainMap[currentPage] !== undefined
                              ? 'bg-green-100 text-green-600 cursor-default'
                              : aiExplainLoading
                                ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-md'
                          }`}
                        >
                          {aiExplainLoading
                            ? <><Loader2 size={16} className="animate-spin" /> 解读中...</>
                            : aiExplainMap[currentPage] !== undefined
                              ? <><Sparkles size={16} /> 已解读</>
                              : <><Wand2 size={16} /> AI 解读</>
                          }
                        </button>
                        {/* 播放/暂停按钮（只在有 AI 解读内容时显示） */}
                        {aiExplainMap[currentPage] && (
                          <button
                            onClick={() => {
                              const text = aiExplainMap[currentPage];
                              if (isPlaying) { stopSpeaking(); setIsPlaying(false); }
                              else { speak(text); setIsPlaying(true); }
                            }}
                            className="text-orange-500 hover:text-orange-600 transition-transform hover:scale-110">
                            {isPlaying ? <PauseCircle size={36} /> : <PlayCircle size={36} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 讲解内容 */}
                    {(() => {
                      const text = aiExplainMap[currentPage];
                      if (!text) {
                        return (
                          <p className="text-gray-400 text-base text-center py-2">
                            点击"AI 解读"，让 GPT 为这一页生成讲解
                          </p>
                        );
                      }
                      return (
                        <p className="text-xl text-gray-700 leading-relaxed font-medium max-h-40 overflow-y-auto pr-1">
                          {text}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* 小度道理页 */}
              {isMoralPage && (
                <div className="h-full overflow-hidden bg-[#dceffd]">
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                      animation: fadeIn 0.4s ease-out forwards;
                    }
                    .bg-clouds {
                      background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 20%),
                                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 15%),
                                        radial-gradient(circle at 10% 80%, rgba(255,255,255,0.7) 0%, transparent 25%),
                                        radial-gradient(circle at 85% 75%, rgba(255,255,255,0.5) 0%, transparent 20%);
                      background-color: #FFEDD5;
                    }
                  `}</style>

                  <div className="mx-auto flex h-full w-full items-center justify-center">
                    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white">
                      <div className="absolute right-6 top-4 z-30">
                        <button onClick={handleOpenXiaodu} className="flex items-center gap-2 rounded-full bg-blue-400 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-500">
                          <MessageCircle size={18} />
                          <span className="font-bold">小度</span>
                        </button>
                      </div>

                      <main className="bg-clouds relative flex flex-1 overflow-hidden">
                        <button
                          onClick={prevPage}
                          className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-50 shadow-md transition-all"
                          aria-label="上一页"
                        >
                          <ChevronLeft size={24} className="text-gray-300" />
                        </button>

                        <button
                          onClick={nextPage}
                          className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
                          aria-label="下一页"
                        >
                          <ChevronRight size={24} className="text-gray-300" />
                        </button>

                        <div className="flex h-full w-full items-center justify-center pb-16">
                          <div className="flex h-full w-full animate-fadeIn flex-col items-center p-8">
                            <h2 className="mb-8 mt-4 text-center text-3xl font-bold tracking-wide text-red-900">
                              故事里的小道理
                            </h2>

                            <div className="relative z-10 flex w-full max-w-4xl items-center justify-center gap-8">
                              <XiaoduMascot />

                              <div className="relative ml-4 flex-1 rounded-3xl border-4 border-orange-100 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                  <IdeaBookIcon />
                                </div>

                                <div className="mt-6 text-center">
                                  <h3 className="mb-4 text-xl font-bold text-red-900">
                                    做一个懂得关心和分享的小朋友
                                  </h3>
                                  <p className="max-h-[170px] overflow-y-auto text-justify text-lg leading-relaxed text-gray-700">
                                    {summaryLoading ? '小度正在整理故事里的小道理……' : summaryMoral}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <p className="mb-8 mt-10 text-xl font-semibold text-red-900">
                              把这个小秘密记在心里，我们一起去互动时刻说说想法吧！
                            </p>

                            <button onClick={nextPage} className="rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-16 py-4 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:from-orange-500 hover:to-orange-600">
                              我也知道了，完成！
                            </button>
                          </div>
                        </div>
                      </main>
                    </div>
                  </div>
                </div>
              )}

              {/* 互动时刻页 */}
              {isInteractionPage && (
                <div className="h-full overflow-hidden bg-[#dceffd]">
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                      animation: fadeIn 0.4s ease-out forwards;
                    }
                    .bg-clouds {
                      background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 20%),
                                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 15%),
                                        radial-gradient(circle at 10% 80%, rgba(255,255,255,0.7) 0%, transparent 25%),
                                        radial-gradient(circle at 85% 75%, rgba(255,255,255,0.5) 0%, transparent 20%);
                      background-color: #FFEDD5;
                    }
                  `}</style>

                  <div className="mx-auto flex h-full w-full items-center justify-center">
                    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white">
                      <div className="absolute right-6 top-4 z-30">
                        <button onClick={handleOpenXiaodu} className="flex items-center gap-2 rounded-full bg-blue-400 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-500">
                          <MessageCircle size={18} />
                          <span className="font-bold">小度</span>
                        </button>
                      </div>

                      <main className="bg-clouds relative flex flex-1 overflow-hidden">
                        <button
                          onClick={prevPage}
                          className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
                          aria-label="上一页"
                        >
                          <ChevronLeft size={24} className="text-gray-300" />
                        </button>

                        <button
                          onClick={() => { setCurrentPage(0); resetReaderStates(); }}
                          className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-50 shadow-md transition-all"
                          aria-label="结束阅读"
                        >
                          <ChevronRight size={24} className="text-gray-300" />
                        </button>

                        <div className="flex h-full w-full items-center justify-center pb-16">
                          <div className="flex h-full w-full animate-fadeIn flex-col items-center p-8">
                            <h2 className="mb-6 mt-2 text-center text-3xl font-bold tracking-wide text-red-900">
                              聊聊你的想法吧！
                            </h2>

                            <div className="relative z-10 flex w-full max-w-4xl items-center justify-center gap-8">
                              <XiaoduMascot />

                              <div className="ml-4 flex-1 rounded-3xl border-4 border-orange-100 bg-white/90 p-8 text-left shadow-lg backdrop-blur-sm">
                                <p className="mb-4 text-lg font-bold leading-relaxed text-gray-800">
                                  {summaryQuestion || '这个故事教会了你什么呢？'}
                                </p>
                                <p className="max-h-[120px] overflow-y-auto text-justify text-base leading-relaxed text-gray-600">
                                  试着说说你会做的一件小事，也可以讲讲你曾经帮助别人、和别人分享快乐的经历。小度会认真听你的答案。
                                </p>
                              </div>
                            </div>

                            <div className="mt-8 flex w-full flex-col items-center">
                              <p className="mb-6 text-lg font-semibold text-red-900">
                                把你的想法通过下面的麦克风说出来吧！
                              </p>

                              <div className="flex w-full max-w-2xl items-center justify-center gap-6">
                                <div className="flex items-center gap-1 opacity-50">
                                  <div className="h-4 w-1.5 animate-pulse rounded-full bg-orange-400" />
                                  <div className="h-8 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:100ms]" />
                                  <div className="h-12 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:200ms]" />
                                  <div className="h-6 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:300ms]" />
                                </div>

                                <button
                                  onClick={() => handleVoiceInput(true)}
                                  disabled={answerLoading}
                                  className="group relative disabled:cursor-not-allowed disabled:opacity-60"
                                  aria-label="语音回答"
                                >
                                  <div className="absolute inset-0 rounded-full bg-orange-300 opacity-75 group-enabled:animate-ping" />
                                  <div className="relative rounded-full bg-gradient-to-b from-orange-400 to-orange-500 p-6 text-white shadow-xl transition-transform group-enabled:hover:scale-105">
                                    {isRecording || answerLoading ? <Loader2 size={32} className="animate-spin" /> : <Mic size={32} />}
                                  </div>
                                </button>

                                <div className="flex items-center gap-1 opacity-50">
                                  <div className="h-6 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:300ms]" />
                                  <div className="h-12 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:200ms]" />
                                  <div className="h-8 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:100ms]" />
                                  <div className="h-4 w-1.5 animate-pulse rounded-full bg-orange-400" />
                                </div>
                              </div>

                              <div className="mt-6 flex w-full max-w-4xl justify-between px-8 text-sm font-medium text-gray-500">
                                <span>{answerLoading ? '互动语音回复中...' : summaryAnswered ? '小度听到你的想法啦。' : '等待你的语音回复'}</span>
                                <div className="flex flex-col items-end">
                                  <span className="mb-1 text-gray-800">{answerFeedback || '说完后，小度会给你反馈。'}</span>
                                  <span>{isRecording ? '点击停止' : '点击录音'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </main>
                    </div>
                  </div>
                </div>
              )}

              {!isEndPage && (
                <>
                  {/* 翻页按钮 */}
                  <button onClick={prevPage} disabled={currentPage === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all z-20 ${
                  currentPage === 0 ? 'bg-white/50 text-gray-400 cursor-not-allowed' : 'bg-white/90 text-orange-500 hover:bg-orange-50 hover:scale-110'
                }`}>
                <ChevronLeft size={32} />
              </button>
              <button onClick={isInteractionPage ? () => { setCurrentPage(0); resetReaderStates(); } : nextPage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all z-20 bg-white/90 text-orange-500 hover:bg-orange-50 hover:scale-110">
                <ChevronRight size={32} />
              </button>

              {/* 小度助手浮动按钮 */}
                  <button
                    onClick={handleOpenXiaodu}
                    className="absolute right-4 top-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-all bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl hover:scale-105"
                  >
                    <MessageCircle size={18} />
                    小度
                  </button>
                </>
              )}

              {/* 小度助手聊天弹窗 */}
              {xiaoduOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col max-h-[80%]">
                    {/* 标题 */}
                    <div className="flex justify-between items-center mb-4 shrink-0">
                      <h3 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
                        <span className="text-4xl">🤖</span>
                        小度助手
                      </h3>
                      <button
                        onClick={() => { setXiaoduOpen(false); stopSpeaking(); }}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-500"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* 消息列表 */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 min-h-0">
                      {xiaoduMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-lg ${
                            msg.sender === 'user' ? 'bg-blue-400 text-white rounded-br-sm' : 'bg-blue-50 text-blue-800 rounded-bl-sm border-2 border-blue-100'
                          }`}>{msg.text}</div>
                        </div>
                      ))}
                      {xiaoduLoading && (
                        <div className="flex justify-start">
                          <div className="bg-blue-50 text-blue-800 p-3 rounded-2xl rounded-bl-sm border-2 border-blue-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                            <span className="text-lg">小度正在想...</span>
                          </div>
                        </div>
                      )}
                      <div ref={xiaoduBottomRef} />
                    </div>

                    {/* 输入区域 */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={handleXiaoduVoiceInput}
                        className={`p-3 rounded-full flex-shrink-0 transition-all ${
                          isRecording ? 'bg-red-500 text-white animate-mic-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        <Mic size={24} />
                      </button>
                      <input
                        type="text"
                        value={xiaoduInput}
                        onChange={(e) => setXiaoduInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleXiaoduSend()}
                        placeholder="问小度任何问题..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button
                        onClick={handleXiaoduSend}
                        disabled={xiaoduLoading || !xiaoduInput.trim()}
                        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 角色交互弹窗 */}
              {renderCharacterModal()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
