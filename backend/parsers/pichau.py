import re

from ._browser import rendered_page

PRICE_RE = re.compile(r"R\$\s*([\d.]+,\d{2})")

USES_BROWSER = True


def get_price(url: str, context=None) -> dict:
    with rendered_page(url, context=context) as page:
        price = None
        for el in page.query_selector_all("[class*='price_vista']"):
            match = PRICE_RE.search(el.inner_text())
            if match:
                price = float(match.group(1).replace(".", "").replace(",", "."))
                break

    if price is None:
        raise ValueError("Elemento de preço não encontrado na página da Pichau")

    return {"price": price, "currency": "BRL", "price_brl": price}
