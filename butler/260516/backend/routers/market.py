from fastapi import APIRouter

from services.finance_data import get_market_indices


router = APIRouter()


@router.get("/indices")
def market_indices():
    return get_market_indices()
