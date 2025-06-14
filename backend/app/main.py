from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles

from .config import settings
from . import models, schemas, crud, deps, auth
from .api.api_v1.api import api_router as api_v1_router
from .database import engine, Base

# --- APIRouters ---
login_router = APIRouter()
users_router = APIRouter()
images_router = APIRouter()

# --- Login Endpoints ---
@login_router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    user = auth.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password"
        )
    access_token = auth.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# --- Users Endpoints ---
@users_router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@users_router.get("/me", response_model=schemas.User)
def read_user_me(current_user: models.User = Depends(deps.get_current_active_user)):
    return current_user

# --- Images Endpoints ---
@images_router.get("/history/", response_model=List[schemas.Image])
def get_user_images(
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
):
    images = crud.get_user_images(db, user_id=current_user.id, skip=skip, limit=limit)
    return images


# --- FastAPI App Initialization ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Standalone Routers (Login/User Creation) ---
standalone_router = APIRouter()

@standalone_router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = auth.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@standalone_router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@standalone_router.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(deps.get_current_active_user)):
    return current_user

# --- Include Routers ---
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
app.include_router(standalone_router, prefix=settings.API_V1_STR) # Add user/login routes to /api/v1

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 