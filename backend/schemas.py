from typing import Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    url: str
    category: str
    target_price: Optional[float] = None


class PriceCheck(BaseModel):
    url: str
