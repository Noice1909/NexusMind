import { useState, useRef, useEffect } from 'react';
import { Folder, ChevronDown, FolderOpen, X } from 'lucide-react';

/**
 * FolderSelector Component
 * Dropdown to select a folder for a note
 */
export default function FolderSelector({ selectedFolderId, folders = [], onChange, placeholder = "Select folder..." }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const selectedFolder = folders.find(f => f.id === selectedFolderId);

    const handleSelect = (folderId) => {
        onChange(folderId);
        setShowDropdown(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selector Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full input-field flex items-center justify-between gap-2 text-left"
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selectedFolder ? (
                        <>
                            <span className="text-xl flex-shrink-0">{selectedFolder.icon}</span>
                            <span className="text-sm text-white truncate">{selectedFolder.name}</span>
                        </>
                    ) : (
                        <>
                            <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-400">{placeholder}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {selectedFolder && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            aria-label="Clear folder"
                        >
                            <X className="w-3 h-3 text-slate-400" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar animate-slide-up">
                    {/* No Folder Option */}
                    <button
                        onClick={() => handleSelect(null)}
                        className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${!selectedFolderId ? 'bg-white/5' : ''
                            }`}
                    >
                        <Folder className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">No Folder</span>
                    </button>

                    {/* Folders List */}
                    {folders.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                            No folders yet. Create one to organize your notes!
                        </div>
                    ) : (
                        folders.map((folder) => (
                            <button
                                key={folder.id}
                                onClick={() => handleSelect(folder.id)}
                                className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${selectedFolderId === folder.id ? 'bg-white/5' : ''
                                    }`}
                                style={{
                                    paddingLeft: `${(folder.level || 0) * 12 + 12}px`
                                }}
                            >
                                <span className="text-xl flex-shrink-0">{folder.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white truncate">{folder.name}</div>
                                    {folder.description && (
                                        <div className="text-xs text-slate-400 truncate">{folder.description}</div>
                                    )}
                                </div>
                                {folder.note_count !== undefined && (
                                    <span className="text-xs text-slate-500">
                                        {folder.note_count}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
