import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prices.db")


def init_db():
    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                site TEXT NOT NULL,
                category TEXT NOT NULL,
                target_price REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_checked_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                price REAL NOT NULL,
                currency TEXT DEFAULT 'BRL',
                price_brl REAL,
                checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_price_history_product
                ON price_history(product_id, id);
        """)

        # Migração: bancos criados antes do campo last_checked_at existir.
        cols = [row["name"] for row in conn.execute("PRAGMA table_info(products)").fetchall()]
        if "last_checked_at" not in cols:
            try:
                conn.execute("ALTER TABLE products ADD COLUMN last_checked_at TIMESTAMP")
            except sqlite3.OperationalError as e:
                if "duplicate column" not in str(e):
                    raise


@contextmanager
def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 10000")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def url_exists(url: str) -> bool:
    with _conn() as conn:
        row = conn.execute("SELECT 1 FROM products WHERE url = ?", (url,)).fetchone()
        return row is not None


def add_product(name: str, url: str, site: str, category: str, target_price: float = None) -> int:
    with _conn() as conn:
        cursor = conn.execute(
            "INSERT INTO products (name, url, site, category, target_price) VALUES (?, ?, ?, ?, ?)",
            (name, url, site, category, target_price),
        )
        return cursor.lastrowid


def get_all_products() -> list[dict]:
    with _conn() as conn:
        rows = conn.execute("""
            SELECT
                p.id, p.name, p.url, p.site, p.category, p.target_price, p.created_at,
                p.last_checked_at AS last_checked,
                ph.price  AS latest_price_original,
                ph.currency,
                ph.price_brl AS latest_price_brl
            FROM products p
            LEFT JOIN price_history ph ON ph.id = (
                SELECT MAX(id) FROM price_history
                WHERE product_id = p.id
            )
            ORDER BY p.created_at DESC
        """).fetchall()
        return [dict(row) for row in rows]


def get_product(product_id: int) -> dict | None:
    with _conn() as conn:
        row = conn.execute("""
            SELECT
                p.id, p.name, p.url, p.site, p.category, p.target_price, p.created_at,
                p.last_checked_at AS last_checked,
                ph.price  AS latest_price_original,
                ph.currency,
                ph.price_brl AS latest_price_brl
            FROM products p
            LEFT JOIN price_history ph ON ph.id = (
                SELECT MAX(id) FROM price_history
                WHERE product_id = p.id
            )
            WHERE p.id = ?
        """, (product_id,)).fetchone()
        return dict(row) if row else None


def get_product_history(product_id: int) -> list[dict]:
    with _conn() as conn:
        rows = conn.execute(
            """
            SELECT price, currency, price_brl, checked_at
            FROM price_history
            WHERE product_id = ?
            ORDER BY id DESC
            """,
            (product_id,),
        ).fetchall()
        return [dict(row) for row in rows]


def insert_price(product_id: int, price: float, currency: str, price_brl: float):
    with _conn() as conn:
        conn.execute(
            "INSERT INTO price_history (product_id, price, currency, price_brl) VALUES (?, ?, ?, ?)",
            (product_id, price, currency, price_brl),
        )


def touch_last_checked(product_id: int):
    with _conn() as conn:
        conn.execute(
            "UPDATE products SET last_checked_at = CURRENT_TIMESTAMP WHERE id = ?",
            (product_id,),
        )


def delete_product(product_id: int):
    with _conn() as conn:
        conn.execute("DELETE FROM price_history WHERE product_id = ?", (product_id,))
        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
