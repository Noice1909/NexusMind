import { useState, useEffect } from 'react';
import { X, Folder, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * FolderModal Component
 * Modal for creating and editing folders
 */
export default function FolderModal({ isOpen, onClose, onSave, folder = null, folders = [] }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#8b5cf6');
    const [icon, setIcon] = useState('📁');
    const [parentFolderId, setParentFolderId] = useState(null);

    const isEditing = !!folder;

    // Predefined colors
    const colors = [
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#10b981' },
        { name: 'Yellow', value: '#f59e0b' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Teal', value: '#14b8a6' },
    ];

    // Predefined icons
    const icons = ['📁', '📂', '📚', '📖', '📝', '💼', '🎯', '🚀', '💡', '🎨', '🔧', '📊'];

    // Load folder data when editing
    useEffect(() => {
        if (folder) {
            setName(folder.name || '');
            setDescription(folder.description || '');
            setColor(folder.color || '#8b5cf6');
            setIcon(folder.icon || '📁');
            setParentFolderId(folder.parent_folder_id || null);
        } else {
            // Reset for new folder
            setName('');
            setDescription('');
            setColor('#8b5cf6');
            setIcon('📁');
            setParentFolderId(null);
        }
    }, [folder, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Folder name is required');
            return;
        }

        const folderData = {
            name: name.trim(),
            description: description.trim() || null,
            color,
            icon,
            parent_folder_id: parentFolderId,
        };

        onSave(folderData);
    };

    if (!isOpen) return null;

    // Filter out current folder and its descendants from parent options
    const availableParents = folders.filter(f =>
        !folder || (f.id !== folder.id && f.parent_folder_id !== folder.id)
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-lg border border-white/10 shadow-2xl w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Folder className="w-5 h-5 text-primary-400" />
                        {isEditing ? 'Edit Folder' : 'New Folder'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Folder Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Work, Personal, Projects"
                            className="input-field w-full"
                            autoFocus
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this folder"
                            className="input-field w-full resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Icon Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Icon
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {icons.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`p-2 rounded-lg text-2xl transition-all ${icon === emoji
                                            ? 'bg-primary-500/20 ring-2 ring-primary-500'
                                            : 'hover:bg-white/10'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Color
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`p-3 rounded-lg transition-all ${color === c.value
                                            ? 'ring-2 ring-white scale-105'
                                            : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Parent Folder */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Parent Folder (Optional)
                        </label>
                        <select
                            value={parentFolderId || ''}
                            onChange={(e) => setParentFolderId(e.target.value || null)}
                            className="input-field w-full"
                        >
                            <option value="">None (Root Level)</option>
                            {availableParents.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.icon} {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            {isEditing ? 'Save Changes' : 'Create Folder'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
