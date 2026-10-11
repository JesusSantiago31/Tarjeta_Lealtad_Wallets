import sys
import os

# Asegurar que el directorio app esté en el path para Vercel Functions
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

# Handler de Vercel Serverless
handler = app
