import sys
import os
import time
import logging
from logging.config import dictConfig

# Add the project root directory to the Python path
# This ensures that all modules can be imported correctly, regardless of how the app is run.
# The project root is assumed to be one level up from the directory containing main.py (i.e., 'backend/')
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
# This ensures that logs are always displayed, even in production environments
# Remove the complex dictConfig and rely on basicConfig or print
# logging.basicConfig(level=logging.INFO)

# Correctly import settings from the core config file
from app.core.config import settings
from .api.api_v1.api import api_router as api_v1_router
from app.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

# --- FastAPI App Initialization ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- KEY ADDITION: A middleware to log every single request ---
# This is the most reliable way to check if a request is reaching the application.
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """
    This middleware will log all incoming requests and their responses.
    This helps to debug cases where requests don't seem to reach the endpoint logs.
    """
    print(f"\n[BACKEND] Middleware: Received request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"[BACKEND] Middleware: Sending response with status: {response.status_code}")
        return response
    except Exception as e:
        # Log any exception that happens during the request processing
        print(f"[BACKEND] Middleware: Exception caught: {type(e).__name__} - {e}")
        # We re-raise the exception to let FastAPI handle it and return a 500 error
        raise

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
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
# @app.middleware("http")
# async def log_requests(request: Request, call_next):
#     """
#     This middleware will log all incoming requests.
#     This is the first point of contact for a request in the backend.
#     """
#     start_time = time.time()
#     logger.info(f"--- BACKEND ENTRY ---")
#     logger.info(f"Request received: {request.method} {request.url.path}")
#     logger.info(f"Client host: {request.client.host}")

#     response = await call_next(request)

#     process_time = time.time() - start_time
#     logger.info(f"Response sent: {response.status_code} (took {process_time:.4f}s)")
#     logger.info(f"--- BACKEND EXIT ---")
#     return response


# --- Include Routers ---
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 