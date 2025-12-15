export const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    // Check if ISO format YYYY-MM-DD
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d); // Local time constructor
    }
    return new Date(dateStr);
};
