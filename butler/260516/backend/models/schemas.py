from typing import Optional

from pydantic import BaseModel, Field


class MarketIndex(BaseModel):
    value: float
    change: float


class StockSummary(BaseModel):
    rank: Optional[int] = None
    name: str
    code: str
    price: float
    change: float
    cap: Optional[str] = None
    sector: Optional[str] = None


class StockDetail(StockSummary):
    week52High: float
    week52Low: float
    volume: int


class Holding(BaseModel):
    code: str
    name: str
    quantity: float = Field(ge=0)
    averagePrice: float = Field(ge=0)


class PortfolioRequest(BaseModel):
    user_id: str = "demo"
    holdings: list[Holding] = []


class AdviceRequest(BaseModel):
    investorType: str = "balanced"
    totalAssets: float = 0
    stockRatio: float = 0
    cashRatio: float = 0


class AdviceResponse(BaseModel):
    summary: str
    actions: list[str]
