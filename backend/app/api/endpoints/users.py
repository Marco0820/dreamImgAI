from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import dependencies as deps
from app.models.user import User
import app.schemas as schemas

router = APIRouter()

@router.get("/me", response_model=schemas.UserRead)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    """
    Get current user.
    """
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return current_user 