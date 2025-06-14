import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app import deps
from app.config import settings

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_API_KEY

@router.post("/create-checkout-session", response_model=schemas.CheckoutSession)
async def create_checkout_session(
    session_create: schemas.CheckoutSessionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
):
    """
    Create a Stripe Checkout session for a user to subscribe to a plan.
    """
    stripe_customer_id = current_user.stripe_customer_id

    # Create a new Stripe customer if one doesn't exist
    if not stripe_customer_id:
        try:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.username,
                metadata={"user_id": current_user.id}
            )
            stripe_customer_id = customer.id
            # Update user model with the new stripe_customer_id
            crud.update_user_stripe_customer_id(db, user_id=current_user.id, stripe_customer_id=stripe_customer_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create Stripe customer: {str(e)}")


    try:
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': session_create.priceId,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{settings.FRONTEND_URL}/profile?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pricing?canceled=true",
            metadata={
                "user_id": str(current_user.id) # Ensure metadata values are strings
            }
        )
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(deps.get_db)):
    """
    Handle webhooks from Stripe.
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get("metadata", {}).get("user_id")
        stripe_subscription_id = session.get("subscription")
        
        if not user_id or not stripe_subscription_id:
             raise HTTPException(status_code=400, detail="Webhook error: Missing user_id or subscription_id")
        
        # Retrieve subscription details from Stripe
        try:
            sub_details = stripe.Subscription.retrieve(stripe_subscription_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not retrieve subscription from Stripe: {str(e)}")
        
        # Find the plan in our DB
        stripe_price_id = sub_details['items']['data'][0]['price']['id']
        plan = crud.get_plan_by_stripe_price_id(db, stripe_price_id=stripe_price_id)

        if not plan:
            raise HTTPException(status_code=404, detail=f"Plan with stripe_price_id {stripe_price_id} not found.")

        # Create or update the user's subscription in our DB
        crud.create_or_update_subscription(db, user_id=int(user_id), plan_id=plan.id, sub_details=sub_details)

    elif event['type'] in ['customer.subscription.updated', 'customer.subscription.deleted']:
        sub_details = event['data']['object']
        stripe_subscription_id = sub_details['id']
        new_status = sub_details['status']
        period_end = sub_details['current_period_end']

        # Update subscription status in our DB
        crud.update_subscription_status(db, stripe_subscription_id=stripe_subscription_id, new_status=new_status, period_end=period_end)
        
    else:
        print('Unhandled event type {}'.format(event['type']))

    return {"status": "success"} 