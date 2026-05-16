from fastapi import APIRouter

from models.schemas import MarketIndex
from services.finance_data import get_market_indices

router = APIRouter()


@router.get("/indices", response_model=dict[str, MarketIndex])
def market_indices() -> dict[str, MarketIndex]:
    return get_market_indices()
