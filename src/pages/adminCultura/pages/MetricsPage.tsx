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
import { getLocaleText, useLocale } from '../../../i18n/locale.js';
const localeCtx = useLocale();
const locale = localeCtx.locale;

const PERIOD_LABELS: Record<'day' | 'week' | 'month', string> = {
  day: getLocaleText(locale, 'Dia', 'Day'),
  week: getLocaleText(locale, 'Semana', 'Week'),
  month: getLocaleText(locale, 'Mês', 'Month'),
};



const SECTION_LABELS: Record<string, string> = {
  home: getLocaleText(locale, 'Início', 'Home'),
  news: getLocaleText(locale, 'Notícias', 'News'),
  events: getLocaleText(locale, 'Eventos', 'Events'),
  research: getLocaleText(locale, 'Investigação', 'Research'),
  laboratory: getLocaleText(locale, 'Laboratório Cultural', 'Cultural Laboratory'),
  agenda: getLocaleText(locale, 'Agenda', 'Agenda'),
  clubs: getLocaleText(locale, 'Clubes', 'Clubs'),
  books: getLocaleText(locale, 'Livros', 'Books'),
  sessions: getLocaleText(locale, 'Sessões', 'Sessions'),
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
          <h3 className="text-2xl font-semibold text-slate-900">{getLocaleText(locale, 'Evolução', 'Evolution')}</h3>
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
          <p className={adminInfo}>{getLocaleText(locale, 'Tente selecionar outro intervalo.', 'Try selecting another time period.')}</p>
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
              : getLocaleText(locale, 'Nao foi possivel carregar as metricas.', 'Could not load metrics.');

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
        title={getLocaleText(locale, 'Métricas', 'Metrics')}
        description={getLocaleText(locale, 'Visão estatística das páginas mais visualizadas por dia, semana e mês.', 'Statistical view of the most viewed pages by day, week and month.')}
        tone="emerald"
        stats={[
          { label: getLocaleText(locale, 'Visualizações', 'Views'), value: overview?.total_views ?? 0 },
          { label: getLocaleText(locale, 'Páginas únicas', 'Unique Pages'), value: overview?.unique_pages ?? 0 },
          { label: getLocaleText(locale, 'Visitantes', 'Visitors'), value: overview?.unique_visitors ?? 0 },
          { label: getLocaleText(locale, 'Clubes criados', 'Clubs Created'), value: overview?.clubs_created ?? 0 },
          { label: getLocaleText(locale, 'Notícias criadas', 'News Created'), value: overview?.news_created ?? 0 },
          { label: getLocaleText(locale, 'Top page', 'Top Page'), value: topPage ? topPage.views : 0 },
        ]}
      />

      <section className={adminPanelCard}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{getLocaleText(locale, 'Intervalo', 'Time Period')}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {getLocaleText(locale, 'Alterna entre os principais recortes temporais.', 'Switch between the main time periods.')}
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

        {loading ? <p className="mt-4 text-sm text-slate-500">{getLocaleText(locale, 'A carregar métricas...', 'Loading metrics...')}</p> : null}
        {error ? <p className={`mt-4 ${adminError}`}>{error}</p> : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className={adminStatCard}>
          <Eye className="h-5 w-5 text-[#dd8609]" />
          <p className={`${adminStatValue} mt-3`}>{overview?.total_views ?? 0}</p>
          <p className={adminStatLabel}>{getLocaleText(locale, 'Visualizações totais', 'Total Views')}</p>
        </article>
        <article className={adminStatCard}>
          <TrendingUp className="h-5 w-5 text-[#dd8609]" />
          <p className={`${adminStatValue} mt-3`}>{overview?.unique_pages ?? 0}</p>
          <p className={adminStatLabel}>{getLocaleText(locale, 'Páginas únicas', 'Unique Pages')}</p>
        </article>
        <article className={adminStatCard}>
          <Users className="h-5 w-5 text-[#dd8609]" />
          <p className={`${adminStatValue} mt-3`}>{overview?.unique_visitors ?? 0}</p>
          <p className={adminStatLabel}>{getLocaleText(locale, 'Visitantes únicos', 'Unique Visitors')}</p>
        </article>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MetricBars overview={overview} />

        <section className={adminPanelCard}>
          <div className="flex items-center gap-3">
            <LineChart className="h-5 w-5 text-[#dd8609]" />
            <h3 className="text-2xl font-semibold text-slate-900">{getLocaleText(locale, 'Top páginas', 'Top Pages')}</h3>
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
                      {item.views} {getLocaleText(locale, 'vistas', 'views')}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <p>{getLocaleText(locale, 'Visitantes:', 'Visitors:')} {item.unique_visitors}</p>
                    <p className="text-right">
                      {getLocaleText(locale, 'Última vista:', 'Last Viewed:')} {formatShortDate(item.last_viewed_at)}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className={adminInfo}>{getLocaleText(locale, 'Ainda não há páginas com visualizações.', 'There are no pages with views yet.')}</p>
            )}
          </div>
        </section>
      </div>

      <section className={adminPanelCard}>
        <h3 className="text-2xl font-semibold text-slate-900">{getLocaleText(locale, 'Distribuição por secção', 'Distribution by Section')}</h3>
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
            <p className={adminInfo}>{getLocaleText(locale, 'Sem dados de secções para mostrar.', 'There is no section data to display.')}</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MetricsPage;
