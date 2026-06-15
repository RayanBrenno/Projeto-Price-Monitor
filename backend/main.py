import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .db import init_db
from .routes import prices, products

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Price Monitor", lifespan=lifespan)

# CORS_ORIGINS=https://main.xxxxx.amplifyapp.com,https://app.seudominio.com
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]

if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(products.router)
app.include_router(prices.router)


# ── SPA — deve ficar por último ────────────────────────────────────────────

@app.get("/{full_path:path}")
def spa(full_path: str):
    full = os.path.join(DIST_DIR, full_path)
    if full_path and os.path.isfile(full):
        return FileResponse(full)
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    raise HTTPException(
        status_code=404,
        detail="Frontend não encontrado. Execute 'npm run build' em frontend/",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
