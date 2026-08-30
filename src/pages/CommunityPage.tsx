import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Clock, Calendar,
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark,
  Plus, Search, CheckCircle2, Tag, ChevronDown, Check,
  ArrowRight, X, Send, LayoutList, PanelRight
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import {
  DiscussionCategory,
  DiscussionSort,
  DiscussionPost,
  Comment
} from '../types/community';
import {
  TRENDING_TICKERS,
  getStoredDiscussions,
  saveDiscussions
} from '../services/communityData';
import { CommunityDetailDrawer } from '../components/community/CommunityDetailDrawer';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';

interface CommunityPageProps {
  onSelectStock?: (ticker: string) => void;
}

interface StockCategoryOption {
  name: string;
  ticker?: string;
  count: number;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onSelectStock }) => {
  const navigate = useNavigate();
  const { t, language } = useAppConfig();

  const handleStockClick = (ticker: string) => {
    if (onSelectStock) {
      onSelectStock(ticker);
    }
    navigate(`/stock/${ticker}`);
  };

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
  const [discussions, setDiscussions] = useState<DiscussionPost[]>(() => getStoredDiscussions());

  // Re-sync discussions on window focus (e.g. returning from write page)
  useEffect(() => {
    const handleFocus = () => {
      setDiscussions(getStoredDiscussions());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const [activeCategory, setActiveCategory] = useState<DiscussionCategory>('all');
  const [activeSort, setActiveSort] = useState<DiscussionSort>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [collapsedCommentPostIds, setCollapsedCommentPostIds] = useState<Set<string>>(new Set());
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Searchable Category Combobox State
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close Category Dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  // Aggregate available stock categories with post count
  const allStockCategoryOptions = useMemo<StockCategoryOption[]>(() => {
    const countMap = new Map<string, { ticker?: string; count: number }>();

    // Count from discussions
    discussions.forEach((p) => {
      if (p.category && p.category !== 'all') {
        const existing = countMap.get(p.category);
        countMap.set(p.category, {
          ticker: p.ticker || existing?.ticker,
          count: (existing?.count || 0) + 1,
        });
      }
    });

    // Ensure trending tickers are included even if count is 0
    TRENDING_TICKERS.forEach((t) => {
      const cleanName = t.name.split(' (')[0];
      if (!countMap.has(cleanName)) {
        countMap.set(cleanName, {
          ticker: t.ticker,
          count: 0,
        });
      }
    });

    const list: StockCategoryOption[] = [];
    countMap.forEach((val, name) => {
      list.push({
        name,
        ticker: val.ticker,
        count: val.count,
      });
    });

    // Sort: categories with more posts first, then alphabetical
    return list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [discussions]);

  // Filter category options based on search input
  const filteredCategoryOptions = useMemo(() => {
    if (!categorySearchTerm.trim()) {
      return allStockCategoryOptions;
    }
    const q = categorySearchTerm.toLowerCase();
    return allStockCategoryOptions.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        (opt.ticker && opt.ticker.toLowerCase().includes(q))
    );
  }, [allStockCategoryOptions, categorySearchTerm]);

  // View Mode State: 'list' (Inline list expansion) or 'panel' (Right side slide drawer)
  const [viewMode, setViewMode] = useState<'list' | 'panel'>(() => {
    try {
      const saved = localStorage.getItem('community_view_mode');
      if (saved === 'list' || saved === 'panel') return saved;
    } catch {
      // ignore
    }
    return 'list';
  });

  const [selectedPanelPostId, setSelectedPanelPostId] = useState<string | null>(null);
  const [drawerWidth, setDrawerWidth] = useState<number>(780);
  const [isDrawerResizing, setIsDrawerResizing] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('community_view_mode', viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

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

  // Navigate to Dedicated Write Page
  const handleOpenWritePage = () => {
    if (activeCategory && activeCategory !== 'all') {
      navigate(`/community/write?category=${encodeURIComponent(activeCategory)}`);
    } else {
      navigate('/community/write');
    }
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Upvote / Downvote Handler
  const handleVote = (postId: string, type: 'up' | 'down') => {
    setDiscussions((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;

        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newVote: 'up' | 'down' | null = type;

        if (post.userVote === type) {
          newVote = null;
          if (type === 'up') newUpvotes -= 1;
          else newDownvotes -= 1;
        } else if (post.userVote) {
          if (type === 'up') {
            newUpvotes += 1;
            newDownvotes -= 1;
          } else {
            newDownvotes += 1;
            newUpvotes -= 1;
          }
        } else {
          if (type === 'up') newUpvotes += 1;
          else newDownvotes -= 1;
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newVote,
        };
      });
      saveDiscussions(updated);
      return updated;
    });
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
        name: '나',
      },
      createdAt: currentTime,
      content: text,
      likes: 0,
    };

    setDiscussions((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...(post.comments || []), newComment],
        };
      });
      saveDiscussions(updated);
      return updated;
    });

    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
    showToast('댓글이 등록되었습니다.');
  };

  // Filter & Sort logic
  const filteredDiscussions = discussions
    .filter((post) => {
      if (activeCategory !== 'all' && post.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        const matchesTicker = post.ticker?.toLowerCase().includes(query);
        const matchesCategory = post.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesTicker && !matchesCategory) {
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

  const isDesktop = windowWidth >= 640;
  const isPanelOpenOnDesktop = isDesktop && viewMode === 'panel' && Boolean(selectedPanelPostId);

  return (
    <div
      style={{
        paddingRight: isPanelOpenOnDesktop ? `${drawerWidth}px` : 0,
        transition: isDrawerResizing ? 'none' : 'padding-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6 animate-fade-in font-sans"
    >

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in border border-white/10 dark:border-black/10">
          <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search, Sort & Stock Category Controls Bar */}
      <div className="cq-controls-wrapper w-full space-y-2.5">
        <div className="cq-top-controls flex flex-wrap items-center justify-between gap-2.5 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          
          {/* Left Group: Searchable Stock Tag Combobox (Far Left) & Sort Tabs */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* 1. Searchable Stock Category (말머리) Combobox Dropdown - 맨 왼쪽 */}
            <div className="relative shrink-0" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  setCategorySearchTerm('');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
                  activeCategory !== 'all'
                    ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] border-[#0071E3]/30 dark:border-[#2997FF]/40 font-bold'
                    : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border-transparent'
                }`}
                title="말머리(종목) 검색 및 선택"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                  <span className="text-[11px] text-[#86868B] font-medium hidden min-[400px]:inline">말머리:</span>
                  <span className="truncate max-w-[130px] sm:max-w-[180px] font-bold">
                    {activeCategory === 'all' ? t('allStockCategory') : activeCategory}
                  </span>
                </div>

                {activeCategory !== 'all' ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCategory('all');
                    }}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-full cursor-pointer ml-0.5 transition-colors"
                    title="전체 종목으로 초기화"
                  >
                    <X className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                  </span>
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180 text-[#0071E3] dark:text-[#2997FF]' : ''}`} />
                )}
              </button>

              {/* Category Search Popover Dropdown (High-end Glassmorphism) */}
              {isCategoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-56 sm:w-60 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-2 z-50 animate-fade-in space-y-1.5">
                  {/* Combobox Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      placeholder={t('searchStockCategoryPlaceholder')}
                      className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-7 pr-6 py-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B] font-medium"
                    />
                    <Search className="w-3 h-3 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    {categorySearchTerm && (
                      <button
                        onClick={() => setCategorySearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-0.5 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Stock List Shelf */}
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar text-xs">
                    {/* All Stocks Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('all');
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                        activeCategory === 'all'
                          ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-bold shadow-xs'
                          : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#86868B]" />
                        <span className="font-semibold">{t('allStockCategory')}</span>
                      </div>
                      {activeCategory === 'all' && (
                        <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                      )}
                    </button>

                    <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

                    {/* Filtered Stock Categories */}
                    {filteredCategoryOptions.length > 0 ? (
                      filteredCategoryOptions.map((opt) => {
                        const isSelected = activeCategory.toLowerCase() === opt.name.toLowerCase();
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => {
                              setActiveCategory(opt.name);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-bold shadow-xs'
                                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate font-semibold">{opt.name}</span>
                              {opt.ticker && (
                                <span className="font-mono text-[10px] text-[#6E6E73] dark:text-[#86868B] bg-black/[0.04] dark:bg-white/[0.08] px-1.5 py-0.5 rounded shrink-0">
                                  {opt.ticker.replace('.KS', '')}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-4 px-2 text-center text-xs text-[#86868B] space-y-2">
                        <p>{t('noMatchingStockCategory')}</p>
                        {categorySearchTerm.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCategory(categorySearchTerm.trim());
                              setIsCategoryDropdownOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] font-bold hover:bg-[#0071E3]/20 transition-all cursor-pointer text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>'{categorySearchTerm.trim()}' 말머리로 직접 필터</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-0.5" />

            {/* 2. Sort Tabs (Segmented Pill Switcher) */}
            <div className="flex items-center gap-0.5 bg-black/[0.04] dark:bg-white/[0.05] p-0.5 rounded-xl overflow-x-auto no-scrollbar shrink-0">
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
                    className={`shrink-0 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] shadow-xs font-bold'
                      : 'text-[#86868B] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Group: Search, View Mode & New Discussion CTA */}
          <div className="cq-top-right-group flex items-center gap-2 shrink-0 justify-between sm:justify-end">
            {/* Single Unified View Mode Toggle Button */}
            <button
              onClick={() => {
                if (viewMode === 'list') {
                  setViewMode('panel');
                } else {
                  setViewMode('list');
                  setSelectedPanelPostId(null);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.04] dark:border-white/[0.08] text-xs font-semibold transition-all cursor-pointer shrink-0"
              title={viewMode === 'list' ? `${t('rightPanelView')}로 전환` : `${t('listView')}로 전환`}
            >
              {viewMode === 'list' ? (
                <>
                  <LayoutList className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                  <span className="hidden min-[360px]:inline text-[11px] sm:text-xs">{t('listView')}</span>
                </>
              ) : (
                <>
                  <PanelRight className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                  <span className="hidden min-[360px]:inline sm:hidden text-[11px]">{t('panelView')}</span>
                  <span className="hidden sm:inline text-xs">{t('rightPanelView')}</span>
                </>
              )}
            </button>

            {/* Compact Fluid Search Bar */}
            <div className="relative flex-1 min-w-[90px] max-w-full sm:max-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 rounded-xl border border-black/[0.04] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
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
              onClick={handleOpenWritePage}
              className="px-3.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newDiscussion')}</span>
            </button>
          </div>
        </div>

        {/* Active Tag Filter Status Banner (Appears only when a specific stock tag is active) */}
        {activeCategory !== 'all' && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#0071E3]/8 dark:bg-[#2997FF]/12 border border-[#0071E3]/20 dark:border-[#2997FF]/25 rounded-xl animate-fade-in text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0071E3] dark:bg-[#2997FF] animate-pulse" />
              <span className="text-[#86868B] dark:text-[#A1A1A6] font-medium">선택된 말머리:</span>
              <span className="font-bold text-[#0071E3] dark:text-[#2997FF] text-xs sm:text-sm">{activeCategory}</span>
              <span className="text-[11px] text-[#86868B] dark:text-[#86868B] bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-md font-medium">
                {filteredDiscussions.length}건의 내재가치 분석
              </span>
            </div>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs font-bold text-[#0071E3] dark:text-[#2997FF] hover:underline flex items-center gap-1 cursor-pointer bg-white dark:bg-[#1C1C1E] px-2.5 py-1 rounded-lg border border-[#0071E3]/20 dark:border-[#2997FF]/30 shadow-2xs"
            >
              <span>전체 보기</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Discussion Feed */}
      <div>
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-12 text-center border border-black/[0.06] dark:border-white/[0.08] space-y-3 shadow-sm">
            <MessageSquare className="w-10 h-10 text-[#86868B] mx-auto stroke-1" />
            <div className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              선택한 말머리({activeCategory === 'all' ? '전체 종목' : activeCategory})에 해당하는 내재가치 글이 없습니다.
            </div>
            <p className="text-xs text-[#86868B]">
              이 종목의 첫 번째 Owner Earnings DCF 내재가치 분석 글을 게시해보세요!
            </p>
            <button
              onClick={handleOpenWritePage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-bold hover:bg-[#0077ED] dark:hover:bg-[#2997FF] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>첫 내재가치 글 작성하기</span>
            </button>
          </div>
        ) : (
          <div className="cq-feed-container bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
            {filteredDiscussions.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const isBookmarked = bookmarkedIds.has(post.id);
              const isCommentsFolded = collapsedCommentPostIds.has(post.id);

              const isPanelSelected = viewMode === 'panel' && selectedPanelPostId === post.id;

              const handlePostItemClick = () => {
                if (viewMode === 'panel') {
                  setSelectedPanelPostId(post.id);
                } else {
                  setExpandedPostId(isExpanded ? null : post.id);
                }
              };

              const handleCategoryTagClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                setActiveCategory((prev) => (prev === post.category ? 'all' : post.category));
              };

              return (
                <div
                  key={post.id}
                  className={`p-3 sm:px-4 sm:py-3.5 hover:bg-[#F5F5F7]/60 dark:hover:bg-[#2C2C2E]/40 transition-all ${isPanelSelected
                    ? 'bg-[#0071E3]/5 dark:bg-[#2997FF]/10 border-l-4 border-[#0071E3] dark:border-[#2997FF]'
                    : ''
                    }`}
                >
                  {/* Single Horizontal Row (Header: Title, Category, Action buttons) */}
                  <div
                    onClick={handlePostItemClick}
                    className="flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer select-none"
                  >
                    {/* Left: 종목명 말머리 & 게시글 제목 */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* 말머리 고정 컬럼 (종목명 뱃지, 클릭 시 해당 종목 필터링 전환) */}
                      <div className="shrink-0 flex items-center">
                        <button
                          type="button"
                          onClick={handleCategoryTagClick}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#0071E3]/10 hover:bg-[#0071E3]/20 dark:bg-[#2997FF]/15 dark:hover:bg-[#2997FF]/25 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/20 dark:border-[#2997FF]/30 whitespace-nowrap cursor-pointer transition-colors"
                          title={`'${post.category}' 말머리 글만 모아보기`}
                        >
                          {post.category}
                        </button>
                      </div>

                      {/* 게시글 제목 */}
                      <h2
                        className={`font-medium text-xs sm:text-sm transition-colors truncate min-w-0 flex-1 ${isPanelSelected
                          ? 'text-[#0071E3] dark:text-[#2997FF] font-bold'
                          : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF]'
                          }`}
                        title={post.title}
                      >
                        {post.title}
                      </h2>
                    </div>

                    {/* Right: 작성자 이름, 추천, 비추천, 댓글, 북마크, 링크 공유, 작성 시각 (순수 CSS Container Query 60fps) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs text-[#86868B] dark:text-[#86868B] whitespace-nowrap">
                      {/* Tier 2: 작성자 이름 및 추천/비추천 (컨테이너 너비 >= 720px) */}
                      <div className="cq-tier-2 items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* 작성자 이름 */}
                        <span className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-[80px] sm:max-w-[100px]">
                          {post.author.name}
                        </span>

                        {/* 추천 / 비추천 */}
                        <div className="flex items-center bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.08]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(post.id, 'up');
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(post.id, 'down');
                            }}
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

                      {/* Tier 3: 북마크 및 공유 (컨테이너 너비 >= 850px) */}
                      <div className="cq-tier-3 items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(post.id);
                          }}
                          className={`p-1 rounded transition-colors cursor-pointer ${isBookmarked ? 'text-[#F59E0B]' : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                            }`}
                          title="북마크"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard?.writeText(window.location.href);
                            showToast('내재가치 글 링크가 복사되었습니다.');
                          }}
                          className="p-1 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
                          title="공유하기"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Tier 1: 댓글 수 및 작성 시각 (컨테이너 너비 >= 480px) */}
                      <div className="cq-tier-1 items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* 댓글 수 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePostItemClick();
                          }}
                          className={`flex items-center gap-1 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer ${(viewMode === 'list' && isExpanded) || isPanelSelected ? 'text-[#0071E3] dark:text-[#2997FF] font-bold' : ''
                            }`}
                          title="댓글 및 상세 보기"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="tabular-nums text-[11px]">{post.commentsCount}</span>
                        </button>

                        {/* 작성 시각 */}
                        <span className="text-[11px] text-[#86868B] dark:text-[#86868B] whitespace-nowrap">
                          {post.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content View (List view mode only) */}
                  {viewMode === 'list' && isExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.06] space-y-4 animate-fade-in text-xs sm:text-sm cursor-default"
                    >
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStockClick(post.ticker!);
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
                      <MarkdownRenderer content={post.content} />

                      {/* Centered Upvote & Downvote Button Bar */}
                      <div className="flex justify-center pt-2 pb-0.5">
                        <div className="flex items-center bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl p-0.5 border border-black/[0.04] dark:border-white/[0.08]">
                          <button
                            onClick={() => handleVote(post.id, 'up')}
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
                            onClick={() => handleVote(post.id, 'down')}
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

                      {/* Embedded Comments Section */}
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
                              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] border-y border-black/[0.06] dark:border-white/[0.08] my-2">
                                {post.comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="py-2.5 px-1 text-xs"
                                  >
                                    <div className="flex items-start gap-2.5 sm:gap-3 text-xs">
                                      <div className="w-24 sm:w-28 shrink-0 pt-0.5">
                                        <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] truncate block" title={comment.author.name}>
                                          {comment.author.name}
                                        </span>
                                      </div>

                                      <div className="min-w-0 flex-1 leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7] break-words font-medium pt-0.5">
                                        {comment.content}
                                      </div>

                                      <div className="w-12 sm:w-14 text-right shrink-0 pt-0.5">
                                        <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] whitespace-nowrap">
                                          {comment.createdAt}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#86868B] dark:text-[#86868B] py-2 text-center">
                                첫 댓글을 작성하여 내재가치 토론에 참여해보세요!
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

      {/* Community Post Detail Slide-over Panel (Side Panel View Mode) */}
      <CommunityDetailDrawer
        post={discussions.find((p) => p.id === selectedPanelPostId) || null}
        isOpen={viewMode === 'panel' && Boolean(selectedPanelPostId)}
        onClose={() => setSelectedPanelPostId(null)}
        postList={filteredDiscussions}
        onSelectPost={(postId) => setSelectedPanelPostId(postId)}
        onWidthChange={(w) => setDrawerWidth(w)}
        onResizingChange={(r) => setIsDrawerResizing(r)}
        onVote={handleVote}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={selectedPanelPostId ? bookmarkedIds.has(selectedPanelPostId) : false}
        onAddComment={(postId, commentText) => {
          setNewCommentText((prev) => ({ ...prev, [postId]: commentText }));
          const text = commentText.trim();
          if (!text) return;
          const now = new Date();
          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const newComment: Comment = {
            id: `c-${Date.now()}`,
            author: { name: '나' },
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
          showToast('댓글이 등록되었습니다.');
        }}
        onSelectStock={handleStockClick}
        showToast={showToast}
      />

    </div>
  );
};
