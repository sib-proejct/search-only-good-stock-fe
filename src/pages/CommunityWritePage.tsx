import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Send, Sparkles, FileText, Tag, Search, Check, ChevronDown, Plus,
  Bold, Italic, Heading, List, ListOrdered, Quote, Code, Table, Minus,
  Eye, Columns2, Edit3, Save, AlertCircle, CheckCircle2, User
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { DiscussionPost } from '../types/community';
import {
  TRENDING_TICKERS,
  getStoredDiscussions,
  addDiscussionPost,
  saveWriteDraft,
  getWriteDraft,
  clearWriteDraft
} from '../services/communityData';
import { stockApi } from '../services/api';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';

interface StockOption {
  name: string;
  ticker?: string;
  count?: number;
}

export const CommunityWritePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useAppConfig();

  // Query params
  const initialCategoryParam = searchParams.get('category') || '';
  const initialTickerParam = searchParams.get('ticker') || '';

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(initialCategoryParam || '삼성전자');
  const [ticker, setTicker] = useState<string>(
    initialTickerParam || (initialCategoryParam === '삼성전자' || !initialCategoryParam ? '005930.KS' : '')
  );
  const [content, setContent] = useState<string>('');

  // Screener Stocks from API
  const [apiStocks, setApiStocks] = useState<StockOption[]>([]);

  useEffect(() => {
    stockApi
      .getStocks({ limit: 100 })
      .then((res) => {
        if (res?.items && Array.isArray(res.items)) {
          setApiStocks(
            res.items.map((s) => ({
              name: s.name || s.ticker,
              ticker: s.ticker,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // View Mode: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  // Stock Category Dropdown State
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Draft & Toast State
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasDraftToRestore, setHasDraftToRestore] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen]);

  // Aggregate stock category options with full screener + discussions + trending
  const stockOptions = useMemo<StockOption[]>(() => {
    const map = new Map<string, StockOption>();

    // 1. Add trending tickers
    TRENDING_TICKERS.forEach((item) => {
      map.set(item.name.toLowerCase(), {
        name: item.name,
        ticker: item.ticker,
        count: 0,
      });
    });

    // 2. Add API stocks
    apiStocks.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: item.name,
          ticker: item.ticker,
          count: 0,
        });
      }
    });

    // 3. Add existing discussion categories
    const stored = getStoredDiscussions();
    stored.forEach((post) => {
      if (post.category && post.category !== 'all') {
        const key = post.category.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.count = (existing.count || 0) + 1;
        } else {
          map.set(key, {
            name: post.category,
            ticker: post.ticker,
            count: 1,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [apiStocks]);

  // Stock Selection Handler: Fully links Category and Ticker together
  const handleSelectStock = (stockName: string, stockTicker?: string) => {
    setCategory(stockName);
    setTicker(stockTicker ? stockTicker.toUpperCase() : '');
    setIsCategoryOpen(false);
    setCategorySearch('');
  };

  // Custom Category Register: Auto-detects if user typed a ticker or stock name
  const handleCustomCategory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const matched = stockOptions.find(
      (opt) =>
        opt.name.toLowerCase() === trimmed.toLowerCase() ||
        opt.ticker?.toUpperCase() === trimmed.toUpperCase() ||
        opt.ticker?.replace('.KS', '').toUpperCase() === trimmed.toUpperCase()
    );

    if (matched) {
      handleSelectStock(matched.name, matched.ticker);
    } else {
      setCategory(trimmed);
      if (/^[A-Z0-9.]+$/.test(trimmed)) {
        setTicker(trimmed.toUpperCase());
      }
      setIsCategoryOpen(false);
      setCategorySearch('');
    }
  };

  // Check for saved draft on initial load
  useEffect(() => {
    if (!initialCategoryParam && !initialTickerParam) {
      const draft = getWriteDraft();
      if (draft && (draft.title || draft.content)) {
        setHasDraftToRestore(true);
      }
    }
  }, [initialCategoryParam, initialTickerParam]);

  // Restore Draft
  const handleRestoreDraft = () => {
    const draft = getWriteDraft();
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.category) setCategory(draft.category);
      if (draft.ticker) setTicker(draft.ticker);
      if (draft.content) setContent(draft.content);
      if (draft.savedAt) {
        const d = new Date(draft.savedAt);
        setLastSavedTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
      showToast(t('restoreDraft') + ' 완료', 'info');
    }
    setHasDraftToRestore(false);
  };

  // Discard Draft Prompt
  const handleDiscardDraftPrompt = () => {
    clearWriteDraft();
    setHasDraftToRestore(false);
    showToast('임시저장 글이 삭제되었습니다.', 'info');
  };

  // Manual Draft Save
  const handleManualSaveDraft = () => {
    if (!title.trim() && !content.trim()) {
      showToast('저장할 제목이나 본문 내용이 없습니다.', 'error');
      return;
    }
    saveWriteDraft({ title, category, ticker, content });
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastSavedTime(timeStr);
    showToast(t('draftSavedToast'), 'success');
  };

  // Auto save draft (debounced)
  useEffect(() => {
    if (!title.trim() && !content.trim()) return;

    const timer = setTimeout(() => {
      saveWriteDraft({ title, category, ticker, content });
      const now = new Date();
      setLastSavedTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, category, ticker, content]);

  // Insert markdown symbol into textarea
  const insertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '텍스트') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + `${prefix}${defaultPlaceholder}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Valuation Templates
  const applyTemplate = (type: 'dcf' | 'moat') => {
    let templateText = '';
    if (type === 'dcf') {
      templateText = `### 1. DCF 및 Owner Earnings 핵심 가정
- **정상화 FCF / 주주이익 (5Y Avg)**: 연평균 약 00조 원 수준
- **할인율 (WACC / 주주요구수익률)**: 무위험수익률(3.5%) + 주식위험프리미엄(5.5%) = **9.0%**
- **영구 성장률 (Terminal Growth Rate)**: 인플레이션율 이하인 **1.5% 가정**

### 2. 적정 내재가치 및 보수적 안전마진 (Margin of Safety)
1. **추정 주당 적정 내재가치**: **000,000원**
2. **보수적 25% 안전마진 요구 매수가**: **000,000원 이하**
3. **결론 및 관전 포인트**: 현재 주가 수준 대비 안전마진 확보 여부 및 분할 매수 전략 점검`;
    } else {
      templateText = `### 1. 경제적 해자 (Economic Moat) 진단
- **가격결정력 (Pricing Power)**: 원가 상승분을 판가로 전가할 수 있는 독점적 시장 지배력
- **네트워크 효과 / 전환비용 (Switching Cost)**: 사용자 락인(Lock-in) 생태계 구축
- **5개년 평균 ROE & ROIC**: 5년 평균 ROE 20% 이상 및 ROIC 15% 이상 유지 여부

### 2. 1달러 유보이익 테스트 및 자본배치
- **유보이익 $1당 창출된 시장가치 증분**: 지난 10년간 유보 1달러당 $2.0 이상 시장가치 증분 창출
- **자사주 매입 및 소각 현황**: 유통주식수의 지속적 소각 및 배당 확대 이력

### 3. 하방 위험 및 안전마진 평가
- **핵심 리스크 요인**: 경쟁 강도 심화, 규제 위험, 기술 대체재 출현
- **보수적 안전마진 밴드**: 내재가치 대비 최소 20~30% 할인된 가격대 진입 여부`;
    }

    setContent((prev) => (prev.trim() ? prev + '\n\n' + templateText : templateText));
    showToast(`${type === 'dcf' ? t('dcfTemplate') : t('moatTemplate')} 양식을 적용했습니다.`, 'info');
  };

  // Submit Post
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }

    if (!content.trim()) {
      showToast('분석 본문 내용을 입력해주세요.', 'error');
      return;
    }

    const finalCategory = category.trim() || '기타';
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const matchedTrending = TRENDING_TICKERS.find(
      (item) =>
        item.name.toLowerCase() === finalCategory.toLowerCase() ||
        (ticker && item.ticker.toUpperCase() === ticker.trim().toUpperCase())
    );

    const newPost: DiscussionPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      category: finalCategory,
      author: {
        name: '나',
        isVerified: false,
      },
      createdAt: currentTime,
      ticker: ticker.trim().toUpperCase() || undefined,
      stockPassStatus: matchedTrending ? (matchedTrending.pass ? 'pass' : 'watch') : undefined,
      buffettScore: matchedTrending?.score,
      snippet: content.trim().slice(0, 160) + (content.length > 160 ? '...' : ''),
      content: content.trim(),
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      commentsCount: 0,
      viewsCount: 1,
      comments: [],
    };

    addDiscussionPost(newPost);
    clearWriteDraft();

    navigate('/community');
  };

  // Cancel / Back Navigation
  const handleCancel = () => {
    if ((title.trim() || content.trim()) && !window.confirm(t('leaveConfirm'))) {
      return;
    }
    navigate('/community');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-[4.5rem] right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl border backdrop-blur-md flex items-center gap-2 text-xs font-semibold animate-scale-up ${
            toastMessage.type === 'error'
              ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
              : toastMessage.type === 'info'
              ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Restore Draft Banner */}
      {hasDraftToRestore && (
        <div className="bg-gradient-to-r from-[#0071E3]/10 to-indigo-500/10 dark:from-[#2997FF]/15 dark:to-indigo-500/15 border border-[#0071E3]/25 dark:border-[#2997FF]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/15 dark:bg-[#2997FF]/20 flex items-center justify-center text-[#0071E3] dark:text-[#2997FF] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                이전에 작성 중이던 임시저장 글이 있습니다.
              </div>
              <p className="text-xs text-[#86868B]">
                작성 중이던 내용을 불러와 이어서 작성할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleDiscardDraftPrompt}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t('discardDraft')}
            </button>
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white shadow-sm transition-all cursor-pointer"
            >
              {t('restoreDraft')}
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#1C1C1E] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title={t('backToCommunity')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {t('writePageTitle')}
              </h1>
              <span className="text-[11px] font-bold bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] px-2.5 py-0.5 rounded-full">
                DCF & Moat
              </span>
            </div>
            <p className="text-xs text-[#86868B] mt-0.5">
              {t('writePageSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          {lastSavedTime && (
            <span className="text-[11px] text-[#86868B] flex items-center gap-1 mr-1">
              <Save className="w-3 h-3 text-emerald-500" />
              <span>{lastSavedTime} {t('draftSaved')}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleManualSaveDraft}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title={t('saveDraft')}
          >
            <Save className="w-3.5 h-3.5 text-[#86868B]" />
            <span>{t('saveDraft')}</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            onClick={handleSubmitPost}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white flex items-center gap-1.5 shadow-md shadow-[#0071E3]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('submitPost')}</span>
          </button>
        </div>
      </div>

      {/* Main Form Layout */}
      <form onSubmit={handleSubmitPost} className="space-y-5">
        {/* Row 1: Stock Category + Ticker + Post Title */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Category Combobox */}
            <div className="relative md:col-span-1" ref={categoryDropdownRef}>
              <label className="block text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                <span>{t('categorySelect')}</span>
                <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] px-3.5 py-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.1] hover:border-[#0071E3]/50 cursor-pointer transition-colors text-xs font-semibold"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{category || t('selectStockPromptCategory')}</span>
                  {ticker && (
                    <span className="font-mono text-[10px] text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-1.5 py-0.5 rounded font-bold shrink-0">
                      {ticker.replace('.KS', '')}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-[#86868B] shrink-0" />
              </div>

              {/* Autocomplete Dropdown */}
              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-2.5 z-50 animate-fade-in space-y-2 max-w-sm">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="종목명 검색 또는 직접 입력..."
                      className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] font-medium placeholder-[#86868B]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar text-xs">
                    {stockOptions
                      .filter(
                        (opt) =>
                          !categorySearch.trim() ||
                          opt.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          (opt.ticker && opt.ticker.toLowerCase().includes(categorySearch.toLowerCase()))
                      )
                      .map((opt) => {
                        const isSelected = category.toLowerCase() === opt.name.toLowerCase();
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => handleSelectStock(opt.name, opt.ticker)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-bold'
                                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold truncate">{opt.name}</span>
                              {opt.ticker && (
                                <span className="font-mono text-[10px] text-[#86868B] bg-black/[0.04] dark:bg-white/[0.08] px-1.5 py-0.5 rounded shrink-0">
                                  {opt.ticker.replace('.KS', '')}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                            )}
                          </button>
                        );
                      })}

                    {categorySearch.trim() && (
                      <button
                        type="button"
                        onClick={() => handleCustomCategory(categorySearch)}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/10 rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>'{categorySearch.trim()}' (직접 입력 등록)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Ticker Info (Read-only / Auto-linked) */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 flex items-center justify-between">
                <span>{t('tickerTagLabel')}</span>
                <span className="text-[10px] text-[#86868B] font-normal">자동 매핑</span>
              </label>
              <div className="w-full bg-[#F5F5F7]/80 dark:bg-[#2C2C2E]/60 text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-mono font-semibold px-3.5 py-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.08] select-none flex items-center justify-between">
                <span>{ticker || '-'}</span>
                {ticker && (
                  <span className="text-[10px] font-sans text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2 py-0.5 rounded font-bold">
                    연동됨
                  </span>
                )}
              </div>
            </div>

            {/* 3. Author Info (Read-only) */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                <span>작성자</span>
              </label>
              <div className="w-full bg-[#F5F5F7]/80 dark:bg-[#2C2C2E]/60 text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.08] select-none flex items-center">
                <span>나</span>
              </div>
            </div>
          </div>

          {/* Thesis Title */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 flex items-center gap-1">
              <span>내재가치 분석 제목</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm sm:text-base font-semibold px-4 py-3 rounded-xl border border-black/[0.06] dark:border-white/[0.1] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] placeholder-[#86868B]"
            />
          </div>
        </div>

        {/* Row 2: Editor Toolbar + Split View Container */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-3 bg-[#FBFBFD] dark:bg-[#18181A] border-b border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            {/* Left: Markdown Format Tools & Templates */}
            <div className="flex items-center gap-1 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**', '굵은 텍스트')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="굵게 (**텍스트**)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*', '기울임 텍스트')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="기울임 (*텍스트*)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('### ', '', '핵심 가치평가 제목')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="제목 (### 제목)"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('- ', '', '리스트 항목')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="불릿 리스트 (- 항목)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('1. ', '', '순위 항목')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="번호 리스트 (1. 항목)"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('> ', '', '버핏의 원칙 인용구')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="인용구 (> 인용문)"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('`', '`', '수식/지표')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="인라인 코드 (`코드`)"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('\n| 연도 | 매출액 | FCF | ROE |\n| --- | --- | --- | --- |\n| 2024 | 100조 | 20조 | 22% |\n\n', '', '')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="표 삽입 (Markdown Table)"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('\n---\n\n', '', '')}
                className="p-2 rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="구분선 (---)"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-black/10 dark:bg-white/15 mx-1" />

              {/* Template Buttons */}
              <button
                type="button"
                onClick={() => applyTemplate('dcf')}
                className="px-2.5 py-1 rounded-lg bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/20 border border-[#0071E3]/20 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="DCF 내재가치 분석 템플릿 불러오기"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('dcfTemplate')}</span>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('moat')}
                className="px-2.5 py-1 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.1] dark:hover:bg-white/[0.15] border border-black/[0.06] dark:border-white/[0.1] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="경제적 해자 & 안전마진 템플릿 불러오기"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t('moatTemplate')}</span>
              </button>
            </div>

            {/* Right: View Mode Toggle */}
            <div className="flex items-center bg-[#F5F5F7] dark:bg-[#2C2C2E] p-0.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('splitView')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'editor'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('editorOnly')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('previewOnly')}</span>
              </button>
            </div>
          </div>

          {/* Editor & Preview Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06] dark:divide-white/[0.08] min-h-[580px]">
            {/* Editor Pane */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <div className={`p-4 flex flex-col ${viewMode === 'editor' ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between text-xs text-[#86868B] pb-2 mb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>마크다운 편집기</span>
                  </span>
                  <span>{wordCount} 단어 · {charCount} 글자</span>
                </div>
                <textarea
                  ref={textareaRef}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('contentPlaceholder')}
                  className="flex-1 w-full min-h-[500px] bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none resize-none leading-relaxed text-sm font-sans placeholder-[#86868B] custom-scrollbar selection:bg-[#0071E3]/20"
                />
              </div>
            )}

            {/* Live Markdown Preview Pane */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div className={`p-5 overflow-y-auto max-h-[700px] custom-scrollbar bg-[#FBFBFD]/60 dark:bg-[#18181A]/60 ${viewMode === 'preview' ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between text-xs text-[#86868B] pb-2 mb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                    <span>{t('livePreview')}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>

                {content.trim() ? (
                  <div className="space-y-4">
                    {title.trim() && (
                      <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                        {title}
                      </h2>
                    )}
                    <MarkdownRenderer content={content} />
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 space-y-3 text-[#86868B]">
                    <FileText className="w-10 h-10 stroke-1" />
                    <p className="text-xs">
                      왼쪽 편집창에 내용을 작성하거나 상단 템플릿(DCF, 경제적 해자)을 클릭하면 실시간 서식이 이곳에 렌더링됩니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Guidelines & Action */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              💡 Search Only Good Stock 가치평가 작성 가이드
            </div>
            <p className="text-[#86868B] leading-relaxed">
              본 게시판은 단기 가격 변동이나 테마주 선동 대신, 5개년 FCF 정상화, 주주이익(Owner Earnings), 영구 성장률, WACC 할인율, 1달러 유보이익 테스트 등 <strong>정량적 내재가치와 안전마진</strong>을 중심으로 한 깊이 있는 분석 글 작성을 권장합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#0071E3] dark:hover:bg-[#2997FF] text-white flex items-center gap-1.5 shadow-md shadow-[#0071E3]/20 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('submitPost')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
