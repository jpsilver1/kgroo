# 프롬프트 01 — 전체 레이아웃 뼈대 구현
> 목적: 내주가 앱의 기본 레이아웃 (사이드바 + 헤더 + 메인) 구현
> 사용 AI: Claude / Cursor
> 순서: 이 파일을 가장 먼저 실행

---

## 프롬프트

```
내주가(NAE JUGA)라는 AI 자산관리 대시보드 앱을 만들려고 해.
React + Vite + Tailwind CSS로 전체 레이아웃 뼈대를 구현해줘.

## 디자인 시스템
- 폰트: Pretendard (CDN으로 불러오기)
- 테마: 다크모드 고정
- 배경: #0f0f12
- 패널/카드: #1a1a24
- 테두리: #2a2a3a
- 포인트 컬러: #664efa
- 보조 포인트: #7468ff
- 메인 텍스트: #f0f0f0
- 보조 텍스트: #8888aa
- 상승: #22c55e
- 하락: #ef4444
- border-radius: 8px 기본

## 레이아웃 구조
- 상단 고정 헤더 (높이 48px)
  - 좌: 로고 (내주가)
  - 중: 검색창
  - 우: 로그인 버튼
- 좌측 고정 사이드바 (너비 220px)
  - 메뉴 아이콘 + 텍스트
  - 활성화 메뉴 포인트 컬러 표시
- 우측 메인 콘텐츠 영역
  - 헤더 아래, 사이드바 우측
  - 스크롤 가능

## 사이드바 메뉴 목록
1. Dashboard (홈 아이콘)
2. Portfolio (지갑 아이콘)
3. Screener (돋보기 아이콘)
4. Watchlist (별 아이콘)
5. AI 조언 (로봇 아이콘)
6. News & Reports (신문 아이콘)
7. 공시/IR (서류 아이콘)
8. 설정 (기어 아이콘) - 하단 고정

## 조건
- 컴포넌트 파일 분리: AppLayout.jsx / Sidebar.jsx / Header.jsx
- 각 메뉴 클릭 시 메인 영역 내용 전환 (React Router 사용)
- 반응형: 모바일에서 사이드바 숨김 처리
- 아이콘: lucide-react 사용
- 더미 페이지 컴포넌트 각각 생성 (내용은 페이지 이름만 표시)
```

---

## 예상 결과물 파일 구조

```
src/
├── components/
│   ├── AppLayout.jsx
│   ├── Sidebar.jsx
│   └── Header.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Portfolio.jsx
│   ├── Screener.jsx
│   ├── Watchlist.jsx
│   ├── AIAdvice.jsx
│   ├── News.jsx
│   └── Disclosure.jsx
├── App.jsx
└── main.jsx
```

---

## 완료 확인 체크리스트

- [ ] 사이드바 렌더링 확인
- [ ] 헤더 렌더링 확인
- [ ] 메뉴 클릭 시 페이지 전환 확인
- [ ] 다크 배경 적용 확인
- [ ] 포인트 컬러 활성 메뉴 확인
- [ ] 모바일 반응형 확인

---

## 다음 단계
완료 후 → 02_dashboard.md 실행
