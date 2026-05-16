from fastapi import APIRouter

from models.schemas import AdviceRequest
from services.anthropic_ai import generate_advice


router = APIRouter()


@router.post("/advice")
def ai_advice(payload: AdviceRequest):
    return generate_advice(payload)
