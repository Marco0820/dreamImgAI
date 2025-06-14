import requests
import base64
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ... import schemas, crud, models, deps
from ...config import settings

router = APIRouter()

@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_image(image_data: schemas.ImageGenerate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_active_user)):
    """
    Generate an image using a selected model.
    """
    if image_data.model == 'stable-diffusion-xl':
        API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
        headers = {
            "Authorization": f"Bearer {settings.HF_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": image_data.prompt,
            "parameters": image_data.parameters or {},
            "options": {"wait_for_model": True}
        }
    elif image_data.model == 'dall-e-3':
        # Here you would add the logic to call DALL-E 3 API
        # This is a placeholder and needs actual implementation
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="DALL-E 3 model is not yet implemented."
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown model: {image_data.model}"
        )

    try:
        response = requests.post(API_URL, headers=headers, json=payload)

        if response.status_code == 200 and response.headers.get("Content-Type") == "image/jpeg":
            # Save image and record in DB
            # For simplicity, we are returning the image directly. 
            # In a real app, you'd save it to a file/cloud storage and store the URL.
            img_b64 = base64.b64encode(response.content).decode("utf-8")
            
            # Create an entry in the database
            db_image = crud.create_user_image(
                db=db,
                user_id=current_user.id,
                prompt=image_data.prompt,
                image_url=f"data:image/jpeg;base64,{img_b64}", # Storing base64 directly for simplicity
            )
            
            return [schemas.Image.from_orm(db_image)] # Return as a list to match frontend
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error from external API: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calling external API: {str(e)}"
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