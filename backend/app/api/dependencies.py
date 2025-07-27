from fastapi import Depends, HTTPException, status, Header, Request
from typing import Optional
from jose import JWTError, ExpiredSignatureError, jwt
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.database import get_db
from app import crud
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

# --- KEY CHANGE: Implementing the robust JWT validation logic from your guide ---
def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    try:
        authorization = request.headers.get("Authorization")
        if not authorization:
            logger.info("No Authorization header found, proceeding as anonymous.")
            return None
            
        if not authorization.startswith("Bearer "):
            logger.warning(f"Invalid Authorization header format: {authorization}")
            return None
            
        token = authorization.replace("Bearer ", "")
        
        # Rigorous check for token format
        if not token or len(token.split('.')) != 3:
            logger.error(f"Invalid JWT token format received: {token}")
            return None

        # For debugging: log the first few chars of the key and the token
        if settings.NEXTAUTH_SECRET:
            logger.info(f"Attempting to decode token with key starting with: {settings.NEXTAUTH_SECRET[:4]}...")
            logger.info(f"Received token starting with: {token[:15]}...")
        else:
            logger.error("CRITICAL: NEXTAUTH_SECRET is not loaded in backend settings!")
            return None

        payload = jwt.decode(
            token, 
            settings.NEXTAUTH_SECRET, 
            algorithms=[ALGORITHM]
        )
        
        user_id = payload.get("sub") # NextAuth places user ID in 'sub'
        if not user_id:
            logger.warning(f"No 'sub' (user ID) in JWT payload: {payload}")
            return None
            
        user = crud.user.get(db, id=user_id)
        if not user:
            logger.warning(f"JWT validated but user with id '{user_id}' not found in database.")
            return None
        
        logger.info(f"Successfully authenticated user via JWT: {user.email} (ID: {user.id})")
        return user
        
    except ExpiredSignatureError:
        logger.warning("JWT validation failed: Token has expired.")
        return None
    except JWTError as e:
        # This will catch padding errors, signature errors, etc.
        logger.error(f"JWT validation failed: Token is invalid. Error: {e}", exc_info=True)
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred in get_current_user_optional: {e}", exc_info=True)
        return None 