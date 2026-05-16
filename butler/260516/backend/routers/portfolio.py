from fastapi import APIRouter

from models.schemas import PortfolioRequest


router = APIRouter()

PORTFOLIOS = {
    "demo": {
        "user_id": "demo",
        "totalValue": 128400000,
        "dailyChange": 1.8,
        "holdings": [
            {"code": "005930", "name": "삼성전자", "quantity": 120, "averagePrice": 61000},
            {"code": "000660", "name": "SK하이닉스", "quantity": 35, "averagePrice": 172000},
        ],
    }
}


@router.get("")
def get_portfolio():
    return PORTFOLIOS["demo"]


@router.get("/{user_id}")
def get_user_portfolio(user_id: str):
    return PORTFOLIOS.get(user_id, {"user_id": user_id, "totalValue": 0, "dailyChange": 0, "holdings": []})


@router.post("")
def save_portfolio(payload: PortfolioRequest):
    total_value = sum(holding.quantity * holding.averagePrice for holding in payload.holdings)
    PORTFOLIOS[payload.user_id] = {
        "user_id": payload.user_id,
        "totalValue": total_value,
        "dailyChange": 0,
        "holdings": [holding.dict() for holding in payload.holdings],
    }
    return PORTFOLIOS[payload.user_id]
