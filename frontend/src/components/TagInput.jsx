import { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';

/**
 * TagInput Component
 * Allows adding, removing, and displaying tags with autocomplete
 */
export default function TagInput({ tags = [], onChange, availableTags = [], placeholder = "Add tags..." }) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = availableTags
                .filter(tag =>
                    tag.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !tags.includes(tag)
                )
                .slice(0, 5);
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [inputValue, availableTags, tags]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSuggestions]);

    const addTag = (tag) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onChange([...tags, trimmedTag]);
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const removeTag = (tagToRemove) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove last tag on backspace if input is empty
            removeTag(tags[tags.length - 1]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        addTag(suggestion);
        inputRef.current?.focus();
    };

    // Tag color based on hash
    const getTagColor = (tag) => {
        const colors = [
            'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'bg-green-500/20 text-green-400 border-green-500/30',
            'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'bg-red-500/20 text-red-400 border-red-500/30',
            'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            'bg-teal-500/20 text-teal-400 border-teal-500/30',
        ];
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="relative">
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTagColor(tag)} transition-all`}
                    >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                            onClick={() => removeTag(tag)}
                            className="hover:bg-white/10 rounded p-0.5 transition-colors"
                            aria-label={`Remove ${tag}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input */}
            <div className="relative" ref={suggestionsRef}>
                <div className="flex items-center gap-2 input-field">
                    <Plus className="w-4 h-4 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => inputValue && setShowSuggestions(filteredSuggestions.length > 0)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-400"
                    />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-sm text-white"
                            >
                                <Tag className="w-3 h-3 text-primary-400" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Helper Text */}
            <p className="text-xs text-slate-400 mt-2">
                Press Enter to add a tag, or select from suggestions
            </p>
        </div>
    );
}
