# Butler Backend

FastAPI backend for the Butler dashboard prototype.

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Swagger UI:

```text
http://localhost:8000/docs
```

## APIs

- `GET /health`
- `GET /api/market/indices`
- `GET /api/stocks/popular`
- `GET /api/stocks/search?q=삼성`
- `GET /api/stocks/screener`
- `GET /api/stocks/{code}`
- `GET /api/portfolio`
- `GET /api/portfolio/{user_id}`
- `POST /api/portfolio`
- `POST /api/ai/advice`
