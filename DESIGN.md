# 📐 DESIGN.md — Search Only Good Stock (Modern Bento Design Edition)

> **"본질에 집중하는 정제된 미니멀리즘과 직관적인 데이터 시각화"**
>
> **"Search Only Good Stock"**은 정제된 미니멀리즘과 벤토 그리드(Bento Grid) 디자인 철학(Clarity, Deference, Depth), 그리고 워런 버핏(Warren Buffett)의 정통 가치투자 원칙을 결합한 프리미엄 핀테크 웹 애플리케이션입니다.

---

## 1. 디자인 철학: 극도의 정제미와 가치투자 명료성 (Zero AI-Slop)

1. **명료함 (Clarity)**
   - 가독성을 해치는 저급한 네온 그라디언트, 인위적인 발광 효과, 조잡한 3D 이모지를 일절 배제합니다.
   - 모든 픽셀과 여백은 사용자가 **기업의 본질적 가치(Intrinsic Value)**와 **소유주 이익(Owner Earnings)**을 가장 직관적으로 읽을 수 있도록 정교하게 설계됩니다.
2. **겸손함 (Deference)**
   - UI는 데이터를 돋보이게 하는 투명한 무대 역할을 합니다.
   - 반투명 블러 글래스 네비게이션(`backdrop-blur-xl bg-white/80`), 부드러운 24px 라운드 벤토 박스(Bento Box) 구조, 은은한 1px 보더(`border-black/[0.05]`)를 적용합니다.
3. **깊이감 (Depth)**
   - 평면적인 요소 위에 정교한 레이어링과 섬세한 그림자, 부드러운 인터랙션 마이크로 모션을 통해 손에 잡힐 듯한 깊이감을 전달합니다.
4. **숫자의 정밀성 (Tabular Monospace Precision)**
   - 모든 재무 수치, 가격, ROE/ROIC, CAGR, 1달러 테스트 수치에 `tabular-nums font-mono`를 적용하여 흔들림 없는 완벽한 열 정렬을 보장합니다.

---

## 2. 색상 팔레트 및 토큰 체계 (Design Color Tokens)

### 2.1 Background & Surface Colors (Clean Light)

| 토큰명                    | Hex Code / RGBA       | 역할 및 적용처                                      |
| :------------------------- | :---------------------- | :---------------------------------------------------- |
| `--canvas-bg`             | `#FBFBFD`             | 페이지 전체 캔버스 배경 (Signature Off-White)        |
| `--surface-bg`            | `#FFFFFF`             | 벤토 카드, 메인 테이블, 모달 컨테이너 배경          |
| `--surface-subtle`        | `#EBEBED`             | 세그먼트 컨트롤 트랙, 검색창 배경, 비활성 칩        |
| `--border-color`          | `rgba(0, 0, 0, 0.06)` | 은은한 1px 컨테이너 및 테이블 테두리                |
| `--divider-color`         | `rgba(0, 0, 0, 0.04)` | 카드 내부 구획선 및 테이블 행 구분선                |

### 2.2 Typography & Text Hierarchy

| 토큰명                    | Hex Code  | 역할 및 적용처                                         |
| :------------------------- | :---------- | :------------------------------------------------------- |
| `--text-primary`          | `#1D1D1F` | 메인 헤드라인, 핵심 수치, 종목명 (Dark Charcoal)        |
| `--text-secondary`        | `#86868B` | 서브헤더, 지표 레이블, 설명문 (Mid Gray)                |
| `--text-tertiary`         | `#A1A1A6` | 각주, 캡션, 비활성 힌트 텍스트                         |

### 2.3 Semantic Colors (Finance)

| 토큰명                | Hex Code  | 의미 및 적용처                                          |
| :--------------------- | :---------- | :-------------------------------------------------------- |
| `--accent-blue`        | `#0071E3` | 브랜드 메인 액센트, 인터랙티브 액티브 상태, 주요 버튼   |
| `--accent-blue-hover`  | `#0077ED` | 버튼 호버 및 포커스 링                                  |
| `--accent-green`       | `#34C759` | 버핏 규칙 통과(Pass), 주가 상승, ROE 초과, 자사주 소각  |
| `--accent-red`         | `#FF3B30` | 버핏 규칙 탈락(Fail), 주가 하락, 과도한 부채, 주식 희석 |
| `--accent-orange`      | `#FF9500` | 주의(Caution), 버핏 지수 고평가 경계, 임계치 인접       |
| `--accent-gold`        | `#D97706` | 버핏 마스터 패스 100점 뱃지 하이라이트                  |

---

## 3. 타이포그래피 (Typography System)

- **기본 폰트**: `Pretendard`, `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **숫자 및 재무 데이터**: `JetBrains Mono`, `tabular-nums`
- **헤딩 스케일**:
  - `Display`: 40px / 48px (Bold, Letter-spacing: -0.025em)
  - `H1`: 28px / 36px (Bold, Letter-spacing: -0.02em)
  - `H2`: 20px / 28px (SemiBold, Letter-spacing: -0.015em)
  - `H3`: 16px / 24px (SemiBold, Letter-spacing: -0.01em)
  - `Body`: 14px / 20px (Regular, Letter-spacing: -0.005em)
  - `Caption`: 12px / 16px (Medium, Letter-spacing: 0.01em)

---

## 4. UI 컴포넌트 아키텍처 (Bento Grid & Controls)

1. **Modern Navigation Bar**:
   - 높이 52px, `backdrop-blur-xl bg-white/80`, 섬세한 `border-b border-black/[0.06]`.
   - 알약형 세그먼트 네비게이션 (`rounded-full bg-[#EBEBED] p-1`).
2. **Bento Hero**:
   - 24px 라운드 벤토 박스 레이아웃.
   - 핵심 메시지: *"진짜 우량 기업을 찾는 가장 명확한 기준"*과 합격률 시각화.
3. **Segmented Filter Controls**:
   - 직관적인 필터 프리셋 칩과 부드러운 슬라이더.
4. **Bento Stock Cards & Data Table**:
   - 마이크로 스파크라인, 6대 버핏 규칙 통과 현황, 1달러 테스트 가치창출 수치를 한눈에 전달.
   - 미니멀 타이포그래피 스탯과 고대비 정보 위계 적용.
5. **Clean Minimalist Stat Badges**:
   - 불필요하게 두꺼운 외곽선 대신 정제된 텍스트와 보더리스 컬러 뱃지로 데이터 직관성 극대화.
