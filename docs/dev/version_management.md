# BE·FE 버전 보존과 개발 흐름

## 기존 버전 기준

`archive/pre-intrinsic-value`는 내재가치 전환 이전 `develop` 소스를 보존하는 annotated tag다. 두 저장소를 아래 조합으로 복원한다.

| 저장소 | 커밋 | 잠금파일 |
| --- | --- | --- |
| BE `search-only-good-stock` | `33cc0a00e5a54a8f1045edb425282fd799fdcb38` | `uv.lock` |
| FE `search-only-good-stock-fe` | `bddea3e000625642315f8eb8e9cd821c4f8e50d4` | `package-lock.json` |

소스 보존이며 DB 데이터, 비밀값, 실행 환경 자체의 백업은 포함하지 않는다.

### 구현 규칙 후보

- 두 저장소의 같은 태그를 한 쌍으로 사용한다.
- 보존 태그를 이동하거나 덮어쓰지 않는다.

## 별도 디렉터리에서 복원

기존 작업 디렉터리를 변경하지 않도록 빈 상위 디렉터리에서 실행한다.

```bash
git clone --branch archive/pre-intrinsic-value https://github.com/sib-proejct/search-only-good-stock.git search-only-good-stock
git clone --branch archive/pre-intrinsic-value https://github.com/sib-proejct/search-only-good-stock-fe.git search-only-good-stock-fe
```

태그 체크아웃은 detached HEAD이며 고정 보관용이다. BE는 Python 3.12와 uv, FE는 Node.js와 npm을 사용한다. 각 체크아웃의 Dockerfile에서 당시 컨테이너 실행 기준도 확인할 수 있다.

BE 디렉터리에서 실행한다.

```bash
uv sync --locked
cp .env.example .env
# .env를 별도 개발 DB에 맞게 설정한다.
uv run alembic upgrade 20260920_04
uv run uvicorn app.main:app --reload --port 8000
```

FE 디렉터리에서 실행한다.

```bash
npm ci
# .env.local에 VITE_API_URL=http://localhost:8000 설정
npm run dev
```

보존 FE의 개발 포트는 5174다. 데이터가 없는 DB에서는 이전 화면의 당시 평가 결과까지 재현되지 않는다.

### 구현 규칙 후보

- 복원 시 기존 작업 디렉터리와 현재 DB를 재사용하지 않는다.
- 태그에 저장된 잠금파일을 사용하고 의존성을 임의로 갱신하지 않는다.

## 환경변수와 DB 기준

BE 실행 설정은 `SOGS_ENV`, `SOGS_DATABASE_URL`, `SOGS_CORS_ORIGINS`, `SOGS_MARKET_DATA_PUBLICATION_ENABLED`, `SOGS_ADMIN_ALLOW_PRIVATE_NETWORK`로 관리한다. CORS에는 실제 FE origin을 명시한다. 공개 LIVE 데이터와 관리자 기능은 해당 버전의 backend 개발 안내를 따른다.

실데이터 수집 시 공급자에 따라 `SOGS_SEC_USER_AGENT`, `SOGS_DART_API_KEY`, `SOGS_TWELVE_DATA_API_KEY`, `SOGS_BOK_API_KEY`가 필요하다. Toss 연동 설정 이름은 `SOGS_TOSS_CLIENT_ID`, `SOGS_TOSS_CLIENT_SECRET`이다. 비밀값은 문서·Git에 저장하지 않는다.

FE는 `VITE_API_URL`을 사용한다. Vite 개발 프록시의 대상은 `VITE_BACKEND_PROXY_URL`로 지정할 수 있다. Docker 실행 시 `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, 선택적으로 `POSTGRES_PORT`, `BACKEND_PORT`, `FRONTEND_PORT`를 설정한다.

보존 BE의 Alembic head는 `20260920_04`다. 새 버전의 기간별 평가 마이그레이션 `20261010_01`은 포함하지 않는다. 위 upgrade 명령은 별도 DB에만 적용하며 현재 DB를 downgrade하지 않는다.

### 구현 규칙 후보

- 환경변수 이름과 필요한 조건만 문서화하고 실제 키나 접속 비밀값을 기록하지 않는다.
- 기존 코드와 최신 DB의 호환성을 가정하지 않는다.

## 새 버전 개발과 PR

보존 태그를 기준으로 기존 버전을 고정한 뒤 `develop`은 내재가치 버전의 통합 브랜치로 사용한다. 작업 브랜치는 최신 `develop`에서 만들고 `develop` 대상 PR로 합친다. BE·FE PR은 서로 링크하고 함께 검토한다. 배포 준비 후 각 저장소의 `develop` → `main` PR을 별도로 만든다.

새 버전 안전마진은 기준 내재가치로 계산하지만 API 필드 이름 `conservativeMarginOfSafety`는 기존 계약을 유지한다. FE 표시와 계산 설명은 기준 시나리오를 따라야 한다.

### 구현 규칙 후보

- 태그 보존을 확인한 뒤 새 버전을 통합한다.
- 두 PR의 API 계약·동작을 함께 검증하고 병합 및 배포는 별도로 결정한다.
