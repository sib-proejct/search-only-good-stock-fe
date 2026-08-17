export type RuleCategory = 
  | 'PROFITABILITY'      // 수익성 (ROE, ROIC, 영업이익률 등)
  | 'GROWTH'             // 성장성 (EPS/BPS CAGR, 벤치마크 초과 성장 등)
  | 'SAFETY'             // 재무 안전성 (부채비율, 이자보상배율, 차입금 의존도 등)
  | 'SHAREHOLDER_VALUE'  // 주주가치 환원 (1달러 유보이익 테스트, 주식 희석 방지 등)
  | 'GOVERNANCE'         // 경영진 & 거버넌스 (보수 연동성, 내부자 지분율, 자본배치 등)
  | 'CUSTOM';            // 사용자 정의 커스텀 규칙

export type FilterControlType = 'slider' | 'toggle' | 'range' | 'select';

export interface FilterRuleDefinition {
  id: string;                      // 규칙 고유 ID (예: 'roe_5yr', 'one_dollar_test')
  category: RuleCategory;
  name: string;                    // 한글 규칙 명칭 (예: '5개년 연속 ROE')
  summary: string;                 // 핵심 요약 문구
  description: string;              // 세부 산출 공식 및 버핏 투자 철학 근거
  evaluationPeriod: string;        // 평가 대상 기간 (예: '최근 3~5개년')
  controlType: FilterControlType;  // UI 조작 컨트롤 유형
  defaultValue: number | boolean;  // 기본 설정값
  currentValue?: number | boolean; // 사용자가 변경한 현재 필터값
  min?: number;                    // 슬라이더 최소치
  max?: number;                    // 슬라이더 최대치
  step?: number;                   // 슬라이더 조절 단위
  unit?: string;                   // 단위 (예: '%', '배', '$')
  comparator: 'gte' | 'lte' | 'eq' | 'custom'; // 비교 연산자 (이상, 이하, 일치, 커스텀)
  isCoreBuffettRule: boolean;      // 워런 버핏 6대 핵심 원칙 여부
}

export interface RulePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  filterValues: Record<string, number | boolean>;
}

export interface RuleEvaluationDetail {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  actualValue: number | string | boolean;
  targetValue: number | string | boolean;
  unit?: string;
  comment: string;
}
