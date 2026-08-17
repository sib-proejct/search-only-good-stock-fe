# search-only-good-stock (Frontend)

좋은 주식을 발굴하고 분석하기 위한 **프론트엔드(FE)** 프로젝트입니다.

---

## 📌 프로젝트 아키텍처 및 저장소 분리

본 서비스는 백엔드(BE)와 프론트엔드(FE)가 별도 저장소/폴더로 분리되어 운영됩니다.

- **Backend (BE)**: `search-only-good-stock`
  - **기술 스택**: Python, FastAPI, `uv`, Pydantic
- **Frontend (FE)**: `search-only-good-stock-fe` (현재 프로젝트)
  - **기술 스택**: Next.js / Vite, TypeScript, Tailwind CSS

---

## 🚀 Frontend 빠른 시작

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행

#### Next.js
```bash
npm run dev
# 기본 주소: http://localhost:3000
```

#### Vite
```bash
npm run dev
# 기본 주소: http://localhost:5173 또는 설정된 포트
```

### 3. 프로덕션 빌드 및 실행

#### Next.js
```bash
npm run build
npm run start
```

#### Vite
```bash
npm run build
npm run preview
```

---

## 🔗 백엔드(BE) 연동 안내

- 백엔드(`search-only-good-stock`) 기본 주소: `http://localhost:8000`
- 환경변수 설정:
  - **Next.js**: `.env.local`에 `NEXT_PUBLIC_API_URL=http://localhost:8000`
  - **Vite**: `.env` 또는 `.env.local`에 `VITE_API_URL=http://localhost:8000`

---

## 📖 개발 지침

자세한 AI/Agent 및 개발 가이드라인은 [AGENTS.md](file:///c:/repo/search-only-good-stock-fe/AGENTS.md) 및 [프론트엔드 개발 가이드](file:///c:/repo/search-only-good-stock-fe/docs/dev/frontend.md)를 참고하세요.
