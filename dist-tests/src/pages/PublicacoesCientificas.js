import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Breadcrumbs from '../components/ui/Breadcrumbs';
import DocumentRow from '../components/ui/DocumentRow';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import PieChartHero from '../components/ui/PieChartHero';
import StatCard from '../components/ui/StatCard';
import TopBar from '../components/layout/TopBar';
import { getLocaleText, useLocale } from '../i18n/locale.js';
import { blockText, blockTitle, container, docsList, docsSection, mainContent, pieSection, sectionSpace, statsGrid, statsSection } from '../styles/ui';
const stats = [
    { value: 611, label: 'Publicacoes' },
    { value: 43, label: 'Livros' },
    { value: 162, label: 'Capitulos' },
    { value: 292, label: 'Artigos Cientificos' },
    { value: 114, label: 'Artigos em atas' }
];
const document = {
    name: 'Publicacoes Cientificas 2010-2024-janeiro.pdf',
    meta: '853KB',
    href: '#'
};
function PublicacoesCientificas() {
    const { locale } = useLocale();
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: getLocaleText(locale, 'Publicacoes Cientificas', 'Scientific Publications'), description: getLocaleText(locale, 'O ISPGAYA desenvolve investigacao cientifica nas diversas areas em que oferece formacao, resultando em publicacoes, livros, capitulos e artigos cientificos.', 'ISPGAYA develops scientific research across the areas in which it teaches, resulting in publications, books, chapters and scientific articles.') }), _jsxs("main", { className: mainContent, children: [_jsx("section", { className: statsSection, children: _jsxs("div", { className: container, children: [_jsx("h2", { className: blockTitle, children: getLocaleText(locale, 'Research at ISPGAYA', 'Research at ISPGAYA') }), _jsx("p", { className: blockText, children: getLocaleText(locale, 'A producao cientifica institucional tem registado crescimento sustentado, refletindo colaboracao nacional e internacional em diferentes areas de conhecimento.', 'Institutional scientific output has shown sustained growth, reflecting national and international collaboration across different fields of knowledge.') }), _jsx("div", { className: statsGrid, children: stats.map((item) => (_jsx(StatCard, { value: item.value, label: item.label }, item.label))) })] }) }), _jsx("section", { className: pieSection, children: _jsx("div", { className: container, children: _jsx(PieChartHero, {}) }) }), _jsx("section", { className: docsSection, children: _jsxs("div", { className: `${container} ${sectionSpace}`, children: [_jsx("h2", { className: blockTitle, children: getLocaleText(locale, 'Documentos', 'Documents') }), _jsx("div", { className: docsList, children: _jsx(DocumentRow, { name: document.name, meta: document.meta, href: document.href }) })] }) })] }), _jsx(Footer, {})] }));
}
export default PublicacoesCientificas;
