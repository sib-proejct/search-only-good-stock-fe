# Agent Development Guidelines

## 프로젝트 구성 및 저장소 분리 구조

본 프로젝트는 **FastAPI 백엔드(`search-only-good-stock`)**와 별도의 **프론트엔드(현재 저장소 `search-only-good-stock-fe`)**로 분리되어 개발됩니다.

- **Backend (BE - `search-only-good-stock`)**: FastAPI (Python with `uv`, Pydantic, SQLAlchemy/SQLModel 등)
- **Frontend (FE - 현재 저장소 `search-only-good-stock-fe`)**: Next.js / Vite (React, TypeScript, Tailwind CSS)

---

## 핵심 개발 지침 (Core Rules)

1. **Backend (`uv` 기반 환경 관리)**

   - 가상환경 및 의존성 관리는 임의의 `pip` 대신 반드시 `uv`(`uv sync`, `uv add`, `uv run`)를 사용합니다.
   - API 요청/응답 모델은 Pydantic을 활용하여 엄격히 타입 검증을 수행합니다.
   - `pyproject.toml`과 `uv.lock`의 동기화 상태를 엄격히 유지합니다.
2. **Frontend (Next.js / Vite & 타입 일치)**

   - API 주소는 환경변수(`NEXT_PUBLIC_API_URL` 또는 `VITE_API_URL`)로 분리 관리합니다.
   - 백엔드 DTO 모델 스펙과 TypeScript 인터페이스 타입을 일치시킵니다.
3. **보안 및 안전성 (Security & Safety)**

   - **SQL Injection 방지**: ORM 파라미터 바인딩 필수 사용 (문자열 결합 Raw SQL 금지).
   - **XSS & 인증 보안**: JWT/세션 토큰은 `HttpOnly`, `Secure` 쿠키 보관 권장, `dangerouslySetInnerHTML` 지양.
   - **시크릿 관리**: API 키, DB 패스워드 등 시크릿 하드코딩 금지 (`.env` 관리 및 `.gitignore` 확인).
   - **정보 노출 방지**: 프로덕션 API 응답에 내부 스택 트레이스 노출 금지 및 민감 데이터 로깅 마스킹.

---

## 세부 개발 가이드 (Detailed Documentation)

상세한 개발 가이드 및 실행 명령어는 아래 문서를 참고합니다:

- [백엔드 개발 가이드 (Backend Guide)](docs/dev/backend.md)
- [프론트엔드 개발 가이드 (Frontend Guide)](docs/dev/frontend.md)
- [보안 및 해킹 방지 가이드 (Security Guide)](docs/dev/security.md)
- [커밋 가이드 (Commit Guide)](docs/dev/commit_rule.md)
