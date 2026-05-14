import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, ShieldAlert, ScrollText, Clock3, BadgeInfo } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminPageHero from '../components/AdminPageHero.js';
import { adminBtnSecondary, adminError, adminInfo, adminPanelCard, adminStatCard, adminStatLabel, adminStatValue, } from '../../../styles/ui.js';
import { fetchAdminActivityLogs, getStoredAccessToken, InfoCulturaApiError, } from '../../../api/infoculturaApi.js';
const SOURCE_LABELS = {
    audit: 'Administração',
    editorial: 'Editorial',
};
const CONTENT_LABELS = {
    news: 'Notícias',
    club: 'Clubes',
    content: 'Conteúdos',
    category: 'Categorias',
    book: 'Livros',
    session: 'Sessões',
    event: 'Eventos',
    newsletter: 'Newsletters',
    newsletter_subscriber: 'Subscritores',
    user: 'Utilizadores',
    registration: 'Inscrições',
    image: 'Imagens',
};
function formatShortDateTime(value) {
    if (!value)
        return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
function getContentLabel(value) {
    return CONTENT_LABELS[value] || value;
}
function getSourceLabel(value) {
    return SOURCE_LABELS[value] || value;
}
function LogsPage() {
    const token = getStoredAccessToken();
    const [source, setSource] = useState('all');
    const [search, setSearch] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        async function loadLogs() {
            if (!token)
                return;
            setLoading(true);
            setError('');
            try {
                const response = await fetchAdminActivityLogs(token, {
                    source: source === 'all' ? undefined : source,
                    search,
                    limit: 100,
                });
                if (!active)
                    return;
                setLogs(response.items);
            }
            catch (caughtError) {
                if (!active)
                    return;
                const message = caughtError instanceof InfoCulturaApiError
                    ? caughtError.message
                    : caughtError instanceof Error
                        ? caughtError.message
                        : 'Nao foi possivel carregar os logs.';
                setError(message);
            }
            finally {
                if (active) {
                    setLoading(false);
                }
            }
        }
        void loadLogs();
        return () => {
            active = false;
        };
    }, [search, source, token]);
    const stats = useMemo(() => ({
        total: logs.length,
        audit: logs.filter((item) => item.source === 'audit').length,
        editorial: logs.filter((item) => item.source === 'editorial').length,
        publicRegistrations: logs.filter((item) => item.content_type === 'registration').length,
    }), [logs]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AdminPageHero, { icon: ScrollText, title: "Logs", description: "Hist\u00F3rico centralizado das a\u00E7\u00F5es administrativas, editoriais e submiss\u00F5es p\u00FAblicas.", tone: "slate", stats: [
                    { label: 'Entradas', value: stats.total },
                    { label: 'Administração', value: stats.audit },
                    { label: 'Editorial', value: stats.editorial },
                    { label: 'Inscrições', value: stats.publicRegistrations },
                ] }), _jsxs("section", { className: adminPanelCard, children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-semibold text-slate-900", children: "Filtro" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Pesquisa r\u00E1pida no feed de a\u00E7\u00F5es do portal." })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['all', 'audit', 'editorial'].map((item) => (_jsx("button", { type: "button", className: source === item
                                        ? 'rounded-md border border-[#dd8609] bg-orange-50 px-4 py-2 text-sm font-semibold text-[#dd8609]'
                                        : adminBtnSecondary, onClick: () => setSource(item), children: item === 'all' ? 'Tudo' : getSourceLabel(item) }, item))) })] }), _jsxs("label", { className: "mt-4 block", children: [_jsx("span", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Pesquisa" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), className: "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#dd8609]", placeholder: "Procurar por not\u00EDcia, clube, utilizador ou resumo..." })] }), loading ? _jsx("p", { className: "mt-4 text-sm text-slate-500", children: "A carregar logs..." }) : null, error ? _jsx("p", { className: `mt-4 ${adminError}`, children: error }) : null] }), _jsxs("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [_jsxs("article", { className: adminStatCard, children: [_jsx(BadgeInfo, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: stats.total }), _jsx("p", { className: adminStatLabel, children: "Total" })] }), _jsxs("article", { className: adminStatCard, children: [_jsx(ShieldAlert, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: stats.audit }), _jsx("p", { className: adminStatLabel, children: "Administra\u00E7\u00E3o" })] }), _jsxs("article", { className: adminStatCard, children: [_jsx(Activity, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: stats.editorial }), _jsx("p", { className: adminStatLabel, children: "Editorial" })] }), _jsxs("article", { className: adminStatCard, children: [_jsx(Clock3, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: stats.publicRegistrations }), _jsx("p", { className: adminStatLabel, children: "Inscri\u00E7\u00F5es" })] })] }), _jsxs("section", { className: adminPanelCard, children: [_jsx("h3", { className: "text-2xl font-semibold text-slate-900", children: "Atividade recente" }), _jsx("div", { className: "mt-6 space-y-4", children: logs.length > 0 ? (logs.map((item, index) => (_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700", children: getSourceLabel(item.source) }), _jsx("span", { className: "rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#dd8609]", children: getContentLabel(item.content_type) }), _jsx("span", { className: "rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600", children: item.action })] }), _jsx("h4", { className: "mt-3 text-base font-semibold text-slate-900", children: item.summary }), _jsxs("p", { className: "mt-1 text-sm text-slate-600", children: ["Por ", item.actor_name, item.club_id ? ` · Clube #${item.club_id}` : ''] })] }), _jsx("p", { className: "shrink-0 text-sm text-slate-500", children: formatShortDateTime(item.created_at) })] }), item.metadata_json ? (_jsx("pre", { className: "mt-3 overflow-auto rounded-xl bg-white p-3 text-xs text-slate-600", children: item.metadata_json })) : null] }, `${item.source}-${item.content_type}-${item.object_id ?? index}-${index}`)))) : (_jsx("p", { className: adminInfo, children: "Ainda n\u00E3o h\u00E1 logs para mostrar." })) })] })] }));
}
export default LogsPage;
