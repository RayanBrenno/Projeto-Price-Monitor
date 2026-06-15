from fastapi import APIRouter, HTTPException

from .. import scraper
from ..db import (
    add_product,
    delete_product,
    get_all_products,
    get_product,
    get_product_history,
    insert_price,
    touch_last_checked,
    url_exists,
)
from ..parsers import infer_site
from ..schemas import ProductCreate

router = APIRouter(tags=["products"])


@router.get("/api/products")
def list_products():
    products = get_all_products()
    for p in products:
        target = p.get("target_price")
        latest = p.get("latest_price_brl")
        p["price_drop"] = bool(target is not None and latest is not None and latest <= target)
    return products


@router.get("/api/products/{product_id}/history")
def product_history(product_id: int):
    return get_product_history(product_id)


@router.post("/api/products/{product_id}/check-price")
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


@router.post("/api/products", status_code=201)
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


@router.delete("/api/products/{product_id}", status_code=204)
def remove_product(product_id: int):
    delete_product(product_id)
