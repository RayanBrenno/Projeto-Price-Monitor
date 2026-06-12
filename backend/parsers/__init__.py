"""Registry de parsers: domínio → módulo.

Para adicionar um novo site, crie o módulo com get_price() e registre aqui.
O nome do site (coluna `site` no banco) é derivado do nome do módulo.
"""
from . import comprasparaguai, kabum, pichau, terabyte

PARSERS = {
    "kabum.com.br": kabum,
    "pichau.com": pichau,
    "terabyteshop.com.br": terabyte,
    "comprasparaguai.com.br": comprasparaguai,
}


def get_parser(url: str):
    for domain, module in PARSERS.items():
        if domain in url:
            return module
    raise ValueError(
        "Site não suportado. URLs aceitas: " + ", ".join(PARSERS)
    )


def infer_site(url: str) -> str:
    return get_parser(url).__name__.rsplit(".", 1)[-1]
