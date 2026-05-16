# NAE JUGA Backend

FastAPI backend for the NAE JUGA asset dashboard.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Environment

Copy `.env.example` to `.env` for local development.

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
SUPABASE_URL=
SUPABASE_KEY=
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
```

## Endpoints

- `GET /health`
- `GET /api/market/indices`
- `GET /api/stocks/popular`
- `GET /api/stocks/search?q=삼성`
- `GET /api/stocks/{code}`
- `POST /api/portfolio`
- `GET /api/portfolio/{user_id}`
- `POST /api/ai/advice`

Swagger UI is available at `http://127.0.0.1:8000/docs`.

Supabase is optional during local development. If `SUPABASE_URL` or `SUPABASE_KEY` is empty, portfolio data is stored in memory.

Claude is optional during local development. If `ANTHROPIC_API_KEY` is empty, `/api/ai/advice` returns a deterministic fallback recommendation.

## Railway

Use this directory as the Railway service root. `Procfile` and `railway.json` run:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `FRONTEND_ORIGINS` to include your deployed Vercel URL.
