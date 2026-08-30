import { DiscussionPost, SentimentPoll, TopContributor } from '../types/community';

export const INITIAL_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'post-1',
    title: '삼성전자 반도체 사이클 및 주주환원율을 반영한 보수적 DCF 적정 내재가치 산출',
    category: '삼성전자',
    author: {
      name: '버핏식가치평가',
      isVerified: true,
    },
    createdAt: '19:09',
    ticker: '005930.KS',
    stockPassStatus: 'watch',
    buffettScore: 78,
    isPinned: true,
    isEditorsPick: true,
    snippet: '메모리 다운사이클을 가정한 보수적 Owner Earnings 산출 결과와 5개년 FCF 정상화 흐름을 기반으로 안전마진 25% 확보 가격대를 점검합니다.',
    content: `삼성전자의 최근 설비투자(Capex) 사이클과 주주환원 재원을 분석하여 버크셔 해서웨이 방식의 보수적 주주이익(Owner Earnings)을 산출했습니다.

### 1. 핵심 내재가치 가치평가 가설
- **정상화 FCF (5개년 평균)**: 연평균 약 28조 원 수준으로 보수적 산정
- **할인율 (WACC)**: 무위험수익률(3.8%) + 주식위험프리미엄(5.5%) = **9.3% 적용**
- **영구 성장률 (Terminal Growth Rate)**: 인플레이션율 이하인 **1.5% 가정**

### 2. 적정 내재가치 및 안전마진 (Margin of Safety)
1. **추정 주당 내재가치**: **88,500원**
2. **보수적 25% 안전마진 요구 매수가**: **66,300원 이하**
3. **결론**: 현재가 기준 보수적 안전마진 밴드 진입 여부를 모니터링하며 분할 관찰이 합리적인 구간입니다.`,
    upvotes: 428,
    downvotes: 12,
    userVote: null,
    commentsCount: 34,
    viewsCount: 6120,
    comments: [
      {
        id: 'c1',
        author: {
          name: 'FCF분석가',
          isVerified: true,
        },
        createdAt: '19:45',
        content: 'HBM 전환에 따른 유지보수 Capex 비중을 감안했을 때 FCF 28조 가정은 매우 현실적이고 신뢰할 만한 보수적 수치입니다.',
        likes: 56,
      },
      {
        id: 'c2',
        author: {
          name: '가치투자원칙',
        },
        createdAt: '20:12',
        content: '순현금 100조 원 이상을 보유한 재무적 완충력을 고려하면 하방 경직성은 충분히 확보되어 있네요.',
        likes: 31,
      },
    ],
  },
  {
    id: 'post-2',
    title: '애플(AAPL) 1달러 유보이익 테스트 및 강력한 해자(Moat) 기반 복리 가치 평가',
    category: '애플',
    author: {
      name: '해자발굴자',
      isVerified: true,
    },
    createdAt: '17:15',
    ticker: 'AAPL',
    stockPassStatus: 'pass',
    buffettScore: 100,
    isEditorsPick: true,
    snippet: '지난 10개년간 1달러의 사내 유보이익당 창출된 시가총액 증분($2.45)과 자사주 소각을 통한 주당 내재가치 복리 효과를 진단합니다.',
    content: `워런 버핏의 11대 원칙 중 **'1달러 유보이익 주주가치 창출 테스트'**와 **'자본배치(Capital Allocation)'** 관점에서 애플의 내재가치를 평가했습니다.

### 1. 유보이익 창출 능력 (1-Dollar Test)
- 지난 10년간 유보된 누적 이익 대비 창출된 시가총액 증가액: **$1당 약 $2.45 창출**
- 5개년 평균 ROE 140%+ 및 ROIC 55%+ 유지 (초고효율 자본 배치 구조)

### 2. 주주환원과 주당 가치 증분
- 매년 연평균 3~4%의 유통 주식수 영구 소각 지속
- 영업이익률 30%대의 독점적 생태계 전환비용(Switching Cost) 해자 구축

### 3. 결론 및 관전 포인트
- 높은 자본효율성 덕분에 외형 성장이 둔화되더라도 주당 내재가치는 지속적으로 우상향하는 전형적인 버핏형 프랜차이즈 기업입니다.`,
    upvotes: 562,
    downvotes: 15,
    userVote: null,
    commentsCount: 42,
    viewsCount: 7850,
    comments: [
      {
        id: 'c3',
        author: {
          name: '오너어닝스',
          isVerified: true,
        },
        createdAt: '18:02',
        content: '자사주 매입 후 즉시 소각함으로써 잔여 주주의 지분 가치를 영구히 높여주는 모범적인 자본 배치의 표본입니다.',
        likes: 68,
      },
    ],
  },
  {
    id: 'post-3',
    title: '엔비디아(NVDA) AI 인프라 장기 성장률과 WACC 10% 가정 시 주주이익 역산 모델',
    category: '엔비디아',
    author: {
      name: '성장가치론자',
      isVerified: true,
    },
    createdAt: '14:20',
    ticker: 'NVDA',
    stockPassStatus: 'pass',
    buffettScore: 92,
    snippet: '현 주가에 반영된 내재 현금흐름 성장률(Reverse DCF)을 역산하여, 향후 5개년 연평균 25% FCF 성장이 지속되어야 정당화되는 밸류에이션 점검.',
    content: `현재 엔비디아의 시가총액이 요구하는 내재 성장률을 역산(Reverse DCF)하여 가치평가 타당성을 분석했습니다.

### 1. Reverse DCF 역산 결과
- **적용 할인율 (WACC)**: 10.2%
- **영구 성장률**: 2.5%
- **역산된 요구 FCF CAGR (향후 5년)**: **연 26.5% 성장 지속 필요**

### 2. 경제적 해자(Moat) 및 경쟁위험
- **CUDA 생태계**: 소프트웨어 락인 효과로 인한 압도적인 가격결정력(Pricing Power)
- **리스크**: 하이퍼스케일러들의 자체 ASIC 칩 개발에 따른 총마진(Gross Margin) 70%선 유지 여부

### 3. 종합 의견
- 비즈니스 퀄리티는 완벽하나, 안전마진(Margin of Safety) 확보를 위해서는 실적 변동성 시점의 보수적 분할 접근이 필요합니다.`,
    upvotes: 389,
    downvotes: 21,
    userVote: null,
    commentsCount: 29,
    viewsCount: 5240,
  },
  {
    id: 'post-4',
    title: '코카콜라(KO) 초과 자본수익률(5Y ROE > 35%)과 영구채권형 현금흐름 할인 모델',
    category: '코카콜라',
    author: {
      name: '영구보유주의',
      isVerified: true,
    },
    createdAt: '11:30',
    ticker: 'KO',
    stockPassStatus: 'pass',
    buffettScore: 95,
    snippet: '불변의 가격결정력과 글로벌 배전망 해자를 갖춘 영구적 필수소비재 기업의 배당 할인 모형(DDM) 및 적정 가치 밴드 분석.',
    content: `워런 버핏의 포트폴리오 핵심인 코카콜라를 인플레이션 헤지 능력과 영구 현금흐름 관점에서 분석했습니다.

### 1. 경제적 해자의 본질
- **가격결정력(Pricing Power)**: 원자재 및 물류비 상승분을 소비자 가격으로 온전히 전가
- **5개년 평균 ROE**: **38.4% 달성** (무차입에 가까운 안정적 재무구조)

### 2. DDM & DCF 가치평가
- **요구수익률**: 7.5%
- **장기 배당성장률**: 4.5%
- **추정 적정 주가**: **$68.00 ~ $72.00**

### 3. 결론
- 단기 주가 시세차익보다는 영구적 복리 배당 재투자를 추구하는 가치투자자에게 가장 이상적인 현금창출 기업입니다.`,
    upvotes: 312,
    downvotes: 8,
    userVote: null,
    commentsCount: 18,
    viewsCount: 3980,
  },
  {
    id: 'post-5',
    title: 'SK하이닉스 HBM 기술 격차와 순현금 전환 사이클에 따른 안전마진 점검',
    category: 'SK하이닉스',
    author: {
      name: '사이클가치투자',
    },
    createdAt: '09:15',
    ticker: '000660.KS',
    stockPassStatus: 'watch',
    buffettScore: 68,
    snippet: 'HBM3E 독점력으로 인한 역대급 영업이익률 달성과 순차입금 상환 속도에 기반한 다운사이클 방어 내재가치 평가.',
    content: `메모리 반도체 사이클 특유의 높은 설비투자와 이익 변동성을 감안한 내재가치 스트레스 테스트입니다.

### 1. 재무 건전성 및 현금흐름 정상화
- 2024~2025년 누적 FCF를 통한 차입금 상환 및 **순현금(Net Cash) 전환 추세**
- HBM 고마진(영업이익률 40%+) 구조가 전체 메모리 평균 ROIC를 18% 이상으로 견인

### 2. 보수적 시나리오별 적정가치
- **비관 시나리오 (사이클 피크아웃)**: 165,000원
- **기본 시나리오 (AI 수요 견조)**: 215,000원
- **낙관 시나리오 (장기 슈퍼사이클)**: 260,000원

### 3. 가치투자자 관점
- 사이클 고점 매수 리스크를 피하기 위해 다운턴 국면의 PBR/DCF 하단 밴드를 안전마진 기준으로 삼아야 합니다.`,
    upvotes: 275,
    downvotes: 14,
    userVote: null,
    commentsCount: 23,
    viewsCount: 4120,
  },
  {
    id: 'post-6',
    title: 'SYN-PASS 5개년 연속 ROE 20%+ 유지 기업의 복리 가치 증분 모델',
    category: 'SYN-PASS',
    author: {
      name: '복리엔진마스터',
      isVerified: true,
    },
    createdAt: '08:00',
    ticker: 'SYN-PASS',
    stockPassStatus: 'pass',
    buffettScore: 100,
    snippet: '버핏 11대 원칙을 완벽히 통과한 합성 우량기업(SYN-PASS)의 10개년 DCF 모델과 안전마진 35% 확보 분석.',
    content: `Search Only Good Stock 스크리너의 11대 원칙을 100% 충족한 합성 우량기업(SYN-PASS)의 정밀 밸류에이션입니다.

### 1. 11대 버핏 지표 정밀 진단
- **5년 평균 ROE**: 20.0% (기준 15% 초과 달성)
- **순현금 상태**: 순차입금 음수(순현금 보유 우량)
- **10년 EPS CAGR**: 10.0%의 꾸준한 주당순이익 복리 성장

### 2. DCF 내재가치 평가
- **Owner Earnings**: 주당 $2.93
- **보수적 추정 내재가치**: **$26.40**
- **현재 시장가격**: **$5.00** (안전마진 **81% 이상 확보**)`,
    upvotes: 490,
    downvotes: 5,
    userVote: null,
    commentsCount: 27,
    viewsCount: 6540,
  }
];

export const INITIAL_POLL: SentimentPoll = {
  id: 'poll-2026-w34',
  question: '2026년 하반기 대형 우량주 DCF 가치평가 시 가장 적절한 WACC(할인율) 가정은?',
  description: '글로벌 무위험 금리와 주식위험프리미엄(ERP)을 감안한 보수적 내재가치 평가 기준 조사',
  totalVotes: 2840,
  endsIn: '3일 남음',
  options: [
    { id: 'opt-1', label: '8.0% ~ 9.0% (전통적 평균 수준)', votes: 624, percentage: 22 },
    { id: 'opt-2', label: '9.0% ~ 10.5% (고금리 장기화 반영 현실적 기준)', votes: 1647, percentage: 58 },
    { id: 'opt-3', label: '10.5% 이상 (철저한 보수적 안전마진 극대화)', votes: 569, percentage: 20 },
  ],
  userVotedId: undefined,
};

export const TOP_CONTRIBUTORS: TopContributor[] = [
  {
    id: 'u1',
    name: '버핏식가치평가',
    passAccuracy: '98.5%',
    reputation: 16400,
    followers: 4120,
  },
  {
    id: 'u2',
    name: '해자발굴자',
    passAccuracy: '96.2%',
    reputation: 12800,
    followers: 3450,
  },
  {
    id: 'u3',
    name: 'FCF분석가',
    passAccuracy: '94.8%',
    reputation: 10500,
    followers: 2890,
  },
  {
    id: 'u4',
    name: '오너어닝스',
    passAccuracy: '93.1%',
    reputation: 8900,
    followers: 2100,
  },
];

export const TRENDING_TICKERS = [
  { ticker: '005930.KS', name: '삼성전자', price: '₩74,500', change: '-1.42%', score: 78, pass: true },
  { ticker: 'AAPL', name: '애플 (Apple)', price: '$228.40', change: '+1.10%', score: 100, pass: true },
  { ticker: 'NVDA', name: '엔비디아 (NVIDIA)', price: '$128.60', change: '+3.85%', score: 92, pass: true },
  { ticker: '000660.KS', name: 'SK하이닉스', price: '₩189,500', change: '+2.80%', score: 68, pass: true },
  { ticker: 'KO', name: '코카콜라 (Coca-Cola)', price: '$64.20', change: '+0.35%', score: 95, pass: true },
  { ticker: 'SYN-PASS', name: 'Synthetic Pass Co', price: '$5.00', change: '+0.00%', score: 100, pass: true },
];

const STORAGE_KEY_DISCUSSIONS = 'sogs_discussions';
const STORAGE_KEY_DRAFT = 'sogs_community_write_draft';

export interface WritePostDraft {
  title: string;
  category: string;
  ticker: string;
  content: string;
  savedAt: string;
}

export function applyDiscussionVote(
  post: DiscussionPost,
  direction: 'up' | 'down'
): DiscussionPost {
  let upvotes = post.upvotes;
  let downvotes = post.downvotes;
  let userVote: 'up' | 'down' | null = direction;

  if (post.userVote === direction) {
    userVote = null;
    if (direction === 'up') upvotes -= 1;
    else downvotes -= 1;
  } else if (post.userVote) {
    if (direction === 'up') {
      upvotes += 1;
      downvotes -= 1;
    } else {
      downvotes += 1;
      upvotes -= 1;
    }
  } else if (direction === 'up') {
    upvotes += 1;
  } else {
    downvotes += 1;
  }

  return { ...post, upvotes, downvotes, userVote };
}

export function getStoredDiscussions(): DiscussionPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISCUSSIONS);
    if (!raw) return INITIAL_DISCUSSIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DISCUSSIONS;
  } catch {
    return INITIAL_DISCUSSIONS;
  }
}

export function saveDiscussions(discussions: DiscussionPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DISCUSSIONS, JSON.stringify(discussions));
  } catch (e) {
    console.error('Failed to save discussions to localStorage', e);
  }
}

export function addDiscussionPost(newPost: DiscussionPost): DiscussionPost[] {
  const current = getStoredDiscussions();
  const updated = [newPost, ...current];
  saveDiscussions(updated);
  return updated;
}

export function saveWriteDraft(draft: { title: string; category: string; ticker: string; content: string }): void {
  try {
    const data: WritePostDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save draft to localStorage', e);
  }
}

export function getWriteDraft(): WritePostDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw) as WritePostDraft;
  } catch {
    return null;
  }
}

export function clearWriteDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
  } catch (e) {
    console.error('Failed to clear draft from localStorage', e);
  }
}

