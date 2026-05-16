import json
import os

from models.schemas import AIAdviceRequest, AIAdviceResponse, AssetAllocation

try:
    from anthropic import Anthropic  # type: ignore
except Exception:  # pragma: no cover - optional dependency fallback
    Anthropic = None


SYSTEM_PROMPT = """
당신은 한국 개인투자자를 돕는 금융 자산관리 전문가입니다.
사용자의 나이, 직업, 월소득, 투자성향, 현재 자산비중을 바탕으로
현금, 주식, 금, 달러, 기타 비중을 추천하세요.
응답은 반드시 JSON만 반환하세요.
JSON schema:
{
  "advice": "짧은 조언",
  "recommended_portfolio": {
    "cash": 0,
    "stock": 0,
    "gold": 0,
    "dollar": 0,
    "other": 0
  },
  "reason": "추천 이유"
}
recommended_portfolio 합계는 반드시 100이어야 합니다.
투자 자문이 아니라 교육 목적의 참고 의견임을 부드럽게 반영하세요.
""".strip()


def _fallback_advice(payload: AIAdviceRequest) -> AIAdviceResponse:
    if payload.investment_style == "공격형":
        allocation = AssetAllocation(cash=18, stock=58, gold=8, dollar=12, other=4)
    elif payload.investment_style == "안정형":
        allocation = AssetAllocation(cash=38, stock=30, gold=12, dollar=15, other=5)
    else:
        allocation = AssetAllocation(cash=30, stock=40, gold=10, dollar=15, other=5)

    return AIAdviceResponse(
        advice="현재 주식 비중이 목표보다 높습니다. 변동성 방어를 위해 현금과 달러 비중을 보강하는 구성이 적합합니다.",
        recommended_portfolio=allocation,
        reason=f"{payload.age}세 {payload.job}, {payload.investment_style} 성향과 월소득 {payload.monthly_income:,}원을 기준으로 유동성과 성장 자산의 균형을 맞췄습니다.",
    )


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json\n", "", 1).replace("JSON\n", "", 1)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Claude response did not contain JSON")
    return json.loads(cleaned[start : end + 1])


def generate_ai_advice(payload: AIAdviceRequest) -> AIAdviceResponse:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or Anthropic is None:
        return _fallback_advice(payload)

    client = Anthropic(api_key=api_key)
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")
    user_payload = payload.model_dump()

    try:
        message = client.messages.create(
            model=model,
            max_tokens=800,
            temperature=0.2,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": json.dumps(user_payload, ensure_ascii=False),
                }
            ],
        )
        text = "".join(block.text for block in message.content if getattr(block, "type", "") == "text")
        data = _extract_json(text)
        return AIAdviceResponse(**data)
    except Exception:
        return _fallback_advice(payload)
