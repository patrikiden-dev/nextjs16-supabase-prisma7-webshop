
/**
 * Format Date so language independent
 * @param dateStr
 * @param locale    Locale string: 'en-US', 'sv-SE', 'de-DE', etc.
 */
export function formatDate(dateStr: string | Date, locale: string = "en-US") {
    return new Date(dateStr).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Get date only: 2026-08-30
 * @param date
 */
export function getDateOnly(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}