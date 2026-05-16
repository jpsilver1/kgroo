from models.schemas import MarketIndex, PopularStock, StockDetail, StockSearchResult
from typing import Optional

try:
    import FinanceDataReader as fdr  # type: ignore
except Exception:  # pragma: no cover - optional dependency fallback
    fdr = None


POPULAR_STOCKS = [
    PopularStock(rank=1, name="삼성전자", code="005930", price=74300, change=1.7, cap="443.6조"),
    PopularStock(rank=2, name="SK하이닉스", code="000660", price=181900, change=2.8, cap="132.4조"),
    PopularStock(rank=3, name="현대차", code="005380", price=247500, change=-0.6, cap="51.8조"),
    PopularStock(rank=4, name="NAVER", code="035420", price=187200, change=0.4, cap="30.1조"),
    PopularStock(rank=5, name="LG화학", code="051910", price=314500, change=-0.8, cap="22.2조"),
    PopularStock(rank=6, name="Tesla", code="TSLA", price=259, change=3.3, cap="$829.4B"),
    PopularStock(rank=7, name="Apple", code="AAPL", price=189, change=0.9, cap="$2.9T"),
    PopularStock(rank=8, name="NVIDIA", code="NVDA", price=923, change=4.2, cap="$2.3T"),
    PopularStock(rank=9, name="Microsoft", code="MSFT", price=421, change=-0.2, cap="$3.1T"),
    PopularStock(rank=10, name="JPMorgan", code="JPM", price=198, change=1.1, cap="$571.2B"),
]


def get_market_indices() -> dict[str, MarketIndex]:
    return {
        "kospi": MarketIndex(value=2734.18, change=0.61),
        "kosdaq": MarketIndex(value=849.82, change=-0.21),
        "nasdaq": MarketIndex(value=18635.22, change=0.9),
        "sp500": MarketIndex(value=5063.46, change=0.6),
    }


def get_popular_stocks() -> list[PopularStock]:
    return POPULAR_STOCKS


def search_stocks(keyword: str) -> list[StockSearchResult]:
    normalized = keyword.strip().lower()
    rows = POPULAR_STOCKS
    if normalized:
        rows = [
            stock
            for stock in POPULAR_STOCKS
            if normalized in stock.name.lower() or normalized in stock.code.lower()
        ]
    return [
        StockSearchResult(
            name=stock.name,
            code=stock.code,
            price=stock.price,
            change=stock.change,
        )
        for stock in rows
    ]


def get_stock_detail(code: str) -> Optional[StockDetail]:
    normalized = code.upper()
    stock = next((item for item in POPULAR_STOCKS if item.code.upper() == normalized), None)
    if stock is None:
        return None

    high = int(stock.price * 1.18)
    low = int(stock.price * 0.74)
    volume_seed = sum(ord(char) for char in stock.code)
    return StockDetail(
        name=stock.name,
        code=stock.code,
        price=stock.price,
        change=stock.change,
        cap=stock.cap,
        week_52_high=high,
        week_52_low=low,
        volume=1_000_000 + volume_seed * 1000,
    )
