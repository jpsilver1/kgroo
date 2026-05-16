from fastapi import APIRouter

from models.schemas import PortfolioPayload, PortfolioResponse
from services.supabase import get_portfolio, save_portfolio

router = APIRouter()


@router.post("", response_model=PortfolioResponse)
def save(payload: PortfolioPayload) -> PortfolioResponse:
    return save_portfolio(payload)


@router.get("/{user_id}", response_model=PortfolioResponse)
def read(user_id: str) -> PortfolioResponse:
    return get_portfolio(user_id)
