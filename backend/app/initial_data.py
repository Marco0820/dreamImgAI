import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import (
    User,
    Plan,
    Subscription,
    Image,
    SharedImage,
    Comment,
    Favorite,
)
from app.database import Base
from app.schemas import PlanCreate
from app.crud import create_plan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But for development and quick starts, this is fine
    logger.info("Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")

    # Check if plans already exist
    if db.query(Plan).first():
        logger.info("Plans already exist. Skipping creation.")
    else:
        logger.info("Creating initial plans...")
        plans = [
            PlanCreate(
                name="Free",
                description="Basic features for everyone.",
                price=0,
                features={"generations": 10, "community_access": True},
                stripe_price_id="price_free_tier" # Example ID, replace with your actual Stripe Price ID
            ),
            PlanCreate(
                name="Pro",
                description="Advanced features for professionals.",
                price=1500, # $15.00
                features={"generations": 500, "community_access": True, "priority_support": True},
                stripe_price_id="price_pro_tier" # Example ID, replace with your actual Stripe Price ID
            ),
            PlanCreate(
                name="Premium",
                description="Unlimited access and all features.",
                price=3000, # $30.00
                features={"generations": -1, "community_access": True, "priority_support": True, "api_access": True}, # -1 for unlimited
                stripe_price_id="price_premium_tier" # Example ID, replace with your actual Stripe Price ID
            )
        ]

        for plan_in in plans:
            create_plan(db, plan_in)
        
        logger.info("Initial plans created.")


def main() -> None:
    logger.info("Creating initial data...")
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    logger.info("Initial data created.")


if __name__ == "__main__":
    main() 