/**
 * Get user initials from email or name
 */
export function getUserInitials(email, name = null) {
    if (name) {
        // If name is provided, use first letters of first and last name
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }

    if (email) {
        // Extract from email (before @)
        const username = email.split('@')[0];

        // If username has dots or underscores, use first letters
        if (username.includes('.') || username.includes('_')) {
            const parts = username.split(/[._]/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
        }

        // Otherwise use first two characters
        return username.substring(0, 2).toUpperCase();
    }

    return 'U';
}

/**
 * Generate a consistent color from a string (for avatar background)
 */
export function getAvatarColor(str) {
    if (!str) return '#8b5cf6'; // Default purple

    // Generate hash from string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to color (vibrant colors)
    const colors = [
        '#8b5cf6', // purple
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#8b5cf6', // purple
    ];

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
