# Frontend Development Guide (`search-only-good-stock-fe`)

Next.js (App Router) 및 Vite (React) 기반 프론트엔드 애플리케이션의 개발 가이드입니다. (TypeScript, Tailwind CSS)

> 💡 **백엔드 연동 명세서**: 백엔드와 연동되는 데이터 모델(DTO), API 엔드포인트 및 화면별 요구 데이터는 [프론트엔드 연동 명세서](frontend_be_integration_spec.md)를 참고하세요.

---

## 1. 패키지 설치 및 실행

Node 패키지 매니저(`npm`, `pnpm`, `yarn`)를 활용합니다.

### 1) 의존성 설치
```bash
npm install
```

### 2) 개발 서버 실행 및 빌드

#### Next.js 프로젝트
```bash
# 로컬 개발 서버 실행 (기본 포트: 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

#### Vite 프로젝트
```bash
# 로컬 개발 서버 실행 (기본 포트: 5173 또는 설정된 포트)
npm run dev

# 프로덕션 빌드 (dist/ 생성)
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

---

## 2. 프론트엔드 개발 핵심 규칙

1. **환경변수 분리**:
   - 백엔드 API 엔드포인트는 환경변수로 관리합니다.
     - **Next.js**: `.env.local`에 `NEXT_PUBLIC_API_URL=http://localhost:8000` 설정 (`process.env.NEXT_PUBLIC_API_URL`)
     - **Vite**: `.env` 또는 `.env.local`에 `VITE_API_URL=http://localhost:8000` 설정 (`import.meta.env.VITE_API_URL`)
   - 클라이언트에 노출되면 안 되는 민감한 시크릿 키는 `NEXT_PUBLIC_` 또는 `VITE_` 접두사를 붙이지 않고 서버 사이드 또는 백엔드에서만 처리합니다.

2. **DTO 모델 일치**:
   - 백엔드 FastAPI의 Pydantic 스키마와 TypeScript 인터페이스/타입 정의를 일치시킵니다.

3. **컴포넌트 및 UI 설계**:
   - 재사용 가능한 모듈식 컴포넌트 단위로 개발합니다.
   - Tailwind CSS 기반 모바일, 태블릿, 데스크톱 환경을 지원하는 반응형 웹 레이아웃을 구현합니다.
   - 에러 바운더리와 로딩 스켈레톤(Suspense)을 적절히 배치하여 사용자 경험을 극대화합니다.
