# 프롬프트 05 — 백엔드 API 구현
> 목적: FastAPI 백엔드 서버 및 주식 데이터 연동
> 사용 AI: Codex / Cursor
> 선행 조건: 프론트엔드 화면 구현 완료 후 실행

---

## 프롬프트

```
내주가(NAE JUGA) 앱의 Python FastAPI 백엔드를 만들어줘.

## 기술 스택
- Framework: FastAPI
- 주식 데이터: FinanceDataReader
- DB: Supabase (PostgreSQL)
- 환경변수: python-dotenv

## API 목록

### 1. 시장 지수
GET /api/market/indices
응답:
{
  "kospi": { "value": 7493.18, "change": 6.1 },
  "kosdaq": { "value": 1129.82, "change": 5.1 },
  "nasdaq": { "value": 26635.22, "change": 0.9 },
  "sp500": { "value": 50063.46, "change": 0.6 }
}

### 2. 인기 종목 TOP 10
GET /api/stocks/popular
응답:
[
  { "rank": 1, "name": "삼성전자", "code": "005930",
    "price": 270500, "change": 8.6, "cap": "1581조" }
]

### 3. 종목 검색
GET /api/stocks/search?q={keyword}
응답: 종목명, 코드, 현재가, 변동률

### 4. 종목 상세
GET /api/stocks/{code}
응답: 현재가, 변동률, 시총, 52주 고저, 거래량

### 5. 포트폴리오 저장
POST /api/portfolio
Body: { user_id, holdings: [...] }

### 6. 포트폴리오 조회
GET /api/portfolio/{user_id}

## 조건
- CORS 설정 (프론트 localhost:5173 허용)
- 에러 핸들링 포함
- .env 파일로 환경변수 관리
- README.md에 실행 방법 포함
- requirements.txt 포함
```

---

## 폴더 구조

```
backend/
├── main.py
├── routers/
│   ├── market.py
│   ├── stocks.py
│   └── portfolio.py
├── services/
│   ├── finance_data.py    ← FinanceDataReader 연동
│   └── supabase.py        ← DB 연결
├── models/
│   └── schemas.py         ← Pydantic 모델
├── .env
├── requirements.txt
└── README.md
```

---

## requirements.txt 예시

```
fastapi
uvicorn
FinanceDataReader
supabase
python-dotenv
pydantic
httpx
```

---

## 완료 확인 체크리스트

- [ ] FastAPI 서버 실행 확인 (uvicorn main:app)
- [ ] /api/market/indices 응답 확인
- [ ] /api/stocks/popular 응답 확인
- [ ] /api/stocks/search 응답 확인
- [ ] CORS 에러 없이 프론트 연결 확인
- [ ] Swagger UI 확인 (localhost:8000/docs)

---

## 다음 단계
완료 후 → 06_ai.md 실행
