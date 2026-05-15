# 프롬프트 03 — Portfolio 화면 구현
> 목적: 자산 현황 및 보유종목 관리 화면 구현
> 사용 AI: Claude / Cursor
> 선행 조건: 01_layout.md, 02_dashboard.md 완료 후 실행

---

## 프롬프트

```
내주가 앱의 Portfolio 화면을 구현해줘.
01_layout.md로 만든 레이아웃 안에 들어갈 Portfolio.jsx 내용이야.

## 화면 구성

### 1. 상단 요약 카드 (3개 가로 배치)
- 총 자산: 금액 표시
- 평가손익: 금액 + % (상승/하락 컬러)
- 오늘 수익: 금액 + % (상승/하락 컬러)

### 2. 자산 배분 섹션
좌측:
- 현재 자산 배분 도넛차트 (Recharts)
- 항목: 현금 / 예금 / 주식 / 금 / 달러 / 보험 / 부동산

우측:
- 항목별 현재비중 vs 목표비중 비교 바
- 예: 주식 현재 45% / 목표 40% → 5% 초과
- 초과: 빨강, 부족: 파랑, 적정: 초록

### 3. 보유종목 테이블
상단 탭: 자산현황 / 보유종목

보유종목 탭 내용:
- 상단: 국내 / 미국 전환 탭
- 테이블 컬럼:
  순위 / 종목명 / 현재가 / 비중 / 수익률 / 보유수량 / 평가금액 / 매입금액

- 수익률: 상승 초록 / 하락 빨강
- 하단: 종목 추가 버튼 (+)

## 조건
- Recharts 사용 (PieChart, BarChart)
- 더미 데이터 포함
- 목표비중 설정 버튼 (클릭 시 모달 - 추후 구현 placeholder)
- 반응형 테이블 (모바일 스크롤)
```

---

## 더미 데이터 예시

```javascript
// 요약
const summary = {
  totalAsset: '45,230,000',
  evalProfit: '+3,420,000',
  evalRate: '+8.2%',
  todayProfit: '+124,000',
  todayRate: '+0.27%',
}

// 자산 배분
const assetAllocation = [
  { name: '주식',   current: 45, target: 40, color: '#664efa' },
  { name: '현금',   current: 25, target: 30, color: '#22c55e' },
  { name: '달러',   current: 15, target: 15, color: '#f59e0b' },
  { name: '금',     current: 10, target: 10, color: '#f97316' },
  { name: '예금',   current: 3,  target: 5,  color: '#3b82f6' },
  { name: '보험',   current: 2,  target: 0,  color: '#8888aa' },
]

// 보유종목
const holdings = [
  { name: '삼성전자', price: '270,500', weight: '25.3%', rate: '+8.6%', qty: 10, eval: '2,705,000', buy: '2,490,000' },
  { name: 'SK하이닉스', price: '1,819,000', weight: '20.1%', rate: '+7.7%', qty: 5, eval: '9,095,000', buy: '8,440,000' },
]
```

---

## 완료 확인 체크리스트

- [ ] 요약 카드 3개 렌더링
- [ ] 자산배분 도넛차트 렌더링
- [ ] 현재/목표 비중 비교 바 렌더링
- [ ] 보유종목 테이블 렌더링
- [ ] 국내/미국 탭 전환
- [ ] 수익률 컬러 적용

---

## 다음 단계
완료 후 → 04_screener.md 실행
