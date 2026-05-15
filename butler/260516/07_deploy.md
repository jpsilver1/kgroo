# 프롬프트 07 — 배포 설정
> 목적: Vercel(프론트) + Railway(백엔드) 배포
> 사용 AI: Claude / Cursor
> 선행 조건: 모든 기능 구현 완료 후 실행

---

## 프롬프트

```
내주가 앱 배포 설정을 도와줘.

## 프론트엔드 — Vercel 배포

### 설정 파일 생성
- vercel.json 생성
- 환경변수 설정 방법 알려줘
  - VITE_API_URL: 백엔드 Railway URL

### 빌드 설정
- build command: npm run build
- output directory: dist
- install command: npm install

## 백엔드 — Railway 배포

### 설정 파일 생성
- Procfile 생성
  web: uvicorn main:app --host 0.0.0.0 --port $PORT
- railway.json 생성
- 환경변수 목록
  - ANTHROPIC_API_KEY
  - SUPABASE_URL
  - SUPABASE_KEY

### CORS 수정
- 배포된 Vercel URL을 CORS 허용 목록에 추가

## 조건
- GitHub Actions 자동 배포 설정 (선택)
- README.md에 배포 방법 문서화
- 로컬 개발 환경 vs 프로덕션 환경 분리
```

---

## 배포 후 확인 체크리스트

- [ ] Vercel 프론트 접속 확인
- [ ] Railway 백엔드 헬스체크 (/health)
- [ ] 프론트 → 백엔드 API 호출 확인
- [ ] CORS 에러 없음 확인
- [ ] 환경변수 정상 로드 확인

---

## 전체 완료

모든 프롬프트 실행 완료 시:
- [ ] 01_layout.md ✅
- [ ] 02_dashboard.md ✅
- [ ] 03_portfolio.md ✅
- [ ] 04_screener.md ✅
- [ ] 05_backend.md ✅
- [ ] 06_ai.md ✅
- [ ] 07_deploy.md ✅
