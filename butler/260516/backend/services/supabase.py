import os


def has_supabase_credentials():
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"))
