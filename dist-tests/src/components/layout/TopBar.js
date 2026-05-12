import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { container, topBar, topBarGroup, topBarInner, topBarLink, topBarLocaleActive, topBarLocale, topBarLocaleWrap, topBarRightGroup, topBarRightLinks } from '../../styles/ui';
import { useLocale, getLocaleText } from '../../i18n/locale.js';
const leftLinks = [
    {
        label: 'Inforestudante',
        href: 'https://inforestudante.ispgaya.pt',
        target: '_blank',
        rel: 'noindex nofollow'
    },
    {
        label: 'Infordocente',
        href: 'https://infordocente.ispgaya.pt',
        target: '_blank',
        rel: 'noindex nofollow'
    },
    {
        label: 'Infocultura',
        href: '/infocultura',
        target: '_blank',
        rel: 'noindex nofollow'
    },
    {
        label: 'Email',
        href: 'https://outlook.office.com',
        target: '_blank',
        rel: 'noindex nofollow'
    },
    {
        label: 'Horarios',
        href: 'https://horarios.ispgaya.pt/geral/',
        target: '_blank',
        rel: 'noindex nofollow'
    }
];
const rightLinks = [
    {
        label: 'Perguntas Frequentes',
        href: 'https://ispgaya.pt/pt/perguntas-frequentes'
    },
    {
        label: 'Candidatura Online',
        href: 'https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS',
        target: '_blank',
        rel: 'noopener noreferrer'
    },
    {
        label: 'Contactos',
        href: 'https://ispgaya.pt/pt/instituicao/contactos'
    }
];
function TopBar({ transparent = false }) {
    const { locale, setLocale } = useLocale();
    const rootClassName = transparent
        ? 'hidden xl:block bg-transparent text-white'
        : topBar;
    const linkClassName = transparent
        ? 'text-white/90 transition-colors hover:text-white'
        : topBarLink;
    const localeActiveClassName = transparent
        ? 'font-bold text-white transition-colors hover:text-white'
        : topBarLocaleActive;
    const localeClassName = transparent
        ? 'text-white/80 transition-colors hover:text-white'
        : topBarLocale;
    const dividerClassName = transparent ? 'border-white/10' : 'border-slate-200';
    const localeLabel = getLocaleText(locale, 'Idioma', 'Language');
    return (_jsxs("div", { className: rootClassName, children: [_jsxs("div", { className: `${container} ${topBarInner}`, children: [_jsx("div", { className: topBarGroup, children: leftLinks.map((item) => (_jsx("a", { href: item.href, target: item.target, rel: item.rel, className: linkClassName, children: item.label }, item.label))) }), _jsxs("div", { className: topBarRightGroup, children: [_jsx("div", { className: topBarRightLinks, children: rightLinks.map((item) => (_jsx("a", { href: item.href, target: item.target, rel: item.rel, className: linkClassName, children: item.label }, item.label))) }), _jsxs("span", { className: topBarLocaleWrap, children: [_jsx("button", { type: "button", title: localeLabel, "aria-pressed": locale === 'pt', className: locale === 'pt' ? localeActiveClassName : localeClassName, onClick: () => setLocale('pt'), children: "PT" }), _jsx("button", { type: "button", title: localeLabel, "aria-pressed": locale === 'en', className: locale === 'en' ? localeActiveClassName : localeClassName, onClick: () => setLocale('en'), children: "EN" })] })] })] }), _jsx("hr", { className: dividerClassName })] }));
}
export default TopBar;
