import { DiscussionPost, SentimentPoll, TopContributor } from '../types/community';

export const INITIAL_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'post-1',
    title: '삼전 8만층에 사람있다 구하러 와라 씨발ㅋㅋㅋㅋ',
    category: 'analysis',
    author: {
      name: '8만층구조대원',
      isVerified: true,
    },
    createdAt: '19:09',
    ticker: '005930.KS',
    stockPassStatus: 'watch',
    buffettScore: 65,
    isPinned: true,
    isEditorsPick: true,
    snippet: '내가 84,000원에 풀매수 치고 2년 동안 기도만 하고 있는데 이재용 회장님 언제 10만전자 만듭니까? 손절 치고 엔비디아 가야 되냐?',
    content: `진짜 개잡주 수준 ㅋㅋㅋ 7만전자 올라오면 탈출하려고 했는데 올라오자마자 개같이 음봉 박히네 ㅋㅋㅋ

1. **내 평단**: 84,200원 (물량 500주 보유 중)
2. **현재 상태**: 물려있어서 주주총회 참석권만 2년째 우편으로 받는 중
3. **질문**: 삼전 다 털어버리고 미국 테슬라나 엔비디아 타는 게 맞냐? 뼈 가판 팩폭 좀 해줘라`,
    upvotes: 342,
    downvotes: 18,
    userVote: null,
    commentsCount: 28,
    viewsCount: 4890,
    tags: ['삼성전자', '삼전8만층', '구조대', '국장탈출'],
    comments: [
      {
        id: 'c1',
        author: {
          name: '주린이3년차',
          isVerified: true,
        },
        createdAt: '20:10',
        content: '8만층이면 양반이네 ㅋㅋㅋ 난 9만1천원 펜트하우스 2년째 장기 투숙 중이다 ㅋㅋㅋ',
        likes: 45,
      },
      {
        id: 'c2',
        author: {
          name: '한강물온도체크',
        },
        createdAt: '20:40',
        content: '형님 미장 가도 지금 고점이라 타면 뚝배기 깨집니다 걍 닥치고 존버하세요',
        likes: 28,
      },
    ],
  },
  {
    id: 'post-2',
    title: '미국장 기술주 폭락한 거 보고 잠 다 깼다 ㅋㅋㅋ',
    category: 'buffett',
    author: {
      name: '미장원정대',
      isVerified: true,
    },
    createdAt: '17:15',
    ticker: 'NVDA',
    stockPassStatus: 'pass',
    buffettScore: 92,
    isEditorsPick: true,
    snippet: '어제 나스닥 프리장 보는데 마이너스 4% 박히길래 식은땀 흘리면서 풀매수 샀다. 남들이 공포에 질렸을 때 사라는 버핏 형님 말씀 잊었냐?',
    content: `야수 본능 발동해서 엔비디아랑 테슬라 추가 매수 박음 ㅋㅋㅋ

- **매수 종목**: NVDA, TSLA
- **사유**: 버핏 형님이 "남들이 공포에 질렸을 때 사고, 탐욕스러울 때 팔라"매 ㅋㅋㅋ 지금이 대공포 타이밍임
- **결과**: 통장 잔고 0원 됨... 이번 달 컵라면만 먹고 버틴다 ㅋㅋㅋ`,
    upvotes: 189,
    downvotes: 24,
    userVote: null,
    commentsCount: 15,
    viewsCount: 2310,
    tags: ['나스닥', '엔비디아', '테슬라', '야수개미'],
    comments: [
      {
        id: 'c3',
        author: {
          name: '시드50만원',
        },
        createdAt: '19:12',
        content: '형님 공포에 사라는 건 우량주 얘기지 3배 레버리지가 아닙니다 ㅋㅋㅋ',
        likes: 52,
      },
    ],
  },
  {
    id: 'post-3',
    title: '국장 버리고 미장 가야 되는 진짜 이유 알려준다',
    category: 'lynch',
    author: {
      name: '탈국장지능순',
      isVerified: true,
    },
    createdAt: '14:20',
    ticker: 'AAPL',
    stockPassStatus: 'pass',
    buffettScore: 100,
    snippet: '국장은 거래량 터지면 대주주가 물량 털고 유상증자 빔 쏘는데, 미장은 자사주 사서 소각해 준다. 주주환원 차원이 다름.',
    content: `국장 3년 차에 계좌 수익률 -35% 찍고 멘탈 터져서 미장으로 이민 갔다.

1. **국장 특징**: 호재 터지면 세력이 물량 털고 유상증자 빔 쏨 ㅋㅋㅋ
2. **미장 특징**: 애플 버크셔 같은 대장주들은 자사주 다 태워서 주가 알아서 올려줌
3. **결론**: 국장은 단타용이고 장투는 무조건 미장이다`,
    upvotes: 512,
    downvotes: 32,
    userVote: null,
    commentsCount: 11,
    viewsCount: 5820,
    tags: ['국장탈출', '미장이민', '애플', '주주환원'],
  },
  {
    id: 'post-4',
    title: 'SK하이닉스 HBM 독점 사이클 부활하냐? 목표가 22만 원 간다 ㅋㅋㅋ',
    category: 'valuation',
    author: {
      name: '반도체전사',
    },
    createdAt: '09:15',
    ticker: '000660.KS',
    stockPassStatus: 'fail',
    buffettScore: 33,
    snippet: 'HBM3E 독점 납품 찌라시 돌면서 외국인들 싹 쓸어가는데 지금이라도 타고 들어가야 됨? 하이닉스 숏 친 애들 한강물 체크하러 가라.',
    content: `삼성전자 비틀거릴 때 하이닉스가 HBM으로 뚝배기 다 깨는 중 ㅋㅋㅋ

- **HBM 점유율**: 50% 이상 독점 모드
- **차트**: 5일선 타고 우상향 정배열 완성
- **목표가**: 220,000원 찍고 숏충이들 다 한강 보낼 예정 ㅋㅋㅋ`,
    upvotes: 210,
    downvotes: 15,
    userVote: null,
    commentsCount: 22,
    viewsCount: 3100,
    tags: ['SK하이닉스', 'HBM', '반도체', '숏청산'],
  },
  {
    id: 'post-5',
    title: '금리 인하하면 배당주 사라는 놈들 다 나와라 ㅋㅋㅋ',
    category: 'outlook',
    author: {
      name: '배당금으로치킨',
      isVerified: true,
    },
    createdAt: '08.17',
    ticker: 'KO',
    stockPassStatus: 'pass',
    buffettScore: 95,
    snippet: '코카콜라 배당률 3%대 받고 싱글벙글했는데 주가 떡락해서 배당 받은 거 이상으로 마이너스 났다 ㅋㅋㅋ 이게 맞는 거냐?',
    content: `배당주 장투하면 건물주 부럽지 않다매 ㅋㅋㅋ

- **보유 종목**: 코카콜라(KO), SCHD
- **상황**: 배당금 10만 원 들어왔는데 주가 평가손실 -120만 원 ㅋㅋㅋ
- **느낀점**: 배당도 주가가 올라야 기분 좋은 거다... 뼛속까지 아프네`,
    upvotes: 156,
    downvotes: 9,
    userVote: null,
    commentsCount: 9,
    viewsCount: 1420,
    tags: ['배당주', '코카콜라', 'SCHD', '배당착시'],
  },
];

export const INITIAL_POLL: SentimentPoll = {
  id: 'poll-2026-w34',
  question: '현재 당신의 주식 계좌 상태 솔직하게 투표해라 ㅋㅋㅋ',
  description: '주식 갤러리 개미들의 2026년 진짜 계좌 수익률 현황 조사',
  totalVotes: 3428,
  endsIn: '3일 남음',
  options: [
    { id: 'opt-1', label: '떡락중 (손실 -30% 이상 물려있음)', votes: 1985, percentage: 58 },
    { id: 'opt-2', label: '본전 치기 (원금만 사수 중)', votes: 1028, percentage: 30 },
    { id: 'opt-3', label: '양전함 (수익률 +10% 이상 대박)', votes: 415, percentage: 12 },
  ],
  userVotedId: undefined,
};

export const TOP_CONTRIBUTORS: TopContributor[] = [
  {
    id: 'u1',
    name: '8만층구조대원',
    passAccuracy: '96.8%',
    reputation: 14250,
    followers: 3280,
  },
  {
    id: 'u2',
    name: '탈국장지능순',
    passAccuracy: '94.2%',
    reputation: 9840,
    followers: 2150,
  },
  {
    id: 'u3',
    name: '미장원정대',
    passAccuracy: '91.5%',
    reputation: 8200,
    followers: 1840,
  },
  {
    id: 'u4',
    name: '한강물온도체크',
    passAccuracy: '89.4%',
    reputation: 6730,
    followers: 1420,
  },
];

export const TRENDING_TICKERS = [
  { ticker: '005930.KS', name: '삼성전자', price: '₩74,500', change: '-1.42%', score: 65, pass: true },
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: '$128.60', change: '+3.85%', score: 92, pass: true },
  { ticker: 'AAPL', name: 'Apple Inc.', price: '$228.40', change: '+1.10%', score: 100, pass: true },
  { ticker: '000660.KS', name: 'SK하이닉스', price: '₩189,500', change: '+2.80%', score: 33, pass: false },
];

