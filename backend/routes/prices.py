from fastapi import APIRouter, HTTPException

from .. import scraper
from ..parsers import infer_site
from ..schemas import PriceCheck

router = APIRouter(tags=["prices"])


@router.post("/api/check-price")
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
