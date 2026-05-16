from models.schemas import AdviceRequest


def generate_advice(payload: AdviceRequest):
    return {
        "summary": f"{payload.investorType} 성향 기준으로 분산 투자 비중을 점검하세요.",
        "actions": [
            "단일 섹터 비중이 높으면 일부 리밸런싱을 고려하세요.",
            "현금 비중을 유지해 변동성 구간의 매수 여력을 확보하세요.",
        ],
    }
