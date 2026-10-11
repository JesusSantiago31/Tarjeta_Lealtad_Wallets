# Arquitectura Multi-Tenant Enterprise (FastAPI + React + Vercel Ready)

Sistema SaaS Multi-Empresa (Multi-Tenant) para Tarjetas de Lealtad, Puntos y Pases Digitales (Google Wallet).

---

## 🚀 Requisitos de Arquitectura Cumplidos

1. **Aislamiento Multi-Tenant & RLS (Row Level Security)**:
   - Base de datos PostgreSQL / Supabase configurada con políticas RLS obligatorias por `tenant_id`.
   - Control de Acceso basado en Roles (RBAC 4 Niveles: `super_admin`, `tenant_admin`, `cashier`, `customer`).

2. **Backend Serverless Stateless (Vercel Ready)**:
   - FastAPI estructurado con Handler Vercel Serverless en `Backend/api/index.py`.
   - Middleware de Seguridad (`SecurityHeadersMiddleware`, `TenantSecurityMiddleware`, `RateLimiterMiddleware`).
   - Configuración Pydantic Settings v2.

3. **Frontend Dinámico con CSS Variables Theme Engine**:
   - Inyección dinámica en `:root` de `--primary-color`, `--secondary-color`, `--bg-color`, `--text-color` y `logo_url`.
   - Componentes UI reutilizables de alta estética (Glassmorphic design, micro-animaciones, Tailwind-free Vanilla CSS).
   - Integración REST con Google Wallet (`GoogleWalletButton.jsx`).

---

## 📁 Estructura de Directorios

```text
/
├── vercel.json                         # Configuración Vercel raíz
├── schema.sql                          # Esquema PostgreSQL / Supabase con RLS
├── .env.example                        # Variables de entorno globales
│
├── Backend/
│   ├── api/
│   │   └── index.py                    # Vercel Serverless Function Handler
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic Settings v2
│   │   │   ├── database.py             # Cliente Supabase
│   │   │   ├── security.py             # JWT Token & Password Hasher
│   │   │   └── middleware/
│   │   │       ├── tenant_security.py  # Contexto Multi-Tenant y RBAC
│   │   │       └── rate_limiter.py     # Middleware Rate Limiter por IP y Tenant
│   │   ├── common/                     # Modelos y Excepciones genéricas
│   │   └── modules/                    # Módulos de negocio organizados por Rol
│   │       ├── auth/
│   │       ├── super_admin/
│   │       ├── admin/                  # rules/, catalog/, branding/
│   │       ├── cashier/                # scanner/, accumulation/
│   │       └── customer/               # wallet/, portal/, history/
│   ├── main.py                         # App principal FastAPI
│   ├── requirements.txt
│   └── vercel.json
│
└── Frontend/
    ├── src/
    │   ├── core/
    │   │   ├── api/                    # Client Axios con interceptores JWT y Tenant
    │   │   ├── auth/                   # Contexto AuthProvider y hook useAuth
    │   │   ├── theme/                  # ThemeProvider e Inyección de Variables CSS
    │   │   └── router/                 # Guardias de Rutas por Rol (ProtectedRoute)
    │   ├── modules/                    # Vistas y componentes por Rol (auth, admin, cashier, customer)
    │   └── shared/                     # UI Kit (Modal, Button, Card, Navbar, Input, Badge)
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

---

## 💻 Instrucciones para Ejecución Local

### Backend (FastAPI):
```bash
cd Backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite):
```bash
cd Frontend
npm install
npm run dev
```

---

## ⚡ Despliegue en Vercel

1. Sube el repositorio a GitHub/GitLab.
2. Crea un nuevo proyecto en **Vercel Dashboard**.
3. Selecciona la raíz del proyecto. Vercel detectará la configuración unificada definida en [vercel.json](file:///c:/Users/THINKPAD/Documents/1_ISIC/Tarjeta_Lealtad_Wallets/vercel.json).
4. Configura las variables de entorno especificadas en [.env.example](file:///c:/Users/THINKPAD/Documents/1_ISIC/Tarjeta_Lealtad_Wallets/.env.example).
