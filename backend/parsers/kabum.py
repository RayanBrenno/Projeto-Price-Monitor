import json
import re

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def _price_from_jsonld(soup) -> float | None:
    """O JSON-LD (dados estruturados p/ Google) é estável entre redesigns,
    ao contrário das classes CSS de utilitário."""
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if not isinstance(item, dict) or item.get("@type") != "Product":
                continue
            offers = item.get("offers") or {}
            if isinstance(offers, list):
                offers = offers[0] if offers else {}
            price = offers.get("price") or offers.get("lowPrice")
            if price is not None:
                try:
                    return float(price)
                except (TypeError, ValueError):
                    continue
    return None


def _price_from_css(soup) -> float | None:
    price_tag = soup.find("h4", class_="text-secondary-500")
    if not price_tag:
        return None
    match = re.search(r"[\d.]+,\d{2}", price_tag.get_text())
    if not match:
        return None
    return float(match.group().replace(".", "").replace(",", "."))


def get_price(url: str) -> dict:
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    price = _price_from_jsonld(soup)
    if price is None:
        price = _price_from_css(soup)
    if price is None:
        raise ValueError("Não foi possível extrair o preço da página da KaBuM")

    return {"price": price, "currency": "BRL", "price_brl": price}
