import os
import logging
import time

import requests
from dotenv import load_dotenv

from .db import init_db, get_all_products, insert_price, touch_last_checked
from .parsers import get_parser
from .parsers._browser import browser_session

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")

RETRY_DELAY_S = 30

log = logging.getLogger(__name__)


def get_price(url: str, context=None) -> dict:
    parser = get_parser(url)
    if getattr(parser, "USES_BROWSER", False):
        return parser.get_price(url, context=context)
    return parser.get_price(url)


def _get_price_with_retry(url: str, context=None) -> dict:
    try:
        return get_price(url, context)
    except Exception as e:
        log.warning(f"Falha ao buscar {url} ({e}); nova tentativa em {RETRY_DELAY_S}s")
        time.sleep(RETRY_DELAY_S)
        return get_price(url, context)


def send_alert(product: dict, price_brl: float):
    """Envia alerta via Telegram. Requer TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        log.info("Telegram não configurado (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID); alerta ignorado.")
        return

    text = (
        f"🔻 *{product['name']}* atingiu o preço alvo!\n"
        f"Atual: R$ {price_brl:.2f} (alvo: R$ {product['target_price']:.2f})\n"
        f"{product['url']}"
    )
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=15,
        )
        resp.raise_for_status()
        log.info(f"[ALERTA] Telegram enviado: {product['name']}")
    except Exception as e:
        log.error(f"[ALERTA] Falha ao enviar Telegram: {e}")


def should_alert(product: dict, new_price: float) -> bool:
    """Alerta só quando o preço CRUZA o alvo para baixo — evita repetir
    o alerta a cada execução enquanto o preço continuar abaixo."""
    target = product.get("target_price")
    if target is None or new_price > target:
        return False
    previous = product.get("latest_price_brl")
    return previous is None or previous > target


def price_changed(previous: float | None, new: float | None) -> bool:
    """Compara com o último preço registrado, ignorando ruído de float."""
    if previous is None or new is None:
        return True
    return round(previous, 2) != round(new, 2)


def run():
    init_db()
    products = get_all_products()

    if not products:
        log.info("Nenhum produto cadastrado.")
        return

    log.info(f"Verificando {len(products)} produto(s)...")

    needs_browser = any(
        getattr(get_parser(p["url"]), "USES_BROWSER", False) for p in products
    )

    if needs_browser:
        with browser_session() as context:
            _check_all(products, context)
    else:
        _check_all(products, None)

    log.info("Scraping concluído.")


def _check_all(products: list[dict], context):
    for product in products:
        name = product["name"]
        try:
            result = _get_price_with_retry(product["url"], context)
            touch_last_checked(product["id"])

            if price_changed(product.get("latest_price_brl"), result["price_brl"]):
                insert_price(product["id"], result["price"], result["currency"], result["price_brl"])
                log.info(f"[OK] {name} — R$ {result['price_brl']:.2f} (novo preço registrado)")
            else:
                log.info(f"[OK] {name} — R$ {result['price_brl']:.2f} (sem alteração)")

            if should_alert(product, result["price_brl"]):
                send_alert(product, result["price_brl"])

        except Exception as e:
            log.error(f"[ERRO] {name} — {e}")


if __name__ == "__main__":
    import sys

    os.makedirs(LOG_DIR, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(os.path.join(LOG_DIR, "scraper.log"), encoding="utf-8"),
        ],
    )
    run()
