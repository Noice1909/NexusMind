import { useState, useEffect, useRef } from 'react';
import { AlertCircle, LogOut, User, Settings, Sun, Moon, Menu, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import NoteEditor from '../components/NoteEditor';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { handleError } from '../lib/errorHandler';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { exportAllNotesToMarkdown } from '../lib/noteUtils';
import { getUserInitials, getAvatarColor } from '../lib/userUtils';

export default function DashboardPage() {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [folders, setFolders] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            callback: () => {
                sidebarRef.current?.focusSearch();
            }
        },
        {
            key: 'n',
            ctrl: true,
            callback: () => {
                handleNewNote();
            }
        }
    ]);

    // Load notes, folders, and tags on mount
    useEffect(() => {
        loadNotes();
        loadFolders();
        loadTags();
    }, []);

    // Click outside handler for mobile menu dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMobileMenu]);

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchedNotes = await api.getNotes();
            setNotes(fetchedNotes);
        } catch (error) {
            const errorMessage = handleError(error, 'Dashboard.loadNotes');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFolders = async () => {
        try {
            const fetchedFolders = await api.getFoldersWithCounts();
            setFolders(fetchedFolders);
        } catch (error) {
            console.error('Failed to load folders:', error);
            // Don't set error state for folders, just log it
        }
    };

    const loadTags = async () => {
        try {
            const tagsData = await api.getAllTags();
            setAvailableTags(tagsData.map(t => t.tag));
        } catch (error) {
            console.error('Failed to load tags:', error);
            // Don't set error state for tags, just log it
        }
    };

    const handleNewNote = (template = null) => {
        setSelectedNote({
            id: null,
            title: template?.title || '',
            body: template?.body || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    };

    const handleSelectNote = (note) => {
        setSelectedNote(note);
    };

    const handleSaveNote = (savedNote) => {
        // Update notes list
        setNotes(prevNotes => {
            const existingIndex = prevNotes.findIndex(n => n.id === savedNote.id);
            if (existingIndex >= 0) {
                // Update existing note
                const newNotes = [...prevNotes];
                newNotes[existingIndex] = savedNote;
                return newNotes;
            } else {
                // Add new note
                return [savedNote, ...prevNotes];
            }
        });

        // Update selected note
        setSelectedNote(savedNote);
    };

    const handleToggleFavorite = async (noteId) => {
        try {
            const updatedNote = await api.toggleFavorite(noteId);

            // Update notes list
            setNotes(prevNotes =>
                prevNotes.map(n => n.id === noteId ? updatedNote : n)
            );

            // Update selected note if it's the one being toggled
            if (selectedNote?.id === noteId) {
                setSelectedNote(updatedNote);
            }

            toast.success(updatedNote.is_favorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            handleError(error, 'Dashboard.toggleFavorite');
        }
    };

    const handleToggleArchive = async (noteId) => {
        try {
            const updatedNote = await api.toggleArchive(noteId);

            // Update notes list
            setNotes(prevNotes =>
                prevNotes.map(n => n.id === noteId ? updatedNote : n)
            );

            // If archived note was selected, clear selection
            if (selectedNote?.id === noteId && updatedNote.is_archived) {
                setSelectedNote(null);
            }

            toast.success(updatedNote.is_archived ? 'Note archived' : 'Note unarchived');
        } catch (error) {
            handleError(error, 'Dashboard.toggleArchive');
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await api.deleteNote(noteId);
            setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));

            // If deleted note was selected, clear selection
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
            }
        } catch (error) {
            handleError(error, 'Dashboard.deleteNote');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your notes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass p-6 sm:p-8 rounded-xl max-w-md text-center w-full">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Connection Error</h2>
                    <p className="text-sm sm:text-base text-slate-400 mb-4">{error}</p>
                    <button onClick={loadNotes} className="btn-primary touch-target">
                        Retry
                    </button>
                    <p className="text-xs text-slate-500 mt-4">
                        Make sure the backend is running at http://localhost:8000
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 z-30 md:hidden glass border-b border-white/10 safe-top">
                <div className="flex items-center justify-between p-3">
                    {/* Hamburger Menu */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>

                    {/* Logo */}
                    <h1 className="text-lg font-bold gradient-text">NexusMind</h1>

                    {/* Mobile Menu Toggle */}
                    <div className="relative" ref={mobileMenuRef}>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
                            aria-label="Open menu"
                        >
                            <MoreVertical className="w-6 h-6 text-white" />
                        </button>

                        {/* Mobile Dropdown Menu */}
                        {showMobileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 glass rounded-lg border border-white/10 shadow-xl overflow-hidden animate-slide-up">
                                <div className="p-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-300" />
                                        <span className="text-white text-sm truncate">{user?.email}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        toggleTheme();
                                        setShowMobileMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 touch-target"
                                >
                                    {theme === 'dark' ? (
                                        <>
                                            <Sun className="w-5 h-5 text-yellow-300" />
                                            <span className="text-white">Light Mode</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="w-5 h-5 text-indigo-400" />
                                            <span className="text-slate-900">Dark Mode</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowMobileMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 touch-target"
                                >
                                    <Settings className="w-5 h-5 text-purple-300" />
                                    <span className="text-white">Profile Settings</span>
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowMobileMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10 touch-target"
                                >
                                    <LogOut className="w-5 h-5 text-red-400" />
                                    <span className="text-white">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="fixed top-0 left-0 right-0 z-40 hidden md:block glass border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <h1 className="text-xl font-bold gradient-text">NexusMind</h1>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        {/* User Profile Avatar */}
                        <div
                            className="glass px-2 lg:px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors group"
                            title={user?.email}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                style={{ backgroundColor: getAvatarColor(user?.email) }}
                            >
                                {getUserInitials(user?.email)}
                            </div>
                            <span className="text-white text-sm hidden lg:inline group-hover:text-purple-300 transition-colors">
                                {user?.email?.split('@')[0]}
                            </span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="glass px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-4 h-4 text-yellow-300" />
                                    <span className="text-white text-sm hidden lg:inline">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4 text-indigo-400" />
                                    <span className="text-slate-900 text-sm hidden lg:inline">Dark</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="glass px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
                            title="Profile Settings"
                        >
                            <Settings className="w-4 h-4 text-purple-300" />
                            <span className="text-white text-sm hidden lg:inline">Profile</span>
                        </button>
                        <button
                            onClick={logout}
                            className="glass px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4 text-purple-300" />
                            <span className="text-white text-sm hidden lg:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <Sidebar
                ref={sidebarRef}
                notes={notes}
                selectedNote={selectedNote}
                onSelectNote={handleSelectNote}
                onNewNote={handleNewNote}
                onDeleteNote={handleDeleteNote}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                folders={folders}
                onFoldersChange={loadFolders}
                availableTags={availableTags}
            />
            <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                folders={folders}
                onFoldersChange={loadFolders}
            />
        </div>
    );
}
