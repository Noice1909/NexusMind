"""
Folders API endpoints for organizing notes.
Handles folder CRUD operations with hierarchical support.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from db.supabase import get_supabase
from core.middleware import get_current_user_id

router = APIRouter(prefix="/folders", tags=["Folders"])


# Pydantic models
class FolderCreate(BaseModel):
    """Schema for creating a new folder."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = "#8b5cf6"
    icon: Optional[str] = "📁"
    parent_folder_id: Optional[str] = None
    position: Optional[int] = 0


class FolderUpdate(BaseModel):
    """Schema for updating a folder."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_folder_id: Optional[str] = None
    position: Optional[int] = None


class FolderResponse(BaseModel):
    """Schema for folder response."""
    id: str
    user_id: str
    name: str
    description: Optional[str]
    color: str
    icon: str
    parent_folder_id: Optional[str]
    position: int
    created_at: str
    updated_at: str


class FolderWithNotes(FolderResponse):
    """Schema for folder with note count."""
    note_count: int


@router.get("/", response_model=List[FolderResponse])
async def get_all_folders(user_id: str = Depends(get_current_user_id)):
    """
    Get all folders for the authenticated user.
    Returns folders sorted by position.
    """
    try:
        supabase = get_supabase()
        response = (
            supabase.table("folders")
            .select("*")
            .eq("user_id", user_id)
            .order("position")
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folders: {str(e)}")


@router.get("/hierarchy")
async def get_folder_hierarchy(user_id: str = Depends(get_current_user_id)):
    """
    Get folder hierarchy for the authenticated user.
    Returns folders in tree structure with levels.
    """
    try:
        supabase = get_supabase()
        
        # Call the SQL function
        response = supabase.rpc("get_folder_hierarchy", {"p_user_id": user_id}).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folder hierarchy: {str(e)}")


@router.get("/with-counts", response_model=List[FolderWithNotes])
async def get_folders_with_counts(user_id: str = Depends(get_current_user_id)):
    """
    Get all folders with note counts.
    Useful for displaying folder statistics.
    """
    try:
        supabase = get_supabase()
        
        # Get folders
        folders_response = (
            supabase.table("folders")
            .select("*")
            .eq("user_id", user_id)
            .order("position")
            .execute()
        )
        
        folders = folders_response.data
        
        # Get note counts for each folder
        for folder in folders:
            notes_response = (
                supabase.table("notes")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .eq("folder_id", folder["id"])
                .execute()
            )
            folder["note_count"] = notes_response.count or 0
        
        return folders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folders with counts: {str(e)}")


@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(folder_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Get a single folder by ID.
    """
    try:
        supabase = get_supabase()
        response = (
            supabase.table("folders")
            .select("*")
            .eq("id", folder_id)
            .eq("user_id", user_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folder: {str(e)}")


@router.post("/", response_model=FolderResponse, status_code=201)
async def create_folder(folder: FolderCreate, user_id: str = Depends(get_current_user_id)):
    """
    Create a new folder for the authenticated user.
    """
    try:
        supabase = get_supabase()
        current_time = datetime.utcnow().isoformat()
        
        folder_data = {
            "user_id": user_id,
            "name": folder.name,
            "description": folder.description,
            "color": folder.color,
            "icon": folder.icon,
            "parent_folder_id": folder.parent_folder_id,
            "position": folder.position,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        response = supabase.table("folders").insert(folder_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create folder")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str,
    folder: FolderUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update an existing folder.
    """
    try:
        supabase = get_supabase()
        
        # Build update data
        update_data = {}
        if folder.name is not None:
            update_data["name"] = folder.name
        if folder.description is not None:
            update_data["description"] = folder.description
        if folder.color is not None:
            update_data["color"] = folder.color
        if folder.icon is not None:
            update_data["icon"] = folder.icon
        if folder.parent_folder_id is not None:
            update_data["parent_folder_id"] = folder.parent_folder_id
        if folder.position is not None:
            update_data["position"] = folder.position
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = (
            supabase.table("folders")
            .update(update_data)
            .eq("id", folder_id)
            .eq("user_id", user_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update folder: {str(e)}")


@router.delete("/{folder_id}", status_code=204)
async def delete_folder(folder_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Delete a folder by ID.
    Notes in the folder will have their folder_id set to NULL.
    """
    try:
        supabase = get_supabase()
        
        response = (
            supabase.table("folders")
            .delete()
            .eq("id", folder_id)
            .eq("user_id", user_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete folder: {str(e)}")


@router.get("/{folder_id}/notes")
async def get_folder_notes(folder_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Get all notes in a specific folder.
    """
    try:
        supabase = get_supabase()
        
        response = (
            supabase.table("notes")
            .select("*")
            .eq("user_id", user_id)
            .eq("folder_id", folder_id)
            .eq("is_archived", False)
            .order("updated_at", desc=True)
            .execute()
        )
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folder notes: {str(e)}")
