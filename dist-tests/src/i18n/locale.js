import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const STORAGE_KEY = 'ispgaya_locale';
const LocaleContext = createContext({
    locale: 'pt',
    setLocale: () => undefined,
    toggleLocale: () => undefined
});
function readStoredLocale() {
    if (typeof window === 'undefined')
        return 'pt';
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'en' ? 'en' : 'pt';
}
export function LocaleProvider({ children }) {
    const [locale, setLocaleState] = useState(readStoredLocale);
    useEffect(() => {
        document.documentElement.lang = locale;
        window.localStorage.setItem(STORAGE_KEY, locale);
    }, [locale]);
    const value = useMemo(() => ({
        locale,
        setLocale: setLocaleState,
        toggleLocale: () => setLocaleState((current) => (current === 'pt' ? 'en' : 'pt'))
    }), [locale]);
    return _jsx(LocaleContext.Provider, { value: value, children: children });
}
export function useLocale() {
    return useContext(LocaleContext);
}
export function getLocaleText(locale, pt, en) {
    return locale === 'en' ? en : pt;
}
