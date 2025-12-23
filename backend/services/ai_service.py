"""
AI Service for NexusMind
Supports multiple FREE AI providers: Groq, Ollama (local), and fallback
"""

import os
import re
import httpx
from typing import List, Optional
from textblob import TextBlob
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIService:
    """
    AI Service with multiple provider support
    Priority: Groq (free cloud) > Ollama (local) > Fallback (rule-based)
    """
    
    def __init__(self):
        # Groq API (FREE - 14,400 requests/day)
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_model = "llama-3.1-8b-instant"  # Fast and free
        
        # Ollama (local - optional)
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
        
        # Provider availability
        self._groq_available = None
        self._ollama_available = None
    
    def is_available(self) -> bool:
        """Check if any AI provider is available"""
        return self._check_groq_available() or self._check_ollama_available()
    
    def _check_groq_available(self) -> bool:
        """Check if Groq API is available"""
        if self._groq_available is not None:
            return self._groq_available
        
        if not self.groq_api_key:
            self._groq_available = False
            return False
        
        try:
            # Quick check - just verify API key format
            self._groq_available = len(self.groq_api_key) > 20
            return self._groq_available
        except:
            self._groq_available = False
            return False
    
    def _check_ollama_available(self) -> bool:
        """Check if Ollama is available"""
        if self._ollama_available is not None:
            return self._ollama_available
        
        try:
            response = httpx.get(f"{self.ollama_base_url}/api/tags", timeout=2.0)
            self._ollama_available = response.status_code == 200
            return self._ollama_available
        except:
            self._ollama_available = False
            return False
    
    async def generate_tags(
        self, 
        title: str, 
        content: str, 
        max_tags: int = 5
    ) -> List[str]:
        """
        Generate tags for a note
        Tries: Groq -> Ollama -> Fallback
        """
        # Try Groq first (FREE cloud API)
        if self._check_groq_available():
            try:
                tags = await self._groq_generate_tags(title, content, max_tags)
                if tags:
                    return tags
            except Exception as e:
                print(f"Groq tag generation failed: {e}")
        
        # Try Ollama (local)
        if self._check_ollama_available():
            try:
                tags = await self._ollama_generate_tags(title, content, max_tags)
                if tags:
                    return tags
            except Exception as e:
                print(f"Ollama tag generation failed: {e}")
        
        # Fallback to rule-based
        return self._fallback_generate_tags(title, content, max_tags)
    
    async def _groq_generate_tags(
        self, 
        title: str, 
        content: str, 
        max_tags: int
    ) -> List[str]:
        """Generate tags using Groq API (FREE)"""
        prompt = f"""Generate {max_tags} relevant tags for this note. Return ONLY the tags as a comma-separated list, nothing else.

Title: {title}
Content: {content[:500]}

Tags:"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.groq_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful assistant that generates relevant tags for notes. Return only comma-separated tags, no explanations."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 50
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                tags_text = result["choices"][0]["message"]["content"].strip()
                tags = [tag.strip() for tag in tags_text.split(",")]
                return [tag for tag in tags if tag][:max_tags]
            
            return []
    
    async def _ollama_generate_tags(
        self, 
        title: str, 
        content: str, 
        max_tags: int
    ) -> List[str]:
        """Generate tags using Ollama (local)"""
        prompt = f"""Generate {max_tags} relevant tags for this note. Return ONLY the tags as a comma-separated list.

Title: {title}
Content: {content[:500]}

Tags:"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                tags_text = result["response"].strip()
                tags = [tag.strip() for tag in tags_text.split(",")]
                return [tag for tag in tags if tag][:max_tags]
            
            return []
    
    def _fallback_generate_tags(
        self, 
        title: str, 
        content: str, 
        max_tags: int
    ) -> List[str]:
        """Fallback: Extract keywords using TextBlob"""
        text = f"{title} {content}"
        
        # Extract noun phrases
        blob = TextBlob(text)
        tags = []
        
        # Get noun phrases
        for phrase in blob.noun_phrases:
            if len(phrase.split()) <= 2:  # Max 2 words
                tags.append(phrase)
        
        # Remove duplicates and limit
        tags = list(dict.fromkeys(tags))[:max_tags]
        
        # If not enough tags, add common words
        if len(tags) < max_tags:
            words = text.lower().split()
            common_words = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']
            for word in words:
                if word not in common_words and len(word) > 3:
                    if word not in tags:
                        tags.append(word)
                    if len(tags) >= max_tags:
                        break
        
        return tags[:max_tags]
    
    async def summarize_note(
        self, 
        title: str, 
        content: str, 
        max_length: int = 150
    ) -> str:
        """
        Summarize a note
        Tries: Groq -> Ollama -> Fallback
        """
        # Try Groq first
        if self._check_groq_available():
            try:
                summary = await self._groq_summarize(title, content, max_length)
                if summary:
                    return summary
            except Exception as e:
                print(f"Groq summarization failed: {e}")
        
        # Try Ollama
        if self._check_ollama_available():
            try:
                summary = await self._ollama_summarize(title, content, max_length)
                if summary:
                    return summary
            except Exception as e:
                print(f"Ollama summarization failed: {e}")
        
        # Fallback
        return self._fallback_summarize(title, content, max_length)
    
    async def _groq_summarize(
        self, 
        title: str, 
        content: str, 
        max_length: int
    ) -> str:
        """Summarize using Groq API"""
        prompt = f"""Summarize this note in approximately {max_length} words. Be concise and capture the main points.

Title: {title}
Content: {content}

Summary:"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.groq_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful assistant that creates concise summaries."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.5,
                    "max_tokens": max_length * 2
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
            
            return ""
    
    async def _ollama_summarize(
        self, 
        title: str, 
        content: str, 
        max_length: int
    ) -> str:
        """Summarize using Ollama"""
        prompt = f"""Summarize this note in approximately {max_length} words:

Title: {title}
Content: {content}

Summary:"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["response"].strip()
            
            return ""
    
    def _fallback_summarize(
        self, 
        title: str, 
        content: str, 
        max_length: int
    ) -> str:
        """Fallback: Extract first N words"""
        # Clean content
        content = re.sub(r'\s+', ' ', content).strip()
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', content)
        
        summary = title + ". "
        word_count = len(title.split())
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            sentence_words = len(sentence.split())
            if word_count + sentence_words <= max_length:
                summary += sentence + ". "
                word_count += sentence_words
            else:
                break
        
        return summary.strip()
    
    async def semantic_search(
        self, 
        query: str, 
        notes: List[dict]
    ) -> List[dict]:
        """
        Semantic search using embeddings
        For FREE tier, we'll use simple text matching
        """
        # Simple keyword-based search for free tier
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        results = []
        for note in notes:
            title = note.get('title', '').lower()
            body = note.get('body', '').lower()
            
            # Calculate simple relevance score
            title_matches = sum(1 for word in query_words if word in title)
            body_matches = sum(1 for word in query_words if word in body)
            
            score = (title_matches * 2) + body_matches  # Title matches worth more
            
            if score > 0:
                note['relevance_score'] = score
                results.append(note)
        
        # Sort by relevance
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return results
    
    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for text
        For FREE tier, return None (embeddings not needed for basic search)
        """
        # Embeddings are optional - basic search works without them
        return None


# Singleton instance
ai_service = AIService()
