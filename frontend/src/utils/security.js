export function sanitizeText(value, maxLength = 500) {
    if (value == null) return '';
    let s = String(value);
    s = s.replace(/<[^>]*>/g, '');
    s = s.replace(/[<>'"`\\]/g, '');
    s = s.trim();
    if (s.length > maxLength) {
        s = s.slice(0, maxLength);
    }
    return s;
}

export function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
