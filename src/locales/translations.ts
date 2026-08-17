export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    // Brand & Navigation
    brandTitle: 'Search Only Good Stock',
    screener: '스크리너',
    analysis: '종목 분석',
    guide: '투자 원칙 가이드',
    searchPlaceholder: '종목명, 티커 검색...',
    searchTickerPlaceholder: '검색...',
    masterPass: '6/6 마스터 통과',
    marketCapLabel: '시가총액',

    // Screener Page
    currentMarketScan: '실시간 시장 스캔',
    stocksPassed: '종목 통과',
    buffettPassApplied: '워런 버핏 기준 적용 중',
    sp500: 'S&P 500',
    tenYearYield: '10년물 국채금리',

    // Presets
    buffettPerfection: '버핏 마스터',
    zeroDebt: '무차입 철통 재무',
    garpStrategy: '피터 린치 성장주',
    dividendChampions: '주주환원 챔피언',

    // Table
    rank: '순위',
    company: '기업명',
    price: '현재가',
    score: '버핏 진단',
    fiveYrRoe: '5년 ROE',
    epsCagr: 'EPS 복리성장',
    showingTop: '총 {total}개 통과 종목 중 상위 {count}개 표시',
    viewAll: '전체 보기',
    showTop6: '상위 6개만 보기',
    pass: '통과',
    watch: '관찰',
    fail: '탈락',

    // Analysis Page
    buffett6RuleDiagnosis: '워런 버핏 6대 원칙 정밀 진단',
    updatedToday: '오늘 기준 갱신',
    consistentEarnings: '지속적 이익 성장',
    tenYrEpsGrowth: '10년 EPS 복리 성장',
    highRoe: '초과 자본수익률',
    avgRoeGt20: '5년 평균 ROE > 20%',
    highRoic: '투하자본 수익성',
    roicGt15Historic: '5년 평균 ROIC > 15%',
    lowDebt: '무차입 재무 안전성',
    netCashPositive: '순현금 자산 우량',
    marginExpansion: '수익성 확장력',
    grossMarginsUp: '매출총이익률 우상향',
    oneDollarTest: '1달러 유보이익 테스트',
    valueCreated: '주주가치 창출 통과',

    dcfIntrinsicValue: 'DCF 현금흐름 내재가치',
    fairValueEstimate: '추정 적정 주가',
    upside: '상승 여력',
    downside: '하락 위험',
    expectedGrowth: '5개년 예상 성장률',
    discountRateWacc: '할인율 (WACC)',

    oneDollarTestTitle: '1달러 유보이익 주주가치 창출 테스트',
    oneDollarSub: '10개년 동안 사내 유보 1달러당 창출된 주주 시장가치',
    retained: '유보이익',
    created: '창출가치',
    marketValue: '시장가치 창출',

    capitalAllocationTitle: '자본배치 현황 (팀 쿡 재임기)',
    buybacks: '자사주 소각',
    sharesRetiredSub: '2012년 주주환원 프로그램 개시 이후 소각된 주식 총액',
    shareRepurchases: '자사주 매입 및 소각',
    dividendsPaid: '현금 배당 지급',

    // Guide Page
    guideTitle: '워런 버핏 6대 가치투자 원칙 & 산출 공식',
    guideSubtitle: 'Search Only Good Stock 스크리너에 적용된 버크셔 해서웨이 소유주 관련 사업 원칙',
    objective: '목적',
    passCriteria: '합격 기준',
    formula: '산출 공식',
    disqualification: '탈락 / 제외 기준',

    // Footer
    footerCopyright: '© 2024 Search Only Good Stock.',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    disclosure: '공시 정보',
    contact: '문의하기',
  },
  en: {
    // Brand & Navigation
    brandTitle: 'Search Only Good Stock',
    screener: 'Screener',
    analysis: 'Analysis',
    guide: 'Guide',
    searchPlaceholder: 'Search ticker, company...',
    searchTickerPlaceholder: 'Search...',
    masterPass: '6/6 Master Pass',
    marketCapLabel: 'Market Cap',

    // Screener Page
    currentMarketScan: 'Current Market Scan',
    stocksPassed: 'Stocks Passed',
    buffettPassApplied: 'Buffett Pass Applied',
    sp500: 'S&P 500',
    tenYearYield: '10Y Yield',

    // Presets
    buffettPerfection: 'Buffett Perfection',
    zeroDebt: 'Zero-Debt',
    garpStrategy: 'GARP Strategy',
    dividendChampions: 'Dividend Champions',

    // Table
    rank: 'Rank',
    company: 'Company',
    price: 'Price',
    score: 'Score',
    fiveYrRoe: '5Y ROE',
    epsCagr: 'EPS CAGR',
    showingTop: 'Showing top {count} of {total} passed stocks',
    viewAll: 'View All',
    showTop6: 'Show Top 6',
    pass: 'Pass',
    watch: 'Watch',
    fail: 'Fail',

    // Analysis Page
    buffett6RuleDiagnosis: 'Buffett 6-Rule Diagnosis',
    updatedToday: 'Updated Today',
    consistentEarnings: 'Consistent Earnings',
    tenYrEpsGrowth: '10yr EPS Growth',
    highRoe: 'High ROE',
    avgRoeGt20: 'Avg > 20%',
    highRoic: 'High ROIC',
    roicGt15Historic: '> 15% Historic',
    lowDebt: 'Low Debt',
    netCashPositive: 'Net Cash Positive',
    marginExpansion: 'Margin Expansion',
    grossMarginsUp: 'Gross Margins ↑',
    oneDollarTest: 'One-Dollar Test',
    valueCreated: 'Value Created',

    dcfIntrinsicValue: 'DCF Intrinsic Value',
    fairValueEstimate: 'FAIR VALUE ESTIMATE',
    upside: 'Upside',
    downside: 'Downside',
    expectedGrowth: 'Expected Growth (5yr)',
    discountRateWacc: 'Discount Rate (WACC)',

    oneDollarTestTitle: '1-Dollar Retained Earnings Test',
    oneDollarSub: 'Value created per $1 retained over 10 years',
    retained: 'Retained',
    created: 'Created',
    marketValue: 'Market Value',

    capitalAllocationTitle: 'Capital Allocation (Cook Era)',
    buybacks: 'Buybacks',
    sharesRetiredSub: 'in shares retired since 2012 program inception.',
    shareRepurchases: 'Share Repurchases',
    dividendsPaid: 'Dividends Paid',

    // Guide Page
    guideTitle: 'Warren Buffett 6-Pillar Investment Doctrine',
    guideSubtitle: 'Mathematical criteria and owner principles powering the Search Only Good Stock screener.',
    objective: 'Objective',
    passCriteria: 'Pass Criteria',
    formula: 'Formula',
    disqualification: 'Exclusion Disqualification',

    // Footer
    footerCopyright: '© 2024 Search Only Good Stock.',
    privacy: 'Privacy',
    terms: 'Terms',
    disclosure: 'Disclosure',
    contact: 'Contact',
  }
};
