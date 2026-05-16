import os

from models.schemas import Holding, PortfolioPayload, PortfolioResponse

try:
    from supabase import create_client  # type: ignore
except Exception:  # pragma: no cover - optional dependency fallback
    create_client = None


_memory_store: dict[str, list[Holding]] = {}


def _client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key or create_client is None:
        return None
    return create_client(url, key)


def save_portfolio(payload: PortfolioPayload) -> PortfolioResponse:
    client = _client()
    if client is None:
        _memory_store[payload.user_id] = payload.holdings
        return PortfolioResponse(user_id=payload.user_id, holdings=payload.holdings)

    rows = [
        {
            "user_id": payload.user_id,
            "code": holding.code,
            "name": holding.name,
            "quantity": holding.quantity,
            "average_price": holding.average_price,
        }
        for holding in payload.holdings
    ]
    client.table("portfolio_holdings").delete().eq("user_id", payload.user_id).execute()
    if rows:
        client.table("portfolio_holdings").insert(rows).execute()
    return PortfolioResponse(user_id=payload.user_id, holdings=payload.holdings)


def get_portfolio(user_id: str) -> PortfolioResponse:
    client = _client()
    if client is None:
        return PortfolioResponse(user_id=user_id, holdings=_memory_store.get(user_id, []))

    result = client.table("portfolio_holdings").select("*").eq("user_id", user_id).execute()
    holdings = [
        Holding(
            code=row["code"],
            name=row["name"],
            quantity=row["quantity"],
            average_price=row["average_price"],
        )
        for row in result.data
    ]
    return PortfolioResponse(user_id=user_id, holdings=holdings)
