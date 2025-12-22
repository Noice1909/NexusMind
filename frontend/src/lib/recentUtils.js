/**
 * Recently Viewed Notes Utility
 * Tracks and manages recently viewed notes in localStorage
 */

const RECENT_NOTES_KEY = 'nexusmind-recent-notes';
const MAX_RECENT_NOTES = 10;

/**
 * Add a note to recently viewed
 */
export function addToRecentlyViewed(noteId) {
    try {
        const recent = getRecentlyViewed();

        // Remove if already exists
        const filtered = recent.filter(id => id !== noteId);

        // Add to beginning
        filtered.unshift(noteId);

        // Limit to MAX_RECENT_NOTES
        const limited = filtered.slice(0, MAX_RECENT_NOTES);

        localStorage.setItem(RECENT_NOTES_KEY, JSON.stringify(limited));
    } catch (error) {
        console.error('Failed to add to recently viewed:', error);
    }
}

/**
 * Get recently viewed note IDs
 */
export function getRecentlyViewed() {
    try {
        const stored = localStorage.getItem(RECENT_NOTES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get recently viewed:', error);
        return [];
    }
}

/**
 * Clear recently viewed notes
 */
export function clearRecentlyViewed() {
    try {
        localStorage.removeItem(RECENT_NOTES_KEY);
    } catch (error) {
        console.error('Failed to clear recently viewed:', error);
    }
}

/**
 * Check if a note is in recently viewed
 */
export function isRecentlyViewed(noteId) {
    const recent = getRecentlyViewed();
    return recent.includes(noteId);
}

/**
 * Saved Searches Utility
 * Manages saved search queries in localStorage
 */

const SAVED_SEARCHES_KEY = 'nexusmind-saved-searches';

/**
 * Save a search query
 */
export function saveSearch(query, name = null) {
    try {
        const searches = getSavedSearches();

        // Check if already exists
        const exists = searches.find(s => s.query === query);
        if (exists) {
            return false;
        }

        const newSearch = {
            id: Date.now().toString(),
            query,
            name: name || query,
            savedAt: new Date().toISOString(),
        };

        searches.push(newSearch);
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
        return true;
    } catch (error) {
        console.error('Failed to save search:', error);
        return false;
    }
}

/**
 * Get all saved searches
 */
export function getSavedSearches() {
    try {
        const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get saved searches:', error);
        return [];
    }
}

/**
 * Delete a saved search
 */
export function deleteSavedSearch(id) {
    try {
        const searches = getSavedSearches();
        const filtered = searches.filter(s => s.id !== id);
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Failed to delete saved search:', error);
        return false;
    }
}

/**
 * Clear all saved searches
 */
export function clearSavedSearches() {
    try {
        localStorage.removeItem(SAVED_SEARCHES_KEY);
    } catch (error) {
        console.error('Failed to clear saved searches:', error);
    }
}

/**
 * Update a saved search name
 */
export function updateSavedSearchName(id, newName) {
    try {
        const searches = getSavedSearches();
        const search = searches.find(s => s.id === id);
        if (search) {
            search.name = newName;
            localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to update saved search:', error);
        return false;
    }
}
