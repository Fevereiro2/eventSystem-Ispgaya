export function buildIspgayaUrl(locale, path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `https://ispgaya.pt/${locale}${normalizedPath}`;
}
export function localizePath(locale, ptPath, enPath) {
    return locale === 'en' ? enPath : ptPath;
}
