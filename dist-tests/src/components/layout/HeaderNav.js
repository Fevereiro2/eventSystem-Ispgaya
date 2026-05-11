import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown, Lock, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandLogo, brandWrap, container, desktopMenu, headerNav, headerNavInner, mobileMenuButton, navDropdownAnchor, navDropdownItem, navDropdownList, navDropdownWrap, navItemGroup, navLink } from '../../styles/ui';
import logo from '../../assets/ispgaya-logo.svg';
import logoNegative from '../../assets/ispgaya-logo-negative.svg';
import { fetchPublicClubs } from '../../api/infoculturaApi';
const defaultLaboratorioDropdown = [
    { label: 'Tuna Academica', href: '/laboratorio-cultural/tuna', internal: true },
    {
        label: 'Clube de Leitura',
        href: '/laboratorio-cultural/clube-leitura',
        internal: true
    },
    { label: 'Clube de Teatro', href: '/laboratorio-cultural/teatro', internal: true }
];
function normalizeLabel(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
function getClubHref(club) {
    const label = normalizeLabel(club.name);
    if (label.includes('tuna')) {
        return '/laboratorio-cultural/tuna';
    }
    if (label.includes('leitura')) {
        return '/laboratorio-cultural/clube-leitura';
    }
    if (label.includes('teatro')) {
        return '/laboratorio-cultural/teatro';
    }
    return `/laboratorio-cultural/clubes/${club.id}`;
}
function mapClubToLinkItem(club) {
    return {
        label: club.name,
        href: getClubHref(club),
        internal: true
    };
}
const menuItems = [
    {
        label: 'Instituicao',
        href: 'https://ispgaya.pt/pt/instituicao',
        dropdown: [
            { label: 'O ISPGAYA', href: 'https://ispgaya.pt/pt/instituicao/ispgaya' },
            { label: 'Organizacao', href: 'https://ispgaya.pt/pt/instituicao/organizacao' },
            { label: 'Corpo Docente', href: 'https://ispgaya.pt/pt/instituicao/corpo-docente' },
            { label: 'Qualidade Institucional', href: 'https://ispgaya.pt/pt/instituicao/qualidade' },
            { label: 'Etica e Boas Praticas', href: 'https://ispgaya.pt/pt/instituicao/etica-e-boas-praticas' },
            { label: 'Emprego e Recrutamento', href: 'https://forms.office.com' },
            { label: 'Titulo Especialista', href: 'https://ispgaya.pt/pt/instituicao/titulo-especialista' },
            { label: 'Contactos', href: 'https://ispgaya.pt/pt/instituicao/contactos' }
        ]
    },
    {
        label: 'Ensino',
        href: 'https://ispgaya.pt/pt/ensino',
        dropdown: [
            { label: 'Oferta Formativa', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa' },
            {
                label: 'Programas Avancados',
                href: 'https://ispgaya.pt/pt/ensino/programas-avancados'
            },
            { label: 'Candidaturas', href: 'https://ispgaya.pt/pt/ensino/candidaturas' },
            {
                label: 'Bolsas e Financiamento',
                href: 'https://ispgaya.pt/pt/ensino/bolsas-e-financiamento'
            }
        ]
    },
    {
        label: 'Empregabilidade',
        href: 'https://ispgaya.pt/pt/empregabilidade',
        dropdown: [
            {
                label: 'Estagios e Emprego',
                href: 'https://ispgaya.pt/pt/empregabilidade/estagios-e-emprego'
            },
            { label: 'Alumni', href: 'https://ispgaya.pt/pt/empregabilidade/alumni' }
        ]
    },
    {
        label: 'Investigacao',
        href: 'https://ispgaya.pt/pt/investigacao',
        dropdown: [
            {
                label: 'Publicacoes Cientificas',
                href: 'https://ispgaya.pt/pt/investigacao/publicacoes-cientificas'
            },
            {
                label: 'Atividades Cientificas',
                href: 'https://ispgaya.pt/pt/investigacao/atividades-cientificas'
            },
            { label: 'Biblioteca', href: 'https://ispgaya.pt/pt/investigacao/biblioteca' },
            { label: 'WIDESKILLS', href: 'https://ispgaya.pt/pt/investigacao/wideskills' },
            { label: 'Politecnica', href: 'https://ispgaya.pt/pt/investigacao/politecnica-revista' }
        ]
    },
    {
        label: 'Internacional',
        href: 'https://ispgaya.pt/pt/internacional',
        dropdown: [
            { label: 'Estudantes Internacionais', href: 'https://international.ispgaya.pt/pt' },
            { label: 'Erasmus+', href: 'https://ispgaya.pt/pt/internacional/erasmus+' },
            { label: 'Guia ECTS', href: 'https://ispgaya.pt/pt/internacional/guia-ects' }
        ]
    },
    {
        label: 'Laboratorio Cultural',
        href: '/laboratorio-cultural',
        internal: true,
        dropdown: defaultLaboratorioDropdown
    },
    {
        label: 'Vida Academica',
        href: 'https://ispgaya.pt/pt/vida-academica',
        dropdown: [
            { label: 'Noticias', href: 'https://ispgaya.pt/pt/vida-academica/noticias' },
            { label: 'Eventos', href: 'https://ispgaya.pt/pt/vida-academica/eventos' },
            {
                label: 'Estudante ISPGAYA',
                href: 'https://ispgaya.pt/pt/vida-academica/estudante-ispgaya'
            },
            {
                label: 'Associacao de Estudantes',
                href: 'https://ispgaya.pt/pt/vida-academica/associacao-estudantes'
            },
            { label: 'Tuna Academica', href: 'https://ispgaya.pt/pt/vida-academica/tuna-academica' }
        ]
    }
];
const mobilePrivateLinks = [
    { label: 'Inforestudante', href: 'https://inforestudante.ispgaya.pt' },
    { label: 'Infordocente', href: 'https://infordocente.ispgaya.pt' },
    { label: 'Infocultura', href: 'https://infordocente.ispgaya.pt' },
    { label: 'Email', href: 'https://outlook.office.com' },
    { label: 'Horários', href: 'https://horarios.ispgaya.pt/geral/' }
];
const mobileInterestLinks = [
    { label: 'Perguntas Frequentes', href: 'https://ispgaya.pt/pt/perguntas-frequentes' },
    {
        label: 'Candidatura Online',
        href: 'https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS'
    },
    { label: 'Contactos', href: 'https://ispgaya.pt/pt/instituicao/contactos' }
];
function renderMenuLink(item, className, onClick) {
    return item.internal ? (_jsx(Link, { to: item.href, className: className, onClick: onClick, children: item.label })) : (_jsx("a", { href: item.href, className: className, onClick: onClick, children: item.label }));
}
function HeaderNav({ transparent = false }) {
    const [laboratorioDropdown, setLaboratorioDropdown] = useState(defaultLaboratorioDropdown);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileSection, setActiveMobileSection] = useState(null);
    useEffect(() => {
        let active = true;
        async function loadClubDropdown() {
            try {
                const clubs = await fetchPublicClubs();
                if (!active)
                    return;
                setLaboratorioDropdown(clubs.length > 0 ? clubs.map(mapClubToLinkItem) : defaultLaboratorioDropdown);
            }
            catch {
                if (!active)
                    return;
                setLaboratorioDropdown(defaultLaboratorioDropdown);
            }
        }
        void loadClubDropdown();
        return () => {
            active = false;
        };
    }, []);
    useEffect(() => {
        if (!isMobileMenuOpen) {
            setActiveMobileSection(null);
        }
    }, [isMobileMenuOpen]);
    useEffect(() => {
        if (!isMobileMenuOpen)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);
    const resolvedMenuItems = menuItems.map((item) => item.label === 'Laboratorio Cultural'
        ? { ...item, dropdown: laboratorioDropdown }
        : item);
    const rootClassName = transparent
        ? 'border-white/10 bg-transparent text-white'
        : headerNav;
    const desktopMenuClassName = transparent
        ? 'relative z-[80] hidden items-center gap-7 xl:flex'
        : desktopMenu;
    const innerClassName = transparent
        ? 'flex items-center justify-between gap-6 py-5 lg:py-4'
        : headerNavInner;
    const linkClassName = transparent
        ? 'text-[16px] font-medium text-white transition-colors hover:text-[#f7c47a]'
        : navLink;
    const dropdownWrapClassName = transparent
        ? 'right-0 z-[90] absolute hidden w-72 pt-2 opacity-0 transition-opacity group-hover:block group-hover:opacity-100 group-focus-within:block group-focus-within:opacity-100'
        : navDropdownWrap;
    const mobileButtonClassName = transparent
        ? 'inline-flex h-11 w-11 items-center justify-center rounded-md  text-white transition-colors  lg:hidden'
        : mobileMenuButton;
    const logoSrc = transparent ? logoNegative : logo;
    const dropdownListClassName = transparent
        ? 'rounded border border-gray-100 bg-white px-4 py-3 text-slate-900 shadow-xl space-y-3'
        : navDropdownList;
    const dropdownItemClassName = transparent
        ? 'flex items-center font-medium text-slate-900 hover:text-[#dd8609] hover:underline underline-offset-2'
        : navDropdownItem;
    const dropdownAnchorClassName = transparent
        ? 'inline-block w-full py-0.5 text-inherit'
        : navDropdownAnchor;
    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }
    return (_jsxs("header", { className: rootClassName, children: [_jsxs("div", { className: `${container} ${innerClassName} px-6 sm:px-6 lg:px-3`, children: [_jsx(Link, { to: "/", className: brandWrap, children: _jsx("img", { src: logoSrc, alt: "ISPGAYA", className: brandLogo }) }), _jsx("nav", { className: desktopMenuClassName, "aria-label": "Principal", children: resolvedMenuItems.map((item) => item.dropdown ? (_jsxs("div", { className: navItemGroup, children: [renderMenuLink(item, linkClassName), _jsx("div", { className: dropdownWrapClassName, children: _jsx("ul", { className: dropdownListClassName, children: item.dropdown.map((child) => (_jsx("li", { className: dropdownItemClassName, children: renderMenuLink(child, dropdownAnchorClassName) }, child.label))) }) })] }, item.label)) : (_jsx("div", { children: renderMenuLink(item, linkClassName) }, item.label))) }), _jsx("button", { type: "button", className: mobileButtonClassName, onClick: () => {
                            setIsMobileMenuOpen((value) => {
                                const nextValue = !value;
                                if (nextValue) {
                                    setActiveMobileSection(resolvedMenuItems[0]?.label ?? null);
                                }
                                return nextValue;
                            });
                        }, "aria-expanded": isMobileMenuOpen, "aria-label": isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu', children: isMobileMenuOpen ? (_jsx(X, { className: "h-5 w-5" })) : (_jsxs("span", { className: "flex h-5 w-5 flex-col items-center justify-center gap-1.5", "aria-hidden": "true", children: [_jsx("span", { className: "block h-0.5 w-5 bg-current" }), _jsx("span", { className: "block h-0.5 w-5 bg-current" })] })) })] }), isMobileMenuOpen ? (_jsxs("div", { className: "fixed inset-0 z-[100] lg:hidden", children: [_jsx("button", { type: "button", className: "absolute inset-0 bg-transparent", onClick: closeMobileMenu, "aria-label": "Fechar menu" }), _jsxs("div", { className: "absolute inset-0 overflow-y-auto bg-white text-slate-900", children: [_jsx("div", { className: `${container} px-6 py-4 sm:px-6 lg:px-3`, children: _jsxs("div", { className: "mx-auto flex w-full max-w-md items-center justify-between gap-4", children: [_jsx(Link, { to: "/", className: "flex items-center justify-center", onClick: closeMobileMenu, children: _jsx("img", { src: logo, alt: "ISPGAYA", className: "h-12 w-auto" }) }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("button", { type: "button", onClick: closeMobileMenu, className: "inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100", "aria-label": "Fechar menu", children: _jsx(X, { className: "h-5 w-5" }) }) })] }) }), _jsx("div", { className: "border-t border-slate-200", children: _jsx("div", { className: `${container} px-6 sm:px-6 lg:px-3`, children: _jsxs("div", { className: "mx-auto w-full max-w-md divide-y divide-slate-200", children: [_jsxs("div", { className: "flex items-right justify-right gap-3 text-sm font-semibold text-slate-700", children: [_jsx("a", { href: "https://ispgaya.pt/pt", title: "pt", rel: "alternate", hrefLang: "pt", className: "text-slate-900", children: "PT" }), _jsx("a", { href: "https://ispgaya.pt/en", title: "en", rel: "alternate", hrefLang: "en", className: "text-slate-500 hover:text-slate-700", children: "EN" })] }), resolvedMenuItems.map((item) => {
                                                const isExpanded = activeMobileSection === item.label;
                                                const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
                                                return (_jsxs("div", { className: "py-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [renderMenuLink(item, 'text-[15px] font-medium text-slate-800 text-left', closeMobileMenu), hasDropdown ? (_jsx("button", { type: "button", onClick: () => setActiveMobileSection((current) => current === item.label ? null : item.label), className: "inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100", "aria-expanded": isExpanded, "aria-label": isExpanded ? 'Fechar submenu' : 'Abrir submenu', children: _jsx(ChevronDown, { className: `h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}` }) })) : null] }), hasDropdown && isExpanded ? (_jsx("div", { className: "mt-3 rounded-lg bg-slate-50 py-2", children: item.dropdown?.map((child) => (_jsx("div", { className: "border-t border-slate-200 first:border-t-0", children: renderMenuLink(child, 'flex items-center gap-3 px-4 py-3 text-[14px] text-slate-700 hover:text-[#dd8609]', closeMobileMenu) }, child.label))) })) : null] }, item.label));
                                            }), _jsxs("div", { className: "flex items-left justify-left gap-2 text-left text-[11px] font-semibold  text-slate-500", children: [_jsx(Lock, { className: "h-4 w-4" }), _jsx("span", { children: "\u00C1rea Privada" })] }), _jsx("div", { className: "mt-3 grid gap-2 text-left", children: mobilePrivateLinks.map((item) => (_jsx("div", { children: renderMenuLink(item, 'block px-2 text-[14px] text-slate-700 hover:text-[#dd8609]', closeMobileMenu) }, item.label))) }), _jsxs("div", { className: "flex items-left justify-left gap-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500", children: [_jsx(Zap, { className: "h-4 w-4" }), _jsx("span", { children: "Links de Interesse" })] }), _jsx("div", { className: "mt-3 grid gap-2 text-left", children: mobileInterestLinks.map((item) => (_jsx("div", { children: renderMenuLink(item, 'block px-2 text-[14px] text-slate-700 hover:text-[#dd8609]', closeMobileMenu) }, item.label))) })] }) }) })] })] })) : null] }));
}
export default HeaderNav;
