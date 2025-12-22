/**
 * Utility functions for note statistics and reading time calculations
 */

/**
 * Calculate reading time for text
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(text) {
    if (!text || text.trim().length === 0) {
        return 0;
    }

    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);

    return minutes;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes) {
    if (minutes < 1) {
        return 'Less than 1 min read';
    } else if (minutes === 1) {
        return '1 min read';
    } else {
        return `${minutes} min read`;
    }
}

/**
 * Count words in text
 */
export function countWords(text) {
    if (!text || text.trim().length === 0) {
        return 0;
    }
    return text.trim().split(/\s+/).length;
}

/**
 * Count characters in text
 */
export function countCharacters(text) {
    if (!text) {
        return 0;
    }
    return text.length;
}

/**
 * Count characters without spaces
 */
export function countCharactersNoSpaces(text) {
    if (!text) {
        return 0;
    }
    return text.replace(/\s/g, '').length;
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text) {
    if (!text || text.trim().length === 0) {
        return 0;
    }
    return text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
}

/**
 * Get note statistics
 */
export function getNoteStats(note) {
    const text = `${note.title || ''} ${note.body || ''}`;
    const bodyText = note.body || '';

    return {
        words: countWords(bodyText),
        characters: countCharacters(bodyText),
        charactersNoSpaces: countCharactersNoSpaces(bodyText),
        paragraphs: countParagraphs(bodyText),
        readingTime: calculateReadingTime(bodyText),
        readingTimeFormatted: formatReadingTime(calculateReadingTime(bodyText)),
    };
}

/**
 * Export note to Markdown file
 */
export function exportToMarkdown(note) {
    const title = note.title || 'Untitled';
    const body = note.body || '';
    const createdAt = new Date(note.created_at).toLocaleString();
    const updatedAt = new Date(note.updated_at).toLocaleString();

    // Build markdown content
    let markdown = `# ${title}\n\n`;
    markdown += `**Created:** ${createdAt}\n`;
    markdown += `**Last Updated:** ${updatedAt}\n\n`;
    markdown += `---\n\n`;
    markdown += body;

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(title)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export all notes to a single Markdown file
 */
export function exportAllNotesToMarkdown(notes) {
    let markdown = `# NexusMind Notes Export\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total Notes:** ${notes.length}\n\n`;
    markdown += `---\n\n`;

    notes.forEach((note, index) => {
        const title = note.title || 'Untitled';
        const body = note.body || '';
        const createdAt = new Date(note.created_at).toLocaleString();

        markdown += `## ${index + 1}. ${title}\n\n`;
        markdown += `**Created:** ${createdAt}\n\n`;
        markdown += body;
        markdown += `\n\n---\n\n`;
    });

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexusmind-notes-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
        .substring(0, 50);
}
