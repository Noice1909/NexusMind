/**
 * API client for NexusMind backend
 * Handles all HTTP requests to FastAPI endpoints with enhanced error handling
 */

import { retryWithBackoff } from './errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexusmind.onrender.com';

class ApiClient {
    /**
     * Get the authentication token from localStorage
     */
    getAuthToken() {
        return localStorage.getItem('access_token');
    }

    /**
     * Make an authenticated request to the API with retry logic
     */
    async request(endpoint, options = {}, shouldRetry = true) {
        const makeRequest = async () => {
            const url = `${API_BASE_URL}${endpoint}`;
            const token = this.getAuthToken();

            // Build headers with authentication
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };

            // Add Authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                headers,
                ...options,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    detail: `Request failed with status ${response.status}`
                }));

                // Create detailed error object
                const errorMessage = error.detail || `HTTP ${response.status}`;
                const err = new Error(errorMessage);
                err.status = response.status;
                err.response = error;

                throw err;
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        };

        try {
            // Use retry logic for GET requests and non-authentication endpoints
            if (shouldRetry && (options.method === 'GET' || !options.method)) {
                return await retryWithBackoff(makeRequest);
            }

            return await makeRequest();
        } catch (error) {
            console.error(`API Error at ${endpoint}:`, error);
            throw error;
        }
    }

    // Notes endpoints
    async getNotes(filters = {}) {
        // Build query string from filters
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.is_favorite !== undefined) params.append('is_favorite', filters.is_favorite);
        if (filters.is_archived !== undefined) params.append('is_archived', filters.is_archived);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const endpoint = queryString ? `/notes/?${queryString}` : '/notes/';

        return this.request(endpoint);
    }

    async searchNotes(query, limit = 50) {
        const params = new URLSearchParams({ query, limit });
        return this.request(`/notes/search?${params.toString()}`);
    }

    async getFavoriteNotes() {
        return this.request('/notes/favorites');
    }

    async getArchivedNotes() {
        return this.request('/notes/archived');
    }

    async getNote(id) {
        return this.request(`/notes/${id}`);
    }

    async createNote(title, body, tags = [], folderId = null) {
        return this.request('/notes/', {
            method: 'POST',
            body: JSON.stringify({ title, body, tags, folder_id: folderId }),
        }, false); // Don't retry POST requests
    }

    async updateNote(id, updates) {
        return this.request(`/notes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }, false);
    }

    async toggleFavorite(id) {
        return this.request(`/notes/${id}/favorite`, {
            method: 'PATCH',
        }, false);
    }

    async toggleArchive(id) {
        return this.request(`/notes/${id}/archive`, {
            method: 'PATCH',
        }, false);
    }

    async deleteNote(id) {
        return this.request(`/notes/${id}`, {
            method: 'DELETE',
        }, false);
    }

    // AI endpoints
    async getAIStatus() {
        return this.request('/ai/status', {
            method: 'GET',
        }, false);
    }

    async generateTags(title, content, maxTags = 5) {
        return this.request('/ai/generate-tags', {
            method: 'POST',
            body: JSON.stringify({ title, content, max_tags: maxTags }),
        }, false);
    }

    async summarizeNote(title, content, maxLength = 150) {
        return this.request('/ai/summarize', {
            method: 'POST',
            body: JSON.stringify({ title, content, max_length: maxLength }),
        }, false);
    }

    async semanticSearch(query, limit = 10) {
        return this.request('/ai/semantic-search', {
            method: 'POST',
            body: JSON.stringify({ query, limit }),
        }, false);
    }

    async generateEmbedding(noteId) {
        return this.request(`/ai/generate-embedding/${noteId}`, {
            method: 'POST',
        }, false);
    }

    async batchGenerateEmbeddings() {
        return this.request('/ai/batch-generate-embeddings', {
            method: 'POST',
        }, false);
    }

    // Folders endpoints
    async getFolders() {
        return this.request('/folders/');
    }

    async getFolderHierarchy() {
        return this.request('/folders/hierarchy');
    }

    async getFoldersWithCounts() {
        return this.request('/folders/with-counts');
    }

    async getFolder(id) {
        return this.request(`/folders/${id}`);
    }

    async createFolder(name, description = null, color = '#8b5cf6', icon = '📁', parentFolderId = null, position = 0) {
        return this.request('/folders/', {
            method: 'POST',
            body: JSON.stringify({
                name,
                description,
                color,
                icon,
                parent_folder_id: parentFolderId,
                position
            }),
        }, false);
    }

    async updateFolder(id, updates) {
        return this.request(`/folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }, false);
    }

    async deleteFolder(id) {
        return this.request(`/folders/${id}`, {
            method: 'DELETE',
        }, false);
    }

    async getFolderNotes(folderId) {
        return this.request(`/folders/${folderId}/notes`);
    }

    // Tags endpoints
    async getAllTags() {
        return this.request('/notes/tags/all');
    }

    async updateNoteTags(id, tags) {
        return this.request(`/notes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ tags }),
        }, false);
    }

    async updateNoteFolder(id, folderId) {
        return this.request(`/notes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ folder_id: folderId }),
        }, false);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

export const api = new ApiClient();

