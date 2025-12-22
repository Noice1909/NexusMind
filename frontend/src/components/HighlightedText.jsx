import { highlightText } from '../lib/searchUtils';

/**
 * Component to render text with highlighted search terms
 */
export default function HighlightedText({ text, searchQuery, className = '' }) {
    const segments = highlightText(text, searchQuery);

    return (
        <span className={className}>
            {segments.map((segment, index) => (
                segment.highlight ? (
                    <mark
                        key={index}
                        className="bg-yellow-400/30 text-yellow-200 font-semibold px-0.5 rounded"
                    >
                        {segment.text}
                    </mark>
                ) : (
                    <span key={index}>{segment.text}</span>
                )
            ))}
        </span>
    );
}
