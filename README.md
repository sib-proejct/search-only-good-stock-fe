# search-only-good-stock (Frontend)

워런 버핏의 가치투자 기준을 바탕으로 좋은 주식을 발굴하고 분석하는 **React 프론트엔드(FE)** 프로젝트입니다.
국내·미국 종목을 검색하고, 투자 기준 충족 여부와 현금흐름 기반 DCF 추정가치를 비교할 수 있습니다.
투자 원칙 가이드와 내재가치 분석 게시판을 통해 평가 기준을 이해하고 투자 의견을 살펴볼 수 있습니다.
궁금한 점은 jhpark@alumni.kaist.ac.kr로 연락주시면 감사하겠습니다.

## 🖥️ 주요 화면

2026년 10월 11일 기준 한국어·라이트 모드의 실제 실행 화면입니다. 종목 가격과 평가 결과는 캡처 당시 로컬 데이터 기준입니다.

### 스크리너

종목명·티커 검색과 시장·핵심 판정·가치평가 필터로 종목을 탐색합니다. 현재가와 1~5개년 내재가치, 안전마진·신뢰도를 비교하고 데이터 기준일과 오래된 데이터(STALE) 표시를 확인합니다.

![스크리너: 국내·미국 종목 목록과 핵심 투자 기준 판정](docs/images/screener.png)

### 종목 상세 분석

종목별 핵심 판정·가치평가·기준 안전마진·신뢰도와 투자 규칙별 진단을 확인합니다. 상세 화면에서는 DCF 추정가치와 연차 재무정보도 살펴볼 수 있습니다. 아래는 엔비디아(NVDA)의 분석 요약입니다.

![종목 상세: 엔비디아의 핵심 판정, DCF 가치평가와 안전마진 요약](docs/images/stock-detail.png)

### 종목 내재가치 분석

엔비디아(NVDA)의 현재가·내재가치·안전마진과 1~5개년 재무자료에 따른 내재가치 추이를 비교합니다.

![내재가치 분석: 엔비디아의 가치평가 요약과 기간별 내재가치 추이](docs/images/valuation.png)

### 내재가치 계산기 · 원자료 관리

종목별 계산 기준일, CAPEX, 주주이익 정규화·성장률 조건을 설정하는 로컬 관리 화면입니다.

![내재가치 계산기: 종목 선택과 주요 계산 조건](docs/images/valuation-calculator.png)

### 투자 원칙 가이드

워런 버핏·피터 린치의 투자 원칙과 산출 공식을 살펴봅니다. 버핏 가이드에서는 핵심·가치평가·자본행동 검토·보조 규칙별 판정 기준을 설명합니다.

![투자 원칙 가이드: 워런 버핏의 11대 가치투자 원칙과 산출 공식](docs/images/guide.png)

### 커뮤니티 · 내재가치 분석 게시판

종목별 투자 의견과 내재가치 분석 글을 검색하고 최신순·추천순으로 탐색합니다. 현재 게시판은 앱에 내장된 예시 게시글과 브라우저 로컬 저장 기능을 사용합니다.

![커뮤니티: 종목별 내재가치 분석 게시글 목록과 검색·정렬 기능](docs/images/community.png)

---

## 📌 프로젝트 아키텍처 및 저장소 분리

본 서비스는 백엔드(BE)와 프론트엔드(FE)가 별도 저장소/폴더로 분리되어 운영됩니다.

- **Backend (BE)**: `search-only-good-stock`
  - **기술 스택**: Python, FastAPI, `uv`, Pydantic
- **Frontend (FE)**: `search-only-good-stock-fe` (현재 프로젝트)
  - **기술 스택**: React, Vite, TypeScript, Tailwind CSS

---

## 🚀 Frontend 빠른 시작

### 1. 패키지 설치
```bash
npm install
```

### 2. 백엔드 주소 설정

`.env.local`에 백엔드 API 주소를 설정합니다.

```dotenv
VITE_API_URL=http://localhost:8000
```

### 3. 로컬 개발 서버 실행

```bash
npm run dev
# 기본 주소: http://localhost:5173
```

종목 목록과 상세 분석을 보려면 데이터가 준비된 백엔드가 실행 중이어야 합니다.

### 4. 프로덕션 빌드 및 로컬 미리보기

```bash
npm run build
npm run preview
```

---

## 🔗 백엔드(BE) 연동 안내

- 백엔드(`search-only-good-stock`) 기본 주소: `http://localhost:8000`
- 환경변수: `.env.local`에 `VITE_API_URL=http://localhost:8000` 설정
- 프론트엔드-백엔드 타입 계약은 `src/types/openapi.generated.ts`를 기준으로 관리합니다.
- 백엔드 실행 방법은 [백엔드 개발 가이드](docs/dev/backend.md)를 참고하세요.

---

## 📖 개발 지침

자세한 AI/Agent 및 개발 가이드라인은 [AGENTS.md](AGENTS.md) 및 [프론트엔드 개발 가이드](docs/dev/frontend.md)를 참고하세요.

---

## ☕ Support / Donate me

이 프로젝트가 마음에 드셨거나 도움이 되셨다면, 커피 한 잔으로 프로젝트의 지속적인 개발과 운영을 응원해 주세요! 여러분의 후원은 큰 힘이 됩니다. 🙏

- **Buy Me a Coffee**: [![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-yellow.svg?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/)
- **GitHub Sponsors**: [![GitHub Sponsors](https://img.shields.io/badge/Sponsor-EA4AAA?style=flat-square&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/)
- **간편 송금 및 계좌 후원**:
  - 간편 송금 링크 또는 후원 계좌번호를 기재하여 사용하실 수 있습니다.

---

## 📄 라이선스 (License)

이 프로젝트는 [Apache License 2.0](LICENSE) 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

