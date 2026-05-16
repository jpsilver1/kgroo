from fastapi import APIRouter, HTTPException

from services.finance_data import get_popular_stocks, get_stock_detail, search_stocks


router = APIRouter()


@router.get("/popular")
def popular_stocks():
    return get_popular_stocks()


@router.get("/search")
def stock_search(q: str = ""):
    return search_stocks(q)


@router.get("/screener")
def stock_screener(q: str = ""):
    return search_stocks(q)


@router.get("/{code}")
def stock_detail(code: str):
    detail = get_stock_detail(code)
    if not detail:
        raise HTTPException(status_code=404, detail="Stock not found")
    return detail
