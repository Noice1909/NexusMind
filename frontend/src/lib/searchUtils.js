/**
 * Utility function to highlight search terms in text
 * @param {string} text - The text to search in
 * @param {string} searchQuery - The search term to highlight
 * @returns {Array} - Array of text segments with highlight flags
 */
export function highlightText(text, searchQuery) {
    if (!searchQuery || !text) {
        return [{ text, highlight: false }];
    }

    const parts = [];
    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
    const segments = text.split(regex);

    segments.forEach((segment, index) => {
        if (segment) {
            const isMatch = regex.test(segment);
            parts.push({
                text: segment,
                highlight: isMatch || segment.toLowerCase() === searchQuery.toLowerCase()
            });
        }
    });

    return parts.length > 0 ? parts : [{ text, highlight: false }];
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search History Manager
 * Manages recent search queries with localStorage persistence
 */
class SearchHistoryManager {
    constructor(maxItems = 10) {
        this.maxItems = maxItems;
        this.storageKey = 'nexusmind_search_history';
    }

    /**
     * Get all search history
     */
    getHistory() {
        try {
            const history = localStorage.getItem(this.storageKey);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load search history:', error);
            return [];
        }
    }

    /**
     * Add a search query to history
     */
    addToHistory(query) {
        if (!query || query.trim().length === 0) {
            return;
        }

        try {
            let history = this.getHistory();

            // Remove duplicate if exists
            history = history.filter(item => item.toLowerCase() !== query.toLowerCase());

            // Add to beginning
            history.unshift(query.trim());

            // Limit to max items
            if (history.length > this.maxItems) {
                history = history.slice(0, this.maxItems);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }

    /**
     * Clear all search history
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear search history:', error);
        }
    }

    /**
     * Remove a specific item from history
     */
    removeFromHistory(query) {
        try {
            let history = this.getHistory();
            history = history.filter(item => item !== query);
            localStorage.setItem(this.storageKey, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to remove from search history:', error);
        }
    }
}

export const searchHistory = new SearchHistoryManager();
