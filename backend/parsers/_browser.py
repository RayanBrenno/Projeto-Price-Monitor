from contextlib import contextmanager

from playwright.sync_api import sync_playwright

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


@contextmanager
def browser_session():
    """Abre um Chromium reutilizável. Passe o context resultante para
    rendered_page() ao verificar vários produtos na mesma execução —
    evita pagar ~5s de startup do browser por produto."""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, args=["--disable-blink-features=AutomationControlled"]
        )
        try:
            yield browser.new_context(user_agent=USER_AGENT, locale="pt-BR")
        finally:
            browser.close()


@contextmanager
def _page(context, url: str, wait_ms: int):
    page = context.new_page()
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(wait_ms)
        yield page
    finally:
        page.close()


@contextmanager
def rendered_page(url: str, wait_ms: int = 4000, context=None):
    if context is not None:
        with _page(context, url, wait_ms) as page:
            yield page
    else:
        with browser_session() as ctx, _page(ctx, url, wait_ms) as page:
            yield page
