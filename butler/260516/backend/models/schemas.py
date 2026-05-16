from pydantic import BaseModel, Field


class MarketIndex(BaseModel):
    value: float
    change: float


class PopularStock(BaseModel):
    rank: int
    name: str
    code: str
    price: int
    change: float
    cap: str


class StockSearchResult(BaseModel):
    name: str
    code: str
    price: int
    change: float


class StockDetail(BaseModel):
    name: str
    code: str
    price: int
    change: float
    cap: str
    week_52_high: int
    week_52_low: int
    volume: int


class Holding(BaseModel):
    code: str
    name: str
    quantity: float = Field(ge=0)
    average_price: float = Field(ge=0)


class PortfolioPayload(BaseModel):
    user_id: str
    holdings: list[Holding]


class PortfolioResponse(BaseModel):
    user_id: str
    holdings: list[Holding]


class AssetAllocation(BaseModel):
    cash: int = Field(ge=0, le=100)
    stock: int = Field(ge=0, le=100)
    gold: int = Field(ge=0, le=100)
    dollar: int = Field(ge=0, le=100)
    other: int = Field(ge=0, le=100)


class AIAdviceRequest(BaseModel):
    age: int = Field(ge=0, le=120)
    job: str
    monthly_income: int = Field(ge=0)
    investment_style: str
    current_assets: AssetAllocation


class AIAdviceResponse(BaseModel):
    advice: str
    recommended_portfolio: AssetAllocation
    reason: str
