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
from typing import Optional
import asyncio
import uuid

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

RUNWARE_API_URL = "https://api.runware.ai/v1"

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
        'Aspect Ratio': data.aspect_ratio,
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

@router.post("/generate/", response_class=JSONResponse, summary="Generate Image with Runware.ai Flux")
async def generate_image(
    image_in: schemas.ImageCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user_optional),
):
    """
    Generate an image based on the provided prompt using Runware.ai Flux API.
    This endpoint supports text-to-image generation.
    """
    await verify_turnstile(image_in.turnstile_token)
    
    # --- Credit consumption logic ---
    if current_user:
        generation_cost = 1 # Define cost per generation
        if current_user.credits < generation_cost:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient credits. You need {generation_cost} credits, but you only have {current_user.credits}."
            )
        current_user.credits -= generation_cost
        current_user.credits_spent += generation_cost
        db.commit()
        db.refresh(current_user)
        logger.info(f"Deducted {generation_cost} credit(s) from user {current_user.id}. New balance: {current_user.credits}")

    try:
        user_id_for_db = current_user.id if current_user else None
        final_prompt = construct_prompt(image_in)
        
        # Map frontend model ID to Runware.ai model ID
        model_map = {
            "tt-flux1-schnell": "black-forest-labs/FLUX.1-schnell",
            "flux1-dev": "black-forest-labs/FLUX.1-dev",
            "tt-flux1-pro": "black-forest-labs/FLUX.1-pro", # Assuming Pro model exists on Runware
            "seedream3": "seedream3", # Placeholder
        }
        runware_model_id = model_map.get(image_in.model, "black-forest-labs/FLUX.1-schnell")

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        task_uuid = str(uuid.uuid4())
        
        payload = [
            {"taskType": "authentication", "apiKey": settings.RUNWARE_API_KEY},
            {
                "taskType": "imageInference",
                "taskUUID": task_uuid,
                "positivePrompt": final_prompt,
                "negativePrompt": image_in.negative_prompt,
                "model": runware_model_id,
                "height": 1024, # Example value, adjust as needed
                "width": 1024,  # Example value, adjust as needed
                "numberResults": 1,
            }
        ]
        
        logger.info(f"Sending payload to Runware.ai: {json.dumps(payload, indent=2)}")

        async with httpx.AsyncClient(timeout=180.0) as client: # Increased timeout for direct generation
            logger.info(f"Submitting job to Runware.ai with model {runware_model_id}")
            response = await client.post(RUNWARE_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            job_data = response.json()
            
            if "errors" in job_data:
                error_msg = job_data["errors"][0].get("message", "Unknown API error")
                raise HTTPException(status_code=500, detail=f"Failed to generate image with Runware.ai: {error_msg}")

            if job_data.get("data") and job_data["data"][0].get("imageURL"):
                result_data = job_data["data"][0]
                image_url = result_data.get("imageURL")
                
                logger.info(f"Job completed successfully. TaskUUID: {task_uuid}. Image URL: {image_url}")
                
                crud.image.create_with_owner(
                    db=db,
                    prompt=image_in.prompt, 
                    user_id=user_id_for_db,
                    image_url=image_url
                )
                return JSONResponse(content={"image": image_url})
            else:
                logger.error(f"Runware.ai response is missing expected data: {job_data}")
                raise HTTPException(status_code=500, detail="Runware.ai job succeeded but the response was malformed.")

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred while contacting Runware.ai: {e.response.status_code} - {e.response.text}")
        logger.error(f"Request that failed: {e.request.method} {e.request.url}")
        
        # Try to parse the error for a more specific message
        try:
            error_data = e.response.json()
            if "errors" in error_data and error_data["errors"]:
                error_code = error_data["errors"][0].get("code")
                if error_code == "insufficientCredits":
                    raise HTTPException(
                        status_code=402, # Payment Required
                        detail="Insufficient credits on Runware.ai. Please top up your account to continue generating images."
                    )
        except Exception:
            # Not a JSON response or malformed, fall back to generic error
            pass
            
        raise HTTPException(status_code=502, detail=f"Error from image generation service: {e.response.text}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An unexpected error occurred during image generation.")

async def get_image(image_id: int, db: Session = Depends(get_db)):
    db_image = crud.image.get(db, id=image_id)
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if not db_image.image_url:
        raise HTTPException(status_code=404, detail="Image URL not available")

    return Response(status_code=302, headers={"Location": db_image.image_url})