# NAE JUGA

AI asset-management dashboard built with React, Vite, and FastAPI.

## Local Development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Set frontend API URL in `.env`:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

## Vercel Frontend

Use these Vercel settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Environment variable:

```bash
VITE_API_URL=https://your-nae-juga-api.up.railway.app
```

## Railway Backend

Deploy the `backend/` directory as the Railway service root.

Required environment variables:

```bash
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
FRONTEND_ORIGINS=https://your-nae-juga.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

Railway health check:

```text
/health
```

## Deployment Checklist

- Vercel frontend loads.
- Railway `/health` returns `{"status":"ok"}`.
- Frontend `VITE_API_URL` points to Railway.
- Railway `FRONTEND_ORIGINS` includes the Vercel URL.
- AI advice works with `ANTHROPIC_API_KEY`; without it, fallback advice is returned.
