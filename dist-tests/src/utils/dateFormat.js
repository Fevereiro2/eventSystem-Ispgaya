export function formatPublicDate(value) {
    if (!value)
        return 'Data por definir';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}
