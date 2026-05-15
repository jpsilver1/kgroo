# S&P Screener Monitor Implementation Plan

## 1. Overview

이 프로젝트의 목표는 S&P Capital IQ Pro와 Butler의 금융 플랫폼 사용 방식을 참고해, 개인화된 금융 스크리너/모니터링 홈페이지를 구축하는 것이다.

핵심 워크플로우는 다음 순서를 따른다.

```text
스크리닝 -> 리스트 저장 -> 대시보드 위젯화 -> 알림 설정 -> Excel/API 데이터 연동 -> 반복 개선
```

현재 앱은 React/Vite 기반 MVP로 구현되어 있으며, S&P 공식 API 권한이 준비되기 전까지 mock 데이터와 Excel export adapter를 통해 UI와 워크플로우를 먼저 검증하는 구조다.

참고 자료:

- `/Users/jpsilver/Downloads/20250130 S&P_v1.2.xlsx`
- S&P Capital IQ Pro dashboard/screener 교육 메모
- Butler의 스크리너, 관심기업, 뉴스/공시 UX

## 2. Current Status

현재 상태는 “초기 MVP 구현 완료, 문서화 및 재정렬 단계”다.

구현된 주요 파일:

- `src/App.tsx`: 금융 스크리너 앱의 타입, mock 데이터, adapter, 탭 UI, 필터, watchlist, alert 로직
- `src/styles.css`: 금융 터미널형 대시보드 레이아웃과 반응형 UI 스타일

현재 구현된 기능:

- `Company Screener` 탭
- `Transaction Screener` 탭
- `Watchlists` 탭
- `Alerts` 탭
- 기업/거래 필터링
- 컬럼 표시/숨김
- 스크리너 결과를 Watchlist로 저장
- Watchlist 기반 내부 알림 규칙 생성
- 선택 기업 상세 패널
- Key Development/news 피드
- Dashboard widget 목록
- mock/S&P API/Excel export 데이터 소스 선택 UI
- `localStorage` 기반 watchlist, alert, column preference 저장

이미 수행한 검증:

- `npm run build` 통과

아직 하지 않은 일:

- `research.md` 작성
- 실제 S&P API credential/base URL 연결
- 실제 Excel export 파일 import parser 구현
- Git commit
- 브라우저 기반 UI QA
- 테스트 케이스 자동화

## 3. Product Scope

### MVP Scope

MVP는 “스크리너 중심 모니터링 홈페이지”다.

반드시 포함할 기능:

- 기업 스크리닝
- 거래/M&A 스크리닝
- 관심기업 리스트 저장
- 리스트 기반 대시보드 위젯
- 리스트/산업/지역 기반 이벤트 알림
- S&P API adapter 자리 확보
- Excel export 보조 데이터 경로 확보

후속 범위:

- 포트폴리오 손익 계산
- 실제 이메일/Slack/모바일 푸시 알림
- 사용자 계정/서버 저장
- 리포트 자동 생성
- S&P Pro Office 수식 기반 동기화

제외 범위:

- S&P/Butler 비공식 크롤링
- 인증 우회
- 허가되지 않은 데이터 재배포
- 실거래 주문 기능

## 4. Data Model

현재 MVP의 핵심 타입은 다음과 같다.

### Company

기업 스크리너의 기본 단위다.

포함 정보:

- 기업 ID
- 티커
- 회사명
- 국가
- 거래소
- 섹터
- 산업
- 상장 여부
- 현재가
- 등락률
- 시가총액
- 매출 성장률
- EBITDA 성장률
- PER
- PBR
- EV/EBITDA
- IPO 연도
- 모회사
- 투자/사업 노출 키워드

### Transaction

M&A, 투자, 자금조달 등 거래 스크리너의 기본 단위다.

포함 정보:

- 거래 ID
- 발표일
- 상태: announced, closed, cancelled
- 거래 유형: M&A, investment, debt financing
- target
- buyer
- target industry
- 거래가치
- 지역
- advisor

### KeyDevelopment

뉴스, 공시, 주요 이벤트, S&P Key Development 피드의 기본 단위다.

포함 이벤트:

- Financial Release
- M&A Announcement
- Transaction Cancelled
- Bankruptcy
- Investment
- New Product
- Major News

### Watchlist

스크리너 결과 또는 수동 선택으로 저장한 기업 리스트다.

사용처:

- 대시보드 위젯
- 알림 scope
- 반복 모니터링

### AlertRule

Watchlist, 산업, 지역 기준으로 이벤트 트리거를 감시하는 규칙이다.

포함 정보:

- 알림명
- scope
- event triggers
- cadence
- active 여부

### MarketDataClient

UI가 특정 데이터 공급자에 묶이지 않도록 하는 adapter 인터페이스다.

현재 adapter:

- `mockAdapter`: UI 검증용 샘플 데이터
- `spApiAdapter`: S&P 공식 API 연결 예정
- `excelImportAdapter`: S&P Excel export/Pro Office 보조 경로

## 5. Implementation Roadmap

### Step 1. Documentation 정리

우선 문서 흐름을 정리한다.

작성할 문서:

- `research.md`: S&P/Butler/첨부 엑셀 분석 내용
- `plan.md`: 구현 계획, 현재 상태, 다음 작업

목표:

- 구현보다 문서가 앞서도록 워크플로우 복구
- 이후 변경이 생기면 `plan.md`를 먼저 수정하고 구현

### Step 2. Code Structure 정리

현재 `src/App.tsx`에 타입, mock 데이터, adapter, UI가 모두 들어 있다.

다음 리팩터링에서 분리할 구조:

```text
src/
  App.tsx
  types.ts
  data/
    mockData.ts
  services/
    marketDataClient.ts
    mockAdapter.ts
    spApiAdapter.ts
    excelImportAdapter.ts
  components/
    Topbar.tsx
    FilterPanel.tsx
    CompanyScreener.tsx
    TransactionScreener.tsx
    Watchlists.tsx
    Alerts.tsx
    RightRail.tsx
```

목표:

- 데이터/서비스/UI 책임 분리
- 실제 S&P API 연결 시 변경 범위 축소
- 테스트 작성 가능성 확보

### Step 3. S&P API Adapter 설계

S&P 공식 API 권한이 준비되면 `spApiAdapter`를 실제 구현으로 교체한다.

필요한 환경 변수:

```text
VITE_SP_API_BASE_URL=
VITE_SP_API_KEY=
VITE_SP_API_CLIENT_ID=
```

구현 원칙:

- API 응답을 직접 UI에 넘기지 않는다.
- 모든 응답은 내부 `Company`, `Transaction`, `KeyDevelopment` 타입으로 정규화한다.
- 권한 없음, 호출 제한, 데이터 없음, 네트워크 실패 상태를 UI에 명확히 표시한다.

### Step 4. Excel Import Adapter 구현

S&P API 권한이 지연될 경우 Excel export를 임시 데이터 소스로 사용한다.

지원할 입력:

- S&P screener export
- S&P transaction export
- Pro Office table-as-function export

처리 방식:

- 사용자가 export 파일을 선택한다.
- 헤더를 읽어 내부 필드와 매핑한다.
- 매핑 실패 시 어떤 컬럼이 부족한지 표시한다.
- 정규화 후 기존 screener/watchlist/dashboard 흐름에 연결한다.

### Step 5. UI/UX 고도화

현재 MVP는 한 화면에 핵심 기능을 모은 상태다.

개선 방향:

- 금융 터미널형 고밀도 테이블 유지
- Butler처럼 검색/관심기업/뉴스 접근은 단순하게 유지
- 테이블 컬럼 리사이즈/정렬 강화
- 선택 기업 상세 패널 확장
- Dashboard widget을 실제 편집 가능한 구조로 전환
- 모바일에서는 필터/우측 패널을 접을 수 있게 변경

### Step 6. Alert 기능 고도화

현재 알림은 내부 rule 생성과 active toggle 수준이다.

다음 구현:

- 이벤트별 severity 설정
- 특정 watchlist에 rule 연결
- 특정 산업/지역 rule 연결
- 알림 이력 저장
- 브라우저 notification optional 지원
- 후속 단계에서 이메일/Slack 연동

### Step 7. Test and Commit Workflow

앞으로 변경은 다음 순서로 진행한다.

```text
research.md 수정
plan.md 수정
문서 검토 및 메모
구현 승인
Codex 구현
npm run build
브라우저 QA
문제 발견 시 plan.md 수정
재구현
Git commit
```

## 6. Test Plan

기본 검증:

```bash
npm run build
```

수동 QA 시나리오:

1. Company Screener에서 시장, 상장 여부, 섹터, 시가총액, 성장률, PER 필터를 조합한다.
2. 검색창에 기업명, 티커, 산업명을 입력해 결과가 줄어드는지 확인한다.
3. 컬럼 선택 체크박스로 테이블 표시 컬럼이 바뀌는지 확인한다.
4. 필터 결과를 Watchlist로 저장한다.
5. Watchlist 탭에서 저장된 리스트와 종목 티커가 보이는지 확인한다.
6. Alerts 탭에서 새 알림을 만들고 active/paused 토글을 확인한다.
7. Transaction Screener에서 M&A, Investment, Closed, Cancelled, 거래가치 필터를 확인한다.
8. 데이터 소스를 `Mock API`, `Excel Export`, `S&P API`로 전환해 상태 메시지가 정상 표시되는지 확인한다.
9. S&P API 미설정 상태에서 에러 메시지가 깨지지 않고 표시되는지 확인한다.
10. 데스크톱과 모바일 폭에서 레이아웃이 겹치지 않는지 확인한다.

후속 자동화 테스트 후보:

- 필터 로직 단위 테스트
- adapter 정규화 테스트
- localStorage persistence 테스트
- 빈 데이터/에러 상태 렌더링 테스트

## 7. Acceptance Criteria

현재 MVP가 충족해야 하는 기준:

- 앱 첫 화면에서 금융 모니터링 제품이라는 목적이 즉시 보여야 한다.
- Company Screener, Transaction Screener, Watchlists, Alerts 탭이 동작해야 한다.
- 스크리너 결과를 Watchlist로 저장할 수 있어야 한다.
- Watchlist와 Alert가 새로고침 후에도 유지되어야 한다.
- S&P API 미설정 상태가 명확히 표시되어야 한다.
- mock/Excel/API adapter 구조가 코드에 존재해야 한다.
- `npm run build`가 통과해야 한다.

다음 단계 완료 기준:

- `research.md`가 추가되어 참고 자료와 요구사항이 정리된다.
- 타입, mock 데이터, adapter, UI 컴포넌트가 분리된다.
- 실제 API/Excel import를 연결할 수 있는 파일 구조가 준비된다.
- 브라우저 QA 후 발견된 문제를 `plan.md`에 반영한다.

## 8. Assumptions and Constraints

가정:

- S&P 데이터는 공식 API, 승인된 Excel export, Pro Office 수식 등 허용된 방식만 사용한다.
- Butler는 UX 참고용이며 데이터 소스로 사용하지 않는다.
- 첫 버전은 스크리너 중심이다.
- 포트폴리오 손익 계산, 실시간 알림, 리포트 자동 생성은 후속 범위다.

제약:

- S&P API credential이 아직 없다.
- 실제 API schema는 권한 확보 후 확인해야 한다.
- 현재 데이터는 mock이며 투자 판단용 실제 데이터가 아니다.
- 비공식 크롤링이나 인증 우회는 구현하지 않는다.

## 9. Immediate Next Actions

다음 작업 순서:

1. `research.md` 작성
2. 현재 `plan.md` 검토 및 메모
3. `src/App.tsx` 분리 리팩터링 계획 확정
4. 구현 승인 후 코드 구조 정리
5. `npm run build`
6. 브라우저 QA
7. 문제 발견 시 `plan.md` 수정
8. 재구현
9. Git commit
