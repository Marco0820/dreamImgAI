import logging
import json
from fastapi import APIRouter, Body, Depends, HTTPException, Response, File, UploadFile, Request
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
FIREWORKS_API_BASE_URL = "https://api.fireworks.ai/inference/v1/workflows/accounts/"
MODEL_MAP = {
    # This is the "Schnell" model, using the dev-fp8 path.
    "tt-flux1-schnell": "fireworks/models/flux-1-dev-fp8",

    # "Original" also points to the same fast model as per request.
    "flux1-dev": "fireworks/models/flux-1-dev-fp8", 
    
    # Community hosted models require the specific account path
    # --- KEY CHANGE: Updated the Pro model to point to the requested dev model ---
    "tt-flux1-pro": "fireworks/models/flux-1-dev-fp8",
    "seedream3": "fal-ai/models/seedream-3.0",
}

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
        return 1024, 1024 # Default to a square size

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
    
    return resolutions.get(ratio_str, (1024, 1024))

@router.post("/generate/", response_class=JSONResponse, summary="Generate Image with Fireworks.ai FLUX.1")
async def generate_image(
    request: Request, # Add Request to the function signature
    image_in: schemas.ImageCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional) # <-- CORRECT way to use dependency
):
    """
    Generate an image based on the provided prompt using Fireworks.ai FLUX.1 API.
    Images are returned as Base64 data URLs and are not stored on the server.
    """
    print(f"\n[BACKEND] images.py: --- [/generate] Endpoint hit ---")
    print(f"[BACKEND] images.py: Received request body: {image_in.model_dump_json(indent=2)}")

    if not settings.FIREWORKS_API_KEY:
        print("[BACKEND] images.py: CRITICAL: Fireworks API key is not configured on the server.")
        raise HTTPException(status_code=500, detail="Fireworks API key is not configured on the server.")

    model_id = image_in.model or "tt-flux1-schnell"
    generation_cost = 4  # Default cost for 4 images

    # --- Credit and Subscription Logic ---
    if current_user:
        print(f"[BACKEND] images.py: Authenticated user: {current_user.email} (ID: {current_user.id}). Credits: {current_user.credits}")
        
        is_pro_model = model_id == "tt-flux1-pro"
        has_pro_subscription = current_user.creem_price_id == 'price_ultimate'

        # Pro model logic: requires subscription OR sufficient credits
        if is_pro_model and not has_pro_subscription:
            print("[BACKEND] images.py: User wants Pro model but lacks subscription. Checking credits as fallback.")
            generation_cost = 20 # Pro model costs more credits
            if current_user.credits < generation_cost:
                print(f"[BACKEND] images.py: WARNING: User {current_user.id} has insufficient credits for Pro model.")
                raise HTTPException(
                    status_code=402, # 402 Payment Required
                    detail=f"Using the Pro model without a subscription costs {generation_cost} credits, but you only have {current_user.credits}."
                )
        # Standard model logic: just check credits
        elif not is_pro_model:
            if current_user.credits < generation_cost:
                print(f"[BACKEND] images.py: WARNING: User {current_user.id} has insufficient credits for standard model.")
                raise HTTPException(
                    status_code=402,
                    detail=f"Insufficient credits. You need {generation_cost} credits for 4 images, but you only have {current_user.credits}."
                )
        # If user has Pro subscription, generation is free (cost is 0)
        else: # is_pro_model and has_pro_subscription
             generation_cost = 0
             print("[BACKEND] images.py: User has Pro subscription. Generation is free.")

    elif model_id == "tt-flux1-pro":
        # Anonymous users cannot use the Pro model at all
        print("[BACKEND] images.py: WARNING: Anonymous user attempted to use Pro model.")
        raise HTTPException(status_code=403, detail="You must be logged in and have a Pro subscription or sufficient credits to use this model.")
    
    model_path = MODEL_MAP.get(model_id)
    if not model_path:
        print(f"[BACKEND] images.py: ERROR: Unsupported model selected: {model_id}")
        raise HTTPException(status_code=400, detail=f"Unsupported model selected: {model_id}")
    
    fireworks_api_url = f"{FIREWORKS_API_BASE_URL}{model_path}/text_to_image"
    print(f"[BACKEND] images.py: Targeting Fireworks.ai endpoint: {fireworks_api_url}")

    try:
        await verify_turnstile(image_in.turnstile_token)
        print("[BACKEND] images.py: Turnstile verification successful.")
    except HTTPException as e:
        print(f"[BACKEND] images.py: ERROR: Turnstile verification failed: {e.detail}")
        raise e

    # --- Deduct credits if applicable ---
    if current_user and generation_cost > 0:
        print(f"[BACKEND] images.py: Attempting to deduct {generation_cost} credits from user {current_user.id}...")
        current_user.credits -= generation_cost
        current_user.credits_spent += generation_cost
        db.commit()
        db.refresh(current_user)
        print(f"[BACKEND] images.py: Deducted {generation_cost} credits. New balance: {current_user.credits}")

    try:
        final_prompt = construct_prompt(image_in)
        width, height = parse_aspect_ratio(image_in.aspect_ratio)
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "image/png",
            "Authorization": f"Bearer {settings.FIREWORKS_API_KEY}",
        }
        
        async def generate_single_image(client: httpx.AsyncClient, url: str):
            payload = {
                "prompt": final_prompt,
                "negative_prompt": image_in.negative_prompt,
                "width": width,
                "height": height,
                "samples": 1,
                "seed": random.randint(1, 4294967295)
            }
            print(f"[BACKEND] images.py: Sending request to Fireworks.ai with payload: {json.dumps(payload, indent=2)}")
            response = await client.post(url, headers=headers, json=payload, timeout=180.0)
            print(f"[BACKEND] images.py: Received response from Fireworks.ai with status: {response.status_code}")
            response.raise_for_status()
            image_bytes = await response.aread()
            return base64.b64encode(image_bytes).decode('utf-8')

        async with httpx.AsyncClient() as client:
            generation_tasks = [generate_single_image(client, fireworks_api_url) for _ in range(4)]
            print(f"[BACKEND] images.py: Generating 4 images in parallel with Fireworks.ai...")
            base64_images_results = await asyncio.gather(*generation_tasks, return_exceptions=True)
            
            successful_images_base64 = [img for img in base64_images_results if not isinstance(img, Exception)]

            if not successful_images_base64:
                first_exception = next((res for res in base64_images_results if isinstance(res, Exception)), None)
                print(f"[BACKEND] images.py: ERROR: All image generation tasks failed. First exception: {first_exception}")
                raise HTTPException(status_code=500, detail="Failed to generate any images from the service.")

            print(f"[BACKEND] images.py: Job completed successfully. Returning {len(successful_images_base64)} base64 images.")

            # --- KEY CHANGE: Return Base64 data URLs directly ---
            image_data_urls = [f"data:image/png;base64,{b64}" for b64 in successful_images_base64]
            
            # Pad the results if some failed, to always return 4 images if at least one succeeded
            if image_data_urls and len(image_data_urls) < 4:
                print(f"[BACKEND] images.py: WARNING: Only {len(image_data_urls)} of 4 images were generated. Duplicating to fill.")
                while len(image_data_urls) < 4:
                    image_data_urls.append(image_data_urls[0])

            return JSONResponse(content={"images": image_data_urls})

    except httpx.HTTPStatusError as e:
        # Revert credits if the API call fails
        if current_user and generation_cost > 0:
            current_user.credits += generation_cost
            current_user.credits_spent -= generation_cost
            db.commit()
            print(f"[BACKEND] images.py: Reverted {generation_cost} credits for user {current_user.id} due to API failure.")
        print(f"[BACKEND] images.py: ERROR: HTTP error occurred while contacting Fireworks.ai: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=502, detail=f"Error from image generation service: {e.response.text}")
    except Exception as e:
        # Revert credits for any other unexpected error
        if current_user and generation_cost > 0:
            current_user.credits += generation_cost
            current_user.credits_spent -= generation_cost
            db.commit()
            print(f"[BACKEND] images.py: Reverted {generation_cost} credits for user {current_user.id} due to an unexpected error.")
        print(f"[BACKEND] images.py: ERROR: An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during image generation.")

# --- Removed my-works and related endpoints as they are no longer needed ---
# The frontend now manages history in localStorage.