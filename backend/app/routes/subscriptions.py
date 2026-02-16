from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.config import get_settings

settings = get_settings()
stripe.api_key = settings.stripe_secret_key

router = APIRouter()


@router.post("/create-checkout-session", response_model=schemas.CheckoutSessionResponse)
def create_checkout_session(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a Stripe checkout session for subscription"""
    try:
        # Create or get Stripe customer
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": current_user.id}
            )
            current_user.stripe_customer_id = customer.id
            db.commit()
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": settings.stripe_price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{settings.frontend_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/subscription/cancel",
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle subscription events
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_id = session.get("customer")
        
        user = db.query(models.User)\
            .filter(models.User.stripe_customer_id == customer_id)\
            .first()
        if user:
            user.is_subscribed = True
            user.subscription_tier = "premium"
            db.commit()
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        
        user = db.query(models.User)\
            .filter(models.User.stripe_customer_id == customer_id)\
            .first()
        if user:
            user.is_subscribed = False
            user.subscription_tier = "free"
            db.commit()
    
    return {"status": "success"}


@router.post("/cancel")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Cancel user subscription"""
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No active subscription")
    
    try:
        # Get active subscriptions
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            status="active"
        )
        
        for sub in subscriptions.data:
            stripe.Subscription.delete(sub.id)
        
        current_user.is_subscribed = False
        current_user.subscription_tier = "free"
        db.commit()
        
        return {"message": "Subscription cancelled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status")
def get_subscription_status(
    current_user: models.User = Depends(get_current_active_user)
):
    """Get current subscription status"""
    return {
        "is_subscribed": current_user.is_subscribed,
        "subscription_tier": current_user.subscription_tier,
        "features": get_tier_features(current_user.subscription_tier)
    }


def get_tier_features(tier: str) -> dict:
    """Get features for subscription tier"""
    features = {
        "free": {
            "stories_per_month": 5,
            "can_download": False,
            "can_generate": False,
            "ad_free": False
        },
        "basic": {
            "stories_per_month": 20,
            "can_download": True,
            "can_generate": False,
            "ad_free": True
        },
        "premium": {
            "stories_per_month": -1,  # Unlimited
            "can_download": True,
            "can_generate": True,
            "ad_free": True
        }
    }
    return features.get(tier, features["free"])
