"""
AI API endpoints for NexusMind
Provides AI-powered features like tag generation, summarization, and semantic search
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from core.middleware import get_current_user_id
from services.ai_service import ai_service
from db.supabase import get_supabase

router = APIRouter(prefix="/ai", tags=["ai"])

# Request/Response Models
class GenerateTagsRequest(BaseModel):
    title: str
    content: str
    max_tags: Optional[int] = 5

class GenerateTagsResponse(BaseModel):
    tags: List[str]
    source: str  # "ai" or "fallback"

class SummarizeRequest(BaseModel):
    title: str
    content: str
    max_length: Optional[int] = 150

class SummarizeResponse(BaseModel):
    summary: str
    source: str  # "ai" or "fallback"

class SemanticSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

class SemanticSearchResponse(BaseModel):
    results: List[dict]
    query: str

@router.get("/status")
async def get_ai_status():
    """
    Check if AI service is available
    """
    return {
        "available": ai_service.is_available(),
        "provider": "gemini" if ai_service.is_available() else "fallback"
    }

@router.post("/generate-tags", response_model=GenerateTagsResponse)
async def generate_tags(
    request: GenerateTagsRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate tags for a note using AI
    
    Requires authentication.
    """
    try:
        tags = await ai_service.generate_tags(
            title=request.title,
            content=request.content,
            max_tags=request.max_tags
        )
        
        source = "ai" if ai_service.is_available() else "fallback"
        
        return GenerateTagsResponse(tags=tags, source=source)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate tags: {str(e)}"
        )

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_note(
    request: SummarizeRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate a summary for a note using AI
    
    Requires authentication.
    """
    try:
        summary = await ai_service.summarize_note(
            title=request.title,
            content=request.content,
            max_length=request.max_length
        )
        
        source = "ai" if ai_service.is_available() else "fallback"
        
        return SummarizeResponse(summary=summary, source=source)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )

@router.post("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Perform semantic search on user's notes
    
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        
        # Fetch user's notes
        response = supabase.table("notes")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        notes = response.data
        
        # Perform semantic search
        results = await ai_service.semantic_search(
            query=request.query,
            notes=notes
        )
        
        # Limit results
        results = results[:request.limit]
        
        # Remove embedding from response (too large)
        for result in results:
            result.pop('embedding', None)
        
        return SemanticSearchResponse(
            results=results,
            query=request.query
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Semantic search failed: {str(e)}"
        )

@router.post("/generate-embedding/{note_id}")
async def generate_embedding(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate and store embedding for a note
    
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        
        # Fetch note
        response = supabase.table("notes")\
            .select("*")\
            .eq("id", note_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        note = response.data
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Generate embedding
        text = f"{note['title']} {note['body']}"
        embedding = await ai_service.generate_embedding(text)
        
        if embedding:
            # Store embedding in database
            supabase.table("notes")\
                .update({"embedding": embedding})\
                .eq("id", note_id)\
                .execute()
            
            return {
                "success": True,
                "note_id": note_id,
                "embedding_size": len(embedding)
            }
        else:
            return {
                "success": False,
                "note_id": note_id,
                "error": "AI service unavailable"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embedding: {str(e)}"
        )

@router.post("/batch-generate-embeddings")
async def batch_generate_embeddings(
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate embeddings for all user's notes
    
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        
        # Fetch all user's notes without embeddings
        response = supabase.table("notes")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        notes = response.data
        
        success_count = 0
        failed_count = 0
        
        for note in notes:
            try:
                text = f"{note['title']} {note['body']}"
                embedding = await ai_service.generate_embedding(text)
                
                if embedding:
                    supabase.table("notes")\
                        .update({"embedding": embedding})\
                        .eq("id", note['id'])\
                        .execute()
                    success_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                print(f"Failed to generate embedding for note {note['id']}: {e}")
                failed_count += 1
        
        return {
            "success": True,
            "total_notes": len(notes),
            "success_count": success_count,
            "failed_count": failed_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch embedding generation failed: {str(e)}"
        )
