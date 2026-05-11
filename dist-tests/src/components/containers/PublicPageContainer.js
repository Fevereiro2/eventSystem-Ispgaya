import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Breadcrumbs from '../ui/Breadcrumbs';
import Footer from '../layout/Footer';
import HeaderNav from '../layout/HeaderNav';
import TopBar from '../layout/TopBar';
import { container, contentSection, mainContent } from '../../styles/ui';
function PublicPageContainer({ title, description, parentLabel, parentHref, currentLabel, currentHref, children }) {
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: title, description: description, parentLabel: parentLabel, parentHref: parentHref, currentLabel: currentLabel, currentHref: currentHref }), _jsx("main", { className: mainContent, children: _jsx("section", { className: contentSection, children: _jsx("div", { className: `${container} relative z-10 mb-12 mt-6 px-4 sm:px-6 xl:px-8`, children: children }) }) }), _jsx(Footer, {})] }));
}
export default PublicPageContainer;
