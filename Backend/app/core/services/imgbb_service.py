import base64
import requests
from typing import Dict, Any
from app.core.config import settings

class ImgBBService:
    def __init__(self):
        pass

    @property
    def api_key(self) -> str:
        """Obtiene la clave de la API de ImgBB dinámicamente de la configuración de entorno."""
        return (getattr(settings, "IMGBB_API_KEY", "") or "").strip()

    def upload_file(self, file_content: bytes, filename: str = "loyalty_image.jpg", content_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Sube un archivo de imagen a ImgBB Cloud Storage y retorna la URL pública de visualización.
        """
        key = self.api_key
        if not key:
            print("[ImgBBService] Advertencia: IMGBB_API_KEY no configurada en el entorno .env")

        try:
            base64_image = base64.b64encode(file_content).decode("utf-8")
            payload = {
                "key": key,
                "image": base64_image,
                "name": filename.split('.')[0]
            }

            resp = requests.post("https://api.imgbb.com/1/upload", data=payload, timeout=20)

            if resp.status_code == 200:
                res_data = resp.json()
                if res_data.get("success"):
                    img_data = res_data.get("data", {})
                    public_url = img_data.get("display_url") or img_data.get("url")
                    return {
                        "success": True,
                        "file_id": img_data.get("id"),
                        "imagen_url": public_url,
                        "delete_url": img_data.get("delete_url"),
                        "source": "imgbb"
                    }

            print(f"[ImgBBService] API Error {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[ImgBBService] Excepción durante la subida a ImgBB: {e}")

        # Fallback resiliente: Data URI en base64 si falla la red o si no hay API key
        encoded = base64.b64encode(file_content).decode("utf-8")
        data_uri = f"data:{content_type};base64,{encoded}"
        return {
            "success": True,
            "file_id": f"local_{filename}",
            "imagen_url": data_uri,
            "source": "data_uri"
        }

imgbb_service = ImgBBService()
