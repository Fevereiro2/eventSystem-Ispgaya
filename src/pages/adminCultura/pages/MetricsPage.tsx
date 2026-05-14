import { BarChart3, Eye, LineChart, Users, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import AdminPageHero from '../components/AdminPageHero.js';
import {
  adminBtnSecondary,
  adminError,
  adminInfo,
  adminPanelCard,
  adminStatCard,
  adminStatLabel,
  adminStatValue,
} from '../../../styles/ui.js';
import {
  fetchAdminMetricsOverview,
  getStoredAccessToken,
  InfoCulturaApiError,
  InfoCulturaMetricsOverview,
} from '../../../api/infoculturaApi.js';

const PERIOD_LABELS: Record<'day' | 'week' | 'month', string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mês',
};

const SECTION_LABELS: Record<string, string> = {
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

function getSectionLabel(value: string): string {
  return SECTION_LABELS[value] || value;
}

function formatShortDate(value: string | null): string {
  if (!value) return 'Sem data';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

function MetricBars({ overview }: { overview: InfoCulturaMetricsOverview | null }) {
  const maxValue = Math.max(1, ...(overview?.series.map((point) => point.value) || [1]));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Evolução temporal</h3>
          <p className="mt-1 text-sm text-slate-600">
            {overview ? `Janela atual: ${PERIOD_LABELS[overview.period as 'day' | 'week' | 'month'] || overview.period}` : 'Sem dados.'}
          </p>
        </div>
      </div>

      <div className="mt-6 h-64">
        {overview && overview.series.length > 0 ? (
          <svg viewBox="0 0 1000 280" className="h-full w-full">
            <defs>
              <linearGradient id="metrics-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#dd8609" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#dd8609" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {overview.series.map((point, index) => {
              const barWidth = 1000 / overview.series.length;
              const height = (point.value / maxValue) * 220;
              const x = index * barWidth + 8;
              const y = 250 - height;
              return (
                <g key={point.label}>
                  <rect x={x} y={y} width={Math.max(barWidth - 16, 8)} height={height} rx="14" fill="url(#metrics-gradient)" />
                  <text x={x + 4} y={268} fontSize="16" fill="#475569">
                    {point.label}
                  </text>
                  <text x={x + 4} y={Math.max(y - 10, 18)} fontSize="16" fontWeight="600" fill="#0f172a">
                    {point.value}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <p className={adminInfo}>Ainda não existem dados para este período.</p>
        )}
      </div>
    </div>
  );
}

function MetricsPage() {
  const token = getStoredAccessToken();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [overview, setOverview] = useState<InfoCulturaMetricsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMetrics() {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const nextOverview = await fetchAdminMetricsOverview(token, { period, limit: 10 });
        if (!active) return;
        setOverview(nextOverview);
      } catch (caughtError) {
        if (!active) return;
        const message =
          caughtError instanceof InfoCulturaApiError
            ? caughtError.message
            : caughtError instanceof Error
              ? caughtError.message
              : 'Nao foi possivel carregar as metricas.';
        setError(message);
      } finally {
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

  const sectionRows = useMemo(
    () => overview?.section_breakdown || [],
    [overview]
  );

  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={BarChart3}
        title="Métricas"
        description="Visão estatística das páginas mais visualizadas por dia, semana e mês."
        tone="emerald"
        stats={[
          { label: 'Visualizações', value: overview?.total_views ?? 0 },
          { label: 'Páginas únicas', value: overview?.unique_pages ?? 0 },
          { label: 'Visitantes', value: overview?.unique_visitors ?? 0 },
          { label: 'Clubes criados', value: overview?.clubs_created ?? 0 },
          { label: 'Notícias criadas', value: overview?.news_created ?? 0 },
          { label: 'Top page', value: topPage ? topPage.views : 0 },
        ]}
      />

      <section className={adminPanelCard}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Intervalo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Alterna entre os principais recortes temporais.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['day', 'week', 'month'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={
                  period === item
                    ? 'rounded-md border border-[#dd8609] bg-orange-50 px-4 py-2 text-sm font-semibold text-[#dd8609]'
                    : adminBtnSecondary
                }
                onClick={() => setPeriod(item)}
              >
                {PERIOD_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-500">A carregar métricas...</p> : null}
        {error ? <p className={`mt-4 ${adminError}`}>{error}</p> : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className={adminStatCard}>
          <Eye className="h-5 w-5 text-[#dd8609]" />
          <p className={`${adminStatValue} mt-3`}>{overview?.total_views ?? 0}</p>
          <p className={adminStatLabel}>Visualizações totais</p>
        </article>
        <article className={adminStatCard}>
          <TrendingUp className="h-5 w-5 text-[#dd8609]" />
          <p className={`${adminStatValue} mt-3`}>{overview?.unique_pages ?? 0}</p>
          <p className={adminStatLabel}>Páginas únicas</p>
        </article>
        <article className={adminStatCard}>
          <Users className="h-5 w-5 text-[#dd8609]" />
          <p className={`${adminStatValue} mt-3`}>{overview?.unique_visitors ?? 0}</p>
          <p className={adminStatLabel}>Visitantes únicos</p>
        </article>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MetricBars overview={overview} />

        <section className={adminPanelCard}>
          <div className="flex items-center gap-3">
            <LineChart className="h-5 w-5 text-[#dd8609]" />
            <h3 className="text-2xl font-semibold text-slate-900">Top páginas</h3>
          </div>
          <div className="mt-6 space-y-4">
            {overview?.top_pages?.length ? (
              overview.top_pages.map((item, index) => (
                <article key={`${item.page_path}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {getSectionLabel(item.section)}
                      </p>
                      <h4 className="mt-1 truncate text-base font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 break-all text-xs text-slate-500">{item.page_path}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.views} vistas
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <p>Visitantes: {item.unique_visitors}</p>
                    <p className="text-right">
                      Última vista: {formatShortDate(item.last_viewed_at)}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className={adminInfo}>Ainda não há páginas com visualizações.</p>
            )}
          </div>
        </section>
      </div>

      <section className={adminPanelCard}>
        <h3 className="text-2xl font-semibold text-slate-900">Distribuição por secção</h3>
        <div className="mt-6 space-y-4">
          {sectionRows.length > 0 ? (
            sectionRows.map((item) => (
              <div key={item.section} className="grid grid-cols-[120px_minmax(0,1fr)_60px] items-center gap-3">
                  <p className="text-sm font-medium text-slate-700">{getSectionLabel(item.section)}</p>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-[#dd8609]"
                    style={{
                      width: `${Math.min(100, (item.views / Math.max(1, overview?.total_views || 1)) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-right text-sm font-semibold text-slate-700">{item.views}</p>
              </div>
            ))
          ) : (
            <p className={adminInfo}>Sem dados de secções para mostrar.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MetricsPage;
