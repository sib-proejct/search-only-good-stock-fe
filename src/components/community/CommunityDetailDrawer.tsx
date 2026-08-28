import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DiscussionPost } from '../../types/community';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { TRENDING_TICKERS } from '../../services/communityData';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  ArrowRight,
} from 'lucide-react';

interface CommunityDetailDrawerProps {
  post: DiscussionPost | null;
  isOpen: boolean;
  onClose: () => void;
  postList: DiscussionPost[];
  onSelectPost: (postId: string) => void;
  onVote: (postId: string, type: 'up' | 'down') => void;
  onToggleBookmark: (postId: string) => void;
  isBookmarked: boolean;
  onAddComment: (postId: string, commentText: string) => void;
  onSelectStock?: (ticker: string) => void;
  showToast?: (msg: string) => void;
  onWidthChange?: (width: number) => void;
  onResizingChange?: (isResizing: boolean) => void;
}

export const CommunityDetailDrawer: React.FC<CommunityDetailDrawerProps> = ({
  post,
  isOpen,
  onClose,
  postList,
  onSelectPost,
  onVote,
  onToggleBookmark,
  isBookmarked,
  onAddComment,
  onSelectStock,
  showToast,
  onWidthChange,
  onResizingChange,
}) => {
  const { t, language } = useAppConfig();
  const [commentText, setCommentText] = useState('');

  // Mobile Touch Swipe Down to Close (Works anywhere: Header, Title, Content, Comments)
  const asideRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isDraggingSheetRef = useRef<boolean>(false);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState<boolean>(false);

  useEffect(() => {
    const asideEl = asideRef.current;
    if (!asideEl || !isOpen || typeof window === 'undefined') return;

    const isMobile = () => window.innerWidth < 640;

    const onTouchStart = (e: TouchEvent) => {
      if (!isMobile()) return;
      const target = e.target as HTMLElement;
      // Do not intercept when typing in input or textarea
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        touchStartY.current = null;
        return;
      }

      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
      isDraggingSheetRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isMobile() || touchStartY.current === null || touchStartX.current === null) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartY.current;
      const deltaX = currentX - touchStartX.current;

      // Ignore horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) return;

      const scrollTop = scrollContainerRef.current ? scrollContainerRef.current.scrollTop : 0;

      // When dragging downwards and scroll is at top (<= 5px)
      if (deltaY > 0 && scrollTop <= 5) {
        isDraggingSheetRef.current = true;
        setIsDraggingSheet(true);
        setDragOffsetY(deltaY);

        if (e.cancelable) {
          e.preventDefault();
        }
      } else if (scrollTop > 5) {
        touchStartY.current = currentY;
        isDraggingSheetRef.current = false;
        setDragOffsetY(0);
        setIsDraggingSheet(false);
      }
    };

    const onTouchEnd = () => {
      if (touchStartY.current === null) return;
      const elapsed = Date.now() - touchStartTime.current;
      const isQuickSwipe = isDraggingSheetRef.current && elapsed < 300;

      if (isDraggingSheetRef.current && (dragOffsetY > 45 || isQuickSwipe)) {
        onClose();
      }

      setDragOffsetY(0);
      setIsDraggingSheet(false);
      isDraggingSheetRef.current = false;
      touchStartY.current = null;
      touchStartX.current = null;
    };

    asideEl.addEventListener('touchstart', onTouchStart, { passive: true });
    asideEl.addEventListener('touchmove', onTouchMove, { passive: false });
    asideEl.addEventListener('touchend', onTouchEnd, { passive: true });
    asideEl.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      asideEl.removeEventListener('touchstart', onTouchStart);
      asideEl.removeEventListener('touchmove', onTouchMove);
      asideEl.removeEventListener('touchend', onTouchEnd);
      asideEl.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isOpen, onClose, dragOffsetY]);

  // Drawer width resizing
  const DEFAULT_WIDTH = 860;
  const MIN_WIDTH = 480;

  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('community_detail_drawer_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH) {
          return Math.min(parsed, typeof window !== 'undefined' ? window.innerWidth - 40 : 1000);
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    onWidthChange?.(drawerWidth);
  }, [drawerWidth, onWidthChange]);

  useEffect(() => {
    onResizingChange?.(isResizing);
  }, [isResizing, onResizingChange]);

  // Resize handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth = Math.max(window.innerWidth - 40, MIN_WIDTH);
      const calculatedWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(Math.max(calculatedWidth, MIN_WIDTH), maxWidth);
      setDrawerWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    try {
      localStorage.setItem('community_detail_drawer_width', drawerWidth.toString());
    } catch {
      // ignore
    }
  }, [drawerWidth]);

  // Post Index Navigation
  const currentIndex = post
    ? postList.findIndex((p) => p.id === post.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < postList.length - 1;

  const handlePrevPost = useCallback(() => {
    if (hasPrev && currentIndex > 0) {
      onSelectPost(postList[currentIndex - 1].id);
    }
  }, [hasPrev, currentIndex, postList, onSelectPost]);

  const handleNextPost = useCallback(() => {
    if (hasNext && currentIndex < postList.length - 1) {
      onSelectPost(postList[currentIndex + 1].id);
    }
  }, [hasNext, currentIndex, postList, onSelectPost]);

  // Keyboard navigation: Escape to close, Left/Right arrow to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid key trigger if typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPost();
      } else if (e.key === 'ArrowRight') {
        handleNextPost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevPost, handleNextPost]);

  // Prevent background scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !post) {
    return null;
  }

  const getStockInfo = (ticker: string) => {
    const matched = TRENDING_TICKERS.find((t) => t.ticker.toUpperCase() === ticker.toUpperCase());
    if (matched) return matched;
    if (ticker.toUpperCase() === 'KO') {
      return { ticker: 'KO', name: language === 'ko' ? '코카콜라' : 'Coca-Cola', price: '$64.20', change: '-0.45%', score: 95 };
    }
    return {
      ticker,
      name: ticker.replace('.KS', ''),
      price: '$150.00',
      change: '+0.50%',
      score: 85,
    };
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-stretch justify-center sm:justify-end pointer-events-none"
    >
      {/* 1. Backdrop Overlay (Mobile only overlay; non-blocking on desktop) */}
      <div
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
        className="fixed inset-0 bg-black/40 dark:bg-black/70 sm:bg-transparent sm:dark:bg-transparent backdrop-blur-xs sm:backdrop-none transition-opacity duration-300 animate-fade-in pointer-events-auto sm:pointer-events-none cursor-pointer"
        aria-hidden="true"
      />

      {/* 2. Slide Panel Container (Desktop: Right Side Panel, Mobile: Bottom Sheet) */}
      <aside
        ref={asideRef}
        style={{
          width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : `${drawerWidth}px`,
          transform: typeof window !== 'undefined' && window.innerWidth < 640 && dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : undefined,
          transition: isDraggingSheet ? 'none' : isResizing ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative z-10 w-full max-w-full bg-[#FBFBFD] dark:bg-[#121212] h-[85vh] sm:h-full max-h-[92vh] sm:max-h-full rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl border-t sm:border-t-0 sm:border-l border-black/[0.08] dark:border-white/[0.1] pointer-events-auto ${isResizing || isDraggingSheet ? 'select-none' : ''
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-post-title"
      >
        {/* Mobile Top Grab Bar Indicator (Click/Tap to Close) */}
        <div
          onClick={onClose}
          className="sm:hidden w-full flex items-center justify-center pt-3 pb-1.5 shrink-0 cursor-pointer touch-none"
          title="닫기"
        >
          <div className="w-12 h-1.5 rounded-full bg-black/25 dark:bg-white/25" />
        </div>
        {/* Left Drag Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setDrawerWidth(DEFAULT_WIDTH)}
          className={`hidden sm:flex absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-ew-resize z-30 items-center justify-center group hover:bg-[#0071E3]/15 dark:hover:bg-[#2997FF]/20 transition-colors ${isResizing ? 'bg-[#0071E3]/25 dark:bg-[#2997FF]/30' : ''
            }`}
          title="드래그하여 너비 조절 (더블클릭: 기본 너비)"
          aria-label="Resize panel width"
        >
          <div
            className={`w-1 rounded-full transition-all duration-200 ${isResizing
              ? 'h-16 bg-[#0071E3] dark:bg-[#2997FF] shadow-sm'
              : 'h-8 bg-black/20 dark:bg-white/20 group-hover:h-12 group-hover:bg-[#0071E3] dark:group-hover:bg-[#2997FF]'
              }`}
          />
        </div>

        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 px-5 sm:px-6 py-3.5 bg-[#FBFBFD]/95 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3 select-none">
          {/* Left: Section Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              내재가치 분석 상세
            </span>
          </div>


          {/* Right: Actions & Close Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(post.id)}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${isBookmarked
                ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] bg-white dark:bg-[#1C1C1E] border-black/[0.08] dark:border-white/[0.08]'
                }`}
              title="북마크"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                if (showToast) showToast('내재가치 글 링크가 복사되었습니다.');
              }}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] transition-colors cursor-pointer"
              title="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
              title="닫기 (Esc)"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body (Single Unified Article Card) */}
        <div
          ref={scrollContainerRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3.5 sm:px-6 py-4 sm:py-5 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6 cursor-default overflow-hidden"
          >

            {/* 1. Compact 2-Line Article Header Section (No Avatar, No Badge) */}
            <div className="space-y-2.5 pb-1">

              {/* Line 1: [종목명 말머리 뱃지] + [게시글 제목] + [작성 시각] */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/20 dark:border-[#2997FF]/30 whitespace-nowrap shrink-0">
                    {post.category}
                  </span>
                  <h1
                    id="drawer-post-title"
                    className="font-bold text-sm sm:text-base text-[#1D1D1F] dark:text-[#F5F5F7] truncate min-w-0 flex-1"
                    title={post.title}
                  >
                    {post.title}
                  </h1>
                </div>
                <span className="text-[11px] text-[#86868B] shrink-0 whitespace-nowrap">
                  {post.createdAt}
                </span>
              </div>

              {/* Line 2: [작성자 닉네임] */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {post.author.name}
                </span>
              </div>
            </div>

            {/* 2. Article Content Section */}
            <div className="pt-5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
              {/* Readable Inline Stock Metrics (Name, Ticker, Price, Change Rate, Buffett Score, View Analysis) */}
              {post.ticker && (() => {
                const stock = getStockInfo(post.ticker);
                const isUp = stock.change.startsWith('+');
                return (
                  <div className="flex items-center gap-2 text-xs flex-wrap py-0.5">
                    {/* Stock Name & Ticker */}
                    <span className="font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] bg-black/[0.05] dark:bg-white/[0.1] px-2 py-0.5 rounded-md text-[11px]">
                      {stock.name} <span className="font-mono text-[#6E6E73] dark:text-[#A1A1A6]">({post.ticker.replace('.KS', '')})</span>
                    </span>

                    {/* Current Price */}
                    <span className="font-bold tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {stock.price}
                    </span>

                    {/* Change Rate Pill */}
                    <span
                      className={`font-semibold tabular-nums text-[11px] px-1.5 py-0.5 rounded ${isUp
                        ? 'bg-[#34C759]/15 text-[#34C759] dark:text-[#30D158]'
                        : 'bg-[#FF3B30]/15 text-[#FF3B30] dark:text-[#FF453A]'
                        }`}
                    >
                      {stock.change}
                    </span>

                    {/* Buffett Score Pill */}
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]">
                      {t('buffettScoreShort')} {post.buffettScore ?? stock.score}{t('scorePts')}
                    </span>

                    {/* Action Link */}
                    {onSelectStock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(post.ticker!);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-xs text-[#0071E3] dark:text-[#2997FF] hover:underline cursor-pointer ml-1"
                      >
                        <span>{t('viewAnalysisLabel')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })()}

              <MarkdownRenderer content={post.content} />

              {/* Centered Upvote & Downvote Button Bar (Compact & Smaller) */}
              <div className="flex justify-center pt-2 pb-0.5">
                <div className="flex items-center bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl p-0.5 border border-black/[0.04] dark:border-white/[0.08]">
                  <button
                    onClick={() => onVote(post.id, 'up')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${post.userVote === 'up'
                      ? 'bg-[#34C759]/15 dark:bg-[#34C759]/25 text-[#34C759] dark:text-[#30D158] font-bold'
                      : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] text-[#86868B]'
                      }`}
                    title="추천"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="tabular-nums font-semibold">{post.upvotes}</span>
                  </button>
                  <div className="w-px h-3 bg-black/[0.06] dark:bg-white/[0.1] mx-0.5" />
                  <button
                    onClick={() => onVote(post.id, 'down')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${post.userVote === 'down'
                      ? 'bg-[#FF3B30]/15 dark:bg-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] font-bold'
                      : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] text-[#86868B]'
                      }`}
                    title="비추천"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span className="tabular-nums font-semibold">{post.downvotes}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Comments Section */}
            <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                  <span>
                    {t('comments')} ({post.commentsCount})
                  </span>
                </div>
              </div>

              {/* Comment Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendComment();
                  }}
                  placeholder={t('writeCommentPlaceholder')}
                  className="flex-1 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] px-3.5 py-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${commentText.trim()
                    ? 'bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-[#86868B] cursor-not-allowed'
                    }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('addComment')}</span>
                </button>
              </div>

              {/* Comments List */}
              {post.comments && post.comments.length > 0 ? (
                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] border-y border-black/[0.06] dark:border-white/[0.08] my-2">
                  {post.comments.map((c) => (
                    <div
                      key={c.id}
                      className="py-2.5 px-1 text-xs"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 text-xs">
                        {/* 작성자 고정 컬럼 (수직 줄맞춤) */}
                        <div className="w-24 sm:w-28 shrink-0 pt-0.5">
                          <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] truncate block" title={c.author.name}>
                            {c.author.name}
                          </span>
                        </div>

                        {/* 댓글 본문 (진하고 선명한 텍스트 색상) */}
                        <div className="min-w-0 flex-1 leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7] break-words font-medium pt-0.5">
                          {c.content}
                        </div>

                        {/* 작성 시각 */}
                        <div className="w-12 sm:w-14 text-right shrink-0 pt-0.5">
                          <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] whitespace-nowrap">
                            {c.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#86868B] dark:text-[#86868B] py-3 text-center">
                  첫 댓글을 작성하여 토론에 참여해보세요!
                </p>
              )}
            </div>

          </div>
        </div>
      </aside>
    </div>
  );
};
