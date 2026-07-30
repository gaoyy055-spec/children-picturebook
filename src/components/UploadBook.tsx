import { useState, useRef } from 'react';
import { Upload, X, ImagePlus, Sparkles, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { pdfToImages } from '../utils/pdf';
import type { BookMeta, BookPageData } from '../data/books';

interface UploadBookProps {
  onBookCreated: (book: BookMeta) => void;
  onBack: () => void;
}

export default function UploadBook({ onBookCreated, onBack }: UploadBookProps) {
  const [title, setTitle] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const imageFiles: File[] = [];
    const pdfFiles: File[] = [];

    newFiles.forEach((file) => {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        pdfFiles.push(file);
      } else if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      }
    });

    // 处理图片（现有逻辑）
    for (const file of imageFiles) {
      const dataUrl = await readFileAsDataURL(file);
      const base64 = dataUrl.split(',')[1];
      setImagePreviews((prev) => [...prev, dataUrl]);
      setImageBase64s((prev) => [...prev, base64]);
    }

    // 处理 PDF
    for (const file of pdfFiles) {
      setPdfProcessing(true);
      try {
        const dataUrls = await pdfToImages(file, (current, total) => {
          setPdfProgress({ current, total });
        });
        dataUrls.forEach((dataUrl) => {
          const base64 = dataUrl.split(',')[1];
          setImagePreviews((prev) => [...prev, dataUrl]);
          setImageBase64s((prev) => [...prev, base64]);
        });
      } catch (err) {
        console.error('PDF 解析失败:', err);
      } finally {
        setPdfProcessing(false);
        setPdfProgress({ current: 0, total: 0 });
      }
    }

    e.target.value = '';
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 移除图片
  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageBase64s((prev) => prev.filter((_, i) => i !== index));
  };

  // 开始识别（不再调用 AI，仅构建页面结构）
  const handleAnalyze = async () => {
    if (imageBase64s.length === 0) return;
    setAnalyzing(true);
    setAnalyzeProgress(0);

    const total = imageBase64s.length;
    const bookTitle = title.trim() || '我的绘本';
    const pages: BookPageData[] = [];

    for (let i = 0; i < total; i++) {
      setAnalyzeProgress(Math.round(((i + 1) / total) * 100));
      pages.push({
        id: i + 1,
        image: imagePreviews[i],
        originalText: '',
        expandedText: '',
        characters: [],
      });
    }

    const newBook: BookMeta = {
      bookId: `uploaded-${Date.now()}`,
      title: bookTitle,
      cover: imagePreviews[0],
      description: `${bookTitle} · ${pages.length}页`,
      emoji: '📖',
      pages,
      isUploaded: true,
      createdAt: Date.now(),
    };

    setAnalyzeProgress(100);
    setAnalyzing(false);
    onBookCreated(newBook);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-sky-50 overflow-y-auto">
      {/* 顶部 */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors">
          <ArrowLeft size={24} /> 返回书架
        </button>
        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
          <Upload size={28} /> 上传绘本
        </h2>
        <div />
      </div>

      <div className="flex-1 px-6 pb-8 space-y-6">
        {/* 书名输入 */}
        <div>
          <label className="block text-gray-600 font-bold mb-2">给绘本起个名字（可选）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：我的冒险故事"
            className="w-full bg-white rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-300 text-lg font-medium border-2 border-purple-100"
          />
        </div>

        {/* 上传区域 */}
        <div>
          <label className="block text-gray-600 font-bold mb-2">上传绘本图片或 PDF（每张/每页为一页）</label>

          {/* 拖拽/点击上传区 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-purple-200 rounded-3xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            <ImagePlus size={48} className="mx-auto text-purple-300 mb-3" />
            <p className="text-purple-500 font-bold text-lg">点击选择文件</p>
            <p className="text-purple-400 text-sm mt-1">支持 JPG / PNG / PDF，可多选</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* PDF 解析进度 */}
        {pdfProcessing && (
          <div className="bg-white rounded-2xl p-4 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={24} className="text-blue-500" />
              <span className="font-bold text-blue-600">正在解析 PDF...</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${pdfProgress.total > 0 ? (pdfProgress.current / pdfProgress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-center text-blue-500 font-bold mt-2">
              正在解析第 {pdfProgress.current} / {pdfProgress.total} 页...
            </p>
          </div>
        )}

        {/* 图片预览列表 */}
        {imagePreviews.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-bold">已选择 {imagePreviews.length} 张图片</span>
              <button
                onClick={() => { setImagePreviews([]); setImageBase64s([]); }}
                className="text-sm text-red-400 hover:text-red-600 font-bold"
              >
                清空全部
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group rounded-2xl overflow-hidden shadow-sm border-2 border-purple-100">
                  <img src={src} alt={`第${i + 1}页`} className="w-full h-28 object-cover" />
                  <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {i + 1}
                  </div>
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {/* 添加更多 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 flex items-center justify-center h-28 transition-colors"
              >
                <Plus size={28} className="text-purple-300" />
              </button>
            </div>
          </div>
        )}

        {/* 识别按钮 */}
        {imageBase64s.length > 0 && !pdfProcessing && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className={`w-full py-4 rounded-full text-white font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-lg ${
              analyzing
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
            }`}
          >
            {analyzing ? (
              <>
                <Loader2 size={28} className="animate-spin" />
                AI 阅读中... {analyzeProgress}%
              </>
            ) : (
              <>
                <Sparkles size={28} />
                开始 AI 阅读，生成互动绘本
              </>
            )}
          </button>
        )}

        {/* 识别进度 */}
        {analyzing && (
          <div className="bg-white rounded-2xl p-4 border-2 border-purple-100">
            <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${analyzeProgress}%` }}
              />
            </div>
            <p className="text-center text-purple-500 font-bold mt-2">
              正在阅读第 {Math.max(1, Math.round(analyzeProgress / (100 / imageBase64s.length)))} / {imageBase64s.length} 页...
            </p>
            <p className="text-center text-gray-400 text-sm">AI 正在看图讲故事、识别角色</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
