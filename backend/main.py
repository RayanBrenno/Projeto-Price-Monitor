import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import scraper
from .db import init_db, add_product, get_all_products, get_product, get_product_history, delete_product, insert_price, touch_last_checked, url_exists
from .parsers import infer_site

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Price Monitor", lifespan=lifespan)


# ── Schemas ────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    url: str
    category: str
    target_price: Optional[float] = None


class PriceCheck(BaseModel):
    url: str


# ── API routes ─────────────────────────────────────────────────────────────

@app.get("/api/products")
def list_products():
    products = get_all_products()
    for p in products:
        target = p.get("target_price")
        latest = p.get("latest_price_brl")
        p["price_drop"] = bool(target is not None and latest is not None and latest <= target)
    return products


@app.get("/api/products/{product_id}/history")
def product_history(product_id: int):
    return get_product_history(product_id)


@app.post("/api/products/{product_id}/check-price")
def check_product_price(product_id: int):
    product = get_product(product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    try:
        result = scraper.get_price(product["url"])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao consultar o preço: {e}")

    touch_last_checked(product_id)

    changed = scraper.price_changed(product.get("latest_price_brl"), result["price_brl"])
    if changed:
        insert_price(product_id, result["price"], result["currency"], result["price_brl"])

    if scraper.should_alert(product, result["price_brl"]):
        scraper.send_alert(product, result["price_brl"])

    return {"price_brl": result["price_brl"], "changed": changed}


@app.post("/api/products", status_code=201)
def create_product(body: ProductCreate):
    name = body.name.strip()
    url = body.url.strip()
    category = body.category.strip()

    if not name or not url or not category:
        raise HTTPException(status_code=400, detail="name, url e category são obrigatórios")

    try:
        site = infer_site(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if url_exists(url):
        raise HTTPException(status_code=409, detail="Produto com essa URL já cadastrado")

    # Consulta o preço ANTES de criar: o modal espera o resultado e o card
    # já nasce com valor. Se o scrape falhar, nada é cadastrado.
    try:
        result = scraper.get_price(url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao consultar o preço: {e}")

    try:
        product_id = add_product(name, url, site, category, body.target_price)
    except Exception as e:
        if "UNIQUE constraint" in str(e):
            raise HTTPException(status_code=409, detail="Produto com essa URL já cadastrado")
        raise

    insert_price(product_id, result["price"], result["currency"], result["price_brl"])
    touch_last_checked(product_id)

    return {"id": product_id, "site": site, "price_brl": result["price_brl"]}


@app.delete("/api/products/{product_id}", status_code=204)
def remove_product(product_id: int):
    delete_product(product_id)


@app.post("/api/check-price")
def check_price(body: PriceCheck):
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="url é obrigatória")

    try:
        site = infer_site(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        result = scraper.get_price(url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao buscar preço: {e}")

    return {"site": site, **result}


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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
