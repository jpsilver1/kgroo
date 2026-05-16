import os


def has_kis_credentials():
    return bool(os.getenv("KIS_APP_KEY") and os.getenv("KIS_APP_SECRET"))


def get_realtime_quote(symbol: str):
    if not has_kis_credentials():
        return None
    return {"symbol": symbol, "message": "KIS API credentials are configured."}
