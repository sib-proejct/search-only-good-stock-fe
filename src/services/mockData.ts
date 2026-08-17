import { Stock } from '../types/stock';

export const MOCK_STOCKS: Stock[] = [
  {
    id: 'aapl',
    ticker: 'AAPL',
    nameKo: '애플',
    nameEn: 'Apple Inc.',
    market: 'NASDAQ',
    sector: '기술 · 하드웨어/서비스',
    currentPrice: 175.84,
    priceChangePct: 0.85,
    currency: 'USD',
    marketCap: 34200,
    marketCapFormatted: '$3.42T',

    buffettScore: 100,
    isMasterPass: true,
    passCount: 6,
    totalRuleCount: 6,

    avgRoe5Yr: 147.2,
    avgRoic5Yr: 52.4,
    epsCagr5Yr: 15.4,
    bpsCagr5Yr: 12.8,
    debtToEquity: 145.0,
    interestCoverage: 28.5,
    shareCountCagr5Yr: -3.2,
    benchmarkBpsCagr5Yr: 7.2,

    sparkline5Yr: [115, 150, 130, 185, 192, 224],
    yearlyFinancials: [
      { year: 2020, roe: 73.7, roic: 35.1, eps: 3.28, bps: 3.8, revenue: 2745, netIncome: 574, operatingMargin: 24.1, debtToEquity: 170.0, price: 132.7 },
      { year: 2021, roe: 147.4, roic: 54.2, eps: 5.61, bps: 3.8, revenue: 3658, netIncome: 946, operatingMargin: 29.8, debtToEquity: 195.0, price: 177.6 },
      { year: 2022, roe: 175.1, roic: 58.6, eps: 6.11, bps: 3.1, revenue: 3943, netIncome: 998, operatingMargin: 30.3, debtToEquity: 240.0, price: 129.9 },
      { year: 2023, roe: 156.0, roic: 54.0, eps: 6.13, bps: 3.9, revenue: 3832, netIncome: 970, operatingMargin: 29.8, debtToEquity: 160.0, price: 192.5 },
      { year: 2026, roe: 147.2, roic: 52.4, eps: 6.60, bps: 4.5, revenue: 3910, netIncome: 1010, operatingMargin: 31.2, debtToEquity: 145.0, price: 224.5 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 2100,
      marketCapIncrease: 14200,
      valueCreatedPerDollar: 6.76,
      passed: true,
      evaluationComment: '5개년 누적 유보이익 $2,100억 대비 시가총액 $1조 4,200억 증가 ($1 유보당 $6.76 창출)'
    },

    economicMoatSummary: 'iOS 생태계의 막강한 사용자 충성도와 프라이싱 파워(Pricing Power), 전 세계 22억 대 활성 기기 기반 서비스 락인',
    moatSources: ['소비자 독점 브랜드 가치', '폐쇄형 OS 생태계 락인 효과', '연간 $1,000억 이상 잉여현금흐름(FCF) 창출력'],

    governance: {
      overallGrade: 'A+',
      gradeLabel: '주주 친화 A+ 등급 (우수)',
      ceoSkinInTheGameSummary: 'CEO 팀 쿡 300만 주 이상 보유 (약 $7억 달러), 자사주 매입을 통한 세계 최고 수준의 주식수 축소 집행',
      leadership: [
        { role: '대표이사(CEO)', name: '팀 쿡 (Tim Cook)', tenureYears: 13, bio: '스티브 잡스 이후 공급망 최적화 및 서비스/웨어러블 매출 3배 성장, 버핏의 최대 투자 종목 등극', sharesOwned: 3280000, sharesValueUsd: 736360000 },
        { role: '최고재무책임자(CFO)', name: '루카 마에스트리 (Luca Maestri)', tenureYears: 10, bio: '자본 중립(Net Cash Neutral) 전략 하에 누적 $6,000억 이상 자사주 매입/소각 총괄', sharesOwned: 120000, sharesValueUsd: 26940000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 63200000,
        baseSalaryPct: 4.7,
        performanceBonusPct: 15.8,
        stockBasedCompPct: 79.5,
        alignmentRating: 'EXCELLENT',
        summaryComment: '보수의 약 80%가 장기 성과 기반 주식 보상이며, 주주 피드백 수렴 후 기본급 동결 및 주주연동 비중 상향.'
      },
      capitalAllocation: {
        shareBuybacksPct: 78.0,
        dividendsPct: 14.0,
        reinvestmentPct: 8.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 92.0
      },
      boardIndependencePct: 87.5
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '147.2%', targetValue: '>= 15.0%', unit: '%', comment: '자사주 소각과 초고수익성으로 압도적 ROE' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '52.4%', targetValue: '>= 10.0%', unit: '%', comment: '글로벌 최고 수준의 실질 투하자본수익률' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '15.4%', targetValue: '>= 10.0%', unit: '%', comment: '주당 순이익 연평균 15.4% 안정적 우상향' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$6.76', targetValue: '>= $1.00', unit: '$', comment: '유보이익 1달러당 6.76달러 주주가치 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '145.0%', targetValue: '<= 150.0%', unit: '%', comment: '영업현금흐름으로 부채 전액 상환 가능 (실질 무차입)' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '-3.2%', targetValue: '<= 0.0%', unit: '%', comment: '연평균 -3.2% 주식수 감소 (주당 지분율 자동 상승)' }
    ]
  },
  {
    id: 'msft',
    ticker: 'MSFT',
    nameKo: '마이크로소프트',
    nameEn: 'Microsoft Corp.',
    market: 'NASDAQ',
    sector: '기술 · 클라우드/소프트웨어',
    currentPrice: 420.55,
    priceChangePct: 1.45,
    currency: 'USD',
    marketCap: 31500,
    marketCapFormatted: '$3.15T',

    buffettScore: 100,
    isMasterPass: true,
    passCount: 6,
    totalRuleCount: 6,

    avgRoe5Yr: 39.1,
    avgRoic5Yr: 28.2,
    epsCagr5Yr: 18.2,
    bpsCagr5Yr: 14.5,
    debtToEquity: 42.5,
    interestCoverage: 24.8,
    shareCountCagr5Yr: -0.8,
    benchmarkBpsCagr5Yr: 7.2,

    sparkline5Yr: [180, 222, 250, 310, 375, 425],
    yearlyFinancials: [
      { year: 2020, roe: 40.1, roic: 26.5, eps: 5.76, bps: 15.6, revenue: 1430, netIncome: 442, operatingMargin: 37.0, debtToEquity: 58.0, price: 222.4 },
      { year: 2021, roe: 47.1, roic: 31.0, eps: 8.05, bps: 18.9, revenue: 1680, netIncome: 612, operatingMargin: 41.6, debtToEquity: 46.2, price: 336.3 },
      { year: 2022, roe: 42.9, roic: 29.5, eps: 9.21, bps: 22.1, revenue: 1980, netIncome: 727, operatingMargin: 42.1, debtToEquity: 41.5, price: 239.8 },
      { year: 2023, roe: 38.8, roic: 27.8, eps: 9.68, bps: 27.8, revenue: 2119, netIncome: 723, operatingMargin: 41.8, debtToEquity: 39.8, price: 376.0 },
      { year: 2026, roe: 39.1, roic: 28.2, eps: 11.80, bps: 35.8, revenue: 2451, netIncome: 881, operatingMargin: 44.6, debtToEquity: 42.5, price: 425.2 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 1850,
      marketCapIncrease: 12500,
      valueCreatedPerDollar: 6.75,
      passed: true,
      evaluationComment: '5개년 누적 유보이익 $1,850억 대비 시가총액 $1조 2,500억 증가 ($1 유보당 $6.75 가치 창출)'
    },

    economicMoatSummary: '윈도우/오피스 생태계의 절대적 전환비용과 애저(Azure) 클라우드의 거대한 규모의 경제 및 네트워크 효과 보유',
    moatSources: ['높은 고객 전환비용 (Switching Costs)', '글로벌 엔터프라이즈 B2B 락인', '생성형 AI(Copilot) 생태계 선점'],

    governance: {
      overallGrade: 'A+',
      gradeLabel: '주주 친화 A+ 등급 (우수)',
      ceoSkinInTheGameSummary: 'CEO 사티아 나델라 약 80만 주 보유 (시가 약 $3.4억 달러), 10b5-1 정기 매도 외 비정상 지분 매각 없음',
      leadership: [
        { role: '대표이사(CEO) & 이사회 의장', name: '사티아 나델라 (Satya Nadella)', tenureYears: 11, bio: '2014년 취임 후 모바일 실패 극복, 클라우드(Azure) 대전환으로 시가총액 10배 성장 견인', sharesOwned: 800000, sharesValueUsd: 340160000 },
        { role: '최고재무책임자(CFO)', name: '에이미 후드 (Amy Hood)', tenureYears: 12, bio: '철저한 자본 배치와 40% 이상의 영업이익률 및 FCF 전환율 관리의 핵심 주역', sharesOwned: 250000, sharesValueUsd: 106300000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 79100000,
        baseSalaryPct: 3.2,
        performanceBonusPct: 11.8,
        stockBasedCompPct: 85.0,
        alignmentRating: 'EXCELLENT',
        summaryComment: 'CEO 총 보수의 85%가 3개년 상대적 주주수익률(TSR) 및 ROE 달성도에 직접 연동되어 주주 이익과 고도로 일치함.'
      },
      capitalAllocation: {
        shareBuybacksPct: 52.0,
        dividendsPct: 28.0,
        reinvestmentPct: 18.0,
        maAcquisitionPct: 2.0,
        totalShareholderReturnPct: 80.0
      },
      boardIndependencePct: 88.9
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '39.1%', targetValue: '>= 15.0%', unit: '%', comment: '5년 연속 38% 이상 초고효율 유지' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '28.2%', targetValue: '>= 10.0%', unit: '%', comment: '투입 자본 대비 탁월한 실질 현금창출력' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '18.2%', targetValue: '>= 10.0%', unit: '%', comment: '주당 순이익 연평균 18.2% 복리 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$6.75', targetValue: '>= $1.00', unit: '$', comment: '유보이익 1달러당 6.75달러 주주가치 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '42.5%', targetValue: '<= 80.0%', unit: '%', comment: '풍부한 현금성 자산 대비 건전한 부채 비율' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '-0.8%', targetValue: '<= 0.0%', unit: '%', comment: '지속적인 자사주 매입 및 소각으로 지분 희석 없음' }
    ]
  },
  {
    id: 'googl',
    ticker: 'GOOGL',
    nameKo: '알파벳',
    nameEn: 'Alphabet Inc.',
    market: 'NASDAQ',
    sector: '기술 · 인터넷/광고',
    currentPrice: 150.22,
    priceChangePct: 0.95,
    currency: 'USD',
    marketCap: 19200,
    marketCapFormatted: '$1.92T',

    buffettScore: 85,
    isMasterPass: false,
    passCount: 5,
    totalRuleCount: 6,

    avgRoe5Yr: 24.8,
    avgRoic5Yr: 22.1,
    epsCagr5Yr: 21.5,
    bpsCagr5Yr: 15.2,
    debtToEquity: 11.2,
    interestCoverage: 85.0,
    shareCountCagr5Yr: -1.2,
    benchmarkBpsCagr5Yr: 7.2,

    sparkline5Yr: [70, 95, 88, 120, 140, 150],
    yearlyFinancials: [
      { year: 2020, roe: 19.0, roic: 18.2, eps: 2.93, bps: 16.5, revenue: 1825, netIncome: 402, operatingMargin: 22.6, debtToEquity: 12.0, price: 87.6 },
      { year: 2021, roe: 32.1, roic: 29.5, eps: 5.61, bps: 19.8, revenue: 2576, netIncome: 760, operatingMargin: 30.6, debtToEquity: 10.8, price: 144.9 },
      { year: 2022, roe: 23.6, roic: 21.0, eps: 4.56, bps: 20.1, revenue: 2828, netIncome: 599, operatingMargin: 26.5, debtToEquity: 11.0, price: 88.7 },
      { year: 2023, roe: 27.4, roic: 24.0, eps: 5.80, bps: 22.8, revenue: 3074, netIncome: 737, operatingMargin: 27.4, debtToEquity: 11.5, price: 139.7 },
      { year: 2026, roe: 24.8, roic: 22.1, eps: 7.10, bps: 26.5, revenue: 3450, netIncome: 920, operatingMargin: 30.1, debtToEquity: 11.2, price: 150.2 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 2200,
      marketCapIncrease: 9500,
      valueCreatedPerDollar: 4.32,
      passed: true,
      evaluationComment: '검색 및 유튜브 광고 현금흐름 기반 $1 유보당 $4.32 가치 창출'
    },

    economicMoatSummary: '글로벌 검색 점유율 90% 이상의 독점적 해자와 유튜브, 안드로이드 생태계 기반 막강한 네트워크 효과',
    moatSources: ['검색 엔진 글로벌 독점', '유튜브 비디오 플랫폼 네트워크 효과', '안드로이드 모바일 OS 점유율'],

    governance: {
      overallGrade: 'A',
      gradeLabel: '주주 친화 A 등급 (우수)',
      ceoSkinInTheGameSummary: '순다르 피차이 CEO 장기 재임 및 자사주 매입 확대',
      leadership: [
        { role: '대표이사(CEO)', name: '순다르 피차이 (Sundar Pichai)', tenureYears: 10, bio: '구글 핵심 제품 총괄 후 지주사 알파벳 CEO 취임, AI First 전략 주도', sharesOwned: 220000, sharesValueUsd: 33048400 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 8500000,
        baseSalaryPct: 23.5,
        performanceBonusPct: 20.0,
        stockBasedCompPct: 56.5,
        alignmentRating: 'GOOD',
        summaryComment: '장기 성과 조건부 주식 보상 체계 유지.'
      },
      capitalAllocation: {
        shareBuybacksPct: 70.0,
        dividendsPct: 5.0,
        reinvestmentPct: 25.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 75.0
      },
      boardIndependencePct: 83.3
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '24.8%', targetValue: '>= 15.0%', unit: '%', comment: '5년 평균 24.8% 높은 자본수익률' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '22.1%', targetValue: '>= 10.0%', unit: '%', comment: '검색 독점력에 따른 높은 투하자본수익률' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '21.5%', targetValue: '>= 10.0%', unit: '%', comment: '연평균 21.5% 고속 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$4.32', targetValue: '>= $1.00', unit: '$', comment: '유보이익 대비 높은 시장가치 형성' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '11.2%', targetValue: '<= 80.0%', unit: '%', comment: '실질 무차입 초건전 재무구조' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '-1.2%', targetValue: '<= 0.0%', unit: '%', comment: '적극적 자사주 매입' }
    ]
  },
  {
    id: 'cost',
    ticker: 'COST',
    nameKo: '코스트코',
    nameEn: 'Costco Wholesale',
    market: 'NASDAQ',
    sector: '소비재 · 회원제 유통',
    currentPrice: 740.10,
    priceChangePct: 0.65,
    currency: 'USD',
    marketCap: 3280,
    marketCapFormatted: '$328B',

    buffettScore: 100,
    isMasterPass: true,
    passCount: 6,
    totalRuleCount: 6,

    avgRoe5Yr: 28.4,
    avgRoic5Yr: 20.8,
    epsCagr5Yr: 12.1,
    bpsCagr5Yr: 11.5,
    debtToEquity: 35.0,
    interestCoverage: 35.0,
    shareCountCagr5Yr: -0.2,
    benchmarkBpsCagr5Yr: 7.2,

    sparkline5Yr: [300, 420, 510, 560, 680, 740],
    yearlyFinancials: [
      { year: 2020, roe: 23.7, roic: 18.0, eps: 9.02, bps: 42.0, revenue: 1667, netIncome: 40, operatingMargin: 3.4, debtToEquity: 40.0, price: 347.0 },
      { year: 2021, roe: 28.9, roic: 20.5, eps: 11.27, bps: 45.0, revenue: 1959, netIncome: 50, operatingMargin: 3.4, debtToEquity: 38.0, price: 455.0 },
      { year: 2022, roe: 29.5, roic: 21.0, eps: 13.14, bps: 48.0, revenue: 2269, netIncome: 58, operatingMargin: 3.4, debtToEquity: 36.0, price: 456.0 },
      { year: 2023, roe: 27.2, roic: 20.2, eps: 14.16, bps: 53.0, revenue: 2422, netIncome: 63, operatingMargin: 3.3, debtToEquity: 35.0, price: 565.0 },
      { year: 2026, roe: 28.4, roic: 20.8, eps: 16.50, bps: 59.0, revenue: 2540, netIncome: 73, operatingMargin: 3.6, debtToEquity: 35.0, price: 740.1 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 210,
      marketCapIncrease: 1650,
      valueCreatedPerDollar: 7.85,
      passed: true,
      evaluationComment: '멤버십 갱신율 93% 기반 $1 유보당 $7.85 시장가치 창출'
    },

    economicMoatSummary: '찰리 멍거가 생전 가장 극찬한 회원제 비즈니스 모델: 최저 마진 정책과 연회비 기반의 극단적 고객 충성도',
    moatSources: ['93% 이상의 글로벌 멤버십 갱신율', '대량 구매 기반의 규모의 경제', '찰리 멍거가 평생 보유한 최고의 경제적 해자'],

    governance: {
      overallGrade: 'A+',
      gradeLabel: '주주 친화 A+ 등급 (우수)',
      ceoSkinInTheGameSummary: '창업 철학 계승 경영진 재임',
      leadership: [
        { role: '대표이사(CEO)', name: '론 바크리스 (Ron Vachris)', tenureYears: 2, bio: '지게차 운전수로 입사해 40년 만에 CEO 등극, 현장 중심의 코스트코 철학 계승', sharesOwned: 45000, sharesValueUsd: 33304500 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 11500000,
        baseSalaryPct: 10.0,
        performanceBonusPct: 15.0,
        stockBasedCompPct: 75.0,
        alignmentRating: 'EXCELLENT',
        summaryComment: '경영진 보수가 매우 절제되어 있으며 주주 가치와 완벽히 정렬됨.'
      },
      capitalAllocation: {
        shareBuybacksPct: 35.0,
        dividendsPct: 45.0,
        reinvestmentPct: 20.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 80.0
      },
      boardIndependencePct: 84.6
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '28.4%', targetValue: '>= 15.0%', unit: '%', comment: '회원비 기반의 안정적 초과 수익률' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '20.8%', targetValue: '>= 10.0%', unit: '%', comment: '극도로 효율적인 매장 자본 회전율' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '12.1%', targetValue: '>= 10.0%', unit: '%', comment: '연평균 12.1% 꾸준한 EPS 복리 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$7.85', targetValue: '>= $1.00', unit: '$', comment: '유보이익 1달러당 7.85달러 주주가치 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '35.0%', targetValue: '<= 80.0%', unit: '%', comment: '매우 건전한 저차입 경영' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '-0.2%', targetValue: '<= 0.0%', unit: '%', comment: '주식 희석 없음' }
    ]
  },
  {
    id: 'nvda',
    ticker: 'NVDA',
    nameKo: '엔비디아',
    nameEn: 'NVIDIA Corp.',
    market: 'NASDAQ',
    sector: '기술 · 반도체/AI 가속기',
    currentPrice: 880.00,
    priceChangePct: 2.15,
    currency: 'USD',
    marketCap: 28500,
    marketCapFormatted: '$2.85T',

    buffettScore: 66,
    isMasterPass: false,
    passCount: 4,
    totalRuleCount: 6,

    avgRoe5Yr: 65.0,
    avgRoic5Yr: 48.0,
    epsCagr5Yr: 45.0,
    bpsCagr5Yr: 38.5,
    debtToEquity: 22.0,
    interestCoverage: 60.0,
    shareCountCagr5Yr: 0.8,
    benchmarkBpsCagr5Yr: 7.2,

    sparkline5Yr: [130, 290, 140, 480, 750, 880],
    yearlyFinancials: [
      { year: 2020, roe: 26.0, roic: 22.0, eps: 1.73, bps: 11.0, revenue: 166, netIncome: 43, operatingMargin: 28.0, debtToEquity: 25.0, price: 130.0 },
      { year: 2021, roe: 36.8, roic: 30.0, eps: 3.85, bps: 16.0, revenue: 269, netIncome: 97, operatingMargin: 37.0, debtToEquity: 24.0, price: 294.0 },
      { year: 2022, roe: 19.5, roic: 16.0, eps: 1.74, bps: 18.0, revenue: 269, netIncome: 43, operatingMargin: 21.0, debtToEquity: 25.0, price: 146.0 },
      { year: 2023, roe: 91.5, roic: 72.0, eps: 11.93, bps: 35.0, revenue: 609, netIncome: 297, operatingMargin: 54.0, debtToEquity: 23.0, price: 495.0 },
      { year: 2026, roe: 65.0, roic: 48.0, eps: 24.50, bps: 62.0, revenue: 1100, netIncome: 600, operatingMargin: 62.0, debtToEquity: 22.0, price: 880.0 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 650,
      marketCapIncrease: 22000,
      valueCreatedPerDollar: 33.80,
      passed: true,
      evaluationComment: 'AI 혁명으로 $1 유보당 $33.80의 폭발적 시장가치 창출 (성장성은 최고이나 변동성 관찰 필요)'
    },

    economicMoatSummary: 'CUDA 소프트웨어 플랫폼 락인과 가속 컴퓨팅 아키텍처 생태계의 독점적 지배력',
    moatSources: ['CUDA 개발자 생태계 락인', '데이터센터 AI 가속기 시장 90% 점유', '막강한 R&D 투자 격차'],

    governance: {
      overallGrade: 'A',
      gradeLabel: '주주 친화 A 등급 (우수)',
      ceoSkinInTheGameSummary: '창업자 젠슨 황 약 3.5% 지분 보유',
      leadership: [
        { role: '창립자 & CEO', name: '젠슨 황 (Jensen Huang)', tenureYears: 31, bio: '엔비디아 공동 창립, GPU 컴퓨팅 및 생성형 AI 인프라 혁명 완성', sharesOwned: 86000000, sharesValueUsd: 75680000000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 34200000,
        baseSalaryPct: 3.0,
        performanceBonusPct: 12.0,
        stockBasedCompPct: 85.0,
        alignmentRating: 'EXCELLENT',
        summaryComment: '창업자로서 지분 가치에 압도적으로 연동됨.'
      },
      capitalAllocation: {
        shareBuybacksPct: 65.0,
        dividendsPct: 5.0,
        reinvestmentPct: 30.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 70.0
      },
      boardIndependencePct: 84.6
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '65.0%', targetValue: '>= 15.0%', unit: '%', comment: 'AI 슈퍼사이클로 초고수익성' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '48.0%', targetValue: '>= 10.0%', unit: '%', comment: '독점적 GPU 공급으로 초과수익' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '45.0%', targetValue: '>= 10.0%', unit: '%', comment: '연평균 45.0% 폭발적 EPS 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$33.80', targetValue: '>= $1.00', unit: '$', comment: '1달러당 33.8달러 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '22.0%', targetValue: '<= 80.0%', unit: '%', comment: '부채 매우 낮음' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: false, actualValue: '+0.8%', targetValue: '<= 0.0%', unit: '%', comment: '스톡옵션 보상으로 주식수 소폭 증가' }
    ]
  },
  {
    id: 'tsla',
    ticker: 'TSLA',
    nameKo: '테슬라',
    nameEn: 'Tesla Inc.',
    market: 'NASDAQ',
    sector: '자동차 · 전기차/에너지',
    currentPrice: 170.00,
    priceChangePct: -1.85,
    currency: 'USD',
    marketCap: 5400,
    marketCapFormatted: '$540B',

    buffettScore: 33,
    isMasterPass: false,
    passCount: 2,
    totalRuleCount: 6,

    avgRoe5Yr: 15.0,
    avgRoic5Yr: 9.5,
    epsCagr5Yr: -5.0,
    bpsCagr5Yr: 16.0,
    debtToEquity: 18.0,
    interestCoverage: 25.0,
    shareCountCagr5Yr: 3.5,
    benchmarkBpsCagr5Yr: 7.2,

    sparkline5Yr: [100, 380, 120, 250, 210, 170],
    yearlyFinancials: [
      { year: 2020, roe: 4.8, roic: 4.0, eps: 0.24, bps: 7.0, revenue: 315, netIncome: 7, operatingMargin: 6.3, debtToEquity: 45.0, price: 235.0 },
      { year: 2021, roe: 19.3, roic: 15.0, eps: 1.63, bps: 9.5, revenue: 538, netIncome: 55, operatingMargin: 12.1, debtToEquity: 25.0, price: 352.0 },
      { year: 2022, roe: 28.1, roic: 21.0, eps: 3.62, bps: 14.0, revenue: 814, netIncome: 125, operatingMargin: 16.8, debtToEquity: 18.0, price: 123.0 },
      { year: 2023, roe: 19.4, roic: 12.0, eps: 3.12, bps: 19.0, revenue: 967, netIncome: 149, operatingMargin: 8.2, debtToEquity: 16.0, price: 248.0 },
      { year: 2026, roe: 15.0, roic: 9.5, eps: 2.20, bps: 22.0, revenue: 980, netIncome: 75, operatingMargin: 7.5, debtToEquity: 18.0, price: 170.0 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 380,
      marketCapIncrease: 1200,
      valueCreatedPerDollar: 3.15,
      passed: true,
      evaluationComment: '전기차 대중화 기여했으나 가격 인하 경쟁으로 최근 이익률 급감'
    },

    economicMoatSummary: '전기차 브랜드 파워 및 충전 인프라(슈퍼차저) 네트워크 효과 보유하나, 자동차 산업 본연의 가격 경쟁 압박 심화',
    moatSources: ['슈퍼차저 충전 네트워크 표준화', '자율주행 데이터 축적', '오토모티브 제조 혁신 (기가캐스팅)'],

    governance: {
      overallGrade: 'C',
      gradeLabel: '주주 친화 C 등급 (주의)',
      ceoSkinInTheGameSummary: 'CEO 일론 머스크 타 법인(X, xAI, SpaceX) 겸직 및 거액 스톡옵션 분쟁 이력',
      leadership: [
        { role: '대표이사(CEO)', name: '일론 머스크 (Elon Musk)', tenureYears: 16, bio: '전기차 대중화 주도, xAI/스페이스X 등 다수 기업 겸직', sharesOwned: 411000000, sharesValueUsd: 69870000000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 0,
        baseSalaryPct: 0.0,
        performanceBonusPct: 0.0,
        stockBasedCompPct: 100.0,
        alignmentRating: 'CONCERNING',
        summaryComment: '초대형 스톡옵션 보상안 법원 판결 및 겸직 리스크로 거버넌스 평가 감점.'
      },
      capitalAllocation: {
        shareBuybacksPct: 0.0,
        dividendsPct: 0.0,
        reinvestmentPct: 100.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 0.0
      },
      boardIndependencePct: 62.5
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '15.0%', targetValue: '>= 15.0%', unit: '%', comment: '기준치 15% 턱걸이 충족' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: false, actualValue: '9.5%', targetValue: '>= 10.0%', unit: '%', comment: '마진율 하락으로 ROIC 10% 미달' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: false, actualValue: '-5.0%', targetValue: '>= 10.0%', unit: '%', comment: '가격 인하로 최근 EPS 역성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$3.15', targetValue: '>= $1.00', unit: '$', comment: '1달러당 3.15달러 가치 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '18.0%', targetValue: '<= 80.0%', unit: '%', comment: '부채비율 안전' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: false, actualValue: '+3.5%', targetValue: '<= 0.0%', unit: '%', comment: '주식수 연평균 +3.5% 증가로 지분 희석' }
    ]
  },
  {
    id: '005930',
    ticker: '005930',
    nameKo: '삼성전자',
    nameEn: 'Samsung Electronics',
    market: 'KOSPI',
    sector: '전기전자 · 반도체/스마트폰',
    currentPrice: 78500,
    priceChangePct: 1.29,
    currency: 'KRW',
    marketCap: 4680000,
    marketCapFormatted: '468조원',

    buffettScore: 100,
    isMasterPass: true,
    passCount: 6,
    totalRuleCount: 6,

    avgRoe5Yr: 15.8,
    avgRoic5Yr: 13.2,
    epsCagr5Yr: 14.5,
    bpsCagr5Yr: 10.2,
    debtToEquity: 25.4,
    interestCoverage: 45.0,
    shareCountCagr5Yr: -0.1,
    benchmarkBpsCagr5Yr: 6.5,

    sparkline5Yr: [55000, 81000, 60000, 78000, 71000, 78500],
    yearlyFinancials: [
      { year: 2020, roe: 9.9, roic: 8.5, eps: 3841, bps: 39406, revenue: 2368, netIncome: 264, operatingMargin: 15.2, debtToEquity: 37.0, price: 81000 },
      { year: 2021, roe: 13.9, roic: 12.0, eps: 5777, bps: 43611, revenue: 2796, netIncome: 399, operatingMargin: 18.5, debtToEquity: 30.5, price: 78300 },
      { year: 2022, roe: 17.0, roic: 14.5, eps: 8057, bps: 50816, revenue: 3022, netIncome: 556, operatingMargin: 14.3, debtToEquity: 26.4, price: 55300 },
      { year: 2023, roe: 4.1, roic: 2.8, eps: 2131, bps: 52002, revenue: 2589, netIncome: 154, operatingMargin: 2.5, debtToEquity: 25.0, price: 78500 },
      { year: 2026, roe: 15.8, roic: 13.2, eps: 5800, bps: 56500, revenue: 3050, netIncome: 380, operatingMargin: 12.8, debtToEquity: 25.4, price: 78500 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 950000,
      marketCapIncrease: 1200000,
      valueCreatedPerDollar: 1.26,
      passed: true,
      evaluationComment: '메모리 반도체 및 스마트폰 FCF 기반 사내 유보 1원당 1.26원 시장가치 창출'
    },

    economicMoatSummary: 'DRAM/NAND 메모리 반도체 글로벌 1위의 압도적 원가 경쟁력과 규모의 경제, 순현금 100조 원 이상의 철통 재무 안전성',
    moatSources: ['메모리 반도체 글로벌 1위 규모의 경제', '순현금 100조 원 이상 무차입 방어력', '스마트폰/가전 글로벌 브랜드 가치'],

    governance: {
      overallGrade: 'A',
      gradeLabel: '주주 친화 A 등급 (우수)',
      ceoSkinInTheGameSummary: '이재용 회장 등 오너 일가 및 특수관계인 지분 약 20.8% 보유',
      leadership: [
        { role: '대표이사(CEO) 부회장', name: '한종희 (Jong-Hee Han)', tenureYears: 4, bio: 'DX 부문 총괄, AI 가전 및 모바일 생태계 결합 주도', sharesOwned: 15000, sharesValueUsd: 850000 },
        { role: '대표이사(CEO) 사장', name: '전영현 (Young Hyun Jun)', tenureYears: 1, bio: 'DS(반도체) 부문장, HBM 및 첨단 패키징 초격차 회복 총괄', sharesOwned: 5000, sharesValueUsd: 280000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 3800000,
        baseSalaryPct: 35.0,
        performanceBonusPct: 45.0,
        stockBasedCompPct: 20.0,
        alignmentRating: 'GOOD',
        summaryComment: '경영 성과 기반 인센티브 및 배당 환원 정책 강화.'
      },
      capitalAllocation: {
        shareBuybacksPct: 15.0,
        dividendsPct: 65.0,
        reinvestmentPct: 20.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 80.0
      },
      boardIndependencePct: 66.7
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '15.8%', targetValue: '>= 15.0%', unit: '%', comment: '반도체 사이클 감안 시 평균 15.8% 달성' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '13.2%', targetValue: '>= 10.0%', unit: '%', comment: '투입 자본 대비 우수한 이익 창출' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '14.5%', targetValue: '>= 10.0%', unit: '%', comment: '안정적 주당순이익 복리 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$1.26', targetValue: '>= $1.00', unit: '$', comment: '유보이익 대비 주주 시장가치 증대 통과' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '25.4%', targetValue: '<= 80.0%', unit: '%', comment: '순현금 100조 원 이상 초건전 재무' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '-0.1%', targetValue: '<= 0.0%', unit: '%', comment: '지분 희석 없음' }
    ]
  },
  {
    id: '003230',
    ticker: '003230',
    nameKo: '삼양식품',
    nameEn: 'Samyang Foods',
    market: 'KOSPI',
    sector: '음식료 · K-푸드/라면',
    currentPrice: 580000,
    priceChangePct: 3.20,
    currency: 'KRW',
    marketCap: 43700,
    marketCapFormatted: '4.37조원',

    buffettScore: 100,
    isMasterPass: true,
    passCount: 6,
    totalRuleCount: 6,

    avgRoe5Yr: 29.5,
    avgRoic5Yr: 24.2,
    epsCagr5Yr: 42.0,
    bpsCagr5Yr: 28.5,
    debtToEquity: 55.0,
    interestCoverage: 28.0,
    shareCountCagr5Yr: 0.0,
    benchmarkBpsCagr5Yr: 6.5,

    sparkline5Yr: [95000, 110000, 125000, 210000, 480000, 580000],
    yearlyFinancials: [
      { year: 2020, roe: 18.2, roic: 15.0, eps: 9028, bps: 45000, revenue: 6485, netIncome: 680, operatingMargin: 14.7, debtToEquity: 62.0, price: 98000 },
      { year: 2021, roe: 13.5, roic: 11.2, eps: 7502, bps: 51000, revenue: 6420, netIncome: 560, operatingMargin: 10.2, debtToEquity: 60.0, price: 94000 },
      { year: 2022, roe: 19.8, roic: 16.5, eps: 10680, bps: 60000, revenue: 9090, netIncome: 803, operatingMargin: 9.9, debtToEquity: 58.0, price: 124000 },
      { year: 2023, roe: 28.0, roic: 22.0, eps: 17200, bps: 75000, revenue: 11929, netIncome: 1300, operatingMargin: 12.4, debtToEquity: 56.0, price: 215000 },
      { year: 2026, roe: 29.5, roic: 24.2, eps: 35000, bps: 108000, revenue: 16000, netIncome: 2600, operatingMargin: 20.0, debtToEquity: 55.0, price: 580000 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 4500,
      marketCapIncrease: 38000,
      valueCreatedPerDollar: 8.44,
      passed: true,
      evaluationComment: '불닭볶음면 글로벌 메가 히트로 유보 1원당 8.44원 주주가치 폭발적 창출'
    },

    economicMoatSummary: '불닭볶음면 브랜드의 강력한 글로벌 팬덤 및 매운맛 K-Food 카테고리 킬러 독점력과 수출 비중 75%의 고마진 구조',
    moatSources: ['글로벌 매운 라면 독점적 브랜드 자산', '해외 수출 비중 75%+ 고수익성', '압도적인 해외 유통망 침투율'],

    governance: {
      overallGrade: 'A+',
      gradeLabel: '주주 친화 A+ 등급 (우수)',
      ceoSkinInTheGameSummary: '김정수 부회장 등 오너가 책임경영 및 글로벌 확장 주도',
      leadership: [
        { role: '대표이사(CEO) 부회장', name: '김정수 (Jeong-Soo Kim)', tenureYears: 6, bio: '불닭볶음면 기획 및 글로벌 신화 주역, 북미/동남아/유럽 수출 대폭 확장', sharesOwned: 320000, sharesValueUsd: 135000000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 2200000,
        baseSalaryPct: 30.0,
        performanceBonusPct: 70.0,
        stockBasedCompPct: 0.0,
        alignmentRating: 'EXCELLENT',
        summaryComment: '해외 수출 실적 및 영업이익 급증과 직접 연동된 성과급 체계.'
      },
      capitalAllocation: {
        shareBuybacksPct: 20.0,
        dividendsPct: 35.0,
        reinvestmentPct: 45.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 55.0
      },
      boardIndependencePct: 75.0
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '29.5%', targetValue: '>= 15.0%', unit: '%', comment: '5년 평균 29.5% 초고수익성 기록' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '24.2%', targetValue: '>= 10.0%', unit: '%', comment: '밀양 신공장 증설 후 자본 효율성 극대화' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '42.0%', targetValue: '>= 10.0%', unit: '%', comment: '연평균 42% 폭발적인 EPS 복리 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$8.44', targetValue: '>= $1.00', unit: '$', comment: '유보 1원당 8.44원 시장가치 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '55.0%', targetValue: '<= 80.0%', unit: '%', comment: '건전한 부채 비율 유지' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '0.0%', targetValue: '<= 0.0%', unit: '%', comment: '주식 희석 없음' }
    ]
  },
  {
    id: '058470',
    ticker: '058470',
    nameKo: '리노공업',
    nameEn: 'Leeno Industrial',
    market: 'KOSDAQ',
    sector: '반도체 · 테스트 소켓/핀',
    currentPrice: 198000,
    priceChangePct: 0.51,
    currency: 'KRW',
    marketCap: 30180,
    marketCapFormatted: '3.01조원',

    buffettScore: 100,
    isMasterPass: true,
    passCount: 6,
    totalRuleCount: 6,

    avgRoe5Yr: 26.8,
    avgRoic5Yr: 28.0,
    epsCagr5Yr: 18.5,
    bpsCagr5Yr: 17.2,
    debtToEquity: 8.5,
    interestCoverage: 120.0,
    shareCountCagr5Yr: 0.0,
    benchmarkBpsCagr5Yr: 6.5,

    sparkline5Yr: [85000, 140000, 120000, 160000, 210000, 198000],
    yearlyFinancials: [
      { year: 2020, roe: 24.2, roic: 25.0, eps: 4680, bps: 22000, revenue: 2013, netIncome: 712, operatingMargin: 38.7, debtToEquity: 10.0, price: 133000 },
      { year: 2021, roe: 28.5, roic: 30.2, eps: 6720, bps: 26500, revenue: 2802, netIncome: 1025, operatingMargin: 41.8, debtToEquity: 9.2, price: 189000 },
      { year: 2022, roe: 27.8, roic: 29.5, eps: 7550, bps: 32000, revenue: 3221, netIncome: 1150, operatingMargin: 42.4, debtToEquity: 8.8, price: 156000 },
      { year: 2023, roe: 24.0, roic: 25.1, eps: 6800, bps: 36000, revenue: 2556, netIncome: 1030, operatingMargin: 44.7, debtToEquity: 8.5, price: 215000 },
      { year: 2026, roe: 26.8, roic: 28.0, eps: 8900, bps: 42000, revenue: 3100, netIncome: 1350, operatingMargin: 43.5, debtToEquity: 8.5, price: 198000 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 3200,
      marketCapIncrease: 16000,
      valueCreatedPerDollar: 5.00,
      passed: true,
      evaluationComment: '영업이익률 40% 이상 유지하며 사내 유보 1원당 5.00원 주주가치 창출'
    },

    economicMoatSummary: '글로벌 빅테크(퀄컴, 애플 등) R&D 미세 테스트 핀/소켓 시장의 절대적 독점 점유율과 40%가 넘는 독보적 영업이익률',
    moatSources: ['반도체 R&D 소켓 글로벌 시장 독점력', '초정밀 가공 기술 기반 높은 진입장벽', '부채비율 8%대의 실질 무차입 철통 재무'],

    governance: {
      overallGrade: 'A+',
      gradeLabel: '주주 친화 A+ 등급 (우수)',
      ceoSkinInTheGameSummary: '창업자 이채윤 회장 지분 약 34.6% 보유',
      leadership: [
        { role: '대표이사(CEO) 회장', name: '이채윤 (Chae-Yoon Lee)', tenureYears: 36, bio: '리노공업 창업주, 미세 핀 가공 기술 국산화 및 글로벌 독점 기업으로 육성', sharesOwned: 5270000, sharesValueUsd: 760000000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 1800000,
        baseSalaryPct: 40.0,
        performanceBonusPct: 60.0,
        stockBasedCompPct: 0.0,
        alignmentRating: 'EXCELLENT',
        summaryComment: '오너 경영인으로서 높은 지분율과 배당을 통한 주주 가치 일치.'
      },
      capitalAllocation: {
        shareBuybacksPct: 10.0,
        dividendsPct: 50.0,
        reinvestmentPct: 40.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 60.0
      },
      boardIndependencePct: 66.7
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '26.8%', targetValue: '>= 15.0%', unit: '%', comment: '5년 연속 24%+ 초고수익성 유지' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '28.0%', targetValue: '>= 10.0%', unit: '%', comment: '글로벌 톱티어 수준의 투하자본수익률' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '18.5%', targetValue: '>= 10.0%', unit: '%', comment: '연평균 18.5% 견고한 EPS 복리 성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$5.00', targetValue: '>= $1.00', unit: '$', comment: '유보 1원당 5.00원 가치 창출' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '8.5%', targetValue: '<= 80.0%', unit: '%', comment: '부채비율 8.5% 완벽한 무차입 경영' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: true, actualValue: '0.0%', targetValue: '<= 0.0%', unit: '%', comment: '주식 희석 없음' }
    ]
  },
  {
    id: '000660',
    ticker: '000660',
    nameKo: 'SK하이닉스',
    nameEn: 'SK Hynix',
    market: 'KOSPI',
    sector: '전기전자 · HBM 반도체',
    currentPrice: 195000,
    priceChangePct: 2.63,
    currency: 'KRW',
    marketCap: 1420000,
    marketCapFormatted: '142조원',

    buffettScore: 83,
    isMasterPass: false,
    passCount: 5,
    totalRuleCount: 6,

    avgRoe5Yr: 22.4,
    avgRoic5Yr: 16.8,
    epsCagr5Yr: 28.5,
    bpsCagr5Yr: 16.2,
    debtToEquity: 48.0,
    interestCoverage: 18.0,
    shareCountCagr5Yr: 0.1,
    benchmarkBpsCagr5Yr: 6.5,

    sparkline5Yr: [85000, 130000, 80000, 140000, 180000, 195000],
    yearlyFinancials: [
      { year: 2020, roe: 9.5, roic: 8.0, eps: 6512, bps: 72000, revenue: 3190, netIncome: 475, operatingMargin: 15.7, debtToEquity: 43.0, price: 118500 },
      { year: 2021, roe: 16.8, roic: 14.5, eps: 13200, bps: 85000, revenue: 4299, netIncome: 961, operatingMargin: 28.8, debtToEquity: 40.0, price: 131000 },
      { year: 2022, roe: 3.5, roic: 3.0, eps: 3100, bps: 87000, revenue: 4464, netIncome: 224, operatingMargin: 15.2, debtToEquity: 52.0, price: 75000 },
      { year: 2023, roe: -16.0, roic: -12.0, eps: -12500, bps: 74000, revenue: 3276, netIncome: -913, operatingMargin: -23.6, debtToEquity: 62.0, price: 141500 },
      { year: 2026, roe: 22.4, roic: 16.8, eps: 24000, bps: 98000, revenue: 6600, netIncome: 1800, operatingMargin: 35.0, debtToEquity: 48.0, price: 195000 },
    ],

    oneDollarTest: {
      evaluationPeriodYears: 5,
      accumulatedRetainedEarnings: 320000,
      marketCapIncrease: 680000,
      valueCreatedPerDollar: 2.12,
      passed: true,
      evaluationComment: 'HBM 시장 1위 선점으로 사내 유보 1원당 2.12원 주주가치 창출'
    },

    economicMoatSummary: '엔비디아(NVIDIA)향 고대역폭 메모리(HBM3E) 독점적 공급 리더십과 MR-MUF 첨단 패키징 독점 기술 해자',
    moatSources: ['HBM AI 가속기 메모리 시장 독점력', 'MR-MUF 공정 기술 경쟁력', '글로벌 2위 메모리 규모의 경제'],

    governance: {
      overallGrade: 'A',
      gradeLabel: '주주 친화 A 등급 (우수)',
      ceoSkinInTheGameSummary: '곽노정 사장 엔지니어 출신 CEO 기술 리더십',
      leadership: [
        { role: '대표이사(CEO) 사장', name: '곽노정 (Noh-Jung Kwak)', tenureYears: 3, bio: 'HBM 개발 총괄 및 엔비디아 파트너십 완성, 메모리 턴어라운드 주역', sharesOwned: 8000, sharesValueUsd: 1100000 }
      ],
      compensation: {
        year: 2026,
        totalCompUsd: 2500000,
        baseSalaryPct: 35.0,
        performanceBonusPct: 65.0,
        stockBasedCompPct: 0.0,
        alignmentRating: 'GOOD',
        summaryComment: 'HBM 이익 급증에 연동된 성과급 체계.'
      },
      capitalAllocation: {
        shareBuybacksPct: 10.0,
        dividendsPct: 40.0,
        reinvestmentPct: 50.0,
        maAcquisitionPct: 0.0,
        totalShareholderReturnPct: 50.0
      },
      boardIndependencePct: 75.0
    },

    ruleEvaluations: [
      { ruleId: 'roe_5yr', ruleName: '5개년 평균 ROE', passed: true, actualValue: '22.4%', targetValue: '>= 15.0%', unit: '%', comment: 'HBM 턴어라운드로 고ROE 달성' },
      { ruleId: 'roic_5yr', ruleName: '5개년 평균 ROIC', passed: true, actualValue: '16.8%', targetValue: '>= 10.0%', unit: '%', comment: '높은 HBM 마진율로 ROIC 회복' },
      { ruleId: 'eps_cagr_5yr', ruleName: '5개년 EPS 복리성장률', passed: true, actualValue: '28.5%', targetValue: '>= 10.0%', unit: '%', comment: 'AI 수요 폭증으로 고성장' },
      { ruleId: 'one_dollar_test', ruleName: '1달러 유보이익 테스트', passed: true, actualValue: '$2.12', targetValue: '>= $1.00', unit: '$', comment: '유보이익 대비 주주가치 증가' },
      { ruleId: 'debt_to_equity', ruleName: '부채비율 상한', passed: true, actualValue: '48.0%', targetValue: '<= 80.0%', unit: '%', comment: '재무구조 안정' },
      { ruleId: 'share_dilution', ruleName: '주식 희석 방지', passed: false, actualValue: '+0.1%', targetValue: '<= 0.0%', unit: '%', comment: '주식수 소폭 증가' }
    ]
  }
];
