import re

from ._browser import rendered_page

PRICE_RE = re.compile(r"[\d.]+,\d{2}")

USES_BROWSER = True


def get_price(url: str, context=None) -> dict:
    with rendered_page(url, context=context) as page:
        el = page.query_selector("#valVista")
        text = el.inner_text() if el else None

    if not text:
        raise ValueError("Elemento de preço não encontrado na página da Terabyte")

    match = PRICE_RE.search(text)
    if not match:
        raise ValueError("Não foi possível extrair o valor do preço da Terabyte")

    price = float(match.group().replace(".", "").replace(",", "."))

    return {"price": price, "currency": "BRL", "price_brl": price}
