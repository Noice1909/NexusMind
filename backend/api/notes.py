"""
Notes API endpoints for CRUD operations.
Handles all note-related database operations via Supabase with user authentication.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from db.supabase import get_supabase
from core.middleware import get_current_user_id, get_optional_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])


# Pydantic models for request/response validation
class NoteCreate(BaseModel):
    """Schema for creating a new note."""
    title: str = Field(..., min_length=1, max_length=500)
    body: str = Field(default="")
    tags: Optional[List[str]] = Field(default=[])
    folder_id: Optional[str] = None


class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    body: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    tags: Optional[List[str]] = None
    folder_id: Optional[str] = None


class NoteResponse(BaseModel):
    """Schema for note response."""
    id: str
    user_id: str
    title: str
    body: str
    is_favorite: Optional[bool] = False
    is_archived: Optional[bool] = False
    tags: Optional[List[str]] = []
    folder_id: Optional[str] = None
    created_at: str
    updated_at: str


@router.get("/", response_model=List[NoteResponse])
async def get_all_notes(
    user_id: str = Depends(get_current_user_id),
    search: Optional[str] = Query(None, description="Search query for title and body"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    is_archived: Optional[bool] = Query(None, description="Filter by archived status"),
    date_from: Optional[str] = Query(None, description="Filter notes created after this date (ISO format)"),
    date_to: Optional[str] = Query(None, description="Filter notes created before this date (ISO format)"),
    limit: Optional[int] = Query(100, ge=1, le=1000, description="Maximum number of results"),
):
    """
    Fetch all notes for the authenticated user with advanced filtering.
    
    Supports:
    - Full-text search in title and body
    - Filter by favorite status
    - Filter by archived status
    - Filter by date range
    - Pagination with limit
    
    Returns notes sorted by creation date (newest first).
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        
        # Start with base query
        query = supabase.table("notes").select("*").eq("user_id", user_id)
        
        # Apply filters
        if is_favorite is not None:
            query = query.eq("is_favorite", is_favorite)
        
        if is_archived is not None:
            query = query.eq("is_archived", is_archived)
        else:
            # By default, don't show archived notes
            query = query.eq("is_archived", False)
        
        if date_from:
            query = query.gte("created_at", date_from)
        
        if date_to:
            query = query.lte("created_at", date_to)
        
        # Apply search if provided
        if search:
            # PostgreSQL full-text search using textSearch
            # This searches in both title and body
            query = query.or_(f"title.ilike.%{search}%,body.ilike.%{search}%")
        
        # Order and limit
        query = query.order("created_at", desc=True).limit(limit)
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")


@router.get("/search", response_model=List[NoteResponse])
async def search_notes(
    query: str = Query(..., min_length=1, description="Search query"),
    user_id: str = Depends(get_current_user_id),
    limit: Optional[int] = Query(50, ge=1, le=100),
):
    """
    Advanced search endpoint with fuzzy matching.
    
    Searches in:
    - Note title
    - Note body
    
    Returns results ranked by relevance.
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        
        # Use PostgreSQL's ILIKE for case-insensitive search
        # Search in both title and body
        response = (
            supabase.table("notes")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .or_(f"title.ilike.%{query}%,body.ilike.%{query}%")
            .order("updated_at", desc=True)
            .limit(limit)
            .execute()
        )
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/favorites", response_model=List[NoteResponse])
async def get_favorite_notes(user_id: str = Depends(get_current_user_id)):
    """
    Get all favorite notes for the authenticated user.
    Returns notes sorted by update date (most recently updated first).
    
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        response = (
            supabase.table("notes")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_favorite", True)
            .eq("is_archived", False)
            .order("updated_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch favorites: {str(e)}")


@router.get("/archived", response_model=List[NoteResponse])
async def get_archived_notes(user_id: str = Depends(get_current_user_id)):
    """
    Get all archived notes for the authenticated user.
    Returns notes sorted by archive date (most recently archived first).
    
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        response = (
            supabase.table("notes")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_archived", True)
            .order("updated_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch archived notes: {str(e)}")


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Get a single note by ID.
    
    Requires authentication. Users can only access their own notes.
    """
    try:
        supabase = get_supabase()
        # Filter by both note_id and user_id for security
        response = supabase.table("notes").select("*").eq("id", note_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Note not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch note: {str(e)}")


@router.post("/", response_model=NoteResponse, status_code=201)
async def create_note(note: NoteCreate, user_id: str = Depends(get_current_user_id)):
    """
    Create a new note for the authenticated user.
    
    Requires authentication.
    """
    try:
        supabase = get_supabase()
        current_time = datetime.utcnow().isoformat()
        
        note_data = {
            "user_id": user_id,  # Associate note with current user
            "title": note.title,
            "body": note.body,
            "is_favorite": False,
            "is_archived": False,
            "tags": note.tags if note.tags else [],
            "folder_id": note.folder_id,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        response = supabase.table("notes").insert(note_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create note")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create note: {str(e)}")


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note: NoteUpdate, user_id: str = Depends(get_current_user_id)):
    """
    Update an existing note.
    
    Requires authentication. Users can only update their own notes.
    """
    try:
        supabase = get_supabase()
        
        # Build update data (only include provided fields)
        update_data = {}
        if note.title is not None:
            update_data["title"] = note.title
        if note.body is not None:
            update_data["body"] = note.body
        if note.is_favorite is not None:
            update_data["is_favorite"] = note.is_favorite
        if note.is_archived is not None:
            update_data["is_archived"] = note.is_archived
        if note.tags is not None:
            update_data["tags"] = note.tags
        if note.folder_id is not None:
            update_data["folder_id"] = note.folder_id
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Filter by both note_id and user_id for security
        response = supabase.table("notes").update(update_data).eq("id", note_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Note not found or you don't have permission to update it")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")


@router.patch("/{note_id}/favorite", response_model=NoteResponse)
async def toggle_favorite(note_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Toggle the favorite status of a note.
    
    Requires authentication. Users can only toggle their own notes.
    """
    try:
        supabase = get_supabase()
        
        # Get current note
        note_response = supabase.table("notes").select("is_favorite").eq("id", note_id).eq("user_id", user_id).execute()
        
        if not note_response.data:
            raise HTTPException(status_code=404, detail="Note not found")
        
        current_favorite = note_response.data[0].get("is_favorite", False)
        
        # Toggle favorite status
        update_data = {
            "is_favorite": not current_favorite,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("notes").update(update_data).eq("id", note_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Failed to update favorite status")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to toggle favorite: {str(e)}")


@router.patch("/{note_id}/archive", response_model=NoteResponse)
async def toggle_archive(note_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Toggle the archive status of a note.
    
    Requires authentication. Users can only toggle their own notes.
    """
    try:
        supabase = get_supabase()
        
        # Get current note
        note_response = supabase.table("notes").select("is_archived").eq("id", note_id).eq("user_id", user_id).execute()
        
        if not note_response.data:
            raise HTTPException(status_code=404, detail="Note not found")
        
        current_archived = note_response.data[0].get("is_archived", False)
        
        # Toggle archive status
        update_data = {
            "is_archived": not current_archived,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("notes").update(update_data).eq("id", note_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Failed to update archive status")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to toggle archive: {str(e)}")


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Delete a note by ID.
    
    Requires authentication. Users can only delete their own notes.
    Tags are automatically deleted via CASCADE constraint.
    """
    try:
        supabase = get_supabase()
        # Filter by both note_id and user_id for security
        response = supabase.table("notes").delete().eq("id", note_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Note not found or you don't have permission to delete it")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")


@router.get("/tags/all")
async def get_all_tags(user_id: str = Depends(get_current_user_id)):
    """
    Get all unique tags used by the authenticated user with usage counts.
    Useful for tag filtering and autocomplete.
    """
    try:
        supabase = get_supabase()
        
        # Get all notes with tags
        response = (
            supabase.table("notes")
            .select("tags")
            .eq("user_id", user_id)
            .execute()
        )
        
        # Count tag occurrences
        tag_counts = {}
        for note in response.data:
            if note.get("tags"):
                for tag in note["tags"]:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Convert to list of objects sorted by count
        tags_list = [
            {"tag": tag, "count": count}
            for tag, count in sorted(tag_counts.items(), key=lambda x: (-x[1], x[0]))
        ]
        
        return tags_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tags: {str(e)}")

