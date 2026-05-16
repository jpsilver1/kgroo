from datetime import datetime, timedelta
from functools import lru_cache

try:
    import FinanceDataReader as fdr
except Exception:
    fdr = None


FALLBACK_STOCKS = [
    {"rank": 1, "name": "삼성전자", "code": "005930", "price": 63600, "change": 2.4, "cap": "380조", "sector": "반도체"},
    {"rank": 2, "name": "SK하이닉스", "code": "000660", "price": 184000, "change": 2.8, "cap": "134조", "sector": "반도체"},
    {"rank": 3, "name": "NAVER", "code": "035420", "price": 175400, "change": 0.2, "cap": "29조", "sector": "인터넷"},
    {"rank": 4, "name": "현대차", "code": "005380", "price": 235000, "change": 1.1, "cap": "49조", "sector": "자동차"},
]

SECTOR_MAP = {
    "005930": "반도체",
    "000660": "반도체",
    "005380": "자동차",
    "035420": "인터넷",
    "051910": "소재",
    "373220": "배터리",
    "207940": "바이오",
    "068270": "바이오",
    "105560": "금융",
    "055550": "금융",
}


def _cap_to_text(value):
    try:
        trillion = float(value) / 1_000_000_000_000
    except Exception:
        return "-"
    if trillion >= 1:
        return f"{trillion:.0f}조"
    return f"{trillion * 1000:.0f}억"


def _stock_row_to_api(row, rank):
    code = str(row.get("Code", "")).zfill(6)
    return {
        "rank": rank,
        "name": str(row.get("Name", "")),
        "code": code,
        "price": float(row.get("Close", 0) or 0),
        "change": float(row.get("ChagesRatio", 0) or 0),
        "cap": _cap_to_text(row.get("Marcap", 0)),
        "sector": SECTOR_MAP.get(code, str(row.get("Market", "기타"))),
    }


@lru_cache(maxsize=1)
def _krx_listing():
    if fdr is None:
        raise RuntimeError("FinanceDataReader is not installed.")
    listing = fdr.StockListing("KRX")
    listing = listing.dropna(subset=["Code", "Name", "Close"])
    listing = listing.sort_values("Marcap", ascending=False)
    return listing


def _latest_index(symbol):
    if fdr is None:
        raise RuntimeError("FinanceDataReader is not installed.")
    start = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")
    data = fdr.DataReader(symbol, start)
    if data.empty:
        raise RuntimeError(f"No index data for {symbol}")
    latest = data.iloc[-1]
    return {
        "value": round(float(latest["Close"]), 2),
        "change": round(float(latest.get("Change", 0)) * 100, 2),
    }


def get_market_indices():
    try:
        return {
            "kospi": _latest_index("KS11"),
            "kosdaq": _latest_index("KQ11"),
            "nasdaq": _latest_index("IXIC"),
            "dow": _latest_index("DJI"),
            "sp500": _latest_index("US500"),
        }
    except Exception:
        return {
            "kospi": {"value": 2734.18, "change": 0.6},
            "kosdaq": {"value": 849.82, "change": -0.2},
            "nasdaq": {"value": 18635.22, "change": 0.9},
            "dow": {"value": 39501.24, "change": -0.2},
            "sp500": {"value": 5063.46, "change": 0.6},
        }


def get_popular_stocks():
    try:
        listing = _krx_listing().head(10)
        return [_stock_row_to_api(row, index + 1) for index, (_, row) in enumerate(listing.iterrows())]
    except Exception:
        return FALLBACK_STOCKS[:10]


def search_stocks(query: str = ""):
    normalized = query.strip().lower()
    try:
        listing = _krx_listing()
        if normalized:
            matched = listing[
                listing["Name"].astype(str).str.lower().str.contains(normalized, regex=False)
                | listing["Code"].astype(str).str.lower().str.contains(normalized, regex=False)
            ]
        else:
            matched = listing.head(50)
        return [_stock_row_to_api(row, index + 1) for index, (_, row) in enumerate(matched.head(50).iterrows())]
    except Exception:
        if not normalized:
            return FALLBACK_STOCKS
        return [
            stock
            for stock in FALLBACK_STOCKS
            if normalized in stock["name"].lower() or normalized in stock["code"].lower()
        ]


def get_stock_detail(code: str):
    try:
        listing = _krx_listing()
        matched = listing[listing["Code"].astype(str).str.zfill(6) == code.zfill(6)]
        if matched.empty:
            return None
        stock = _stock_row_to_api(matched.iloc[0], 1)
        data = fdr.DataReader(code.zfill(6), (datetime.now() - timedelta(days=370)).strftime("%Y-%m-%d"))
        if data.empty:
            return {**stock, "week52High": stock["price"], "week52Low": stock["price"], "volume": 0}
        return {
            **stock,
            "week52High": float(data["High"].max()),
            "week52Low": float(data["Low"].min()),
            "volume": int(data.iloc[-1].get("Volume", 0) or 0),
        }
    except Exception:
        stock = next((item for item in FALLBACK_STOCKS if item["code"] == code), None)
        if not stock:
            return None
        return {
            **stock,
            "week52High": round(stock["price"] * 1.35, 2),
            "week52Low": round(stock["price"] * 0.72, 2),
            "volume": 1523400 + (stock["rank"] or 0) * 10000,
        }
