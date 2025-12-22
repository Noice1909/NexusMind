"""
Supabase client configuration and database utilities.
"""
from supabase import create_client, Client
from core.config import settings


class SupabaseClient:
    """Singleton Supabase client wrapper."""
    
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance using service role key."""
        if cls._instance is None:
            if not settings.supabase_url:
                raise ValueError(
                    "Supabase URL not found. "
                    "Please set SUPABASE_URL in .env file."
                )
            
            # Use service key if available (production), otherwise anon key (development)
            key = settings.supabase_service_key or settings.supabase_key
            
            if not key:
                raise ValueError(
                    "Supabase credentials not found. "
                    "Please set SUPABASE_SERVICE_KEY or SUPABASE_KEY in .env file."
                )
            
            cls._instance = create_client(
                settings.supabase_url,
                key
            )
        return cls._instance


# Convenience function for getting client
def get_supabase() -> Client:
    """Get Supabase client instance."""
    return SupabaseClient.get_client()


# Alias for compatibility
def get_supabase_client() -> Client:
    """Get Supabase client instance (alias for get_supabase)."""
    return get_supabase()
