# Backend Development Guide (`search-only-good-stock`)

FastAPI 기반 백엔드 애플리케이션의 환경 구성, 패키지 관리, 서버 실행 및 개발 규칙입니다.

---

## 1. 가상환경 및 의존성 관리 (`uv`)

본 프로젝트는 고속 Python 패키지 관리자인 `uv`를 사용합니다. 임의의 전역 `pip` 대신 항상 `uv`를 통해 의존성을 관리합니다.

### 1) 가상환경 생성 및 동기화
```bash
# 가상환경 생성 (.venv)
uv venv

# pyproject.toml 및 uv.lock 기반 의존성 동기화
uv sync
```

### 2) 패키지 추가 및 삭제
```bash
# 기본 런타임 패키지 추가
uv add fastapi "uvicorn[standard]" pydantic sqlalchemy sqlmodel

# 개발용 도구 추가
uv add --dev pytest ruff pytest-asyncio

# 패키지 삭제
uv remove <package_name>
```

---

## 2. 서버 실행 및 테스트

가상환경 컨텍스트 내에서 실행하기 위해 항상 `uv run`을 접두어로 사용합니다.

### 1) 로컬 개발 서버 실행
```bash
# 기본 포트 8000으로 reload 모드 실행
uv run uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2) 테스트 및 린트 실행
```bash
# 전체 테스트 실행
uv run pytest

# 코드 포맷팅 및 린트 검사
uv run ruff check .
uv run ruff format .
```

---

## 3. 백엔드 개발 핵심 규칙

1. **의존성 락 무결성**: 의존성 수정 시 `pyproject.toml`과 `uv.lock` 파일이 항상 동기화되도록 유지합니다.
2. **엄격한 타입 검증**: 모든 API 요청/응답 페이로드는 Pydantic 스키마(BaseModel)를 정의하여 런타임 타입 검증을 수행합니다.
3. **CORS 미들웨어**: 프론트엔드(`search-only-good-stock-fe`)와의 통신을 위해 개발 환경 및 프로덕션 환경의 CORS Origin을 명확히 분리 설정합니다.
4. **비동기 처리**: I/O 바운드 작업(DB 쿼리, 외부 API 호출)은 `async/await` 패턴을 우선 적용합니다.
