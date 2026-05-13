import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import logo from '../assets/ispgaya-logo.svg';
import { getLocaleText, useLocale } from '../i18n/locale.js';
import { container, mainContent } from '../styles/ui';
function LaboratorioRoadmap() {
    const { locale } = useLocale();
    const contentBlocks = locale === 'en'
        ? [
            {
                title: 'Mission',
                text: 'Promote culture within the academic community, encouraging participation, creativity and the sharing of experiences.'
            },
            {
                title: 'Goals',
                items: [
                    'Encourage participation in cultural activities',
                    'Promote cultural events and initiatives',
                    'Stimulate creativity and critical thinking',
                    'Bring students closer to culture inside and outside the institution'
                ]
            }
        ]
        : [
            {
                title: 'Missão',
                text: 'Promover a cultura na comunidade académica, incentivando a participação, a criatividade e a partilha de experiências.'
            },
            {
                title: 'Objetivos',
                items: [
                    'Incentivar a participação em atividades culturais',
                    'Divulgar eventos e iniciativas culturais',
                    'Estimular a criatividade e o pensamento crítico',
                    'Aproximar os estudantes da cultura dentro e fora da instituição'
                ]
            }
        ];
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: getLocaleText(locale, 'Missão e Objetivos', 'Mission and Goals'), description: getLocaleText(locale, 'O Laboratório Cultural é um espaço vivo onde a criatividade ganha forma e a cultura se torna experiência.', 'The Cultural Lab is a living space where creativity takes shape and culture becomes an experience.'), parentLabel: getLocaleText(locale, 'Laboratorio Cultural', 'Cultural Lab'), parentHref: "/laboratorio-cultural", currentLabel: getLocaleText(locale, 'Missão e Objetivos', 'Mission and Goals'), currentHref: "/laboratorio-cultural/roadmap" }), _jsx("main", { className: mainContent, children: _jsx("section", { className: "pb-20", children: _jsx("div", { className: `${container} mt-6 px-4 sm:px-6 xl:px-8`, children: _jsxs("div", { className: "relative grid grid-cols-12 items-start gap-8", children: [_jsx("div", { className: "col-span-12 mt-8 grid grid-cols-2 gap-8 lg:col-span-8", children: contentBlocks.map((item) => (_jsxs("div", { className: "col-span-2 md:col-span-1", children: [_jsx("h2", { className: "mb-3 font-heading text-[2rem] font-bold leading-tight decoration-2 underline-offset-3", children: item.title }), 'text' in item ? (_jsx("p", { className: "text-[1.12rem] leading-9 text-slate-700", children: item.text })) : (_jsx("div", { className: "space-y-4", children: item.items.map((objective) => (_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("span", { className: "mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dd8609]" }), _jsx("p", { className: "text-[1.08rem] leading-8 text-slate-700", children: objective })] }, objective))) }))] }, item.title))) }), _jsx("div", { className: "col-span-4 hidden lg:block", children: _jsx("div", { className: "sticky top-40 mx-auto mt-6 flex h-96 w-96 items-center justify-center rounded-[1.75rem] border border-slate-100 bg-slate-50 p-10 shadow-[0_18px_40px_rgba(15,23,42,0.05)]", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white", children: _jsx("img", { src: logo, alt: "ISPGAYA", className: "h-14 w-auto" }) }), _jsx("p", { className: "mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Laborat\u00F3rio Cultural" }), _jsx("p", { className: "mt-4 text-base leading-8 text-slate-600", children: "Um espa\u00E7o para descobrir, participar e dar continuidade \u00E0s experi\u00EAncias culturais da comunidade acad\u00E9mica." })] }) }) })] }) }) }) }), _jsx(Footer, {})] }));
}
export default LaboratorioRoadmap;
