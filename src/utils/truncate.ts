/**
 * Truncate a String
 * @param content
 * @param maxLength Default string length followed by ellipsis ...
 */
export function truncateText(content: string, maxLength: number = 150): string {
    if (!content) {
        return "";
    }

    const text = content;

    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
