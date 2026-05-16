from fastapi import APIRouter

from models.schemas import AIAdviceRequest, AIAdviceResponse
from services.anthropic_ai import generate_ai_advice

router = APIRouter()


@router.post("/advice", response_model=AIAdviceResponse)
def advice(payload: AIAdviceRequest) -> AIAdviceResponse:
    return generate_ai_advice(payload)
