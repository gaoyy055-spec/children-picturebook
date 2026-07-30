import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, PlayCircle, PauseCircle, ChevronRight, ChevronLeft, 
  Mic, MessageCircle, Info, ScanFace, X, Send, Sparkles, Volume2
} from 'lucide-react';

// --- 模拟绘本数据 ---
const bookData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1589182373814-fd19ba71c5ec?q=80&w=1000&auto=format&fit=crop", // 替换为可爱的卡通风格图片（这里用一张童话感图片示意）
    originalText: "小兔子在森林里发现了一个大蘑菇。",
    expandedText: "阳光透过树叶洒在草地上，活泼可爱的小兔子蹦蹦跳跳地来到了森林深处。突然，她停下了脚步，哇！眼前竟然出现了一个像小伞一样的大蘑菇，上面还长着漂亮的红色斑点呢！小兔子好奇地凑过去，闻了闻泥土的清香。",
    characters: [
      {
        id: "c1",
        name: "小白兔",
        type: "animal",
        position: { top: '40%', left: '20%', width: '30%', height: '40%' },
        persona: "我是一只聪明活泼的小兔子，喜欢吃胡萝卜，对世界充满好奇！",
        encyclopedia: "兔子是哺乳类兔形目动物，它们有长长的耳朵，听觉非常灵敏，而且跑得很快哦！",
        avatar: "🐰"
      },
      {
        id: "c2",
        name: "神奇蘑菇",
        type: "object",
        position: { top: '50%', left: '60%', width: '25%', height: '35%' },
        persona: "我是森林里的魔法蘑菇，虽然不会动，但我知道很多森林里的秘密。",
        encyclopedia: "蘑菇不是植物哦，它们属于真菌。有些蘑菇非常美味，但有些颜色鲜艳的蘑菇是有毒的，小朋友在野外千万不要随便采摘！",
        avatar: "🍄"
      }
    ]
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?q=80&w=1000&auto=format&fit=crop", 
    originalText: "大熊也来了，他们决定一起分享。",
    expandedText: "这时候，踩着沉重脚步的憨厚大熊也走过来了。“好香的蘑菇呀！”大熊摸了摸肚子说。小兔子看着大熊，微笑着说：“大熊哥哥，我们一起分享这个大蘑菇吧！”于是，两个好朋友坐在草地上，开心地聊起了天。",
    characters: [
      {
        id: "c1",
        name: "小白兔",
        position: { top: '45%', left: '15%', width: '25%', height: '35%' },
        persona: "我是一只聪明活泼的小兔子，喜欢分享！",
        encyclopedia: "兔子喜欢群居，它们用肢体语言交流，比如跺脚表示警告哦！",
        avatar: "🐰"
      },
      {
        id: "c3",
        name: "大熊",
        type: "animal",
        position: { top: '25%', left: '50%', width: '40%', height: '60%' },
        persona: "我是憨厚老实的大熊，最喜欢吃蜂蜜和交朋友。说话总是慢吞吞的。",
        encyclopedia: "熊是杂食性动物，有些熊在冬天会进行冬眠，睡上好几个月不吃不喝呢！",
        avatar: "🐻"
      }
    ]
  }
];

// --- 模拟总结与互动环节数据 ---
const summaryData = {
  moral: "小朋友们，今天的故事告诉我们，学会分享是一件非常快乐的事情。当我们把美好的东西和好朋友一起分享时，快乐就会变成双倍哦！",
  question: "你在幼儿园或者家里，有没有和好朋友分享过什么好东西呢？快大声告诉小度吧！",
  aiResponse: "哇，你真是一个懂得分享的好孩子！把玩具分享给好朋友，大家一起玩，真的是太棒啦！给你点个大大的赞！👍"
};

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 角色交互状态
  const [selectedChar, setSelectedChar] = useState(null);
  const [interactionMode, setInteractionMode] = useState(null); // 'menu', 'ask', 'chat', 'ar'
  
  // 聊天与语音状态
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef(null);

  // 总结环节状态
  const [isSummaryFinished, setIsSummaryFinished] = useState(false);
  const [summaryAnswered, setSummaryAnswered] = useState(false);

  const isEndPage = currentPage === bookData.length;
  const currentData = bookData[currentPage];

  // 自动滚动聊天到底部
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 处理翻页
  const nextPage = () => {
    if (currentPage < bookData.length) {
      setCurrentPage(prev => prev + 1);
      resetStates();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      resetStates();
    }
  };

  const resetStates = () => {
    setSelectedChar(null);
    setInteractionMode(null);
    setChatMessages([]);
    setIsPlaying(false);
    setIsRecording(false);
    setSummaryAnswered(false);
  };

  // 点击画面中的角色
  const handleCharClick = (char) => {
    setSelectedChar(char);
    setInteractionMode('menu');
  };

  // 模拟发送消息给大模型角色
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // 用户消息
    const newUserMsg = { sender: 'user', text: inputText };
    setChatMessages(prev => [...prev, newUserMsg]);
    setInputText('');

    // 模拟大模型回复延迟
    setTimeout(() => {
      const aiReply = `你好呀！${selectedChar.persona} 听到你说的啦！我觉得你非常有趣！`;
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 1000);
  };

  // 模拟语音输入 (儿童语音识别)
  const handleVoiceInput = (isSummary = false) => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      if (isSummary) {
        setSummaryAnswered(true);
      } else {
        const simulatedVoiceText = "你好呀小动物！";
        setChatMessages(prev => [...prev, { sender: 'user', text: simulatedVoiceText }]);
        setTimeout(() => {
          const aiReply = `哈哈，你好呀小朋友！${selectedChar.persona}`;
          setChatMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
        }, 1000);
      }
    }, 2000); // 录音2秒后完成
  };

  // --- 界面组件：角色交互弹窗 ---
  const CharacterModal = () => {
    if (!selectedChar || !interactionMode) return null;

    return (
      <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 rounded-3xl backdrop-blur-sm transition-all">
        <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl transform transition-all scale-100">
          
          {/* 顶部导航与关闭 */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
              <span className="text-4xl">{selectedChar.avatar}</span>
              {selectedChar.name}
            </h3>
            <button 
              onClick={() => setInteractionMode(null)}
              className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* 模式1：功能选择菜单 */}
          {interactionMode === 'menu' && (
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setInteractionMode('ask')}
                className="flex items-center gap-4 bg-blue-100 hover:bg-blue-200 p-4 rounded-2xl text-blue-700 font-bold text-xl transition-colors"
              >
                <div className="bg-blue-500 text-white p-3 rounded-full"><Info size={28} /></div>
                小度百科：了解TA
              </button>
              <button 
                onClick={() => {
                  setInteractionMode('chat');
                  setChatMessages([{ sender: 'ai', text: `你好呀，小朋友！${selectedChar.persona}` }]);
                }}
                className="flex items-center gap-4 bg-green-100 hover:bg-green-200 p-4 rounded-2xl text-green-700 font-bold text-xl transition-colors"
              >
                <div className="bg-green-500 text-white p-3 rounded-full"><MessageCircle size={28} /></div>
                和 {selectedChar.name} 聊天
              </button>
              <button 
                onClick={() => setInteractionMode('ar')}
                className="flex items-center gap-4 bg-purple-100 hover:bg-purple-200 p-4 rounded-2xl text-purple-700 font-bold text-xl transition-colors"
              >
                <div className="bg-purple-500 text-white p-3 rounded-full"><ScanFace size={28} /></div>
                召唤3D立体 AR
              </button>
            </div>
          )}

          {/* 模式2：小度百科 */}
          {interactionMode === 'ask' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 relative">
                <div className="absolute -top-4 -left-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">小度解答</div>
                <p className="text-gray-700 text-lg leading-relaxed mt-2">{selectedChar.encyclopedia}</p>
              </div>
              <button onClick={() => setInteractionMode('menu')} className="w-full text-center text-blue-500 font-bold mt-4">返回菜单</button>
            </div>
          )}

          {/* 模式3：角色对话 (大模型驱动) */}
          {interactionMode === 'chat' && (
            <div className="flex flex-col h-80">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-lg ${
                      msg.sender === 'user' 
                        ? 'bg-orange-400 text-white rounded-br-sm' 
                        : 'bg-green-100 text-green-800 rounded-bl-sm border-2 border-green-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
              
              {/* 聊天输入区 */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVoiceInput(false)}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${
                    isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Mic size={24} />
                </button>
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="或者输入文字..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-3 bg-orange-400 text-white rounded-full hover:bg-orange-500"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}

          {/* 模式4：AR展示 (模拟) */}
          {interactionMode === 'ar' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-48 h-48 bg-purple-100 rounded-full flex items-center justify-center border-4 border-purple-300 border-dashed animate-spin-slow">
                <span className="text-8xl animate-bounce">{selectedChar.avatar}</span>
              </div>
              <p className="mt-6 text-purple-600 font-bold text-xl text-center">
                请将摄像头对准平坦的桌面<br/><span className="text-sm font-normal">正在加载AR模型...</span>
              </p>
              <button onClick={() => setInteractionMode('menu')} className="mt-8 text-gray-500 font-bold">返回</button>
            </div>
          )}

        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 font-sans selection:bg-orange-200">
      {/* 绘本主容器 - 模拟iPad/平板设备外观 */}
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white relative flex flex-col h-[90vh]">
        
        {/* 顶部导航条 */}
        <div className="h-16 bg-gradient-to-r from-orange-300 to-yellow-400 flex items-center justify-between px-6 text-white shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen size={28} />
            <h2>绘本奇妙之旅</h2>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: bookData.length + 1 }).map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i <= currentPage ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          
          {/* 阅读模式 (1~N页) */}
          {!isEndPage && (
            <div className="h-full flex flex-col">
              {/* 图片与CV识别区域 */}
              <div className="relative flex-1 overflow-hidden group">
                <img 
                  src={currentData.image} 
                  alt="绘本画面" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* 叠加层：CV角色识别定位框 */}
                {currentData.characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => handleCharClick(char)}
                    style={char.position}
                    className="absolute border-4 border-yellow-400 rounded-3xl cursor-pointer hover:bg-yellow-400/20 transition-all flex items-center justify-center group/box animate-pulse-slow"
                    aria-label={`点击与${char.name}互动`}
                  >
                    {/* 提示小标签 */}
                    <div className="absolute -top-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold shadow-md opacity-0 group-hover/box:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-1">
                      <Sparkles size={16} /> 点我互动
                    </div>
                  </button>
                ))}
              </div>

              {/* 大模型扩写故事区域 */}
              <div className="h-1/3 min-h-[220px] bg-white rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] p-6 relative z-10 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Sparkles size={16} /> AI 沉浸式扩写
                  </span>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-orange-500 hover:text-orange-600 transition-transform hover:scale-110"
                  >
                    {isPlaying ? <PauseCircle size={48} /> : <PlayCircle size={48} />}
                  </button>
                </div>
                
                <div className="overflow-y-auto pr-4 flex-1">
                  <p className="text-gray-400 text-sm mb-2 line-through">原文：{currentData.originalText}</p>
                  <p className="text-2xl text-gray-700 leading-relaxed font-medium">
                    {currentData.expandedText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 总结与互动模式 (最后一页) */}
          {isEndPage && (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-green-50">
              <div className="max-w-2xl w-full bg-white p-8 rounded-[3rem] shadow-xl text-center relative overflow-hidden border-4 border-green-200">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-300 rounded-full opacity-20 blur-xl"></div>
                
                <h2 className="text-3xl font-bold text-green-600 mb-6 flex items-center justify-center gap-2">
                  <Volume2 className="text-green-500" size={36} /> 绘本小结
                </h2>
                
                <p className="text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                  {summaryData.moral}
                </p>

                <div className="bg-blue-50 rounded-3xl p-6 mb-8 border-2 border-blue-100">
                  <p className="text-xl text-blue-800 font-bold mb-6">
                    🤔 {summaryData.question}
                  </p>
                  
                  {!summaryAnswered ? (
                    <button 
                      onClick={() => handleVoiceInput(true)}
                      className={`mx-auto flex flex-col items-center justify-center w-24 h-24 rounded-full transition-all ${
                        isRecording 
                          ? 'bg-red-500 scale-110 shadow-lg shadow-red-200 animate-pulse' 
                          : 'bg-blue-500 hover:bg-blue-600 shadow-xl shadow-blue-200 hover:scale-105'
                      }`}
                    >
                      <Mic className="text-white mb-1" size={36} />
                      <span className="text-white text-sm font-bold">{isRecording ? '聆听中...' : '按住说话'}</span>
                    </button>
                  ) : (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex items-start gap-4 animate-fade-in">
                      <div className="bg-green-500 text-white p-2 rounded-full shrink-0"><Sparkles size={24} /></div>
                      <p className="text-left text-green-700 text-lg font-medium">{summaryData.aiResponse}</p>
                    </div>
                  )}
                </div>

                {summaryAnswered && (
                  <button 
                    onClick={() => setCurrentPage(0)}
                    className="bg-green-500 text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    再读一遍
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 页面切换按钮 */}
          <button 
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${
              currentPage === 0 ? 'bg-white/50 text-gray-400 cursor-not-allowed' : 'bg-white/90 text-orange-500 hover:bg-orange-50 hover:scale-110'
            }`}
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={nextPage}
            disabled={currentPage === bookData.length}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${
              currentPage === bookData.length ? 'bg-white/50 text-gray-400 cursor-not-allowed' : 'bg-white/90 text-orange-500 hover:bg-orange-50 hover:scale-110 animate-bounce'
            }`}
          >
            <ChevronRight size={32} />
          </button>

          {/* 渲染角色交互弹窗 */}
          <CharacterModal />

        </div>
      </div>

      {/* 补充一点全局样式 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 15px rgba(250, 204, 21, 0); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
}