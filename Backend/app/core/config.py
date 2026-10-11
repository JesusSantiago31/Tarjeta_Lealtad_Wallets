import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise Multi-Tenant Loyalty Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # JWT Auth (Leídos dinámicamente de variables de entorno .env)
    SECRET_KEY: str = ""
    JWT_SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    
    # Supabase / DB (Leídos dinámicamente de variables de entorno .env)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None
    
    # Rate Limiting
    DEFAULT_RATE_LIMIT: str = "100/minute"
    
    # ImgBB Cloud Storage API Key (Leído dinámicamente de .env)
    IMGBB_API_KEY: Optional[str] = None
    
    # Google Wallet Base Credentials (Leídos dinámicamente de .env)
    GOOGLE_ISSUER_ID: Optional[str] = None
    GOOGLE_CLASS_ID: Optional[str] = None
    GOOGLE_CLIENT_EMAIL: Optional[str] = None
    GOOGLE_PRIVATE_KEY: Optional[str] = None
    GOOGLE_WALLET_ISSUER_ID: Optional[str] = None
    GOOGLE_WALLET_CLASS_ID: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS_JSON: Optional[str] = None
    
    # Google Wallet Pass Presentation Defaults (Leídos dinámicamente de .env)
    CAFETERIA_NAME: str = "Cafetería"
    CAFETERIA_SUBHEADER: str = "Datos de Cliente"
    CAFETERIA_BG_COLOR: str = "#a4c0a2"
    CAFETERIA_LOGO_URL: Optional[str] = None
    CAFETERIA_HERO_IMAGE_URL: Optional[str] = None
    CAFETERIA_LATITUDE: float = 19.432608
    CAFETERIA_LONGITUDE: float = -99.133209
    
    # CORS Allow Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app"
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
