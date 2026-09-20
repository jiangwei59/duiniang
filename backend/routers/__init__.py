from .products import router as products_router
from .orders import router as orders_router
from .auth import router as auth_router
from .upload import router as upload_router

__all__ = ["products_router", "orders_router", "auth_router", "upload_router"]