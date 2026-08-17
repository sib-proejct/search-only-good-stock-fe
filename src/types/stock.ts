import { RuleEvaluationDetail } from './rules';

export interface LeadershipMember {
  role: string;           // 직책 (예: '대표이사(CEO)', '최고재무책임자(CFO)', '이사회 의장')
  name: string;           // 인물명 (예: '사티아 나델라')
  tenureYears: number;    // 재임 연수
  bio: string;            // 핵심 업적 및 평가
  sharesOwned: number;    // 보유 주식 수
  sharesValueUsd: number; // 시가 환산 보유액 ($)
}

export interface ExecutiveCompensation {
  year: number;
  totalCompUsd: number;      // 총 보수액 ($)
  baseSalaryPct: number;     // 기본급 비중 (%)
  performanceBonusPct: number; // 단기 성과급 비중 (%)
  stockBasedCompPct: number; // 장기 주식보상/스톡옵션 비중 (%)
  alignmentRating: 'EXCELLENT' | 'GOOD' | 'CONCERNING'; // 주주수익률 연동 평가
  summaryComment: string;    // 평가 요약 코멘트
}

export interface CapitalAllocation5Yr {
  shareBuybacksPct: number;  // 자사주 매입/소각 비중 (%)
  dividendsPct: number;      // 현금 배당 비중 (%)
  reinvestmentPct: number;   // R&D 및 CAPEX 재투자 비중 (%)
  maAcquisitionPct: number;  // 타법인 M&A 비중 (%)
  totalShareholderReturnPct: number; // 총 주주환원율 (%)
}

export interface ManagementGovernance {
  overallGrade: 'A+' | 'A' | 'B' | 'C'; // 거버넌스 등급
  gradeLabel: string;                   // '주주 친화 A+ 등급 (우수)'
  ceoSkinInTheGameSummary: string;      // 내부자 지분율 요약
  leadership: LeadershipMember[];       // 핵심 리더십 프로필
  compensation: ExecutiveCompensation;  // 경영진 보수 체계
  capitalAllocation: CapitalAllocation5Yr; // 5개년 자본배치 이력
  boardIndependencePct: number;         // 사외이사 독립성 비율 (%)
}

export interface YearlyFinancialMetric {
  year: number;
  roe: number;        // 자기자본이익률 (%)
  roic: number;       // 투하자본수익률 (%)
  eps: number;        // 주당순이익 ($ or 원)
  bps: number;        // 주당순자산 ($ or 원)
  revenue: number;    // 매출액
  netIncome: number;  // 당기순이익
  operatingMargin: number; // 영업이익률 (%)
  debtToEquity: number;   // 부채비율 (%)
  price: number;      // 연말 주가
}

export interface OneDollarTestResult {
  evaluationPeriodYears: number; // 평가 기간 (5년)
  accumulatedRetainedEarnings: number; // 5개년 누적 유보이익 (억 달러)
  marketCapIncrease: number;          // 5개년 시가총액 증가분 (억 달러)
  valueCreatedPerDollar: number;      // 1달러당 창출 시장가치 ($)
  passed: boolean;                    // 1.0 이상 여부
  evaluationComment: string;
}

export interface Stock {
  id: string;
  ticker: string;                     // 티커 (AAPL, MSFT, 005930 등)
  nameKo: string;                     // 한글 종목명 (애플, 마이크로소프트, 삼성전자)
  nameEn: string;                     // 영문 종목명
  market: 'NASDAQ' | 'NYSE' | 'KOSPI' | 'KOSDAQ';
  sector: string;                     // 업종 (기술/소프트웨어, 필수소비재 등)
  currentPrice: number;               // 현재가
  priceChangePct: number;             // 일일 등락률 (%)
  currency: 'USD' | 'KRW';
  marketCap: number;                  // 시가총액 (억 달러 or 조 원)
  marketCapFormatted: string;         // 포맷팅된 시총 ("$3.15T", "450조원")

  // 버핏 6대 지표 요약
  buffettScore: number;               // 버핏 종합 스코어 (0 ~ 100점)
  isMasterPass: boolean;              // 6/6 전체 통과 여부
  passCount: number;                  // 통과 규칙 개수 (예: 6)
  totalRuleCount: number;             // 총 검증 규칙 수 (예: 6)

  avgRoe5Yr: number;                  // 5개년 평균 ROE (%)
  avgRoic5Yr: number;                 // 5개년 평균 ROIC (%)
  epsCagr5Yr: number;                 // 5개년 EPS CAGR (%)
  bpsCagr5Yr: number;                 // 5개년 BPS CAGR (%)
  debtToEquity: number;               // 최근 부채비율 (%)
  interestCoverage: number;           // 이자보상배율 (배)
  shareCountCagr5Yr: number;          // 5개년 발행주식수 CAGR (%) (마이너스면 자사주 소각)
  benchmarkBpsCagr5Yr: number;        // 벤치마크(S&P500/KOSPI) BPS CAGR (%)

  // 시계열 재무 추세 데이터
  sparkline5Yr: number[];             // 5개년 주가 추세 스파크라인 포인트
  yearlyFinancials: YearlyFinancialMetric[]; // 연도별 세부 재무제표

  // 1달러 유보이익 테스트 결과
  oneDollarTest: OneDollarTestResult;

  // 경제적 해자(Moat) 분석
  economicMoatSummary: string;
  moatSources: string[];              // ['높은 전환비용', '강력한 네트워크 효과', '독점적 브랜드 자산']

  // 경영진 및 이사회 거버넌스
  governance: ManagementGovernance;

  // 규칙별 세부 평가 결과
  ruleEvaluations: RuleEvaluationDetail[];
}
