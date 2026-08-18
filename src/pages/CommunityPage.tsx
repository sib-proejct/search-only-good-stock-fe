import React, { useState } from 'react';
import {
  MessageSquare, Clock, Calendar,
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark,
  Plus, Search, CheckCircle2,
  ArrowRight, X, Send
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import {
  DiscussionCategory,
  DiscussionSort,
  DiscussionPost,
  Comment
} from '../types/community';
import {
  INITIAL_DISCUSSIONS,
  TRENDING_TICKERS
} from '../services/communityData';

interface CommunityPageProps {
  onSelectStock?: (ticker: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onSelectStock }) => {
  const { t, language } = useAppConfig();

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

  // State
  const [discussions, setDiscussions] = useState<DiscussionPost[]>(INITIAL_DISCUSSIONS);
  const [activeCategory] = useState<DiscussionCategory>('all');
  const [activeSort, setActiveSort] = useState<DiscussionSort>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [collapsedCommentPostIds, setCollapsedCommentPostIds] = useState<Set<string>>(new Set());
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleCommentsFold = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedCommentPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState<DiscussionCategory>('buffett');
  const [modalTicker, setModalTicker] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalTags, setModalTags] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Upvote / Downvote Handler
  const handleVote = (postId: string, type: 'up' | 'down') => {
    setDiscussions((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newVote: 'up' | 'down' | null = type;

        if (post.userVote === type) {
          // Unvote
          newVote = null;
          if (type === 'up') newUpvotes -= 1;
          else newDownvotes -= 1;
        } else if (post.userVote) {
          // Switch vote
          if (type === 'up') {
            newUpvotes += 1;
            newDownvotes -= 1;
          } else {
            newDownvotes += 1;
            newUpvotes -= 1;
          }
        } else {
          // First vote
          if (type === 'up') newUpvotes += 1;
          else newDownvotes += 1;
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newVote,
        };
      })
    );
  };

  // Bookmark Handler
  const handleToggleBookmark = (postId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        showToast('북마크에서 제거되었습니다.');
      } else {
        next.add(postId);
        showToast('북마크에 저장되었습니다.');
      }
      return next;
    });
  };

  // Add Comment Handler
  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: {
        name: '나 (가치투자자)',
      },
      createdAt: currentTime,
      content: text,
      likes: 0,
    };

    setDiscussions((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...(post.comments || []), newComment],
        };
      })
    );

    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
    showToast('댓글이 등록되었습니다.');
  };

  // Create Post Submit Handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalContent.trim()) {
      showToast('제목과 내용을 입력해주세요.');
      return;
    }

    const tagsArray = modalTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPost: DiscussionPost = {
      id: `post-${Date.now()}`,
      title: modalTitle.trim(),
      category: modalCategory,
      author: {
        name: '나 (가치투자자)',
        isVerified: false,
      },
      createdAt: currentTime,
      ticker: modalTicker.trim().toUpperCase() || undefined,
      stockPassStatus: 'pass',
      buffettScore: 100,
      snippet: modalContent.trim().slice(0, 160) + '...',
      content: modalContent.trim(),
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      commentsCount: 0,
      viewsCount: 1,
      tags: tagsArray.length > 0 ? tagsArray : ['가치투자'],
      comments: [],
    };

    setDiscussions([newPost, ...discussions]);
    setIsWriteModalOpen(false);
    setModalTitle('');
    setModalContent('');
    setModalTicker('');
    setModalTags('');
    showToast('새 토론 글이 게시되었습니다!');
  };

  // Filter & Sort logic
  const filteredDiscussions = discussions
    .filter((post) => {
      if (activeCategory !== 'all' && post.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        const matchesTicker = post.ticker?.toLowerCase().includes(query);
        const matchesTag = post.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesContent && !matchesTicker && !matchesTag) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned posts always stay on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (activeSort === 'daily') {
        return b.upvotes - a.upvotes;
      }
      if (activeSort === 'weekly') {
        return (b.upvotes * 2 + b.commentsCount * 3) - (a.upvotes * 2 + a.commentsCount * 3);
      }
      if (activeSort === 'monthly') {
        return (b.viewsCount || 0) - (a.viewsCount || 0) || (b.upvotes - a.upvotes);
      }
      if (activeSort === 'top') {
        return b.upvotes - a.upvotes;
      }
      // 'latest' default
      return 0;
    });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 space-y-6 animate-fade-in font-sans">

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in border border-white/10 dark:border-black/10">
          <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1C1C1E] p-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'latest', label: t('sortLatest'), icon: Clock },
              { id: 'top', label: t('sortTop'), icon: ThumbsUp },
              { id: 'daily', label: 'Daily', icon: Calendar },
              { id: 'weekly', label: 'Weekly', icon: Calendar },
              { id: 'monthly', label: 'Monthly', icon: Calendar },
            ] as const
          ).map((s) => {
            const Icon = s.icon;
            const isActive = activeSort === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSort(s.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${isActive
                  ? 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] shadow-xs'
                  : 'text-[#86868B] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & New Discussion CTA */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('communitySearchPlaceholder')}
              className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-black/[0.04] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
            />
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newDiscussion')}</span>
          </button>
        </div>
      </div>

      {/* Main Discussion Feed */}
      <div>
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-12 text-center border border-black/[0.06] dark:border-white/[0.08] space-y-3 shadow-sm">
            <MessageSquare className="w-10 h-10 text-[#86868B] mx-auto stroke-1" />
            <div className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              검색 조건에 해당하는 토론이 없습니다.
            </div>
            <p className="text-xs text-[#86868B]">
              새로운 가치투자 아이디어를 가장 먼저 게시해보세요!
            </p>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-bold hover:bg-[#0077ED] dark:hover:bg-[#2997FF] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>첫 토론 시작하기</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
            {filteredDiscussions.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const isBookmarked = bookmarkedIds.has(post.id);
              const isCommentsFolded = collapsedCommentPostIds.has(post.id);

              const getCategoryKeyword = (cat: DiscussionCategory): string => {
                switch (cat) {
                  case 'analysis':
                    return '분석';
                  case 'valuation':
                    return '정보';
                  case 'buffett':
                    return '버핏밸류';
                  case 'lynch':
                    return '피터린치';
                  case 'outlook':
                    return '전망';
                  default:
                    return '일반';
                }
              };

              return (
                <div
                  key={post.id}
                  className="p-3 sm:px-4 sm:py-3.5 hover:bg-[#F5F5F7]/60 dark:hover:bg-[#2C2C2E]/40 transition-colors"
                >
                  {/* Single Horizontal Row */}
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    {/* Left: 말머리 & 게시글 제목 */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* 말머리 고정 컬럼 (뱃지 자체는 안 늘어나고 제목 시작위치만 정렬) */}
                      <div className="w-14 sm:w-16 shrink-0 flex items-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] border border-black/[0.04] dark:border-white/[0.08] whitespace-nowrap">
                          {getCategoryKeyword(post.category)}
                        </span>
                      </div>

                      {/* 게시글 제목 */}
                      <h2
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className="font-medium text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors cursor-pointer truncate min-w-0 flex-1"
                        title={post.title}
                      >
                        {post.title}
                      </h2>
                    </div>

                    {/* Right: 작성자 이름, 추천, 비추천, 댓글, 북마크, 링크 공유, 작성 시각(맨 끝) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs text-[#86868B] dark:text-[#86868B]">
                      {/* 작성자 이름 고정 컬럼 (오른쪽 정렬) */}
                      <div className="w-20 sm:w-28 text-right shrink-0">
                        <span className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate block">
                          {post.author.name}
                        </span>
                      </div>

                      {/* 추천 / 비추천 컬럼 */}
                      <div className="w-12 sm:w-20 shrink-0 flex justify-center">
                        <div className="flex items-center bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.08]">
                          <button
                            onClick={() => handleVote(post.id, 'up')}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${post.userVote === 'up'
                              ? 'bg-[#34C759]/15 dark:bg-[#34C759]/25 text-[#34C759] dark:text-[#30D158] font-bold'
                              : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                              }`}
                            title="추천"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="tabular-nums text-[11px]">{post.upvotes}</span>
                          </button>
                          <div className="w-px h-3 bg-black/[0.06] dark:bg-white/[0.1] hidden sm:block" />
                          <button
                            onClick={() => handleVote(post.id, 'down')}
                            className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${post.userVote === 'down'
                              ? 'bg-[#FF3B30]/15 dark:bg-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] font-bold'
                              : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                              }`}
                            title="비추천"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* 댓글 컬럼 */}
                      <div className="w-10 sm:w-12 shrink-0 flex justify-center">
                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className={`flex items-center gap-1 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer ${isExpanded ? 'text-[#0071E3] dark:text-[#2997FF] font-bold' : ''
                            }`}
                          title="댓글 및 상세 보기"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="tabular-nums text-[11px]">{post.commentsCount}</span>
                        </button>
                      </div>

                      {/* 북마크 컬럼 (모바일 숨김) */}
                      <div className="w-6 shrink-0 hidden sm:flex justify-center">
                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${isBookmarked ? 'text-[#F59E0B]' : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                            }`}
                          title="북마크"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* 링크 공유 컬럼 (모바일 숨김) */}
                      <div className="w-6 shrink-0 hidden sm:flex justify-center">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            showToast('토론 링크가 복사되었습니다.');
                          }}
                          className="p-1 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
                          title="공유하기"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 작성 시각 컬럼 (맨 끝 위치) */}
                      <div className="w-12 sm:w-14 text-right shrink-0">
                        <span className="text-[11px] text-[#86868B] dark:text-[#86868B] whitespace-nowrap">
                          {post.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content View (Post Content + Tags + Comments) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.06] space-y-4 animate-fade-in text-xs sm:text-sm">
                      {/* Readable Inline Stock Metrics (Name, Ticker, Price, Change Rate, Buffett Score) */}
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
                              className={`font-semibold tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                                isUp
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectStock?.(post.ticker!);
                              }}
                              className="inline-flex items-center gap-1 font-bold text-xs text-[#0071E3] dark:text-[#2997FF] hover:underline cursor-pointer ml-1"
                            >
                              <span>{t('viewAnalysisLabel')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })()}

                      {/* Post Content */}
                      <div className="text-[#424245] dark:text-[#D1D1D6] leading-relaxed whitespace-pre-line font-normal">
                        {post.content}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.tags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery(tag);
                            }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>

                      {/* Embedded Comments Section (With Fold / Unfold Toggle) */}
                      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          <span>{t('comments')} ({post.commentsCount})</span>
                          <button
                            onClick={(e) => toggleCommentsFold(post.id, e)}
                            className="text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isCommentsFolded ? t('expandComments') : t('collapseComments')}</span>
                            <ArrowRight className={`w-3 h-3 transition-transform ${isCommentsFolded ? 'rotate-90' : '-rotate-90'}`} />
                          </button>
                        </div>

                        {!isCommentsFolded && (
                          <>
                            {post.comments && post.comments.length > 0 ? (
                              <div className="space-y-2">
                                {post.comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 rounded-xl p-3 text-xs space-y-1.5 border border-black/[0.02] dark:border-white/[0.04]"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                                          {comment.author.name}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-[#86868B] dark:text-[#86868B]">
                                        {comment.createdAt}
                                      </span>
                                    </div>
                                    <p className="text-[#424245] dark:text-[#D1D1D6] leading-relaxed">
                                      {comment.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#86868B] dark:text-[#86868B] py-2 text-center">
                                첫 댓글을 작성하여 토론에 참여해보세요!
                              </p>
                            )}

                            {/* New Comment Input */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={newCommentText[post.id] || ''}
                                onChange={(e) =>
                                  setNewCommentText({
                                    ...newCommentText,
                                    [post.id]: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddComment(post.id);
                                }}
                                placeholder={t('writeCommentPlaceholder')}
                                className="flex-1 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] px-3.5 py-2 rounded-xl border border-black/[0.04] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-3 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>{t('addComment')}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create New Discussion Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.12] space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
                <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {t('writeModalTitle')}
                </h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                    {t('categorySelect')}
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as DiscussionCategory)}
                    className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.1] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF]"
                  >
                    <option value="buffett" className="dark:bg-[#1C1C1E] dark:text-[#F5F5F7]">{t('categoryBuffett')}</option>
                    <option value="lynch" className="dark:bg-[#1C1C1E] dark:text-[#F5F5F7]">{t('categoryLynch')}</option>
                    <option value="analysis" className="dark:bg-[#1C1C1E] dark:text-[#F5F5F7]">{t('categoryAnalysis')}</option>
                    <option value="valuation" className="dark:bg-[#1C1C1E] dark:text-[#F5F5F7]">{t('categoryValuation')}</option>
                    <option value="outlook" className="dark:bg-[#1C1C1E] dark:text-[#F5F5F7]">{t('categoryOutlook')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                    {t('tickerTagLabel')}
                  </label>
                  <input
                    type="text"
                    value={modalTicker}
                    onChange={(e) => setModalTicker(e.target.value)}
                    placeholder="예: AAPL, BRK.B"
                    className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.1] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] uppercase placeholder-[#86868B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  제목
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                  className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.1] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  분석 본문
                </label>
                <textarea
                  required
                  rows={6}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder={t('contentPlaceholder')}
                  className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.1] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] resize-none leading-relaxed placeholder-[#86868B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  {t('tagsLabel')}
                </label>
                <input
                  type="text"
                  value={modalTags}
                  onChange={(e) => setModalTags(e.target.value)}
                  placeholder="예: 워런버핏, 1달러테스트, FCF"
                  className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.1] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#86868B] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('submitPost')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
