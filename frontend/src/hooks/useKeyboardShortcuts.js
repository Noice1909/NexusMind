import { useEffect } from 'react';

/**
 * Custom hook for global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check each shortcut
            for (const shortcut of shortcuts) {
                const { key, ctrl, alt, shift, callback, preventDefault = true } = shortcut;

                // Check if all modifiers match
                const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
                const altMatch = alt ? event.altKey : !event.altKey;
                const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
                const keyMatch = event.key.toLowerCase() === key.toLowerCase();

                if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
                    if (preventDefault) {
                        event.preventDefault();
                    }
                    callback(event);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts]);
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut) {
    const parts = [];

    if (shortcut.ctrl) {
        parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.alt) {
        parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.shift) {
        parts.push('⇧');
    }

    parts.push(shortcut.key.toUpperCase());

    return parts.join('+');
}
