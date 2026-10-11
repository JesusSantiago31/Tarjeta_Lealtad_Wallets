import json
import time
import re
from typing import Any, Dict, Optional
from jose import jwt as jose_jwt
from app.core.config import settings

class GoogleWalletService:
    def __init__(self):
        pass

    @property
    def issuer_id(self) -> str:
        return (getattr(settings, "GOOGLE_ISSUER_ID", "") or "3388000000023191405").strip().strip('"').strip("'")

    @property
    def client_email(self) -> str:
        return (getattr(settings, "GOOGLE_CLIENT_EMAIL", "") or "").strip().strip('"').strip("'")

    @property
    def private_key(self) -> str:
        raw_key = getattr(settings, "GOOGLE_PRIVATE_KEY", "") or ""
        return raw_key.strip().strip('"').strip("'").replace("\\n", "\n")

    def generate_pass_for_user(self, user: dict) -> Dict[str, Any]:
        """
        Genera el pase digital firmado de Google Wallet con layout dinámico de tarjeta.
        """
        user_id = str(user.get("id", "guest"))
        phone_raw = str(user.get("phone") or user.get("loyalty_code") or user_id)
        phone_clean = re.sub(r'\D', '', phone_raw)
        
        first_name = user.get('first_name') or 'Cliente'
        last_name = user.get('last_name') or ''
        full_name = f"{first_name} {last_name}".strip()
        points = user.get("current_points", 0)
        purchases_count = user.get("total_purchases_count", 0)

        if phone_clean:
            pass_id = f"{self.issuer_id}.gen_v6_{phone_clean}"
        else:
            pass_id = f"{self.issuer_id}.gen_v6_{user_id.replace('-', '_')}"

        raw_class_id = (getattr(settings, "GOOGLE_CLASS_ID", "") or "cafeteria_generic_v6").strip().strip('"').strip("'")
        class_id = raw_class_id if "." in raw_class_id else f"{self.issuer_id}.{raw_class_id}"

        # Definición de la clase genérica de Google Wallet
        generic_class: Dict[str, Any] = {
            "id": class_id,
            "logo": {
                "sourceUri": {
                    "uri": getattr(settings, "CAFETERIA_LOGO_URL", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBl6LKbfzoGTny4NdhmY6Sb918FWDa0NZ_8XNWPh5BjQ&s")
                },
                "contentDescription": {
                    "defaultValue": {
                        "language": "es-419",
                        "value": "Logo"
                    }
                }
            },
            "cardTitle": {
                "defaultValue": {
                    "language": "es-419",
                    "value": getattr(settings, "CAFETERIA_NAME", "Cafetería")
                }
            },
            "subheader": {
                "defaultValue": {
                    "language": "es-419",
                    "value": getattr(settings, "CAFETERIA_SUBHEADER", "Datos de Cliente")
                }
            }
        }

        hero_url = user.get("wallet_hero_image_url") or getattr(settings, "CAFETERIA_HERO_IMAGE_URL", "")
        hero_image_obj = None
        if hero_url:
            hero_image_obj = {
                "sourceUri": {
                    "uri": hero_url
                },
                "contentDescription": {
                    "defaultValue": {
                        "language": "es-419",
                        "value": "Tarjeta de Lealtad - Sellos"
                    }
                }
            }

        stamps = user.get("current_stamps", 0)
        max_stamps = user.get("max_stamps", 10)

        # Geofencing (Notificación en pantalla de bloqueo al pasar cerca de la tienda)
        generic_class["locations"] = [
            {
                "kind": "walletobjects#latLongPoint",
                "latitude": float(getattr(settings, "CAFETERIA_LATITUDE", 19.432608)),
                "longitude": float(getattr(settings, "CAFETERIA_LONGITUDE", -99.133209))
            }
        ]

        # Objeto de pase genérico
        generic_object: Dict[str, Any] = {
            "id": pass_id,
            "classId": class_id,
            "state": "ACTIVE",
            "logo": generic_class["logo"],
            "cardTitle": generic_class["cardTitle"],
            "subheader": generic_class["subheader"],
            "header": {
                "defaultValue": {
                    "language": "es-419",
                    "value": full_name
                }
            },
            "hexBackgroundColor": getattr(settings, "CAFETERIA_BG_COLOR", "#a4c0a2"),
            "heroImage": hero_image_obj,
            "locations": generic_class["locations"],
            "messages": [
                {
                    "id": f"msg_welcome_{int(time.time())}",
                    "header": f"¡Bienvenido a {getattr(settings, 'CAFETERIA_NAME', 'Cafetería')}! ☕",
                    "body": f"¡Hola {first_name}! Tienes {stamps} de {max_stamps} sellos y {points} pts en tu tarjeta VIP."
                }
            ],
            "textModulesData": [
                {
                    "id": "sellos_acumulados",
                    "header": "SELLOS ACUMULADOS",
                    "body": f"{stamps} de {max_stamps}"
                },
                {
                    "id": "puntos_disponibles",
                    "header": "PUNTOS DISPONIBLES",
                    "body": f"{points} pts"
                },
                {
                    "id": "compras_realizadas",
                    "header": "COMPRAS REALIZADAS",
                    "body": str(purchases_count)
                },
                {
                    "id": "codigo_cliente",
                    "header": "CÓDIGO DE CLIENTE",
                    "body": f"CEL-{phone_raw}"
                }
            ],
            "barcode": {
                "type": "QR_CODE",
                "value": phone_raw,
                "alternateText": phone_raw
            }
        }

        # Construcción del payload JWT
        now = int(time.time())
        claims = {
            "iss": self.client_email or "service-account@google.com",
            "aud": "google",
            "origins": [],
            "typ": "savetowallet",
            "iat": now,
            "payload": {
                "genericClasses": [{"id": class_id}],
                "genericObjects": [generic_object]
            }
        }

        is_mock = False
        jwt_token = ""

        p_key = self.private_key
        if p_key and "BEGIN PRIVATE KEY" in p_key:
            try:
                import jwt as pyjwt
                jwt_token = pyjwt.encode(claims, p_key, algorithm="RS256")
            except Exception as e:
                print(f"[GoogleWalletService] RS256 signing fallback: {e}")
                is_mock = True
                jwt_token = jose_jwt.encode(claims, settings.SECRET_KEY, algorithm="HS256")
        else:
            is_mock = True
            jwt_token = jose_jwt.encode(claims, settings.SECRET_KEY, algorithm="HS256")

        save_url = f"https://pay.google.com/gp/v/save/{jwt_token}"

        return {
            "save_url": save_url,
            "pass_class_id": class_id,
            "pass_object_id": pass_id,
            "hero_image_url": hero_url,
            "locations": generic_class["locations"],
            "messages": generic_object["messages"],
            "is_mock": is_mock
        }

google_wallet_service = GoogleWalletService()
