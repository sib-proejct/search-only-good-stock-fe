# Security & Anti-Hacking Guidelines

본 문서는 백엔드(FastAPI) 및 프론트엔드(Next.js) 개발 시 준수해야 하는 보안 및 해킹 방지 세부 지침입니다.

---

## 1. 인증 및 인가 (Authentication & Authorization)

- **비밀번호 안전 관리**:
  - 비밀번호를 절대 평문으로 저장하지 않으며, 검증된 단방향 해싱 알고리즘(`Argon2id`, `bcrypt`)을 사용합니다.
- **토큰 보안 (JWT & Session)**:
  - 인증 토큰은 브라우저 `localStorage` 저장을 지양하고, XSS 공격 방지를 위해 `HttpOnly`, `Secure`, `SameSite=Lax/Strict` 속성이 부여된 쿠키에 보관합니다.
- **인가(Authorization) 백엔드 재검증**:
  - 클라이언트 사이드 UI 조건부 렌더링에만 의존하지 않고, 모든 API 엔드포인트에서 백엔드 RBAC/ABAC 권한 검증을 필수로 수행합니다.

---

## 2. 입력값 검증 및 인젝션 방어 (Input Validation & Injection Prevention)

- **SQL Injection 방어**:
  - SQLAlchemy, SQLModel 등의 ORM 파라미터 바인딩을 기본으로 사용합니다.
  - 문자열 포맷팅(`f-string`, 문자열 결합)을 사용한 원시 SQL(Raw Query) 작성을 엄격히 금지합니다.
- **XSS (크로스 사이트 스크립팅) 방어**:
  - React/Next.js의 기본 이스케이프 메커니즘을 신뢰하며, `dangerouslySetInnerHTML`의 무분별한 사용을 금지합니다.
  - 부득이하게 HTML을 렌더링할 경우 `DOMPurify` 등을 통해 반드시 새니타이징(Sanitizing)합니다.
- **요청 데이터 검증**:
  - FastAPI의 Pydantic 스키마를 통해 모든 인바운드 페이로드의 타입, 길이, 정규식, 허용 범위를 엄격히 검증합니다.

---

## 3. API 및 네트워크 보안 (API & Network Security)

- **CORS (Cross-Origin Resource Sharing) 설정**:
  - 프로덕션 환경에서는 와일드카드(`*`) 허용을 엄격히 금지하고, 실제 허용된 프론트엔드 도메인만 화이트리스트로 지정합니다.
- **Rate Limiting & 무차별 대입(Brute-force) 방지**:
  - 로그인, 인증번호 전송, 검색 등 자원 소모가 크거나 무차별 대입 공격에 취약한 엔드포인트는 IP/계정 기반 호출 제한을 적용합니다.
- **보안 응답 헤더 구성**:
  - `HSTS (Strict-Transport-Security)`
  - `Content-Security-Policy (CSP)`
  - `X-Frame-Options: DENY` (Clickjacking 방지)
  - `X-Content-Type-Options: nosniff` (MIME 스니핑 방지)

---

## 4. 환경변수 및 민감 정보 관리 (Secret Management)

- **시크릿 하드코딩 금지**:
  - DB 비밀번호, API Secret Key, JWT Secret 등은 소스코드에 커밋하지 않고 `.env` 파일로 관리하며 `.gitignore`에 등록합니다.
- **Next.js 환경변수 노출 주의**:
  - `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 브라우저 번들에 포함되어 누구나 확인할 수 있으므로 민감한 시크릿 키에는 절대 사용하지 않습니다.

---

## 5. 에러 핸들링 및 로깅 보안 (Error Handling & Logging)

- **내부 스택 트레이스 은닉**:
  - 프로덕션 환경에서는 내부 DB 스키마, 시스템 절대 경로, 스택 트레이스가 클라이언트 API 응답에 노출되지 않도록 전역 예외 처리기(Global Exception Handler)를 구현합니다.
- **민감 데이터 로깅 마스킹**:
  - 로그 파일 및 APM(Sentry 등)에 사용자 비밀번호, 개인식별정보(PII), 인증 토큰, 신용카드 번호 등이 기록되지 않도록 마스킹 처리합니다.

---

## 6. 의존성 및 패키지 보안 (Dependency Security)

- **정기 취약점 점검**:
  - Backend: `uv run pip-audit` 또는 보안 스캐너 실행
  - Frontend: `npm audit` 실행
- **락 파일 무결성 유지**:
  - `uv.lock` 및 `package-lock.json`을 형상 관리에 필수로 포함하여 의도치 않은 패키지 변조 및 공급망 공격을 방지합니다.
