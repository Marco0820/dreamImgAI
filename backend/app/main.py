from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Correctly import settings from the core config file
from app.core.config import settings
from .api.api_v1.api import api_router as api_v1_router

# --- FastAPI App Initialization ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount static files directory --- (No longer needed)
# os.makedirs("app/static/generated", exist_ok=True)
# app.mount("/static", StaticFiles(directory="app/static"), name="static")


# --- Logging Middleware ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    This middleware will log all incoming requests.
    This is the first point of contact for a request in the backend.
    """
    start_time = time.time()
    logger.info(f"--- BACKEND ENTRY ---")
    logger.info(f"Request received: {request.method} {request.url.path}")
    logger.info(f"Client host: {request.client.host}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"Response sent: {response.status_code} (took {process_time:.4f}s)")
    logger.info(f"--- BACKEND EXIT ---")
    return response


# --- Include Routers ---
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 