import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function getAdminHeroToneClasses(tone) {
    if (tone === 'blue')
        return 'bg-sky-100 text-sky-700';
    if (tone === 'rose')
        return 'bg-rose-100 text-rose-700';
    if (tone === 'emerald')
        return 'bg-emerald-100 text-emerald-700';
    if (tone === 'slate')
        return 'bg-slate-100 text-slate-700';
    return 'bg-amber-100 text-amber-700';
}
function AdminPageHero({ icon: Icon, title, description, tone = 'amber', stats = [], actions, }) {
    return (_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsx("div", { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `flex h-11 w-11 items-center justify-center rounded-xl ${getAdminHeroToneClasses(tone)}`, children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-semibold text-slate-900", children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: description })] })] }) }), actions ? _jsx("div", { className: "flex flex-wrap gap-3", children: actions }) : null] }), stats.length > 0 ? (_jsx("div", { className: "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", children: stats.map((stat) => (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm", children: [_jsx("p", { className: "text-2xl font-semibold text-slate-900", children: stat.value }), _jsx("p", { className: "mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500", children: stat.label })] }, stat.label))) })) : null] }));
}
export default AdminPageHero;
