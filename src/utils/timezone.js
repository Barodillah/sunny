// Utility functions for timezone handling
// Uses manual UTC+7 offset for Vercel serverless compatibility

/**
 * Convert a date to Jakarta timezone (UTC+7)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {Date} Date object adjusted to Jakarta time
 */
export function toJakartaTime(dateInput) {
    const utcDate = new Date(dateInput);
    const jakartaOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
    return new Date(utcDate.getTime() + jakartaOffset);
}

/**
 * Format a date to Jakarta timezone with custom format
 * @param {string|Date} dateInput - Date string or Date object  
 * @param {Object} options - Format options
 * @param {boolean} options.showTime - Include time in output
 * @param {boolean} options.showDate - Include date in output
 * @param {boolean} options.use24Hour - Use 24-hour format
 * @returns {string} Formatted date string
 */
export function formatJakartaTime(dateInput, options = {}) {
    const { showTime = true, showDate = true, use24Hour = false } = options;

    if (!dateInput) return '-';

    const jakartaDate = toJakartaTime(dateInput);

    const hours = jakartaDate.getUTCHours();
    const minutes = jakartaDate.getUTCMinutes().toString().padStart(2, '0');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[jakartaDate.getUTCMonth()];
    const day = jakartaDate.getUTCDate();
    const year = jakartaDate.getUTCFullYear();

    let result = [];

    if (showDate) {
        result.push(`${month} ${day}, ${year}`);
    }

    if (showTime) {
        if (use24Hour) {
            result.push(`${hours.toString().padStart(2, '0')}:${minutes}`);
        } else {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;
            result.push(`${hour12}:${minutes} ${ampm}`);
        }
    }

    return result.join(' ');
}

/**
 * Format date for display (short format)
 * @param {string|Date} dateInput 
 * @returns {string} e.g., "Jan 15, 11:30 AM"
 */
export function formatDateShort(dateInput) {
    if (!dateInput) return '-';

    const jakartaDate = toJakartaTime(dateInput);

    const hours = jakartaDate.getUTCHours();
    const minutes = jakartaDate.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[jakartaDate.getUTCMonth()];
    const day = jakartaDate.getUTCDate();

    return `${month} ${day}, ${hour12}:${minutes} ${ampm}`;
}

/**
 * Format time only
 * @param {string|Date} dateInput 
 * @returns {string} e.g., "11:30 AM"
 */
export function formatTimeOnly(dateInput) {
    if (!dateInput) return '-';

    const jakartaDate = toJakartaTime(dateInput);

    const hours = jakartaDate.getUTCHours();
    const minutes = jakartaDate.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Format relative time (e.g., "5 menit lalu")
 * @param {string|Date} dateInput 
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
    const jakartaDate = toJakartaTime(dateInput);
    const now = toJakartaTime(new Date());

    const diffMs = now.getTime() - jakartaDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${jakartaDate.getUTCDate()} ${months[jakartaDate.getUTCMonth()]}`;
}
