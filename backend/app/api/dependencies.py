from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from jose import JWTError, ExpiredSignatureError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app import crud
from app.models.user import User

ALGORITHM = "HS512"

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

def get_current_user_optional(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> Optional[User]:
    if not authorization:
        return None
    
    token_prefix, _, token = authorization.partition(' ')
    if token_prefix.lower() != 'bearer' or not token:
        return None

    try:
        payload = jwt.decode(token, settings.NEXTAUTH_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        user = crud.get_user(db, user_id=int(user_id))
        if not user:
            return None
            
        return user
    except (JWTError, ExpiredSignatureError):
        # If token is invalid or expired, treat as anonymous user
        return None 