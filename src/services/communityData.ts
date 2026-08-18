import { DiscussionPost, SentimentPoll, TopContributor } from '../types/community';

export const INITIAL_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'post-1',
    title: '워런 버핏의 2026 주주서한 심층 분석: 왜 당기순이익보다 소유주 이익(Owner Earnings)이 중요한가?',
    category: 'buffett',
    author: {
      name: '오마하의현인',
      handle: '@omaha_disciple',
      badge: 'Master Value Analyst',
      avatar: '🏛️',
      isVerified: true,
    },
    createdAt: '2시간 전',
    ticker: 'BRK.B',
    stockPassStatus: 'pass',
    buffettScore: 100,
    isPinned: true,
    isEditorsPick: true,
    snippet: '일반적인 GAAP 순이익은 감가상각과 비현금성 평가손익으로 왜곡될 수 있습니다. 버핏이 강조한 "소유주 이익 = 순이익 + 감가상각비 - 유지보수 자본지출(Maintenance CapEx)" 공식을 실제 테크 및 금융 지주사에 적용해 본 데이터입니다.',
    content: `버크셔 해서웨이의 2026년 주주서한에서 가장 주목할 점은 자본배분의 효율성입니다.

1. **소유주 이익(Owner Earnings)의 산출**:
   - 영업현금흐름(OCF)에서 기업의 현 경제적 해자와 경쟁력을 유지하기 위해 필수적인 유지 CapEx를 차감해야 합니다.
   - 성장 CapEx는 장기 복리 효과를 낳지만, 유지 CapEx는 현상 유지를 위한 필수 비용입니다.

2. **1달러 유보이익 테스트(One-Dollar Test)**:
   - 기업이 배당하지 않고 유보한 1달러당 1달러 이상의 시장가치를 창출했는가를 추적하면 훌륭한 경영진인지 즉시 구별됩니다.

3. **결론**:
   - 단기 분기 실적의 희석 효과보다 10년 단위의 잉여현금흐름(FCF)과 BPS 복리성장률(CAGR)을 추적하는 것이 진정한 안전마진을 확보하는 길입니다.`,
    upvotes: 342,
    downvotes: 4,
    userVote: null,
    commentsCount: 28,
    viewsCount: 4890,
    tags: ['가치투자', '워런버핏', '소유주이익', 'BRK.B'],
    comments: [
      {
        id: 'c1',
        author: {
          name: '복리의마법사',
          badge: 'Verified Investor',
          avatar: '📈',
          isVerified: true,
        },
        createdAt: '1시간 전',
        content: '유지 CapEx와 성장 CapEx를 구분해서 산출하는 접근이 정말 핵심이네요. 좋은 글 감사합니다!',
        likes: 19,
      },
      {
        id: 'c2',
        author: {
          name: '안전마진추구자',
          badge: 'Contributor',
          avatar: '🛡️',
        },
        createdAt: '30분 전',
        content: 'Search Only Good Stock 스크리너의 1달러 테스트 공식과 정확히 일치해서 이해가 쏙쏙 됩니다.',
        likes: 12,
      },
    ],
  },
  {
    id: 'post-2',
    title: '애플(AAPL)의 5년 연속 자사주 매입 소각 효과: 주당 가치 복리의 정석',
    category: 'analysis',
    author: {
      name: '찰리멍거의지혜',
      handle: '@munger_legacy',
      badge: 'Senior Analyst',
      avatar: '💡',
      isVerified: true,
    },
    createdAt: '4시간 전',
    ticker: 'AAPL',
    stockPassStatus: 'pass',
    buffettScore: 100,
    isEditorsPick: true,
    snippet: '애플은 지난 5년간 총 4,500억 달러 규모의 자사주를 소각하여 유통주식수를 18% 줄였습니다. 이는 순이익 성장률을 상회하는 주당순이익(EPS) 성장률을 견인하는 핵심 동력입니다.',
    content: `애플의 자본배치 전략은 버핏이 왜 포트폴리오의 최우선 순위로 애플을 보유했는지를 여실히 보여줍니다.

- **유통 주식수 감소율**: 5개년 연평균 약 3.8% 주식 소각
- **ROE 150%+ 유지 비결**: 지속적인 자기자본 축소 및 고효율 현금흐름 창출
- **경제적 해자**: iOS 생태계 락인 및 서비스 부문 마진 70%+ 확장

재무제표 상 부채비율만 보고 탈락시킬 것이 아니라, 이자보상배율 30배 이상의 압도적 현금창출능력을 감안해야 합니다.`,
    upvotes: 189,
    downvotes: 7,
    userVote: null,
    commentsCount: 15,
    viewsCount: 2310,
    tags: ['애플', 'AAPL', '자사주매입', '자본배치'],
    comments: [
      {
        id: 'c3',
        author: {
          name: '성장주사냥꾼',
          badge: 'Member',
          avatar: '🎯',
        },
        createdAt: '2시간 전',
        content: '하드웨어 기업에서 서비스 플랫폼 기업으로의 완벽한 리레이팅 사례죠.',
        likes: 8,
      },
    ],
  },
  {
    id: 'post-3',
    title: '피터 린치 PEG 0.8 이하 성장주 발굴법: 일상 속에서 발견하는 독점 기업',
    category: 'lynch',
    author: {
      name: '월가의영웅',
      handle: '@peter_lynch_fan',
      badge: 'GARP Strategist',
      avatar: '🔍',
      isVerified: true,
    },
    createdAt: '7시간 전',
    ticker: 'GOOGL',
    stockPassStatus: 'pass',
    buffettScore: 92,
    snippet: '피터 린치는 PER과 EPS 성장률의 관계(PEG)가 1.0 이하인 기업을 강력 매수 구간으로 보았습니다. 2026년 기준 알파벳의 AI 인프라 매출 성장세와 밸류에이션을 대입해보았습니다.',
    content: `피터 린치의 6대 분류 중 '대형 우량주(Stalwarts)'와 '고성장주(Fast Growers)' 사이의 완벽한 균형점:

- **PER**: 23.4배
- **5년 EPS CAGR 예상**: 26.5%
- **산출 PEG**: 23.4 / 26.5 = **0.88 (합격)**
- **순현금 보유액**: 980억 달러의 무차입 수준 철통 재무

기관들의 단기 AI CAPEX 우려로 주가가 조정을 받을 때가 피터 린치 관점에서는 최고의 분할 매수 기회입니다.`,
    upvotes: 145,
    downvotes: 3,
    userVote: null,
    commentsCount: 11,
    viewsCount: 1820,
    tags: ['피터린치', 'PEG', '알파벳', 'GARP'],
  },
  {
    id: 'post-4',
    title: 'SK하이닉스 vs 마이크론: 반도체 사이클 기업의 버핏 6대 룰 탈락 원인 분석',
    category: 'valuation',
    author: {
      name: '사이클의역발상',
      handle: '@contrarian_cycle',
      badge: 'Quantitative Analyst',
      avatar: '📊',
    },
    createdAt: '12시간 전',
    ticker: '000660.KS',
    stockPassStatus: 'fail',
    buffettScore: 33,
    snippet: 'HBM 시장의 압도적 호황에도 불구하고, 왜 버핏의 6대 가치투자 원칙에서는 "탈락(Fail)"으로 진단되는가? 10개년 이익 변동성과 감가상각비 부담 관점에서의 고찰.',
    content: `버핏의 가치투자 관점에서는 "예측 가능한 꾸준한 이익 성장"이 핵심 전제조건입니다.

1. **지속적 이익 성장 탈락**: 2022~2023년 대규모 영업적자 발생으로 10년 연속 흑자 기준 미달.
2. **수익성 확장력 변동성**: 경기 사이클에 따라 영업이익률이 -30%에서 +45%까지 급등락.
3. **거대한 유지 CapEx**: 기술 공정 전환을 위해 연간 수십조 원의 설비투자가 필수적이므로 FCF 전환율이 변동적임.

결론적으로 '트레이딩' 관점에서는 매력적일 수 있으나, 영구보유형 '가치투자' 원칙에서는 버핏 스크리너에서 제외되는 이유입니다.`,
    upvotes: 98,
    downvotes: 14,
    userVote: null,
    commentsCount: 22,
    viewsCount: 3100,
    tags: ['SK하이닉스', '반도체사이클', '버핏룰탈락', '경기민감주'],
  },
  {
    id: 'post-5',
    title: '2026 하반기 글로벌 금리 인하기, 우량 배당성장주의 가치 재평가 전망',
    category: 'outlook',
    author: {
      name: '글로벌매크로랩',
      handle: '@macro_insights',
      badge: 'Macro Strategist',
      avatar: '🌐',
      isVerified: true,
    },
    createdAt: '1일 전',
    ticker: 'KO',
    stockPassStatus: 'pass',
    buffettScore: 95,
    snippet: '미국채 10년물 금리가 3% 중반으로 안정화될 때, 60년 연속 배당을 인상한 코카콜라(KO)와 존슨앤존슨(JNJ)의 실질 주주수익률(배당수익률 + EPS성장률) 비교.',
    content: `무위험 수익률이 하락할수록 가격결정력(Pricing Power)을 가진 필수소비재 우량주의 채권형 주식(Equity Bond) 매력이 부각됩니다.

- 인플레이션을 제품 가격에 100% 전가 가능한 브랜드 파워
- 50년 이상 축적된 글로벌 독점 유통망
- 지속적인 주당 배당금 인상 트랙레코드`,
    upvotes: 76,
    downvotes: 2,
    userVote: null,
    commentsCount: 9,
    viewsCount: 1420,
    tags: ['배당성장주', '코카콜라', '금리인하', '시장전망'],
  },
];

export const INITIAL_POLL: SentimentPoll = {
  id: 'poll-2026-w34',
  question: '현재 글로벌 S&P 500 시장의 밸류에이션 상태에 대한 당신의 판단은?',
  description: '워런 버핏의 버크셔 현금 보유량 3,000억 달러 돌파 시점에서 투자자들의 체감 밸류에이션',
  totalVotes: 1428,
  endsIn: '3일 남음',
  options: [
    { id: 'opt-1', label: '고평가 (버핏처럼 현금 비중 확대 필요)', votes: 785, percentage: 55 },
    { id: 'opt-2', label: '적정 가치 (개별 우량주 선별 매수 구간)', votes: 471, percentage: 33 },
    { id: 'opt-3', label: '저평가 (강력 분할 매수 기회)', votes: 172, percentage: 12 },
  ],
  userVotedId: undefined,
};

export const TOP_CONTRIBUTORS: TopContributor[] = [
  {
    id: 'u1',
    name: '오마하의현인',
    handle: '@omaha_disciple',
    badge: 'Master Value Analyst',
    avatar: '🏛️',
    passAccuracy: '96.8%',
    reputation: 14250,
    followers: 3280,
  },
  {
    id: 'u2',
    name: '찰리멍거의지혜',
    handle: '@munger_legacy',
    badge: 'Senior Analyst',
    avatar: '💡',
    passAccuracy: '94.2%',
    reputation: 9840,
    followers: 2150,
  },
  {
    id: 'u3',
    name: '월가의영웅',
    handle: '@peter_lynch_fan',
    badge: 'GARP Strategist',
    avatar: '🔍',
    passAccuracy: '91.5%',
    reputation: 8200,
    followers: 1840,
  },
  {
    id: 'u4',
    name: '글로벌매크로랩',
    handle: '@macro_insights',
    badge: 'Macro Strategist',
    avatar: '🌐',
    passAccuracy: '89.4%',
    reputation: 6730,
    followers: 1420,
  },
];

export const TRENDING_TICKERS = [
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', price: '$448.20', change: '+1.42%', score: 100, pass: true },
  { ticker: 'AAPL', name: 'Apple Inc.', price: '$228.60', change: '+0.85%', score: 100, pass: true },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$178.40', change: '+2.10%', score: 92, pass: true },
  { ticker: '000660.KS', name: 'SK하이닉스', price: '₩189,500', change: '-1.80%', score: 33, pass: false },
];
