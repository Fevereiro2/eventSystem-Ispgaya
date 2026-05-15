import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Newspaper } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
import { NewsFormState } from './types';
import { formatAdminDateTime, getWorkflowStatusLabel, normalizeWorkflowStatus } from './utils';
import {
  adminActions,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminFieldSpaced,
  adminFormGridSpaced,
  adminHeaderRow,
  adminInfo,
  adminInput,
  adminLabel,
  adminList,
  adminListDesc,
  adminListItem,
  adminListMeta,
  adminListTitle,
  adminListTools,
  adminListTop,
  adminPanelCard,
  adminPanelForm,
  adminTextarea,
  blockText,
  blockTitle,
} from '../../styles/ui';
import {
  InfoCulturaClub,
  InfoCulturaNews,
  InfoCulturaNewsStatus,
  resolveInfoCulturaAssetUrl,
} from '../../api/infoculturaApi';

type AdminHeroStat = { label: string; value: string | number };

type NewsPageProps = {
  canManageUsers: boolean;
  newsOverviewStats: AdminHeroStat[];
  isExportingNews: boolean;
  handleExportNewsCsv: () => void | Promise<void>;
  showNewsForm: boolean;
  showNewsList: boolean;
  handleSaveNews: (event: FormEvent<HTMLFormElement>) => void;
  editingNewsId: number | null;
  newsForm: NewsFormState;
  setNewsForm: Dispatch<SetStateAction<NewsFormState>>;
  clubs: InfoCulturaClub[];
  isLoadingNewsStatuses: boolean;
  availableNewsStatuses: InfoCulturaNewsStatus[];
  newsFormError: string;
  isSavingNews: boolean;
  resetNewsForm: () => void;
  newsImageFileKey: number;
  isUploadingNewsImage: boolean;
  handleUploadNewsImage: (file: File | null) => void | Promise<void>;
  newsError: string;
  handleApplyNewsSearch: (event: FormEvent<HTMLFormElement>) => void;
  newsSearchInput: string;
  setNewsSearchInput: Dispatch<SetStateAction<string>>;
  setNewsSearch: Dispatch<SetStateAction<string>>;
  setNewsPage: Dispatch<SetStateAction<number>>;
  newsClubFilter: string;
  setNewsClubFilter: Dispatch<SetStateAction<string>>;
  newsStatusFilter: string;
  setNewsStatusFilter: Dispatch<SetStateAction<string>>;
  newsStatuses: InfoCulturaNewsStatus[];
  newsDateFrom: string;
  setNewsDateFrom: Dispatch<SetStateAction<string>>;
  newsDateTo: string;
  setNewsDateTo: Dispatch<SetStateAction<string>>;
  newsOrder: string;
  setNewsOrder: Dispatch<SetStateAction<string>>;
  selectedNewsIds: number[];
  setSelectedNewsIds: Dispatch<SetStateAction<number[]>>;
  sortedNews: InfoCulturaNews[];
  bulkNewsStatus: string;
  setBulkNewsStatus: Dispatch<SetStateAction<string>>;
  isApplyingBulkNews: boolean;
  handleApplyBulkNewsStatus: () => void | Promise<void>;
  isDeletingBulkNews: boolean;
  handleBulkDeleteNews: () => void | Promise<void>;
  deletingNewsId: number | null;
  handleDeleteNews: (id: number) => void | Promise<void>;
  handleEditNews: (item: InfoCulturaNews) => void;
  newsTotal: number;
  newsPage: number;
  newsTotalPages: number;
  isLoadingNews: boolean;
  toggleSelectedId: (setter: Dispatch<SetStateAction<number[]>>, id: number) => void;
};

function NewsPage({
  canManageUsers,
  newsOverviewStats,
  isExportingNews,
  handleExportNewsCsv,
  showNewsForm,
  showNewsList,
  handleSaveNews,
  editingNewsId,
  newsForm,
  setNewsForm,
  clubs,
  isLoadingNewsStatuses,
  availableNewsStatuses,
  newsFormError,
  isSavingNews,
  resetNewsForm,
  newsImageFileKey,
  isUploadingNewsImage,
  handleUploadNewsImage,
  newsError,
  handleApplyNewsSearch,
  newsSearchInput,
  setNewsSearchInput,
  setNewsSearch,
  setNewsPage,
  newsClubFilter,
  setNewsClubFilter,
  newsStatusFilter,
  setNewsStatusFilter,
  newsStatuses,
  newsDateFrom,
  setNewsDateFrom,
  newsDateTo,
  setNewsDateTo,
  newsOrder,
  setNewsOrder,
  selectedNewsIds,
  setSelectedNewsIds,
  sortedNews,
  bulkNewsStatus,
  setBulkNewsStatus,
  isApplyingBulkNews,
  handleApplyBulkNewsStatus,
  isDeletingBulkNews,
  handleBulkDeleteNews,
  deletingNewsId,
  handleDeleteNews,
  handleEditNews,
  newsTotal,
  newsPage,
  newsTotalPages,
  isLoadingNews,
  toggleSelectedId,
}: NewsPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={Newspaper}
        title="Noticias"
        description="Workflow editorial, publicacao e acompanhamento das noticias por clube."
        tone="blue"
        stats={newsOverviewStats}

      />

      {showNewsForm ? (
        <form id="news-form" onSubmit={handleSaveNews} className={adminPanelForm}>
          <h2 className={blockTitle}>{editingNewsId ? 'Editar Noticia' : 'Nova Noticia'}</h2>
          <p className={blockText}>Publica novidades de cada clube e controla o respetivo estado.</p>

          <div className={adminFormGridSpaced}>
            {canManageUsers ? (
              <div className={adminField}>
                <label className={adminLabel} htmlFor="news-club-id">
                  Clube
                </label>
                <select
                  id="news-club-id"
                  className={adminInput}
                  value={newsForm.club_id}
                  onChange={(event) =>
                    setNewsForm((prev) => ({ ...prev, club_id: event.target.value }))
                  }
                >
                  <option value="">Seleciona um clube</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-title">
                Titulo
              </label>
              <input
                id="news-title"
                className={adminInput}
                value={newsForm.title}
                onChange={(event) =>
                  setNewsForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </div>

            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-status">
                Estado
              </label>
              <select
                id="news-status"
                className={adminInput}
                value={newsForm.news_status}
                onChange={(event) =>
                  setNewsForm((prev) => ({
                    ...prev,
                    news_status: normalizeWorkflowStatus(event.target.value),
                  }))
                }
              >
                {isLoadingNewsStatuses ? <option value="">A carregar estados...</option> : null}
                {availableNewsStatuses.map((status) => (
                  <option key={status.id} value={status.name}>
                    {getWorkflowStatusLabel(status.name)}
                  </option>
                ))}
              </select>
              <p className={blockText}>
                {canManageUsers
                  ? 'O superadmin pode publicar ou arquivar diretamente.'
                  : 'O club_admin trabalha em rascunho ou envia para revisao.'}
              </p>
            </div>

            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-published-at">
                Publicado em
              </label>
              <input
                id="news-published-at"
                type="datetime-local"
                className={adminInput}
                value={newsForm.published_at}
                disabled={
                  !canManageUsers &&
                  !['published', 'archived'].includes(normalizeWorkflowStatus(newsForm.news_status))
                }
                onChange={(event) =>
                  setNewsForm((prev) => ({ ...prev, published_at: event.target.value }))
                }
              />
            </div>
          </div>

          <div className={adminFieldSpaced}>
            <label className={adminLabel} htmlFor="news-summary">
              Resumo
            </label>
            <textarea
              id="news-summary"
              rows={3}
              className={adminTextarea}
              value={newsForm.summary}
              onChange={(event) =>
                setNewsForm((prev) => ({ ...prev, summary: event.target.value }))
              }
            />
          </div>

          <div className={adminFieldSpaced}>
            <label className={adminLabel} htmlFor="news-image">
              Imagem
            </label>
            <input
              id="news-image"
              key={newsImageFileKey}
              type="file"
              accept="image/*"
              className={adminInput}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                void handleUploadNewsImage(file);
              }}
            />
            <p className={blockText}>
              {isUploadingNewsImage
                ? 'A carregar imagem...'
                : newsForm.image
                  ? 'Imagem carregada com sucesso.'
                  : 'Seleciona uma imagem para a noticia.'}
            </p>
            {newsForm.image ? (
              <img
                src={resolveInfoCulturaAssetUrl(newsForm.image)}
                alt="Preview da noticia"
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>

          <div className={adminFieldSpaced}>
            <label className={adminLabel} htmlFor="news-content">
              Conteudo
            </label>
            <textarea
              id="news-content"
              rows={6}
              className={adminTextarea}
              value={newsForm.content}
              onChange={(event) =>
                setNewsForm((prev) => ({ ...prev, content: event.target.value }))
              }
            />
          </div>

          {newsFormError ? <p className={adminError}>{newsFormError}</p> : null}

          <div className={adminActions}>
            <button type="submit" className={adminBtnPrimary} disabled={isSavingNews}>
              {isSavingNews ? 'A guardar...' : editingNewsId ? 'Atualizar' : 'Criar'}
            </button>
            <button type="button" onClick={resetNewsForm} className={adminBtnSecondary}>
              Limpar
            </button>
          </div>
        </form>
      ) : null}

      {showNewsList ? (
        <section id="news-list" className={adminPanelCard}>
          <div className={adminHeaderRow}>
            <div>
              <h2 className={blockTitle}>Noticias registadas</h2>
              <p className={blockText}>Lista das noticias criadas no InfoCultura.</p>
            </div>
            {canManageUsers ? (
              <div className={adminField}>
                <label className={adminLabel} htmlFor="news-club-filter">
                  Filtrar por clube
                </label>
                <select
                  id="news-club-filter"
                  className={adminInput}
                  value={newsClubFilter}
                  onChange={(event) => setNewsClubFilter(event.target.value)}
                >
                  <option value="all">Todos os clubes</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-status-filter">
                Estado editorial
              </label>
              <select
                id="news-status-filter"
                className={adminInput}
                value={newsStatusFilter}
                onChange={(event) => setNewsStatusFilter(event.target.value)}
              >
                <option value="all">Todos os estados</option>
                {newsStatuses.map((status) => (
                  <option key={status.id} value={normalizeWorkflowStatus(status.name)}>
                    {getWorkflowStatusLabel(status.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {newsError ? <p className={adminError}>{newsError}</p> : null}

          <div className={`${adminFormGridSpaced} mt-6`}>
            <form onSubmit={handleApplyNewsSearch} className={adminPanelForm}>
              <div className={adminField}>
                <label className={adminLabel} htmlFor="news-search">
                  Pesquisar noticias
                </label>
                <input
                  id="news-search"
                  className={adminInput}
                  value={newsSearchInput}
                  onChange={(event) => setNewsSearchInput(event.target.value)}
                  placeholder="Titulo, resumo, conteudo ou clube"
                />
              </div>
              <div className={adminActions}>
                <button type="submit" className={adminBtnPrimary}>
                  Pesquisar
                </button>
                <button
                  type="button"
                  className={adminBtnSecondary}
                  onClick={() => {
                    setNewsSearchInput('');
                    setNewsSearch('');
                    setNewsPage(1);
                  }}
                >
                  Limpar
                </button>
              </div>
            </form>

            <div className={adminActions}>
          </div>
          </div>

          <div className={adminFormGridSpaced}>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-date-from">
                Criadas desde
              </label>
              <input
                id="news-date-from"
                type="date"
                className={adminInput}
                value={newsDateFrom}
                onChange={(event) => setNewsDateFrom(event.target.value)}
              />
            </div>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-date-to">
                Criadas ate
              </label>
              <input
                id="news-date-to"
                type="date"
                className={adminInput}
                value={newsDateTo}
                onChange={(event) => setNewsDateTo(event.target.value)}
              />
            </div>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="news-order">
                Ordenar por
              </label>
              <select
                id="news-order"
                className={adminInput}
                value={newsOrder}
                onChange={(event) => setNewsOrder(event.target.value)}
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="title_asc">Titulo A-Z</option>
                <option value="title_desc">Titulo Z-A</option>
                <option value="club_asc">Clube A-Z</option>
                <option value="club_desc">Clube Z-A</option>
                <option value="status_asc">Estado A-Z</option>
                <option value="status_desc">Estado Z-A</option>
              </select>
            </div>
          </div>

          <div className={adminActions}>
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() =>
                setSelectedNewsIds(
                  selectedNewsIds.length === sortedNews.length
                    ? []
                    : sortedNews.map((item) => item.id)
                )
              }
              disabled={sortedNews.length === 0}
            >
              {selectedNewsIds.length === sortedNews.length && sortedNews.length > 0
                ? 'Limpar selecao'
                : 'Selecionar pagina'}
            </button>
            <select
              className={adminInput}
              value={bulkNewsStatus}
              onChange={(event) => setBulkNewsStatus(event.target.value)}
            >
              {availableNewsStatuses.map((status) => (
                <option key={status.id} value={normalizeWorkflowStatus(status.name)}>
                  {getWorkflowStatusLabel(status.name)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={adminBtnPrimary}
              disabled={selectedNewsIds.length === 0 || isApplyingBulkNews}
              onClick={() => void handleApplyBulkNewsStatus()}
            >
              {isApplyingBulkNews ? 'A aplicar...' : 'Aplicar em lote'}
            </button>
            <button
              type="button"
              className={adminBtnDanger}
              disabled={selectedNewsIds.length === 0 || isDeletingBulkNews}
              onClick={() => void handleBulkDeleteNews()}
            >
              {isDeletingBulkNews ? 'A apagar...' : 'Apagar selecionadas'}
            </button>
          </div>

          <div className={adminList}>
            {isLoadingNews ? <p className={adminInfo}>A carregar noticias...</p> : null}
            {!isLoadingNews && sortedNews.length === 0 ? (
              <p className={adminInfo}>Nao existem noticias para o filtro atual.</p>
            ) : null}
            {sortedNews.map((item) => (
              <article key={item.id} className={adminListItem}>
                <div className={adminListTop}>
                  <label className="mr-4 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedNewsIds.includes(item.id)}
                      onChange={() => toggleSelectedId(setSelectedNewsIds, item.id)}
                    />
                    Selecionar
                  </label>
                  <div>
                    <h3 className={adminListTitle}>{item.title}</h3>
                    <p className={adminListMeta}>
                      {item.club_name} · {getWorkflowStatusLabel(item.news_status_name)} ·{' '}
                      {formatAdminDateTime(item.published_at || item.created_at)}
                    </p>
                  </div>
                </div>
                <p className={adminListDesc}>{item.summary}</p>
                {item.editorial_history && item.editorial_history.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {item.editorial_history.slice(0, 3).map((history, index) => (
                      <p key={`${item.id}-${index}`} className={adminListMeta}>
                        {history.actor_name} ·{' '}
                        {history.from_status
                          ? `${getWorkflowStatusLabel(history.from_status)} -> `
                          : ''}
                        {getWorkflowStatusLabel(history.to_status)} ·{' '}
                        {formatAdminDateTime(history.created_at || '')}
                      </p>
                    ))}
                  </div>
                ) : null}
                <div className={adminListTools}>
                  <button type="button" className={adminBtnEdit} onClick={() => handleEditNews(item)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    disabled={deletingNewsId === item.id}
                    onClick={() => handleDeleteNews(item.id)}
                  >
                    {deletingNewsId === item.id ? 'A apagar...' : 'Apagar'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!isLoadingNews ? (
            <div className={`${adminActions} mt-6`}>
              <p className={adminInfo}>
                {newsTotal} noticia(s) · pagina {newsPage} de {newsTotalPages || 1}
              </p>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={newsPage <= 1}
                onClick={() => setNewsPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={newsTotalPages === 0 || newsPage >= newsTotalPages}
                onClick={() => setNewsPage((prev) => prev + 1)}
              >
                Seguinte
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export default NewsPage;
