from fastapi import APIRouter
from ..endpoints import images

api_router = APIRouter()
api_router.include_router(images.router, prefix="/images", tags=["images"])

# The subscriptions router can be included here as well if it's part of v1
# api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"]) 