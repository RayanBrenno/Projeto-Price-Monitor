import re

import requests
from bs4 import BeautifulSoup

PRICE_RE = re.compile(r"[\d.]+,\d{2}")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def get_price(url: str) -> dict:
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    price_div = soup.find("div", class_="header-product-info--currency")
    if not price_div:
        raise ValueError("Elemento de preço não encontrado na página do Compras Paraguai")

    match = PRICE_RE.search(price_div.get_text())
    if not match:
        raise ValueError("Não foi possível extrair o valor do preço do Compras Paraguai")

    price = float(match.group().replace(".", "").replace(",", "."))

    return {"price": price, "currency": "BRL", "price_brl": price}
