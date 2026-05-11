import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { breadcrumbsAnchor, breadcrumbsItemCurrent, breadcrumbsItemMuted, breadcrumbsList, breadcrumbsNav, breadcrumbsSlash, heroIntroText, heroIntroTitle, heroIntroWrap, heroPatternSection, heroPatternWrap } from '../../styles/ui';
function renderBreadcrumbLink(href, label, className) {
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    return isExternal ? (_jsx("a", { href: href, className: className, children: label })) : (_jsx(Link, { to: href, className: className, children: label }));
}
function Breadcrumbs({ title = 'Publicacoes Cientificas', description = 'O ISPGAYA desenvolve investigacao cientifica nas diversas areas em que oferece formacao, resultando em publicacoes, livros, capitulos e artigos cientificos.', parentLabel = 'Investigacao', parentHref = '/', currentLabel = 'Publicacoes Cientificas', currentHref = '/' }) {
    return (_jsx("div", { className: heroPatternWrap, children: _jsxs("section", { className: heroPatternSection, children: [_jsx("nav", { className: breadcrumbsNav, "aria-label": "Breadcrumb", children: _jsxs("ol", { role: "list", className: breadcrumbsList, children: [_jsx("li", { children: _jsxs("div", { className: breadcrumbsItemMuted, children: [renderBreadcrumbLink(parentHref, parentLabel, breadcrumbsAnchor), _jsx("span", { className: breadcrumbsSlash, children: "/" })] }) }), _jsx("li", { children: _jsx("div", { className: breadcrumbsItemCurrent, children: renderBreadcrumbLink(currentHref, currentLabel, breadcrumbsAnchor) }) })] }) }), _jsxs("div", { className: heroIntroWrap, children: [_jsx("h1", { className: heroIntroTitle, children: title }), _jsx("p", { className: heroIntroText, children: description })] })] }) }));
}
export default Breadcrumbs;
