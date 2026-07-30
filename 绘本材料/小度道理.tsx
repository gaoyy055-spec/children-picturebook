import React, { useState } from 'react';

// --- Reusable SVG Icons ---
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const IconMic = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const IconVolume = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const IconPause = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const IconIdeaBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
    <circle cx="50" cy="50" r="48" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="4"/>
    <path d="M30 60 Q 50 70 70 60 L 70 40 Q 50 50 30 40 Z" fill="#fff" stroke="#F59E0B" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M50 45 L 50 65" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
    <path d="M45 25 Q 50 15 55 25 Q 60 35 50 40 Q 40 35 45 25 Z" fill="#FDE047" stroke="#EAB308" strokeWidth="2"/>
    <path d="M50 40 L 50 45" stroke="#EAB308" strokeWidth="2"/>
    <path d="M35 50 L 45 53 M 65 50 L 55 53" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M43 32 Q 50 38 57 32" stroke="#F59E0B" strokeWidth="2" fill="none"/>
  </svg>
);

// Custom stylized robot mascot based on the images
const Mascot = () => (
  <div className="relative w-48 h-56 flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
    <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl">
      {/* Arms */}
      <path d="M 50 140 Q 20 120 30 160 Q 40 180 55 170" fill="none" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round"/>
      <circle cx="25" cy="155" r="10" fill="#fff" stroke="#94A3B8" strokeWidth="3"/>
      
      <path d="M 150 140 Q 180 120 170 160 Q 160 180 145 170" fill="none" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round"/>
      <circle cx="175" cy="155" r="10" fill="#fff" stroke="#94A3B8" strokeWidth="3"/>

      {/* Body */}
      <rect x="65" y="120" width="70" height="90" rx="30" fill="#fff" stroke="#94A3B8" strokeWidth="4"/>
      <circle cx="100" cy="165" r="20" fill="#60A5FA" opacity="0.8"/>
      
      {/* Legs */}
      <rect x="75" y="200" width="16" height="30" rx="8" fill="#fff" stroke="#94A3B8" strokeWidth="3"/>
      <rect x="109" y="200" width="16" height="30" rx="8" fill="#fff" stroke="#94A3B8" strokeWidth="3"/>
      
      {/* Head */}
      <rect x="40" y="30" width="120" height="95" rx="40" fill="#fff" stroke="#94A3B8" strokeWidth="4"/>
      
      {/* Head details (red/blue accents) */}
      <path d="M 45 60 Q 60 35 100 35 L 100 45 Q 65 45 50 65 Z" fill="#EF4444"/>
      <path d="M 155 60 Q 140 35 100 35 L 100 45 Q 135 45 150 65 Z" fill="#3B82F6"/>

      {/* Face Screen */}
      <rect x="55" y="50" width="90" height="60" rx="20" fill="#1E293B"/>
      
      {/* Eyes & Mouth (Happy) */}
      <path d="M 70 70 Q 80 60 90 70" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="120" cy="70" r="5" fill="#fff"/>
      <path d="M 90 85 Q 100 95 110 85 Z" fill="#EF4444"/>
      
      {/* Ears */}
      <rect x="30" y="65" width="10" height="25" rx="5" fill="#94A3B8"/>
      <rect x="160" y="65" width="10" height="25" rx="5" fill="#94A3B8"/>
    </svg>
  </div>
);

// Content for Screen 1: 小度道理
const ReasonScreen = () => (
  <div className="flex flex-col items-center w-full h-full p-8 animate-fadeIn">
    <h2 className="text-3xl font-bold text-red-900 mb-8 mt-4 tracking-wide text-center">
      【在此生成绘本总结与道理的大标题】
    </h2>
    
    <div className="flex items-center justify-center w-full max-w-4xl gap-8 relative z-10">
      <Mascot />
      
      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-4 border-orange-100 shadow-lg relative ml-4">
        {/* Overlapping Icon */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <IconIdeaBook />
        </div>
        
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-red-900 mb-4">
            【在此生成核心教育道理标题占位符】
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed text-justify">
            【在此生成针对该绘本的最核心、最具体的教育道理描述文本，包含几行文字。这里的内容应该比原来三个小块的文本更深入、更全面，针对唯一的、核心的道理进行阐述。】
          </p>
        </div>
      </div>
    </div>

    <p className="text-xl font-semibold text-red-900 mt-10 mb-8">
      [在此生成针对整个绘本内容的最终总结性教育道理语句]
    </p>

    <button className="bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-2xl font-bold py-4 px-16 rounded-full shadow-lg transition-transform transform hover:scale-105">
      我也知道了，完成！
    </button>
  </div>
);

// Content for Screen 2: 互动时刻
const InteractionScreen = () => (
  <div className="flex flex-col items-center w-full h-full p-8 animate-fadeIn">
    <h2 className="text-3xl font-bold text-red-900 mb-6 mt-2 tracking-wide text-center">
      【在此生成互动时刻的主标题：聊聊你的想法吧！】
    </h2>
    
    <div className="flex items-center justify-center w-full max-w-4xl gap-8 relative z-10">
      <Mascot />
      
      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-4 border-orange-100 shadow-lg ml-4">
        <div className="text-left">
          <p className="text-gray-800 text-lg font-bold mb-4 leading-relaxed">
            【在此生成一个针对该绘本内容的具体、深刻的互动问标题占位符，例如：如果你是小豆，你会如何向黑豆和他的朋友们介绍这个奇妙的地方？请用语音告诉小度！】
          </p>
          <p className="text-gray-600 text-base leading-relaxed text-justify">
            【在此生成具体的问题文本占位符，包含更深入的引导，例如：在奇妙之旅的第17页，黑豆和他的朋友们（红豆、绿豆、黄豆、粉豆）在雨中看着成都熊猫基地的黑白地标的黑白地标，谈论着黑豆。如果你是小豆，你会对他们说什么呢？分享你的想法和感受！】
          </p>
        </div>
      </div>
    </div>

    <div className="mt-8 flex flex-col items-center w-full">
      <p className="text-red-900 text-lg font-semibold mb-6">
        【在语音回复前，在此生成语音回复引导文本：把你的想法通过下面的麦克风说出来吧！】
      </p>

      {/* Voice Interaction Area */}
      <div className="flex items-center justify-center gap-6 w-full max-w-2xl">
         {/* Fake Soundwaves Left */}
         <div className="flex items-center gap-1 opacity-50">
           <div className="w-1.5 h-4 bg-orange-400 rounded-full animate-pulse"></div>
           <div className="w-1.5 h-8 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '100ms'}}></div>
           <div className="w-1.5 h-12 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
           <div className="w-1.5 h-6 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
         </div>

        {/* Mic Button */}
        <button className="relative group">
          <div className="absolute inset-0 bg-orange-300 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-gradient-to-b from-orange-400 to-orange-500 rounded-full p-6 shadow-xl group-hover:scale-105 transition-transform">
            <IconMic />
          </div>
        </button>

        {/* Fake Soundwaves Right */}
        <div className="flex items-center gap-1 opacity-50">
           <div className="w-1.5 h-6 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
           <div className="w-1.5 h-12 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
           <div className="w-1.5 h-8 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '100ms'}}></div>
           <div className="w-1.5 h-4 bg-orange-400 rounded-full animate-pulse"></div>
         </div>
      </div>
      
      <div className="flex justify-between w-full max-w-4xl px-8 mt-6 text-sm font-medium text-gray-500">
        <span>【互动语音回复中...】</span>
        <div className="flex flex-col items-end">
          <span className="text-gray-800 mb-1">【在语音回复后，在此生成完成互动的按钮，例如：我讲完了! / 提交互动！】</span>
          <span>【在此生成语音回复按钮状态，例如：点击录音 / 说完停止】</span>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeScreen, setActiveScreen] = useState(0); // 0 = 道理, 1 = 互动

  const handlePrev = () => setActiveScreen(0);
  const handleNext = () => setActiveScreen(1);

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 font-sans selection:bg-orange-200">
      
      {/* Inject custom animations */}
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
          background-color: #FFEDD5; /* Tailwind orange-50 equivalent */
        }
      `}</style>

      {/* Main Tablet Container */}
      <div className="w-full max-w-[1200px] h-[750px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-8 border-white/50">
        
        {/* Header Bar */}
        <header className="bg-orange-400 text-white h-16 flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-orange-500 rounded-full transition-colors">
              <IconBack />
            </button>
            <IconBook />
            <span className="text-xl font-bold tracking-wider">
              {activeScreen === 0 ? "小度道理" : "【在此生成互动时刻的标题】"}
            </span>
          </div>
          <div className="text-orange-100 font-medium tracking-widest text-sm">
            {activeScreen === 0 ? "22 / 22" : "23 / 24"}
          </div>
        </header>

        {/* Floating Chat Bubble */}
        <div className="absolute top-20 right-6 z-30">
          <button className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition-transform transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            <span className="font-bold">小度</span>
          </button>
        </div>

        {/* Content Area with Cloud Background */}
        <main className="flex-1 bg-clouds relative flex overflow-hidden">
          
          {/* Navigation Arrows (Fixed on edges) */}
          <button 
            onClick={handlePrev}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center z-30 transition-all ${activeScreen === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-lg'}`}
            disabled={activeScreen === 0}
          >
            <IconChevronLeft />
          </button>

          <button 
            onClick={handleNext}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center z-30 transition-all ${activeScreen === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-lg'}`}
            disabled={activeScreen === 1}
          >
            <IconChevronRight />
          </button>

          {/* Dynamic Content */}
          <div className="w-full h-full flex items-center justify-center pb-16">
            {activeScreen === 0 ? <ReasonScreen /> : <InteractionScreen />}
          </div>
        </main>

        {/* Bottom Status Bar */}
        <footer className="absolute bottom-4 left-0 w-full px-8 flex justify-between items-center z-20 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-sm text-gray-500 text-sm font-medium hover:bg-white cursor-pointer transition-colors">
            <IconVolume />
            绘本讲解
          </div>
          
          <div className="pointer-events-auto flex items-center gap-3 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-sm">
            <span className="text-gray-500 text-sm font-medium">已解读</span>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
              <IconPause />
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}