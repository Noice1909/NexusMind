"""
Authentication API endpoints for user signup, login, and token management.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import timedelta
from core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from core.middleware import get_current_user, get_current_user_id
from db.supabase import get_supabase_client
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================
# Request/Response Models
# ============================================

class SignupRequest(BaseModel):
    """Schema for user signup request."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)


class LoginRequest(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60  # in seconds


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user information response."""
    id: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    created_at: str


class MessageResponse(BaseModel):
    """Schema for simple message response."""
    message: str


class ChangePasswordRequest(BaseModel):
    """Schema for change password request."""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8, max_length=100)


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)



# ============================================
# Authentication Endpoints
# ============================================

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """
    Register a new user account.
    
    Creates a new user with email and password, generates JWT tokens.
    """
    supabase = get_supabase_client()
    
    try:
        # Check if user already exists
        existing = supabase.table("user_profiles").select("email").eq("email", request.email).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate user ID and hash password
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(request.password)
        
        # Create user profile
        user_data = {
            "id": user_id,
            "email": request.email,
            "full_name": request.full_name,
            "password_hash": hashed_password,
            "avatar_url": None,
            "preferences": {}
        }
        
        # Note: In production, you would use Supabase Auth API
        # For now, we're storing users in user_profiles table
        # This is a simplified version - Supabase Auth is recommended
        
        response = supabase.table("user_profiles").insert(user_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user_id, "email": request.email})
        refresh_token = create_refresh_token(data={"sub": user_id})
        
        # Send welcome email (async, don't block signup)
        try:
            from core.email_service import email_service
            email_service.send_welcome_email(request.email, request.full_name)
        except Exception as e:
            # Log error but don't fail signup
            print(f"Failed to send welcome email: {str(e)}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return JWT tokens.
    
    Validates email and password, returns access and refresh tokens.
    """
    supabase = get_supabase_client()
    
    try:
        # Get user by email
        response = supabase.table("user_profiles").select("*").eq("email", request.email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = response.data[0]
        
        # Verify password
        if not verify_password(request.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
        refresh_token = create_refresh_token(data={"sub": user["id"]})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh an access token using a refresh token.
    
    Validates refresh token and generates new access and refresh tokens.
    """
    try:
        # Verify refresh token
        payload = verify_token(request.refresh_token, token_type="refresh")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user to include email in new token
        supabase = get_supabase_client()
        response = supabase.table("user_profiles").select("email").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_email = response.data[0]["email"]
        
        # Generate new tokens
        access_token = create_access_token(data={"sub": user_id, "email": user_email})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    
    Requires valid JWT access token.
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        avatar_url=current_user.get("avatar_url"),
        created_at=current_user["created_at"]
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user_id: str = Depends(get_current_user_id)):
    """
    Logout current user.
    
    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the tokens. This endpoint is for logging purposes.
    """
    # In a production app, you might want to:
    # 1. Add token to a blacklist
    # 2. Log the logout event
    # 3. Invalidate refresh tokens in database
    
    return MessageResponse(message="Successfully logged out")


class UpdateProfileRequest(BaseModel):
    """Schema for profile update request."""
    full_name: Optional[str] = Field(None, max_length=100)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user's profile information.
    
    Allows updating full_name. Email cannot be changed.
    """
    supabase = get_supabase_client()
    
    try:
        # Prepare update data
        update_data = {}
        if request.full_name is not None:
            update_data["full_name"] = request.full_name
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update profile
        response = supabase.table("user_profiles").update(
            update_data
        ).eq("id", current_user["id"]).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )
        
        updated_user = response.data[0]
        
        return UserResponse(
            id=updated_user["id"],
            email=updated_user["email"],
            full_name=updated_user.get("full_name"),
            avatar_url=updated_user.get("avatar_url"),
            created_at=updated_user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {str(e)}"
        )



@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Change user's password.
    
    Requires current password for verification.
    """
    supabase = get_supabase_client()
    
    try:
        # Verify current password
        if not verify_password(request.current_password, current_user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_password_hash = get_password_hash(request.new_password)
        
        # Update password
        response = supabase.table("user_profiles").update({
            "password_hash": new_password_hash
        }).eq("id", current_user["id"]).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        return MessageResponse(message="Password changed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Send password reset email to user.
    
    Generates a password reset token and sends it via email.
    """
    supabase = get_supabase_client()
    
    try:
        # Check if user exists
        response = supabase.table("user_profiles").select("id, email").eq("email", request.email).execute()
        
        if not response.data or len(response.data) == 0:
            # Don't reveal if email exists or not for security
            return MessageResponse(message="If that email exists, a password reset link has been sent")
        
        user = response.data[0]
        
        # Generate password reset token (valid for 1 hour)
        reset_token = create_access_token(
            data={"sub": user["id"], "email": user["email"], "type": "password_reset"},
            expires_delta=timedelta(hours=1)
        )
        
        # Send email with reset link
        from core.email_service import email_service
        email_sent = email_service.send_password_reset_email(user["email"], reset_token)
        
        if not email_sent:
            # Log the token for development if email fails
            print(f"⚠️ Email failed. Password reset token for {user['email']}: {reset_token}")
            print(f"Reset link: http://localhost:5173/reset-password?token={reset_token}")
        
        return MessageResponse(message="If that email exists, a password reset link has been sent")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset user's password using reset token.
    
    Validates the reset token and updates the password.
    """
    supabase = get_supabase_client()
    
    try:
        # Verify reset token
        payload = verify_token(request.token)
        
        # Check if token is a password reset token
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid reset token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid reset token"
            )
        
        # Hash new password
        new_password_hash = get_password_hash(request.new_password)
        
        # Update password
        response = supabase.table("user_profiles").update({
            "password_hash": new_password_hash
        }).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reset password"
            )
        
        return MessageResponse(message="Password reset successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )

