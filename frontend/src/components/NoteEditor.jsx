import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Sparkles, Loader2, Check, Download, Clock, FileText, FileType, ChevronDown, Wand2, Languages, FileEdit, Tag, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../lib/api';
import { getNoteStats, exportToMarkdown } from '../lib/noteUtils';
import TagInput from './TagInput';
import FolderSelector from './FolderSelector';
import toast from 'react-hot-toast';

export default function NoteEditor({ note, onSave, folders = [], onFoldersChange }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const [tags, setTags] = useState([]);
    const [folderId, setFolderId] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [showMetadata, setShowMetadata] = useState(false);
    const autoSaveTimerRef = useRef(null);
    const aiMenuRef = useRef(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setBody(note.body);
            setTags(note.tags || []);
            setFolderId(note.folder_id || null);
            setHasUnsavedChanges(false);
            setLastSaved(note.updated_at);
        } else {
            setTitle('');
            setBody('');
            setTags([]);
            setFolderId(null);
            setHasUnsavedChanges(false);
            setLastSaved(null);
        }
    }, [note]);

    // Fetch available tags for autocomplete
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const allTags = await api.getAllTags();
                setAvailableTags(allTags.map(t => t.tag));
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        fetchTags();
    }, []);

    // Auto-save functionality - saves after 3 seconds of inactivity
    useEffect(() => {
        if (hasUnsavedChanges && title.trim()) {
            // Clear existing timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            // Set new timer for auto-save
            autoSaveTimerRef.current = setTimeout(() => {
                handleSave(true); // true indicates auto-save
            }, 3000);
        }

        // Cleanup timer on unmount
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [title, body, hasUnsavedChanges]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+S or Cmd+S - Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasUnsavedChanges && title.trim()) {
                    handleSave();
                }
            }
            // Ctrl+/ or Cmd+/ - Toggle preview
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setIsPreview(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasUnsavedChanges, title]);

    // Click outside handler for AI menu dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (aiMenuRef.current && !aiMenuRef.current.contains(event.target)) {
                setShowAiMenu(false);
            }
        };

        if (showAiMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showAiMenu]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleBodyChange = (e) => {
        setBody(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleSave = async (isAutoSave = false) => {
        if (!title.trim()) {
            if (!isAutoSave) {
                toast.error('Please enter a title');
            }
            return;
        }

        setIsSaving(true);
        try {
            let savedNote;
            if (note?.id) {
                savedNote = await api.updateNote(note.id, {
                    title,
                    body,
                    tags,
                    folder_id: folderId
                });
            } else {
                savedNote = await api.createNote(title, body, tags, folderId);
            }
            setHasUnsavedChanges(false);
            setLastSaved(new Date().toISOString());
            onSave(savedNote);

            if (!isAutoSave) {
                toast.success('Note saved successfully!');
            }
        } catch (error) {
            toast.error(`Failed to save note: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (!note) {
            toast.error('No note to export');
            return;
        }

        try {
            exportToMarkdown(note);
            toast.success('Note exported successfully!');
        } catch (error) {
            toast.error('Failed to export note');
        }
    };

    const handleTagsChange = (newTags) => {
        setTags(newTags);
        setHasUnsavedChanges(true);
    };

    const handleFolderChange = (newFolderId) => {
        setFolderId(newFolderId);
        setHasUnsavedChanges(true);
    };

    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    const handleGenerateTags = async () => {
        if (!body.trim()) {
            toast.error('Please enter some content first');
            return;
        }

        setIsGeneratingTags(true);
        try {
            const response = await api.generateTags(title, body);
            setTags(response.tags);
            toast.success(`Generated ${response.tags.length} tags!`);
        } catch (error) {
            toast.error(`Failed to generate tags: ${error.message}`);
        } finally {
            setIsGeneratingTags(false);
        }
    };

    const handleSummarize = async () => {
        if (!body.trim()) {
            toast.error('Please enter some content first');
            return;
        }

        setIsSummarizing(true);
        try {
            const response = await api.summarizeNote(title, body);
            toast.success('Summary generated!');

            // Show summary in a toast with copy option
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-semibold">Summary:</p>
                    <p className="text-sm">{response.summary}</p>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(response.summary);
                            toast.success('Summary copied!');
                            toast.dismiss(t.id);
                        }}
                        className="btn-secondary text-xs px-2 py-1"
                    >
                        Copy Summary
                    </button>
                </div>
            ), {
                duration: 10000,
            });
        } catch (error) {
            toast.error(`Failed to generate summary: ${error.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleEnhance = async () => {
        if (!body.trim()) {
            toast.error('Please enter some content first');
            return;
        }

        setIsEnhancing(true);
        try {
            // Placeholder for enhance functionality
            toast.success('Content enhancement coming soon!');
            setShowAiMenu(false);
        } catch (error) {
            toast.error(`Failed to enhance content: ${error.message}`);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleTranslate = async () => {
        if (!body.trim()) {
            toast.error('Please enter some content first');
            return;
        }

        setIsTranslating(true);
        try {
            // Placeholder for translate functionality
            toast.success('Translation coming soon!');
            setShowAiMenu(false);
        } catch (error) {
            toast.error(`Failed to translate: ${error.message}`);
        } finally {
            setIsTranslating(false);
        }
    };

    if (!note && title === '' && body === '') {
        return (
            <div className="flex-1 flex items-center justify-center p-4 mt-14 md:mt-0">
                <div className="text-center text-slate-400">
                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg sm:text-xl">Select a note or create a new one</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen mt-14 md:mt-16">
            {/* Toolbar - Redesigned to prevent overlap */}
            <div className="glass border-b border-white/10 px-3 py-4 sm:px-4 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                    {/* Left: Edit/Preview Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPreview(false)}
                            className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm touch-target ${!isPreview
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setIsPreview(true)}
                            className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm touch-target ${isPreview
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Preview
                        </button>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* AI Tools Dropdown */}
                        <div className="relative" ref={aiMenuRef}>
                            <button
                                onClick={() => setShowAiMenu(!showAiMenu)}
                                className="btn-secondary flex items-center gap-2 text-sm px-3 sm:px-4 py-2 touch-target"
                                title="AI Tools"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">AI Tools</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showAiMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* AI Dropdown Menu */}
                            {showAiMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 glass rounded-lg border border-white/10 shadow-xl overflow-hidden animate-slide-up z-50">
                                    <button
                                        onClick={() => {
                                            handleGenerateTags();
                                            setShowAiMenu(false);
                                        }}
                                        disabled={isGeneratingTags || !body.trim()}
                                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingTags ? (
                                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                        )}
                                        <div>
                                            <div className="text-white text-sm font-medium">Generate Tags</div>
                                            <div className="text-slate-400 text-xs">Auto-tag your note</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleSummarize();
                                            setShowAiMenu(false);
                                        }}
                                        disabled={isSummarizing || !body.trim()}
                                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSummarizing ? (
                                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                        ) : (
                                            <FileType className="w-5 h-5 text-blue-400" />
                                        )}
                                        <div>
                                            <div className="text-white text-sm font-medium">Summarize</div>
                                            <div className="text-slate-400 text-xs">Get a quick summary</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleEnhance}
                                        disabled={isEnhancing || !body.trim()}
                                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isEnhancing ? (
                                            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                                        ) : (
                                            <Wand2 className="w-5 h-5 text-green-400" />
                                        )}
                                        <div>
                                            <div className="text-white text-sm font-medium">Enhance</div>
                                            <div className="text-slate-400 text-xs">Improve writing</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleTranslate}
                                        disabled={isTranslating || !body.trim()}
                                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isTranslating ? (
                                            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                                        ) : (
                                            <Languages className="w-5 h-5 text-yellow-400" />
                                        )}
                                        <div>
                                            <div className="text-white text-sm font-medium">Translate</div>
                                            <div className="text-slate-400 text-xs">Multi-language</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={!note}
                            className="btn-secondary flex items-center gap-2 text-sm px-3 sm:px-4 py-2 touch-target"
                            title="Export to Markdown"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden lg:inline">Export</span>
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasUnsavedChanges}
                            className={`btn-primary flex items-center gap-2 text-sm px-3 sm:px-4 py-2 touch-target ${!hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Save</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Note Title"
                        value={title}
                        onChange={handleTitleChange}
                        disabled={isPreview}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-transparent border-none focus:outline-none w-full mb-4 sm:mb-6 text-white placeholder-slate-600"
                    />

                    {/* Metadata Section (Tags & Folder) */}
                    <div className="mb-4 sm:mb-6 space-y-4">
                        {/* Toggle Metadata Button */}
                        <button
                            onClick={() => setShowMetadata(!showMetadata)}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMetadata ? 'rotate-180' : ''}`} />
                            {showMetadata ? 'Hide' : 'Show'} Tags & Folder
                        </button>

                        {/* Metadata Inputs */}
                        {showMetadata && (
                            <div className="space-y-4 animate-slide-down">
                                {/* Tags Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Tags
                                    </label>
                                    <TagInput
                                        tags={tags}
                                        onChange={handleTagsChange}
                                        availableTags={availableTags}
                                        placeholder="Add tags to organize your note..."
                                    />
                                </div>

                                {/* Folder Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <Folder className="w-4 h-4" />
                                        Folder
                                    </label>
                                    <FolderSelector
                                        selectedFolderId={folderId}
                                        folders={folders}
                                        onChange={handleFolderChange}
                                        placeholder="Choose a folder..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tags Display (when collapsed) */}
                        {!showMetadata && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm glass rounded-full text-primary-300 border border-primary-500/30"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Editor/Preview */}
                    {isPreview ? (
                        <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {body || '*No content*'}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            placeholder="Start writing in Markdown..."
                            value={body}
                            onChange={handleBodyChange}
                            className="w-full min-h-[50vh] sm:min-h-[60vh] bg-transparent border-none focus:outline-none resize-none text-slate-200 font-mono text-xs sm:text-sm leading-relaxed placeholder-slate-600"
                        />
                    )}
                </div>
            </div>

            {/* Status bar */}
            <div className="glass border-t border-white/10 px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs text-slate-500">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    {isSaving && (
                        <span className="text-blue-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </span>
                    )}
                    {!isSaving && hasUnsavedChanges && (
                        <span className="text-yellow-400 flex items-center gap-1">
                            • Unsaved changes (auto-save in 3s)
                        </span>
                    )}
                    {!isSaving && !hasUnsavedChanges && lastSaved && (
                        <span className="text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Saved {new Date(lastSaved).toLocaleTimeString()}
                        </span>
                    )}
                    <span className="text-slate-600 hidden sm:inline">
                        Ctrl+S to save • Ctrl+/ to preview • Ctrl+K to search
                    </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    {note && (() => {
                        const stats = getNoteStats(note);
                        return (
                            <>
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {stats.words} words
                                </span>
                                <span className="hidden sm:inline">
                                    {stats.characters} chars
                                </span>
                                <span className="flex items-center gap-1 text-primary-400">
                                    <Clock className="w-3 h-3" />
                                    {stats.readingTimeFormatted}
                                </span>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
