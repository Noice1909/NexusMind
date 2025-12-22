import { FileText, Plus, Search, Sparkles, Trash2, ChevronDown, X, Star, Archive, Filter, Clock, Bookmark, SlidersHorizontal, Folder, FolderPlus, Edit2, Tag } from 'lucide-react';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import Fuse from 'fuse.js';
import { noteTemplates } from '../lib/noteTemplates';
import { searchHistory } from '../lib/searchUtils';
import { addToRecentlyViewed, getRecentlyViewed, getSavedSearches, saveSearch, deleteSavedSearch } from '../lib/recentUtils';
import { countWords } from '../lib/noteUtils';
import HighlightedText from './HighlightedText';
import FolderModal from './FolderModal';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const Sidebar = forwardRef(({ notes, selectedNote, onSelectNote, onNewNote, onDeleteNote, onToggleFavorite, onToggleArchive, isOpen, onClose, folders = [], onFoldersChange, availableTags = [] }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'favorites', 'archived', 'recent', 'folder:id'
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [wordCountFilter, setWordCountFilter] = useState({ min: 0, max: Infinity });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [showFolders, setShowFolders] = useState(true);
    const [showTagFilter, setShowTagFilter] = useState(false);
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);
    const templateDropdownRef = useRef(null);
    const searchHistoryDropdownRef = useRef(null);
    const advancedFiltersRef = useRef(null);

    // Load search history, saved searches, and recently viewed on mount
    useEffect(() => {
        setRecentSearches(searchHistory.getHistory());
    }, []);

    // Debounced search history save
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            // Clear existing timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Set new timeout to save after 1 second of inactivity
            searchTimeoutRef.current = setTimeout(() => {
                searchHistory.addToHistory(searchQuery);
                setRecentSearches(searchHistory.getHistory());
            }, 1000);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Click outside handler for template dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target)) {
                setShowTemplates(false);
            }
        };

        if (showTemplates) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showTemplates]);

    // Click outside handler for search history dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchHistoryDropdownRef.current && !searchHistoryDropdownRef.current.contains(event.target)) {
                setShowSearchHistory(false);
            }
        };

        if (showSearchHistory) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSearchHistory]);

    // Configure Fuse.js for fuzzy search
    const fuse = useMemo(() => {
        const options = {
            keys: ['title', 'body'],
            threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
            distance: 100, // Maximum distance for a match
            minMatchCharLength: 2,
            includeScore: true,
            useExtendedSearch: false,
        };
        return new Fuse(notes, options);
    }, [notes]);

    // Filter notes with fuzzy search, word count, and recently viewed
    const filteredNotes = useMemo(() => {
        let results = notes;

        // Apply fuzzy search if query exists
        if (searchQuery.trim()) {
            const fuseResults = fuse.search(searchQuery);
            results = fuseResults.map(result => result.item);
        }

        // Apply tab filter
        results = results.filter(note => {
            if (activeFilter === 'favorites') {
                return note.is_favorite;
            } else if (activeFilter === 'archived') {
                return note.is_archived;
            } else if (activeFilter === 'recent') {
                const recentIds = getRecentlyViewed();
                return recentIds.includes(note.id) && !note.is_archived;
            } else if (activeFilter.startsWith('folder:')) {
                const folderId = activeFilter.replace('folder:', '');
                return note.folder_id === folderId && !note.is_archived;
            }
            // 'all' filter - show non-archived notes
            return !note.is_archived;
        });

        // Apply folder filter
        if (selectedFolderId) {
            results = results.filter(note => note.folder_id === selectedFolderId);
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            results = results.filter(note => {
                if (!note.tags || note.tags.length === 0) return false;
                // Note must have ALL selected tags
                return selectedTags.every(tag => note.tags.includes(tag));
            });
        }

        // Apply word count filter
        if (wordCountFilter.min > 0 || wordCountFilter.max < Infinity) {
            results = results.filter(note => {
                const wordCount = countWords(note.body);
                return wordCount >= wordCountFilter.min && wordCount <= wordCountFilter.max;
            });
        }

        return results;
    }, [notes, searchQuery, activeFilter, fuse, wordCountFilter, selectedFolderId, selectedTags]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        focusSearch: () => {
            searchInputRef.current?.focus();
            setIsSidebarOpen?.(true);
        }
    }));

    const handleSearchFocus = () => {
        if (recentSearches.length > 0) {
            setShowSearchHistory(true);
        }
    };

    const handleSearchHistorySelect = (query) => {
        setSearchQuery(query);
        setShowSearchHistory(false);
        searchInputRef.current?.focus();
    };

    const handleRemoveFromHistory = (e, query) => {
        e.stopPropagation();
        searchHistory.removeFromHistory(query);
        setRecentSearches(searchHistory.getHistory());
    };

    const handleClearHistory = () => {
        searchHistory.clearHistory();
        setRecentSearches([]);
        setShowSearchHistory(false);
    };

    const handleTemplateSelect = (template) => {
        onNewNote(template);
        setShowTemplates(false);
        // Close sidebar on mobile after creating note
        if (window.innerWidth < 768) {
            onClose?.();
        }
    };

    const handleNoteSelect = (note) => {
        // Add to recently viewed
        addToRecentlyViewed(note.id);
        onSelectNote(note);
        // Close sidebar on mobile after selecting note
        if (window.innerWidth < 768) {
            onClose?.();
        }
    };

    // Folder management handlers
    const handleCreateFolder = () => {
        setEditingFolder(null);
        setShowFolderModal(true);
    };

    const handleEditFolder = (folder) => {
        setEditingFolder(folder);
        setShowFolderModal(true);
    };

    const handleSaveFolder = async (folderData) => {
        try {
            if (editingFolder) {
                await api.updateFolder(editingFolder.id, folderData);
                toast.success('Folder updated successfully!');
            } else {
                await api.createFolder(
                    folderData.name,
                    folderData.description,
                    folderData.color,
                    folderData.icon,
                    folderData.parent_folder_id
                );
                toast.success('Folder created successfully!');
            }
            setShowFolderModal(false);
            setEditingFolder(null);
            onFoldersChange?.();
        } catch (error) {
            toast.error(`Failed to ${editingFolder ? 'update' : 'create'} folder: ${error.message}`);
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!confirm('Are you sure you want to delete this folder? Notes in this folder will not be deleted.')) {
            return;
        }
        try {
            await api.deleteFolder(folderId);
            toast.success('Folder deleted successfully!');
            if (selectedFolderId === folderId) {
                setSelectedFolderId(null);
            }
            onFoldersChange?.();
        } catch (error) {
            toast.error(`Failed to delete folder: ${error.message}`);
        }
    };

    const handleSelectFolder = (folderId) => {
        setSelectedFolderId(folderId);
        setActiveFilter(folderId ? `folder:${folderId}` : 'all');
    };

    const handleToggleFavorite = (e, noteId) => {
        e.stopPropagation();
        onToggleFavorite?.(noteId);
    };

    const handleToggleArchive = (e, noteId) => {
        e.stopPropagation();
        onToggleArchive?.(noteId);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:relative
                inset-y-0 left-0
                w-80 sm:w-96
                glass border-r border-white/10 
                flex flex-col h-screen
                md:pt-16
                z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors md:hidden z-10"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-white/10">
                    <h1 className="text-xl sm:text-2xl font-bold gradient-text mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                        NexusMind
                    </h1>

                    <div className="relative" ref={templateDropdownRef}>
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="btn-primary w-full flex items-center justify-center gap-2 touch-target"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm sm:text-base">New Note</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Template Dropdown */}
                        {showTemplates && (
                            <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto custom-scrollbar">
                                {noteTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleTemplateSelect(template)}
                                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-b-0 touch-target"
                                    >
                                        <span className="text-xl sm:text-2xl">{template.icon}</span>
                                        <div>
                                            <div className="text-white font-medium text-sm sm:text-base">{template.name}</div>
                                            <div className="text-xs text-slate-400">
                                                {template.id === 'blank' ? 'Start from scratch' : 'Pre-formatted template'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 sm:p-4 border-b border-white/10">
                    <div className="relative" ref={searchHistoryDropdownRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            className="input-field pl-10 text-sm sm:text-base"
                        />

                        {/* Search History Dropdown */}
                        {showSearchHistory && recentSearches.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar animate-slide-up">
                                <div className="p-2 border-b border-white/10 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-medium">Recent Searches</span>
                                    <button
                                        onClick={handleClearHistory}
                                        className="text-xs text-slate-400 hover:text-white transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                {recentSearches.map((query, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearchHistorySelect(query)}
                                        className="w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center justify-between gap-2 group"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            <span className="text-sm text-white truncate">{query}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleRemoveFromHistory(e, query)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                            aria-label="Remove from history"
                                        >
                                            <X className="w-3 h-3 text-red-400" />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Folders Section */}
                <div className="border-b border-white/10 px-3 sm:px-4 py-3">
                    <button
                        onClick={() => setShowFolders(!showFolders)}
                        className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            Folders
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFolder();
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="New Folder"
                            >
                                <FolderPlus className="w-4 h-4 text-primary-400" />
                            </button>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFolders ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {showFolders && (
                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                            {folders.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-2">
                                    No folders yet
                                </p>
                            ) : (
                                folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group ${selectedFolderId === folder.id ? 'bg-white/10' : ''
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleSelectFolder(folder.id)}
                                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                        >
                                            <span className="text-lg flex-shrink-0">{folder.icon}</span>
                                            <span className="text-sm text-white truncate">{folder.name}</span>
                                            {folder.note_count !== undefined && (
                                                <span className="text-xs text-slate-500">({folder.note_count})</span>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditFolder(folder)}
                                                className="p-1 hover:bg-white/10 rounded"
                                                title="Edit Folder"
                                            >
                                                <Edit2 className="w-3 h-3 text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFolder(folder.id)}
                                                className="p-1 hover:bg-red-500/20 rounded"
                                                title="Delete Folder"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                            {selectedFolderId && (
                                <button
                                    onClick={() => handleSelectFolder(null)}
                                    className="w-full text-xs text-primary-400 hover:text-primary-300 transition-colors py-1"
                                >
                                    Clear folder filter
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tags Filter Section */}
                <div className="border-b border-white/10 px-3 sm:px-4 py-3">
                    <button
                        onClick={() => setShowTagFilter(!showTagFilter)}
                        className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Filter by Tags
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showTagFilter ? 'rotate-180' : ''}`} />
                    </button>

                    {showTagFilter && (
                        <div className="space-y-2">
                            {availableTags.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-2">
                                    No tags yet
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                    {availableTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                if (selectedTags.includes(tag)) {
                                                    setSelectedTags(selectedTags.filter(t => t !== tag));
                                                } else {
                                                    setSelectedTags([...selectedTags, tag]);
                                                }
                                            }}
                                            className={`px-2 py-1 text-xs rounded-full transition-all ${selectedTags.includes(tag)
                                                ? 'bg-primary-500/30 text-primary-300 border border-primary-500'
                                                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="w-full text-xs text-primary-400 hover:text-primary-300 transition-colors py-1"
                                >
                                    Clear tag filter ({selectedTags.length} selected)
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-white/10 px-3 sm:px-4">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${activeFilter === 'all'
                            ? 'border-primary-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        All Notes
                    </button>
                    <button
                        onClick={() => setActiveFilter('favorites')}
                        className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-1 ${activeFilter === 'favorites'
                            ? 'border-primary-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        Favorites
                    </button>
                    <button
                        onClick={() => setActiveFilter('archived')}
                        className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-1 ${activeFilter === 'archived'
                            ? 'border-primary-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                        Archived
                    </button>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center text-slate-400 mt-8">
                            <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-xs sm:text-sm">
                                {searchQuery ? 'No notes found' :
                                    activeFilter === 'favorites' ? 'No favorite notes' :
                                        activeFilter === 'archived' ? 'No archived notes' :
                                            'No notes yet'}
                            </p>
                        </div>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => handleNoteSelect(note)}
                                className={`
                                    card p-3 sm:p-4 group relative cursor-pointer
                                    ${selectedNote?.id === note.id ? 'bg-white/15 ring-2 ring-primary-500/50' : ''}
                                `}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                                                <HighlightedText
                                                    text={note.title || 'Untitled'}
                                                    searchQuery={searchQuery}
                                                />
                                            </h3>
                                            {note.is_favorite && (
                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                                            <HighlightedText
                                                text={note.body.substring(0, 100)}
                                                searchQuery={searchQuery}
                                            />
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {/* Favorite Toggle */}
                                        <button
                                            onClick={(e) => handleToggleFavorite(e, note.id)}
                                            className="p-1.5 sm:p-2 hover:bg-yellow-500/20 rounded-lg transition-all touch-target"
                                            aria-label={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
                                            title={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <Star className={`w-4 h-4 ${note.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`} />
                                        </button>

                                        {/* Archive Toggle */}
                                        {!note.is_archived && (
                                            <button
                                                onClick={(e) => handleToggleArchive(e, note.id)}
                                                className="p-1.5 sm:p-2 hover:bg-blue-500/20 rounded-lg transition-all touch-target"
                                                aria-label="Archive note"
                                                title="Archive note"
                                            >
                                                <Archive className="w-4 h-4 text-slate-400" />
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteNote(note.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 md:opacity-100 p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-all touch-target"
                                            aria-label="Delete note"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t border-white/10 text-xs text-slate-500 text-center">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    {searchQuery && ` (filtered)`}
                </div>
            </div>

            {/* Folder Modal */}
            <FolderModal
                isOpen={showFolderModal}
                onClose={() => {
                    setShowFolderModal(false);
                    setEditingFolder(null);
                }}
                onSave={handleSaveFolder}
                folder={editingFolder}
                folders={folders}
            />
        </>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
