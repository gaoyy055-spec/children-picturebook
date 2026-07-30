import { useCallback } from 'react';
import { useReadingStore } from '../stores/readingStore';
import { speak, stopSpeaking } from '../services/tts';
import type { BookData } from '../types';

/** 绘本阅读 Hook：翻页 + 朗读 */
export function useBookReader(book: BookData) {
  const { currentPageIndex, nextPage, prevPage, setCurrentPage, isAtEnd } = useReadingStore();

  const currentPage = book.pages[currentPageIndex];
  const totalPages = book.pages.length;

  const goNext = useCallback(() => {
    stopSpeaking();
    nextPage(totalPages);
  }, [nextPage, totalPages]);

  const goPrev = useCallback(() => {
    stopSpeaking();
    prevPage();
  }, [prevPage]);

  const goToPage = useCallback(
    (index: number) => {
      stopSpeaking();
      setCurrentPage(index);
    },
    [setCurrentPage],
  );

  const readCurrentPage = useCallback(() => {
    if (currentPage) {
      speak(currentPage.text);
    }
  }, [currentPage]);

  return {
    currentPage,
    currentPageIndex,
    totalPages,
    isAtEnd,
    goNext,
    goPrev,
    goToPage,
    readCurrentPage,
  };
}
