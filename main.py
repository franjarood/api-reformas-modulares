from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Reformas & Casas Modulares API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # para clase está perfecto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# MODELOS DE CASAS (DATOS)
# ----------------------------
MODELOS = [
    {
        "id": 1,
        "nombre": "Casa Modular Ecológica",
        "m2": 60,
        "precio_base": 78000
    },
    {
        "id": 2,
        "nombre": "Contenedor Minimalista",
        "m2": 45,
        "precio_base": 64000
    }
]

# ----------------------------
# OPCIONES / EXTRAS (DATOS)
# ----------------------------
OPTIONS = [
    # FACHADA
    {
        "id": 101,
        "categoria": "FACHADA",
        "nombre": "SATE (aislamiento exterior)",
        "precio": 9500,
        "image_url": "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 102,
        "categoria": "FACHADA",
        "nombre": "Monocapa",
        "precio": 6500,
        "image_url": "https://images.unsplash.com/photo-1505691723518-36a5ac3b2b18?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 103,
        "categoria": "FACHADA",
        "nombre": "Fachada ventilada",
        "precio": 14000,
        "image_url": "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=900&q=80"
    },

    # VENTANAS
    {
        "id": 201,
        "categoria": "VENTANAS",
        "nombre": "PVC",
        "precio": 4500,
        "image_url": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 202,
        "categoria": "VENTANAS",
        "nombre": "Aluminio con RPT",
        "precio": 6200,
        "image_url": "https://images.unsplash.com/photo-1582582429416-1b4c57f0c7c5?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 203,
        "categoria": "VENTANAS",
        "nombre": "Triple vidrio",
        "precio": 7800,
        "image_url": "https://images.unsplash.com/photo-1560448075-bb4bfc6c2f16?auto=format&fit=crop&w=900&q=80"
    },

    # AISLAMIENTO
    {
        "id": 301,
        "categoria": "AISLAMIENTO",
        "nombre": "Lana de roca",
        "precio": 3200,
        "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 302,
        "categoria": "AISLAMIENTO",
        "nombre": "XPS (extrusionado)",
        "precio": 2900,
        "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 303,
        "categoria": "AISLAMIENTO",
        "nombre": "Celulosa proyectada",
        "precio": 3600,
        "image_url": "https://images.unsplash.com/photo-1581579185169-7b0b5b6d6d89?auto=format&fit=crop&w=900&q=80"
    }
]

# ----------------------------
# "BASE DE DATOS" EN MEMORIA
# ----------------------------
CONFIGURATIONS = []
NEXT_CONFIG_ID = 1
LEADS = []
NEXT_LEAD_ID = 1


# ----------------------------
# FORMATO DEL JSON DE ENTRADA
# ----------------------------
class CalculateRequest(BaseModel):
    modelo_id: int
    option_ids: List[int] = []

class ConfigurationCreate(BaseModel):
    nombre_cliente: str
    email: str
    modelo_id: int
    option_ids: List[int] = []

class LeadCreate(BaseModel):
    nombre: str
    email: str
    mensaje: str


@app.get("/health")
def health():
    return {"status": "ok"}



@app.get("/models")
def list_models():
    return MODELOS

@app.get("/options")
def list_options():
    return OPTIONS

@app.post("/configurations/calculate")
def calculate_budget(req: CalculateRequest):
    # 1) Buscar el modelo
    modelo = next((m for m in MODELOS if m["id"] == req.modelo_id), None)
    if not modelo:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")

    # 2) Buscar las opciones
    opciones_elegidas = [o for o in OPTIONS if o["id"] in req.option_ids]

    # 3) Validar que no mandaron IDs inexistentes
    if len(opciones_elegidas) != len(req.option_ids):
        ids_encontrados = {o["id"] for o in opciones_elegidas}
        ids_invalidos = [oid for oid in req.option_ids if oid not in ids_encontrados]
        raise HTTPException(status_code=400, detail=f"Option IDs inválidos: {ids_invalidos}")

    # 2.5) Validar que no haya dos opciones de la misma categoría
    categorias = [o["categoria"] for o in opciones_elegidas]
    if len(set(categorias)) != len(categorias):
        raise HTTPException(
            status_code=400,
            detail="No puedes seleccionar dos opciones de la misma categoría"
        )

    # 4) Calcular
    base = modelo["precio_base"]
    extras = sum(o["precio"] for o in opciones_elegidas)
    total = base + extras

    # 5) Respuesta con desglose (esto es lo que verá tu web)
    return {
        "modelo": modelo,
        "opciones": opciones_elegidas,
        "desglose": {
            "precio_base": base,
            "precio_extras": extras,
            "total_estimado": total
        },
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

@app.post("/configurations")
def create_configuration(req: ConfigurationCreate):
    global NEXT_CONFIG_ID

    # Reutilizamos el cálculo para no duplicar lógica:
    calc = calculate_budget(CalculateRequest(modelo_id=req.modelo_id, option_ids=req.option_ids))

    nueva = {
        "id": NEXT_CONFIG_ID,
        "nombre_cliente": req.nombre_cliente,
        "email": req.email,
        "modelo_id": req.modelo_id,
        "option_ids": req.option_ids,
        "resultado": calc,  # guardamos el resultado completo
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    CONFIGURATIONS.append(nueva)
    NEXT_CONFIG_ID += 1

    return nueva
@app.get("/configurations")
def list_configurations(email: Optional[str] = None):
    if email:
        return [c for c in CONFIGURATIONS if c["email"].lower() == email.lower()]
    return CONFIGURATIONS



@app.get("/configurations/{config_id}")
def get_configuration(config_id: int):
    conf = next((c for c in CONFIGURATIONS if c["id"] == config_id), None)
    if not conf:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return conf

@app.post("/leads")
def create_lead(req: LeadCreate):
    global NEXT_LEAD_ID

    nuevo = {
        "id": NEXT_LEAD_ID,
        "nombre": req.nombre,
        "email": req.email,
        "mensaje": req.mensaje,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    LEADS.append(nuevo)
    NEXT_LEAD_ID += 1

    return nuevo

@app.get("/leads")
def list_leads():
    return LEADS


@app.get("/")
def root():
    return {"message": "API Reformas & Casas Modulares. Visita /docs"}



