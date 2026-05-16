from fastapi import APIRouter, HTTPException, Query

from models.schemas import PopularStock, StockDetail, StockSearchResult
from services.finance_data import get_popular_stocks, get_stock_detail, search_stocks

router = APIRouter()


@router.get("/popular", response_model=list[PopularStock])
def popular_stocks() -> list[PopularStock]:
    return get_popular_stocks()


@router.get("/search", response_model=list[StockSearchResult])
def search(q: str = Query(default="", description="Stock name or code")) -> list[StockSearchResult]:
    return search_stocks(q)


@router.get("/{code}", response_model=StockDetail)
def detail(code: str) -> StockDetail:
    stock = get_stock_detail(code)
    if stock is None:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock
