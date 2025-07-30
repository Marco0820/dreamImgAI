from fastapi import Depends, HTTPException, status, Header, Request
from typing import Optional
from jose import JWTError, ExpiredSignatureError, jwt
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.database import get_db
from app import crud, models, schemas
from app.models.user import User

# --- FIX: Initialize the logger for this module ---
logger = logging.getLogger(__name__)

# --- KEY CHANGE: Use the correct algorithm used by NextAuth.js by default ---
ALGORITHM = "HS256"

# The get_current_user function remains for endpoints that strictly require a user.
# (No changes needed here for now)
def get_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> User:
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing",
        )
    
    token_prefix, _, token = authorization.partition(' ')
    if token_prefix.lower() != 'bearer' or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token scheme. Use 'Bearer <token>'.",
        )

    try:
        # --- CORRECTING THE KEY: Use NEXTAUTH_SECRET which is correctly defined in config.py ---
        payload = jwt.decode(token, settings.NEXTAUTH_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials, user identifier not in token.",
            )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. The token may be invalid or malformed.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.get_user(db, user_id=int(user_id))

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    return user

# --- KEY CHANGE: Prioritize reading user ID from header as per your guide ---
async def get_current_user_optional(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
) -> Optional[models.User]:
    """
    Dependency to get the current user from header information.
    This is an optional dependency; it returns the user if found, or None otherwise.
    It does not raise an exception if the user is not found or headers are missing.
    """
    logging.info("[dependencies.py] Entering get_current_user_optional")
    if not x_user_id:
        logging.info("[dependencies.py] No X-User-Id header found.")
        return None

    logging.info(f"[dependencies.py] Found user ID '{x_user_id}' in X-User-Id header.")

    # The user ID from NextAuth is a string (CUID).
    # We query by the string ID directly.
    user = crud.user.get_by_id_str(db, id=x_user_id)
    if user:
        logging.info(f"[dependencies.py] Successfully found user by string ID: {user.email}")
        return user

    # If user is not found by ID, try to find or create them by email.
    # This is a fallback and helps sync users who might not exist in our DB yet.
    if x_user_email:
        logging.info(f"[dependencies.py] User not found by ID, trying to find or create by email: {x_user_email}")
        user = crud.user.get_by_email(db, email=x_user_email)
        if not user:
            logging.info(f"[dependencies.py] User not found by email, creating a new one.")
            # Use the ID from the header for the new user.
            user_in = schemas.UserCreate(id=x_user_id, email=x_user_email, password="password_placeholder")
            user = crud.user.create_with_id(db, obj_in=user_in)
            logging.info(f"[dependencies.py] Created new user: {user.email} with ID {user.id}")
        else:
            logging.info(f"[dependencies.py] Found existing user by email: {user.email}")
        return user
        
    logging.warning(f"[dependencies.py] Could not authenticate user with ID '{x_user_id}'. Returning None.")
    return None 