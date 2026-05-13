import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download } from 'lucide-react';
import { docBadge, docDownloadAction, docDownloadIcon, docMain, docMeta, docName, docRow, docTop } from '../../styles/ui';
import { useLocale, getLocaleText } from '../../i18n/locale.js';
function DocumentRow({ name, meta, href }) {
    const { locale } = useLocale();
    return (_jsxs("article", { className: docRow, children: [_jsx("span", { className: docBadge, children: "PDF" }), _jsxs("div", { className: docMain, children: [_jsx("div", { className: docTop, children: _jsx("h3", { className: docName, children: name }) }), _jsx("p", { className: docMeta, children: meta })] }), _jsx("a", { href: href, className: docDownloadAction, "aria-label": getLocaleText(locale, `Descarregar ${name}`, `Download ${name}`), children: _jsx(Download, { className: docDownloadIcon }) })] }));
}
export default DocumentRow;
