from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """
    Retorna el cliente oficial de Supabase resolviendo dinámicamente
    las variables de entorno SUPABASE_URL y SUPABASE_KEY/SUPABASE_ANON_KEY.
    """
    url = settings.SUPABASE_URL or "https://placeholder.supabase.co"
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY or settings.SUPABASE_ANON_KEY or "placeholder-anon-key"
    return create_client(url, key)

supabase_client = get_supabase_client()
