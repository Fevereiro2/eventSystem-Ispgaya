import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, Eye, LineChart, Users, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminPageHero from '../components/AdminPageHero.js';
import { adminBtnSecondary, adminError, adminInfo, adminPanelCard, adminStatCard, adminStatLabel, adminStatValue, } from '../../../styles/ui.js';
import { fetchAdminMetricsOverview, getStoredAccessToken, InfoCulturaApiError, } from '../../../api/infoculturaApi.js';
const PERIOD_LABELS = {
    day: 'Dia',
    week: 'Semana',
    month: 'Mês',
};
const SECTION_LABELS = {
    home: 'Início',
    news: 'Notícias',
    events: 'Eventos',
    research: 'Investigação',
    laboratory: 'Laboratório Cultural',
    agenda: 'Agenda',
    clubs: 'Clubes',
    books: 'Livros',
    sessions: 'Sessões',
};
function getSectionLabel(value) {
    return SECTION_LABELS[value] || value;
}
function formatShortDate(value) {
    if (!value)
        return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
    }).format(date);
}
function MetricBars({ overview }) {
    const maxValue = Math.max(1, ...(overview?.series.map((point) => point.value) || [1]));
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("div", { className: "flex flex-wrap items-center justify-between gap-3", children: _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-semibold text-slate-900", children: "Evolu\u00E7\u00E3o temporal" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: overview ? `Janela atual: ${PERIOD_LABELS[overview.period] || overview.period}` : 'Sem dados.' })] }) }), _jsx("div", { className: "mt-6 h-64", children: overview && overview.series.length > 0 ? (_jsxs("svg", { viewBox: "0 0 1000 280", className: "h-full w-full", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "metrics-gradient", x1: "0", x2: "0", y1: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#dd8609", stopOpacity: "0.9" }), _jsx("stop", { offset: "100%", stopColor: "#dd8609", stopOpacity: "0.2" })] }) }), overview.series.map((point, index) => {
                            const barWidth = 1000 / overview.series.length;
                            const height = (point.value / maxValue) * 220;
                            const x = index * barWidth + 8;
                            const y = 250 - height;
                            return (_jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: Math.max(barWidth - 16, 8), height: height, rx: "14", fill: "url(#metrics-gradient)" }), _jsx("text", { x: x + 4, y: 268, fontSize: "16", fill: "#475569", children: point.label }), _jsx("text", { x: x + 4, y: Math.max(y - 10, 18), fontSize: "16", fontWeight: "600", fill: "#0f172a", children: point.value })] }, point.label));
                        })] })) : (_jsx("p", { className: adminInfo, children: "Ainda n\u00E3o existem dados para este per\u00EDodo." })) })] }));
}
function MetricsPage() {
    const token = getStoredAccessToken();
    const [period, setPeriod] = useState('week');
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        async function loadMetrics() {
            if (!token)
                return;
            setLoading(true);
            setError('');
            try {
                const nextOverview = await fetchAdminMetricsOverview(token, { period, limit: 10 });
                if (!active)
                    return;
                setOverview(nextOverview);
            }
            catch (caughtError) {
                if (!active)
                    return;
                const message = caughtError instanceof InfoCulturaApiError
                    ? caughtError.message
                    : caughtError instanceof Error
                        ? caughtError.message
                        : 'Nao foi possivel carregar as metricas.';
                setError(message);
            }
            finally {
                if (active) {
                    setLoading(false);
                }
            }
        }
        void loadMetrics();
        return () => {
            active = false;
        };
    }, [period, token]);
    const topPage = overview?.top_pages[0] || null;
    const sectionRows = useMemo(() => overview?.section_breakdown || [], [overview]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AdminPageHero, { icon: BarChart3, title: "M\u00E9tricas", description: "Vis\u00E3o estat\u00EDstica das p\u00E1ginas mais visualizadas por dia, semana e m\u00EAs.", tone: "emerald", stats: [
                    { label: 'Visualizações', value: overview?.total_views ?? 0 },
                    { label: 'Páginas únicas', value: overview?.unique_pages ?? 0 },
                    { label: 'Visitantes', value: overview?.unique_visitors ?? 0 },
                    { label: 'Clubes criados', value: overview?.clubs_created ?? 0 },
                    { label: 'Notícias criadas', value: overview?.news_created ?? 0 },
                    { label: 'Top page', value: topPage ? topPage.views : 0 },
                ] }), _jsxs("section", { className: adminPanelCard, children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-semibold text-slate-900", children: "Intervalo" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Alterna entre os principais recortes temporais." })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['day', 'week', 'month'].map((item) => (_jsx("button", { type: "button", className: period === item
                                        ? 'rounded-md border border-[#dd8609] bg-orange-50 px-4 py-2 text-sm font-semibold text-[#dd8609]'
                                        : adminBtnSecondary, onClick: () => setPeriod(item), children: PERIOD_LABELS[item] }, item))) })] }), loading ? _jsx("p", { className: "mt-4 text-sm text-slate-500", children: "A carregar m\u00E9tricas..." }) : null, error ? _jsx("p", { className: `mt-4 ${adminError}`, children: error }) : null] }), _jsxs("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [_jsxs("article", { className: adminStatCard, children: [_jsx(Eye, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: overview?.total_views ?? 0 }), _jsx("p", { className: adminStatLabel, children: "Visualiza\u00E7\u00F5es totais" })] }), _jsxs("article", { className: adminStatCard, children: [_jsx(TrendingUp, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: overview?.unique_pages ?? 0 }), _jsx("p", { className: adminStatLabel, children: "P\u00E1ginas \u00FAnicas" })] }), _jsxs("article", { className: adminStatCard, children: [_jsx(Users, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("p", { className: `${adminStatValue} mt-3`, children: overview?.unique_visitors ?? 0 }), _jsx("p", { className: adminStatLabel, children: "Visitantes \u00FAnicos" })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]", children: [_jsx(MetricBars, { overview: overview }), _jsxs("section", { className: adminPanelCard, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(LineChart, { className: "h-5 w-5 text-[#dd8609]" }), _jsx("h3", { className: "text-2xl font-semibold text-slate-900", children: "Top p\u00E1ginas" })] }), _jsx("div", { className: "mt-6 space-y-4", children: overview?.top_pages?.length ? (overview.top_pages.map((item, index) => (_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-slate-500", children: getSectionLabel(item.section) }), _jsx("h4", { className: "mt-1 truncate text-base font-semibold text-slate-900", children: item.title }), _jsx("p", { className: "mt-1 break-all text-xs text-slate-500", children: item.page_path })] }), _jsxs("span", { className: "rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700", children: [item.views, " vistas"] })] }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600", children: [_jsxs("p", { children: ["Visitantes: ", item.unique_visitors] }), _jsxs("p", { className: "text-right", children: ["\u00DAltima vista: ", formatShortDate(item.last_viewed_at)] })] })] }, `${item.page_path}-${index}`)))) : (_jsx("p", { className: adminInfo, children: "Ainda n\u00E3o h\u00E1 p\u00E1ginas com visualiza\u00E7\u00F5es." })) })] })] }), _jsxs("section", { className: adminPanelCard, children: [_jsx("h3", { className: "text-2xl font-semibold text-slate-900", children: "Distribui\u00E7\u00E3o por sec\u00E7\u00E3o" }), _jsx("div", { className: "mt-6 space-y-4", children: sectionRows.length > 0 ? (sectionRows.map((item) => (_jsxs("div", { className: "grid grid-cols-[120px_minmax(0,1fr)_60px] items-center gap-3", children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: getSectionLabel(item.section) }), _jsx("div", { className: "h-3 rounded-full bg-slate-100", children: _jsx("div", { className: "h-3 rounded-full bg-[#dd8609]", style: {
                                            width: `${Math.min(100, (item.views / Math.max(1, overview?.total_views || 1)) * 100)}%`
                                        } }) }), _jsx("p", { className: "text-right text-sm font-semibold text-slate-700", children: item.views })] }, item.section)))) : (_jsx("p", { className: adminInfo, children: "Sem dados de sec\u00E7\u00F5es para mostrar." })) })] })] }));
}
export default MetricsPage;
