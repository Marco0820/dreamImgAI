import logging
import json
from fastapi import APIRouter, Body, Depends, HTTPException, Response, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import base64
import io
from PIL import Image
from io import BytesIO
import time
import httpx
from typing import Optional, List
import asyncio
import uuid
import random

from app.core.config import settings
from app.api import dependencies as deps
from app.database import get_db
from app.models.user import User
import app.schemas as schemas
import app.crud as crud

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Fireworks.ai API Configuration ---
FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image"

async def verify_turnstile(token: str):
    if not token:
        raise HTTPException(status_code=400, detail="Turnstile token is missing.")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.CLOUDFLARE_TURNSTILE_SECRET_KEY, "response": token},
        )
        data = response.json()
        if not data.get("success"):
            logger.error(f"Cloudflare Turnstile verification failed: {data.get('error-codes')}")
            raise HTTPException(status_code=403, detail="Cloudflare Turnstile verification failed.")

def construct_prompt(data: schemas.ImageCreate) -> str:
    """Constructs a detailed prompt from various style attributes."""
    parts = [data.prompt]
    
    style_map = {
        'Style': data.style,
        'Color': data.color,
        'Lighting': data.lighting,
        'Composition': data.composition,
    }

    for key, value in style_map.items():
        if value:
            parts.append(f"{value}")
            
    return ", ".join(filter(None, parts))

@router.get("/healthcheck/", status_code=200, summary="Check if the service is running")
async def healthcheck():
    """
    A simple endpoint to confirm that the API is running.
    """
    logger.info("Healthcheck endpoint was hit!")
    return {"status": "ok"}

def parse_aspect_ratio(ratio_str: Optional[str]) -> (int, int):
    """Parses aspect ratio string like '1:1' into (width, height). Defaults to 1024x1024."""
    if not ratio_str or ':' not in ratio_str:
        return 1152, 896 # Default to a larger size

    # A mapping of aspect ratios to supported resolutions
    # As per Fireworks.ai docs for FLUX.1 - adjusted for larger sizes
    resolutions = {
        "1:1": (1024, 1024),    # Kept as square
        "16:9": (1344, 768),
        "9:16": (768, 1344),
        "21:9": (1536, 640),
        "9:21": (640, 1536),
        "2:3": (896, 1152),   # A taller option
        "3:2": (1152, 896),   # A wider option
        "4:5": (896, 1152),
        "5:4": (1152, 896),
    }
    
    return resolutions.get(ratio_str, (1152, 896))

@router.post("/generate/", response_class=JSONResponse, summary="Generate Image with Fireworks.ai FLUX.1")
async def generate_image(
    image_in: schemas.ImageCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user_optional),
):
    """
    Generate an image based on the provided prompt using Fireworks.ai FLUX.1 API.
    """
    logger.info("--- [/generate] Endpoint hit (Fireworks.ai) ---")
    logger.info(f"Received request body: {image_in.model_dump_json(indent=2)}")

    if not settings.FIREWORKS_API_KEY:
        raise HTTPException(status_code=500, detail="Fireworks API key is not configured on the server.")

    try:
        await verify_turnstile(image_in.turnstile_token)
        logger.info("Turnstile verification successful.")
    except HTTPException as e:
        logger.error(f"Turnstile verification failed: {e.detail}")
        raise e

    # --- Credit consumption logic (no changes needed) ---
    if current_user:
        logger.info(f"Authenticated user: {current_user.email} (ID: {current_user.id})")
        # Assuming 4 images are generated, cost might be higher. Adjust if needed.
        generation_cost = 4 
        if current_user.credits < generation_cost:
            logger.warning(f"User {current_user.id} has insufficient credits.")
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient credits. You need {generation_cost} credits for 4 images, but you only have {current_user.credits}."
            )
        current_user.credits -= generation_cost
        current_user.credits_spent += generation_cost
        db.commit()
        db.refresh(current_user)
        logger.info(f"Deducted {generation_cost} credit(s) from user {current_user.id}. New balance: {current_user.credits}")
    else:
        logger.info("Request is from an anonymous user.")

    try:
        final_prompt = construct_prompt(image_in)
        width, height = parse_aspect_ratio(image_in.aspect_ratio)
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "image/png",  # Request binary image data directly
            "Authorization": f"Bearer {settings.FIREWORKS_API_KEY}",
        }
        
        async def generate_single_image(client: httpx.AsyncClient):
            """Helper function to generate one image and return its base64 string."""
            
            # --- KEY CHANGE: Create a unique payload for each request with a random seed ---
            payload = {
                "prompt": final_prompt,
                "negative_prompt": image_in.negative_prompt,
                "width": width,
                "height": height,
                "samples": 1,
                "seed": random.randint(1, 4294967295) # Use a random seed for each image
            }
            logger.info(f"Sending payload to Fireworks.ai: {json.dumps(payload, indent=2)}")

            response = await client.post(FIREWORKS_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            # The response content is now binary image data, not JSON.
            # We need to encode it into base64 ourselves.
            image_bytes = await response.aread()
            base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
            return base64_encoded

        async with httpx.AsyncClient(timeout=180.0) as client:
            # Create a list of tasks to run in parallel
            generation_tasks = [generate_single_image(client) for _ in range(4)]
            
            # Run all generation tasks concurrently
            logger.info("Generating 4 images in parallel with Fireworks.ai...")
            base64_images_results = await asyncio.gather(*generation_tasks, return_exceptions=True)
            
            # Filter out any potential errors
            successful_images_base64 = [img for img in base64_images_results if not isinstance(img, Exception)]
            if not successful_images_base64:
                logger.error("All image generation tasks failed.", exc_info=base64_images_results[0])
                raise HTTPException(status_code=500, detail="Failed to generate any images from the service.")
            
            logger.info(f"Job completed successfully. Received {len(successful_images_base64)} base64 images from Fireworks.ai.")
            
            # --- KEY CHANGE: Do not save to server disk. Return base64 directly. ---
            # We also no longer need to save the records to the database here,
            # as there is no persistent URL to save.
            # If you want to log the generation, you could still do that here.
            
            # Prefix with data URI scheme for direct use in browser <img> tags
            image_data_urls = [f"data:image/png;base64,{b64}" for b64 in successful_images_base64]

            return JSONResponse(content={"images": image_data_urls})

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred while contacting Fireworks.ai: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=502, detail=f"Error from image generation service: {e.response.text}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred during image generation.")

async def get_image(image_id: int, db: Session = Depends(get_db)):
    db_image = crud.image.get(db, id=image_id)
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if not db_image.image_url:
        raise HTTPException(status_code=404, detail="Image URL not available")

    return Response(status_code=302, headers={"Location": db_image.image_url})