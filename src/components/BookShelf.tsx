import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Sparkles, MoreVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import type { BookMeta } from '../data/books';

interface BookShelfProps {
  books: BookMeta[];
  onSelectBook: (book: BookMeta) => void;
  onUploadClick: () => void;
  onRenameBook?: (bookId: string, newTitle: string) => void;
  onDeleteBook?: (bookId: string) => void;
}

export default function BookShelf({ books, onSelectBook, onUploadClick, onRenameBook, onDeleteBook }: BookShelfProps) {
  const [activeMenuBookId, setActiveMenuBookId] = useState<string | null>(null);
  const [renamingBookId, setRenamingBookId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const activeMenuBookIdRef = useRef<string | null>(null);
  activeMenuBookIdRef.current = activeMenuBookId;

  // 点击外部关闭菜单（用 ref 存 activeMenuBookId，避免 stale closure）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!activeMenuBookIdRef.current) return;
      const target = e.target as HTMLElement;
      // 如果点击的是菜单按钮或菜单本身内部，不关闭
      if (target.closest('[data-menu-container]')) return;
      setActiveMenuBookId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (book: BookMeta) => {
    setActiveMenuBookId(null);
    setRenamingBookId(book.bookId);
    setRenameValue(book.title);
    // 下一帧聚焦
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(`[data-rename-input="${book.bookId}"]`);
      input?.focus();
      input?.select();
    }, 50);
  };

  const handleConfirmRename = () => {
    if (renamingBookId && renameValue.trim()) {
      onRenameBook?.(renamingBookId, renameValue.trim());
    }
    setRenamingBookId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingBookId(null);
    setRenameValue('');
  };

  const handleStartDelete = (bookId: string) => {
    setActiveMenuBookId(null);
    setDeletingBookId(bookId);
  };

  const handleConfirmDelete = () => {
    if (deletingBookId) {
      onDeleteBook?.(deletingBookId);
    }
    setDeletingBookId(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-50 to-orange-50 overflow-y-auto">
      {/* 标题区 */}
      <div className="text-center pt-8 pb-6 px-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BookOpen size={36} className="text-orange-500" />
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            绘本书架
          </h1>
          <BookOpen size={36} className="text-yellow-500" />
        </div>
        <p className="text-gray-500 text-lg font-medium">选一本喜欢的绘本，开始奇妙之旅吧！</p>
      </div>

      {/* 书架网格 */}
      <div className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 上传入口卡片 */}
          <button
            onClick={onUploadClick}
            className="group flex flex-col items-center justify-center bg-white rounded-3xl border-4 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all min-h-[280px] shadow-sm hover:shadow-lg"
          >
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={40} className="text-orange-500" />
            </div>
            <span className="text-orange-500 font-bold text-lg">上传我的绘本</span>
            <span className="text-orange-400 text-sm mt-1">上传图片或PDF，AI帮你讲故事</span>
          </button>

          {/* 绘本卡片 */}
          {books.map((book) => (
            <div
              key={book.bookId}
              className="group relative flex flex-col bg-white rounded-3xl overflow-visible shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* 删除确认遮罩 — 绝对定位在卡片之上 */}
              {deletingBookId === book.bookId && (
                <div className="absolute inset-0 bg-black/60 z-30 rounded-3xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                  <p className="text-white font-bold text-lg text-center px-4">确定删除这本绘本吗？</p>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirmDelete(); }}
                      className="bg-red-500 text-white px-5 py-2 rounded-full font-bold hover:bg-red-600 transition-colors"
                    >
                      删除
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingBookId(null); }}
                      className="bg-white/90 text-gray-700 px-5 py-2 rounded-full font-bold hover:bg-white transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* 封面图区域 — 用 div 而非 button，避免嵌套按钮问题 */}
              <div
                onClick={() => {
                  if (renamingBookId !== book.bookId && deletingBookId !== book.bookId) onSelectBook(book);
                }}
                className="relative h-48 overflow-hidden rounded-t-3xl cursor-pointer"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Sparkles size={18} className="text-orange-500" />
                    <span className="font-bold text-orange-600">开始阅读</span>
                  </div>
                </div>
                {/* 标签 */}
                {book.isUploaded && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                    我的
                  </div>
                )}
                {/* 操作按钮 */}
                {book.isUploaded && (
                  <div
                    data-menu-container
                    className="absolute top-2 left-2 z-20"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuBookId(activeMenuBookId === book.bookId ? null : book.bookId);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>
                    {activeMenuBookId === book.bookId && (
                      <div className="absolute left-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-28 z-30">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartRename(book); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={14} /> 重命名
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartDelete(book.bookId); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} /> 删除
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 信息 */}
              <div className="p-4 flex-1 flex flex-col">
                {renamingBookId === book.bookId ? (
                  <div className="flex items-center gap-1 mb-1">
                    <input
                      data-rename-input={book.bookId}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-gray-100 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirmRename(); }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelRename(); }}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{book.emoji}</span>
                    <h3 className="font-bold text-gray-800 text-lg truncate">{book.title}</h3>
                  </div>
                )}
                <p className="text-gray-500 text-sm line-clamp-2 flex-1">{book.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-400">
                    {book.pages.length} 页 · {book.isUploaded ? '我的上传' : '经典绘本'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
