import React, { useState } from 'react';
import { 
  Users, MessageSquare, ShieldCheck, Flame, Clock, 
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, 
  Plus, Search, CheckCircle2, TrendingUp, TrendingDown,
  Sparkles, Award, HelpCircle, ArrowRight, X, Send,
  Pin, Filter, BarChart3, AlertCircle
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { 
  DiscussionCategory, 
  DiscussionSort, 
  DiscussionPost, 
  SentimentPoll,
  Comment
} from '../types/community';
import { 
  INITIAL_DISCUSSIONS, 
  INITIAL_POLL, 
  TOP_CONTRIBUTORS, 
  TRENDING_TICKERS 
} from '../services/communityData';

interface CommunityPageProps {
  onSelectStock?: (ticker: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onSelectStock }) => {
  const { t } = useAppConfig();

  // State
  const [discussions, setDiscussions] = useState<DiscussionPost[]>(INITIAL_DISCUSSIONS);
  const [activeCategory, setActiveCategory] = useState<DiscussionCategory>('all');
  const [activeSort, setActiveSort] = useState<DiscussionSort>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [poll, setPoll] = useState<SentimentPoll>(INITIAL_POLL);
  const [expandedPostId, setExpandedPostId] = useState<string | null>('post-1');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set(['u1']));

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

  // Follow Contributor Handler
  const handleToggleFollow = (userId: string) => {
    setFollowedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        showToast('팔로우를 취소했습니다.');
      } else {
        next.add(userId);
        showToast('팔로우를 시작했습니다.');
      }
      return next;
    });
  };

  // Poll Vote Handler
  const handlePollVote = (optionId: string) => {
    if (poll.userVotedId) return;

    const total = poll.totalVotes + 1;
    const updatedOptions = poll.options.map((opt) => {
      const votes = opt.id === optionId ? opt.votes + 1 : opt.votes;
      return {
        ...opt,
        votes,
        percentage: Math.round((votes / total) * 100),
      };
    });

    setPoll({
      ...poll,
      totalVotes: total,
      userVotedId: optionId,
      options: updatedOptions,
    });
    showToast('투표가 반영되었습니다.');
  };

  // Add Comment Handler
  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: {
        name: '나 (가치투자자)',
        badge: 'Member',
        avatar: '👤',
      },
      createdAt: '방금 전',
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

    const newPost: DiscussionPost = {
      id: `post-${Date.now()}`,
      title: modalTitle.trim(),
      category: modalCategory,
      author: {
        name: '나 (가치투자자)',
        handle: '@my_portfolio',
        badge: 'Active Investor',
        avatar: '💎',
        isVerified: false,
      },
      createdAt: '방금 전',
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

      if (activeSort === 'trending') {
        return b.upvotes * 2 + b.commentsCount * 3 - (a.upvotes * 2 + a.commentsCount * 3);
      }
      if (activeSort === 'top') {
        return b.upvotes - a.upvotes;
      }
      if (activeSort === 'editors') {
        if (a.isEditorsPick && !b.isEditorsPick) return -1;
        if (!a.isEditorsPick && b.isEditorsPick) return 1;
        return b.upvotes - a.upvotes;
      }
      // 'latest' default
      return 0;
    });

  const categories: { id: DiscussionCategory; label: string }[] = [
    { id: 'all', label: t('allCategories') },
    { id: 'buffett', label: t('categoryBuffett') },
    { id: 'lynch', label: t('categoryLynch') },
    { id: 'analysis', label: t('categoryAnalysis') },
    { id: 'valuation', label: t('categoryValuation') },
    { id: 'outlook', label: t('categoryOutlook') },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 space-y-6 animate-fade-in font-sans">

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in border border-white/10 dark:border-black/10">
          <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner with Stats & New Discussion Action */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0071E3]/10 dark:bg-[#2997FF]/15 flex items-center justify-center text-[#0071E3] dark:text-[#2997FF]">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              {t('communityTitle')}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
            {t('communitySubtitle')}
          </p>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1F2937] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
              <Users className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
              <span className="text-[#86868B]">{t('onlineInvestors')}:</span>
              <span className="font-bold tabular-nums">4,281</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1F2937] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
              <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[#86868B]">{t('totalDiscussions')}:</span>
              <span className="font-bold tabular-nums">128.4k</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1F2937] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
              <span className="text-[#86868B]">{t('verifiedPortfolios')}:</span>
              <span className="font-bold tabular-nums">8,520</span>
            </div>
          </div>
        </div>

        {/* CTA: Create New Discussion */}
        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="self-start md:self-center px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newDiscussion')}</span>
        </button>
      </section>

      {/* 2. Category Filter Pills & Search + Sort Bar */}
      <section className="space-y-4">
        {/* Category Horizontal Scroll Shelf */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-white dark:bg-[#111827] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] border border-black/[0.04] dark:border-white/[0.08]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
          {/* Sort Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            {(
              [
                { id: 'trending', label: t('sortTrending'), icon: Flame },
                { id: 'latest', label: t('sortLatest'), icon: Clock },
                { id: 'top', label: t('sortTop'), icon: ThumbsUp },
                { id: 'editors', label: t('sortEditors'), icon: Award },
              ] as const
            ).map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSort(s.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSort === s.id
                      ? 'bg-[#F5F5F7] dark:bg-[#1F2937] text-[#0071E3] dark:text-[#2997FF]'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search within community */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="토론 검색, 티커, 해시태그..."
              className="w-full bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-black/[0.04] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3]"
            />
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Content 2-Column Grid (Feed + Right Bento Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Discussion Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredDiscussions.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-12 text-center border border-black/[0.04] dark:border-white/[0.08] space-y-3">
              <MessageSquare className="w-10 h-10 text-[#86868B] mx-auto stroke-1" />
              <div className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                검색 조건에 해당하는 토론이 없습니다.
              </div>
              <p className="text-xs text-[#86868B]">
                새로운 가치투자 아이디어를 가장 먼저 게시해보세요!
              </p>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-bold hover:bg-[#0077ED] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>첫 토론 시작하기</span>
              </button>
            </div>
          ) : (
            filteredDiscussions.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const isBookmarked = bookmarkedIds.has(post.id);
              const isCommentsOpen = activeCommentsPostId === post.id;

              return (
                <article
                  key={post.id}
                  className={`bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border transition-all duration-200 ${
                    post.isPinned
                      ? 'border-[#F59E0B]/40 dark:border-[#F59E0B]/30 shadow-md ring-1 ring-[#F59E0B]/20'
                      : 'border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] shadow-sm'
                  }`}
                >
                  {/* Pinned & Editor's Pick Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {post.isPinned && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 flex items-center gap-1">
                        <Pin className="w-3 h-3 rotate-45" />
                        {t('pinned')}
                      </span>
                    )}
                    {post.isEditorsPick && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/20 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {t('editorsPickBadge')}
                      </span>
                    )}
                    {post.ticker && (
                      <button
                        onClick={() => onSelectStock && onSelectStock(post.ticker!)}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#0071E3]/10 hover:text-[#0071E3] transition-colors cursor-pointer flex items-center gap-1 border border-black/[0.04] dark:border-white/[0.08]"
                        title="종목 분석으로 이동"
                      >
                        <span>${post.ticker}</span>
                        {post.buffettScore && (
                          <span
                            className={`text-[9px] px-1 rounded ${
                              post.buffettScore >= 80
                                ? 'bg-[#34C759]/20 text-[#34C759]'
                                : 'bg-[#FF3B30]/20 text-[#FF3B30]'
                            }`}
                          >
                            {post.buffettScore}점
                          </span>
                        )}
                      </button>
                    )}
                    <span className="text-[11px] text-[#86868B] ml-auto">
                      {post.createdAt}
                    </span>
                  </div>

                  {/* Author Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#F5F5F7] dark:bg-[#1F2937] flex items-center justify-center text-base border border-black/[0.04] dark:border-white/[0.08]">
                      {post.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {post.author.name}
                        </span>
                        {post.author.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                        )}
                        <span className="text-[10px] text-[#86868B]">
                          {post.author.handle}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-[#86868B] flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]" />
                        <span>{post.author.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors cursor-pointer leading-snug mb-2"
                  >
                    {post.title}
                  </h2>

                  {/* Content (Snippet vs Full) */}
                  <div className="text-xs sm:text-sm text-[#424245] dark:text-[#A1A1A6] leading-relaxed whitespace-pre-line mb-3 font-normal">
                    {isExpanded ? post.content : post.snippet}
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="text-[11px] font-semibold text-[#0071E3] dark:text-[#2997FF] hover:underline mb-4 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? '간략히 보기' : '전체 분석 읽기'}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
                  </button>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {post.tags.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(tag)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F7] dark:bg-[#1F2937] text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B]">
                    {/* Left: Vote Pill */}
                    <div className="flex items-center bg-[#F5F5F7] dark:bg-[#1F2937] rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.08]">
                      <button
                        onClick={() => handleVote(post.id, 'up')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                          post.userVote === 'up'
                            ? 'bg-[#34C759]/15 text-[#34C759] font-bold'
                            : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                        }`}
                        title="추천"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="tabular-nums text-[11px]">{post.upvotes}</span>
                      </button>
                      <div className="w-px h-3 bg-black/[0.06] dark:bg-white/[0.1]" />
                      <button
                        onClick={() => handleVote(post.id, 'down')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                          post.userVote === 'down'
                            ? 'bg-[#FF3B30]/15 text-[#FF3B30] font-bold'
                            : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                        }`}
                        title="비추천"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Right: Comments, Bookmark, Share */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Comments Toggle */}
                      <button
                        onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                        className={`flex items-center gap-1.5 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer ${
                          isCommentsOpen ? 'text-[#0071E3] dark:text-[#2997FF] font-bold' : ''
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{post.commentsCount}</span>
                      </button>

                      {/* Bookmark Toggle */}
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-[#F59E0B]'
                            : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                        }`}
                        title="북마크"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>

                      {/* Share */}
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
                  </div>

                  {/* 4. Embedded Comments Section */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.06] space-y-3 animate-fade-in">
                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-2.5">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-[#F5F5F7] dark:bg-[#1F2937]/70 rounded-xl p-3 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span>{comment.author.avatar}</span>
                                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                                    {comment.author.name}
                                  </span>
                                  <span className="text-[10px] text-[#86868B]">
                                    {comment.author.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#86868B]">
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
                        <p className="text-xs text-[#86868B] py-2 text-center">
                          첫 댓글을 작성하여 토론에 참여해보세요!
                        </p>
                      )}

                      {/* Add Comment Input Bar */}
                      <div className="flex items-center gap-2 pt-2">
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
                          className="flex-1 bg-[#F5F5F7] dark:bg-[#1F2937] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] px-3.5 py-2 rounded-xl border border-black/[0.04] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t('addComment')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right Column: Bento Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Widget 1: Weekly Sentiment Poll */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {t('weeklySentimentPoll')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#1F2937] text-[#86868B]">
                {poll.endsIn}
              </span>
            </div>

            <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
              {poll.question}
            </p>

            {/* Poll Options */}
            <div className="space-y-2">
              {poll.options.map((opt) => {
                const isSelected = poll.userVotedId === opt.id;
                const hasVoted = Boolean(poll.userVotedId);

                return (
                  <button
                    key={opt.id}
                    disabled={hasVoted}
                    onClick={() => handlePollVote(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs relative overflow-hidden transition-all ${
                      hasVoted
                        ? 'border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7]/50 dark:bg-[#1F2937]/50 cursor-default'
                        : 'border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071E3] bg-white dark:bg-[#111827] cursor-pointer'
                    }`}
                  >
                    {/* Animated Progress Fill */}
                    {hasVoted && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 opacity-15 transition-all duration-700 ${
                          isSelected
                            ? 'bg-[#0071E3] dark:bg-[#2997FF] opacity-25'
                            : 'bg-[#86868B]'
                        }`}
                        style={{ width: `${opt.percentage}%` }}
                      />
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      <span className={`font-medium ${isSelected ? 'text-[#0071E3] dark:text-[#2997FF] font-bold' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>
                        {opt.label}
                      </span>
                      {hasVoted && (
                        <span className="text-[11px] font-bold tabular-nums text-[#86868B]">
                          {opt.percentage}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#86868B] pt-1">
              <span>총 {poll.totalVotes.toLocaleString()}명 참여</span>
              {poll.userVotedId && (
                <span className="text-[#34C759] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('voted')}
                </span>
              )}
            </div>
          </div>

          {/* Widget 2: Top Value Contributors */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {t('topContributors')}
                </h3>
              </div>
              <span className="text-[10px] text-[#86868B]">주간 랭킹</span>
            </div>

            <div className="space-y-3">
              {TOP_CONTRIBUTORS.map((contributor, idx) => {
                const isFollowed = followedUserIds.has(contributor.id);
                return (
                  <div
                    key={contributor.id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-bold font-mono text-[#86868B] w-3">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#F5F5F7] dark:bg-[#1F2937] flex items-center justify-center text-sm shrink-0 border border-black/[0.04] dark:border-white/[0.08]">
                        {contributor.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] truncate flex items-center gap-1">
                          <span>{contributor.name}</span>
                          <ShieldCheck className="w-3 h-3 text-[#0071E3] shrink-0" />
                        </div>
                        <div className="text-[10px] text-[#86868B] flex items-center gap-1">
                          <span>적중률 {contributor.passAccuracy}</span>
                          <span>·</span>
                          <span className="font-mono">{contributor.followers} 팔로워</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(contributor.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                        isFollowed
                          ? 'bg-[#F5F5F7] dark:bg-[#1F2937] text-[#86868B]'
                          : 'bg-[#0071E3] text-white hover:bg-[#0077ED]'
                      }`}
                    >
                      {isFollowed ? '팔로잉' : '팔로우'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 3: Trending Stock Discussions */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#34C759]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {t('trendingTickers')}
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {TRENDING_TICKERS.map((item) => (
                <button
                  key={item.ticker}
                  onClick={() => {
                    if (onSelectStock) onSelectStock(item.ticker);
                    else setSearchQuery(item.ticker);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F7] dark:hover:bg-[#1F2937] transition-all text-xs text-left cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3]">
                        {item.ticker}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          item.pass
                            ? 'bg-[#34C759]/15 text-[#34C759]'
                            : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                        }`}
                      >
                        버핏 {item.score}점
                      </span>
                    </div>
                    <div className="text-[10px] text-[#86868B] truncate">
                      {item.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {item.price}
                    </div>
                    <div
                      className={`text-[10px] font-bold tabular-nums ${
                        item.change.startsWith('+')
                          ? 'text-[#34C759]'
                          : 'text-[#FF3B30]'
                      }`}
                    >
                      {item.change}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Widget 4: Guidelines Banner */}
          <div className="bg-gradient-to-br from-[#0071E3]/5 to-[#34C759]/5 dark:from-[#0071E3]/10 dark:to-[#34C759]/10 rounded-2xl p-4 border border-[#0071E3]/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#0071E3] dark:text-[#2997FF]">
              <AlertCircle className="w-4 h-4" />
              <span>{t('communityRules')}</span>
            </div>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              {t('communityRulesDesc')}
            </p>
          </div>

        </div>

      </div>

      {/* 5. Create New Discussion Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.12] space-y-5 animate-scale-up">
            
            {/* Modal Header */}
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

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              {/* Category & Ticker Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                    {t('categorySelect')}
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as DiscussionCategory)}
                    className="w-full bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3]"
                  >
                    <option value="buffett">{t('categoryBuffett')}</option>
                    <option value="lynch">{t('categoryLynch')}</option>
                    <option value="analysis">{t('categoryAnalysis')}</option>
                    <option value="valuation">{t('categoryValuation')}</option>
                    <option value="outlook">{t('categoryOutlook')}</option>
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
                    className="w-full bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] uppercase"
                  />
                </div>
              </div>

              {/* Title Input */}
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
                  className="w-full bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* Content Textarea */}
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
                  className="w-full bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] resize-none leading-relaxed"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  {t('tagsLabel')}
                </label>
                <input
                  type="text"
                  value={modalTags}
                  onChange={(e) => setModalTags(e.target.value)}
                  placeholder="예: 워런버핏, 1달러테스트, FCF"
                  className="w-full bg-[#F5F5F7] dark:bg-[#1F2937] text-[#1D1D1F] dark:text-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
