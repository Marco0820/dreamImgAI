import requests
import base64
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ... import schemas, crud, models, deps

router = APIRouter()

@router.post("/generate-sdxl", status_code=status.HTTP_200_OK)
async def generate_sdxl_image(image_data: schemas.SDXLImageGenerate):
    """
    Generate an image using the stabilityai/stable-diffusion-3.5-large model from Hugging Face.
    """
    API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large"
    HF_TOKEN = "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"

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": image_data.prompt,
        "parameters": {
            "width": 1024,
            "height": 1024,
            "num_inference_steps": 30
        },
        "options": {
            "wait_for_model": True
        }
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            img_b64 = base64.b64encode(response.content).decode("utf-8")
            return {"img_base64": img_b64}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error from Hugging Face API: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calling Hugging Face API: {str(e)}"
        )

# The old "/generate" endpoint that used local models is now removed.

@router.get("/history", response_model=List[schemas.Image])
def get_user_image_history(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get the image generation history for the currently logged-in user.
    """
    images = crud.get_user_images(db, user_id=current_user.id, skip=skip, limit=limit)
    if not images:
        return []
    return images 