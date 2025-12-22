"""
AI Service for NexusMind
Handles AI-powered features like tag generation, summarization, and semantic search
Uses Ollama for local LLM inference
"""

import os
import httpx
from typing import List, Dict, Optional
from dotenv import load_dotenv
import re
from collections import Counter
import math

load_dotenv()

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")  # Default model
OLLAMA_EMBEDDING_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")

class AIService:
    """Service for AI-powered features using Ollama"""
    
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = OLLAMA_MODEL
        self.embedding_model = OLLAMA_EMBEDDING_MODEL
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def is_available(self) -> bool:
        """Check if Ollama service is available"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception:
            return False
    
    async def generate_tags(self, title: str, content: str, max_tags: int = 5) -> List[str]:
        """
        Generate relevant tags for a note using Ollama
        
        Args:
            title: Note title
            content: Note content
            max_tags: Maximum number of tags to generate
            
        Returns:
            List of generated tags
        """
        if not await self.is_available():
            return self._fallback_tags(title, content, max_tags)
        
        try:
            prompt = f"""Analyze the following note and generate {max_tags} relevant tags.
The tags should be:
- Single words or short phrases (2-3 words max)
- Descriptive of the main topics
- Useful for categorization and search
- Lowercase

Note Title: {title}
Note Content: {content[:1000]}

Return ONLY the tags as a comma-separated list, nothing else.
Example: python, web development, tutorial, backend, api

Tags:"""
            
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                tags_text = result.get("response", "").strip()
                
                # Parse tags
                tags = [tag.strip().lower() for tag in tags_text.split(',')]
                tags = [tag for tag in tags if tag and len(tag) > 1 and len(tag) < 30]
                
                return tags[:max_tags]
            else:
                return self._fallback_tags(title, content, max_tags)
            
        except Exception as e:
            print(f"Ollama tag generation failed: {e}")
            return self._fallback_tags(title, content, max_tags)
    
    async def summarize_note(self, title: str, content: str, max_length: int = 150) -> str:
        """
        Generate a summary of a note using Ollama
        
        Args:
            title: Note title
            content: Note content
            max_length: Maximum length of summary in words
            
        Returns:
            Generated summary
        """
        if not await self.is_available():
            return self._fallback_summary(content, max_length)
        
        try:
            prompt = f"""Summarize the following note in {max_length} words or less.
The summary should:
- Capture the main points
- Be clear and concise
- Be in the same language as the note
- Start directly with the summary (no "This note is about..." or similar)

Note Title: {title}
Note Content: {content}

Summary:"""
            
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.5,
                        "top_p": 0.9,
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                summary = result.get("response", "").strip()
                
                # Ensure summary isn't too long
                words = summary.split()
                if len(words) > max_length:
                    summary = ' '.join(words[:max_length]) + '...'
                
                return summary
            else:
                return self._fallback_summary(content, max_length)
            
        except Exception as e:
            print(f"Ollama summarization failed: {e}")
            return self._fallback_summary(content, max_length)
    
    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding vector for semantic search using Ollama
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector or None if unavailable
        """
        if not await self.is_available():
            return None
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": self.embedding_model,
                    "prompt": text[:2000],  # Limit text length
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("embedding")
            else:
                return None
            
        except Exception as e:
            print(f"Ollama embedding generation failed: {e}")
            return None
    
    async def semantic_search(self, query: str, notes: List[Dict]) -> List[Dict]:
        """
        Perform semantic search on notes using embeddings
        
        Args:
            query: Search query
            notes: List of notes with embeddings
            
        Returns:
            Sorted list of notes by relevance
        """
        if not await self.is_available():
            return notes  # Return unsorted if AI unavailable
        
        try:
            # Generate query embedding
            query_embedding = await self.generate_embedding(query)
            if not query_embedding:
                return notes
            
            # Calculate similarity scores
            scored_notes = []
            for note in notes:
                if 'embedding' in note and note['embedding']:
                    similarity = self._cosine_similarity(
                        query_embedding,
                        note['embedding']
                    )
                    scored_notes.append({
                        **note,
                        'similarity_score': similarity
                    })
            
            # Sort by similarity score
            scored_notes.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            return scored_notes
            
        except Exception as e:
            print(f"Semantic search failed: {e}")
            return notes
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(b * b for b in vec2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def _fallback_tags(self, title: str, content: str, max_tags: int) -> List[str]:
        """Fallback tag generation using simple keyword extraction"""
        # Combine title and content
        text = f"{title} {content}".lower()
        
        # Remove special characters and split into words
        words = re.findall(r'\b[a-z]{3,}\b', text)
        
        # Common stop words to exclude
        stop_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 
                     'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 
                     'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 
                     'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let',
                     'put', 'say', 'she', 'too', 'use', 'this', 'that', 'with',
                     'have', 'from', 'they', 'will', 'what', 'been', 'more'}
        
        # Filter and count words
        words = [w for w in words if w not in stop_words]
        word_counts = Counter(words)
        
        # Get most common words as tags
        tags = [word for word, count in word_counts.most_common(max_tags)]
        
        return tags[:max_tags]
    
    def _fallback_summary(self, content: str, max_length: int) -> str:
        """Fallback summary using first N words"""
        words = content.split()
        if len(words) <= max_length:
            return content
        
        summary = ' '.join(words[:max_length]) + '...'
        return summary
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global AI service instance
ai_service = AIService()
