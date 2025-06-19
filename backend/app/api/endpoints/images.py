import logging
import json
from fastapi import APIRouter, Body, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
import base64
import io
from PIL import Image
from io import BytesIO
import time
import httpx

from tencentcloud.common import credential
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile
from tencentcloud.hunyuan.v20230901 import hunyuan_client, models
from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException

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
    
    # Mapping style attributes to their string representation if they exist
    style_map = {
        'Style': data.style,
        'Color': data.color,
        'Lighting': data.lighting,
        'Composition': data.composition,
        'Aspect Ratio': data.aspect_ratio,
    }

    # Add non-empty values to the prompt
    for key, value in style_map.items():
        if value:
            parts.append(f"{value}")
            
    return ", ".join(filter(None, parts))

@router.post("/generate/", response_class=JSONResponse, summary="Generate Image")
async def generate_image(
    image_in: schemas.ImageCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user_optional),
):
    """
    Generate an image based on the provided prompt using Tencent Cloud Hunyuan API (Advanced).
    This endpoint uses an asynchronous job submission and polling mechanism.
    """
    await verify_turnstile(image_in.turnstile_token)
    try:
        user_id_for_db = current_user.id if current_user else None

        cred = credential.Credential(settings.TENCENT_SECRET_ID, settings.TENCENT_SECRET_KEY)
        http_profile = HttpProfile(endpoint="hunyuan.tencentcloudapi.com")
        client_profile = ClientProfile(httpProfile=http_profile)
        client = hunyuan_client.HunyuanClient(cred, "ap-guangzhou", client_profile)
        
        # Construct the final prompt and parameters for the API call
        final_prompt = construct_prompt(image_in)
        
        params = {
            "Prompt": final_prompt,
            "NegativePrompt": image_in.negative_prompt or "",
            "Style": "Base", # This seems to be a required base style for the API
            "LogoAdd": 0,
        }
        
        # Add image reference if provided
        if image_in.image_b64:
            params["Image"] = image_in.image_b64
            params["Strength"] = image_in.reference_strength if image_in.reference_strength is not None else 0.5

        submit_req = models.SubmitHunyuanImageChatJobRequest()
        submit_req.from_json_string(json.dumps(params))
        
        submit_resp = client.SubmitHunyuanImageChatJob(submit_req)
        job_id = submit_resp.JobId
        logger.info(f"Job submitted successfully. JobId: {job_id}")

        # Polling for Job Result (up to 30 seconds)
        max_wait_time, start_time = 30, time.time()
        while time.time() - start_time < max_wait_time:
            time.sleep(2) # Wait before polling
            describe_req = models.QueryHunyuanImageChatJobRequest()
            describe_req.JobId = job_id
            describe_resp = client.QueryHunyuanImageChatJob(describe_req)
            
            job_status_code = describe_resp.JobStatusCode
            logger.info(f"Polling for job {job_id}. Status: {describe_resp.JobStatusMsg}")

            if job_status_code == "5": # SUCCEED
                if not describe_resp.ResultImage or not describe_resp.ResultImage[0]:
                    raise HTTPException(status_code=500, detail="Image generation succeeded but no image URL was returned.")

                image_url = describe_resp.ResultImage[0]
                
                crud.image.create_with_owner(
                    db=db,
                    prompt=image_in.prompt, 
                    user_id=user_id_for_db,
                    image_url=image_url
                )
                
                return JSONResponse(content={"image": image_url})

            elif job_status_code == "4": # FAILED
                raise HTTPException(status_code=500, detail=f"Image generation job failed: {describe_resp.JobErrorMsg}")

        raise HTTPException(status_code=508, detail="Image generation timed out.")

    except TencentCloudSDKException as e:
        logger.error(f"A Tencent Cloud SDK error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def get_image(image_id: int, db: Session = Depends(get_db)):
    db_image = crud.image.get(db, id=image_id)
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if not db_image.image_data_b64:
        raise HTTPException(status_code=404, detail="Image data not available")

    try:
        image_data = base64.b64decode(db_image.image_data_b64)
        return Response(content=image_data, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error decoding image: {e}")