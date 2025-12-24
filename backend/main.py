"""
NexusMind FastAPI Backend
AI-Powered Markdown Wiki API Server

This is the main entry point for the FastAPI application.
Configures CORS, routes, and auto-generated documentation.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api import notes, ai, auth, folders

# Initialize FastAPI app with metadata
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    docs_url="/docs",  # Swagger UI at /docs
    redoc_url="/redoc",  # ReDoc at /redoc
)

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://nexusmind-five.vercel.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Security Headers Middleware
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Enable XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' http://localhost:* https:;"
        )
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (formerly Feature Policy)
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=()"
        )
        
        return response

app.add_middleware(SecurityHeadersMiddleware)


# Include API routers
app.include_router(auth.router)  # Authentication routes
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(folders.router)  # Folders routes


@app.get("/", tags=["Root"])
async def root():
    """
    Health check endpoint.
    Confirms the API is running and accessible.
    """
    return {
        "message": "NexusMind API is running",
        "version": settings.api_version,
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """
    Detailed health check endpoint.
    """
    try:
        # Test Supabase connection
        from db.supabase import get_supabase
        supabase = get_supabase()
        
        return {
            "status": "healthy",
            "database": "connected",
            "api_version": settings.api_version
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "disconnected",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
