/**
 * IndexedDB utility for offline note storage
 * Stores notes locally when offline and syncs when back online
 */

const DB_NAME = 'nexusmind-db';
const DB_VERSION = 1;
const NOTES_STORE = 'pending-notes';

/**
 * Open IndexedDB connection
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store for pending notes
            if (!db.objectStoreNames.contains(NOTES_STORE)) {
                const store = db.createObjectStore(NOTES_STORE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('action', 'action', { unique: false });
            }
        };
    });
}

/**
 * Add a pending note to IndexedDB
 */
export async function addPendingNote(note, action = 'create') {
    try {
        const db = await openDB();
        const transaction = db.transaction([NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE);

        const pendingNote = {
            ...note,
            action, // 'create', 'update', 'delete'
            timestamp: Date.now(),
        };

        await store.add(pendingNote);
        console.log('[IndexedDB] Pending note added:', pendingNote);

        return true;
    } catch (error) {
        console.error('[IndexedDB] Failed to add pending note:', error);
        return false;
    }
}

/**
 * Get all pending notes from IndexedDB
 */
export async function getPendingNotes() {
    try {
        const db = await openDB();
        const transaction = db.transaction([NOTES_STORE], 'readonly');
        const store = transaction.objectStore(NOTES_STORE);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('[IndexedDB] Failed to get pending notes:', error);
        return [];
    }
}

/**
 * Remove a pending note from IndexedDB
 */
export async function removePendingNote(id) {
    try {
        const db = await openDB();
        const transaction = db.transaction([NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE);

        await store.delete(id);
        console.log('[IndexedDB] Pending note removed:', id);

        return true;
    } catch (error) {
        console.error('[IndexedDB] Failed to remove pending note:', error);
        return false;
    }
}

/**
 * Clear all pending notes from IndexedDB
 */
export async function clearPendingNotes() {
    try {
        const db = await openDB();
        const transaction = db.transaction([NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE);

        await store.clear();
        console.log('[IndexedDB] All pending notes cleared');

        return true;
    } catch (error) {
        console.error('[IndexedDB] Failed to clear pending notes:', error);
        return false;
    }
}

/**
 * Get count of pending notes
 */
export async function getPendingNotesCount() {
    try {
        const db = await openDB();
        const transaction = db.transaction([NOTES_STORE], 'readonly');
        const store = transaction.objectStore(NOTES_STORE);

        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('[IndexedDB] Failed to get pending notes count:', error);
        return 0;
    }
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported() {
    return 'indexedDB' in window;
}
