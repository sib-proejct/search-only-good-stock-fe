import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { stockApi } from '../../services/api';
import { useAccount } from '../../context/AccountContext';

interface StockMemoEditorProps {
  stockId: string;
  stockName: string;
  initialMemo?: string | null;
  isFavoritePage?: boolean;
  onMemoChange?: (newMemo: string | null) => void;
  className?: string;
}

export const StockMemoEditor: React.FC<StockMemoEditorProps> = ({
  stockId,
  stockName,
  initialMemo = null,
  isFavoritePage = true,
  onMemoChange,
  className = '',
}) => {
  const { user } = useAccount();
  const navigate = useNavigate();
  const [memo, setMemo] = useState<string | null>(initialMemo);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMemo(initialMemo);
  }, [initialMemo]);

  useEffect(() => {
    if (isEditing) {
      setDraft(memo || '');
      setSaveError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing, memo]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    if (!user || saving) return;

    const trimmed = draft.trim();
    setSaving(true);
    setSaveError(null);

    try {
      if (trimmed === '') {
        await stockApi.deleteStockMemo(stockId);
        setMemo(null);
        onMemoChange?.(null);
      } else {
        const result = await stockApi.updateStockMemo(stockId, trimmed);
        setMemo(result.content);
        onMemoChange?.(result.content);
      }
      setIsEditing(false);
    } catch {
      setSaveError('메모 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className={`text-[11px] truncate max-w-[160px] flex items-center gap-1 ${className}`}
        onClick={(e) => e.stopPropagation()}
        title={saveError || undefined}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          placeholder="메모..."
          onChange={(e) => {
            setDraft(e.target.value);
            if (saveError) setSaveError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={saving}
          maxLength={500}
          className={`flex-1 min-w-0 p-0 text-[11px] bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] border-b outline-none font-sans ${
            saveError
              ? 'border-[#FF3B30]'
              : 'border-[#0071E3] dark:border-[#2997FF]'
          }`}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-[#34C759] hover:opacity-80 p-0 cursor-pointer"
        >
          {saving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-0 cursor-pointer"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  // 즐겨찾기 페이지 모드: 기업 풀네임 자리에 100% 동일한 div 크기/스타일로 메모 또는 '+ 메모' 표시
  if (isFavoritePage) {
    return (
      <div
        className={`text-[11px] font-normal truncate max-w-[160px] cursor-pointer select-none transition-colors ${
          memo
            ? 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF]'
            : 'text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF]'
        } ${className}`}
        onClick={handleStartEdit}
        title={
          !user
            ? `${stockName} (로그인하고 메모 추가)`
            : memo
            ? `${stockName} (클릭하여 메모 수정)`
            : `${stockName} (클릭하여 메모 추가)`
        }
      >
        {memo || '+ 메모'}
      </div>
    );
  }

  // 일반 스크리너 모드: 기업명 표시
  return (
    <div className={`text-[#86868B] font-normal text-[11px] truncate max-w-[160px] ${className}`} title={stockName}>
      {stockName}
    </div>
  );
};
