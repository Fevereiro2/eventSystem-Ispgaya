import { Dispatch, FormEvent, SetStateAction } from 'react';
import { CalendarClock } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
import { adminNamePattern, adminNameTitle } from './nameValidation.js';
import { ActivityTab, BookFormState, CategoryFormState, EventFormState, SessionFormState } from './types';
import { formatAdminDateTime, getWorkflowStatusLabel, normalizeWorkflowStatus } from './utils';
import { EVENT_WORKFLOW_ORDER } from './constants';
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
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaEvent,
  InfoCulturaSession,
  resolveInfoCulturaAssetUrl,
} from '../../api/infoculturaApi';

type AdminHeroStat = { label: string; value: string | number };

export type ActivitiesPageProps = {
  activitySectionLabel: string;
  activitySectionDescription: string;
  activityOverviewStats: AdminHeroStat[];
  showActivityFiltersAndList: boolean;
  canManageUsers: boolean;
  clubs: InfoCulturaClub[];
  activityClubFilter: string;
  setActivityClubFilter: Dispatch<SetStateAction<string>>;
  activityCategoryFilter: string;
  setActivityCategoryFilter: Dispatch<SetStateAction<string>>;
  activityStatusFilter: string;
  setActivityStatusFilter: Dispatch<SetStateAction<string>>;
  activityError: string;
  handleApplyActivitySearch: (event: FormEvent<HTMLFormElement>) => void;
  activitySearchInput: string;
  setActivitySearchInput: Dispatch<SetStateAction<string>>;
  setActivitySearch: Dispatch<SetStateAction<string>>;
  setActivityPage: Dispatch<SetStateAction<number>>;
  activityDateFrom: string;
  setActivityDateFrom: Dispatch<SetStateAction<string>>;
  activityDateTo: string;
  setActivityDateTo: Dispatch<SetStateAction<string>>;
  activityOrder: string;
  setActivityOrder: Dispatch<SetStateAction<string>>;
  activityTab: ActivityTab;
  selectedBookIds: number[];
  setSelectedBookIds: Dispatch<SetStateAction<number[]>>;
  sortedBooks: InfoCulturaBook[];
  isDeletingBulkBooks: boolean;
  handleBulkDeleteBooks: () => void | Promise<void>;
  selectedEventIds: number[];
  setSelectedEventIds: Dispatch<SetStateAction<number[]>>;
  sortedEvents: InfoCulturaEvent[];
  bulkEventStatus: string;
  setBulkEventStatus: Dispatch<SetStateAction<string>>;
  availableEventStatuses: string[];
  isApplyingBulkEvents: boolean;
  handleApplyBulkEventStatus: () => void | Promise<void>;
  isDeletingBulkEvents: boolean;
  handleBulkDeleteEvents: () => void | Promise<void>;
  showActivityForm: boolean;
  handleSaveBook: (event: FormEvent<HTMLFormElement>) => void;
  editingBookId: number | null;
  bookForm: BookFormState;
  setBookForm: Dispatch<SetStateAction<BookFormState>>;
  bookImageFileKey: number;
  isUploadingBookImage: boolean;
  handleUploadBookImage: (file: File | null) => void | Promise<void>;
  bookFormError: string;
  isSavingBook: boolean;
  resetBookForm: () => void;
  handleEditBook: (book: InfoCulturaBook) => void;
  deletingBookId: number | null;
  handleDeleteBook: (id: number) => void | Promise<void>;
  isLoadingActivities: boolean;
  activityTotal: number;
  activityPage: number;
  activityTotalPages: number;
  handleSaveSession: (event: FormEvent<HTMLFormElement>) => void;
  editingSessionId: number | null;
  sessionForm: SessionFormState;
  setSessionForm: Dispatch<SetStateAction<SessionFormState>>;
  sessionFormError: string;
  isSavingSession: boolean;
  resetSessionForm: () => void;
  handleEditSession: (session: InfoCulturaSession) => void;
  deletingSessionId: number | null;
  handleDeleteSession: (id: number) => void | Promise<void>;
  sortedSessions: InfoCulturaSession[];
  handleSaveEvent: (event: FormEvent<HTMLFormElement>) => void;
  editingEventId: number | null;
  eventForm: EventFormState;
  setEventForm: Dispatch<SetStateAction<EventFormState>>;
  eventImageFileKey: number;
  isUploadingEventImage: boolean;
  handleUploadEventImage: (file: File | null) => void | Promise<void>;
  eventFormError: string;
  isSavingEvent: boolean;
  resetEventForm: () => void;
  handleEditEvent: (eventItem: InfoCulturaEvent) => void;
  deletingEventId: number | null;
  handleDeleteEvent: (id: number) => void | Promise<void>;
  showEventCategories: boolean;
  handleSaveCategory: (event: FormEvent<HTMLFormElement>) => void;
  categoryForm: CategoryFormState;
  setCategoryForm: Dispatch<SetStateAction<CategoryFormState>>;
  categoryFormError: string;
  isSavingCategory: boolean;
  editingCategoryId: number | null;
  resetCategoryForm: () => void;
  sortedCategories: InfoCulturaCategory[];
  isLoadingCategories: boolean;
  handleEditCategory: (category: InfoCulturaCategory) => void;
  deletingCategoryId: number | null;
  handleDeleteCategory: (id: number) => void | Promise<void>;
  toggleSelectedId: (setter: Dispatch<SetStateAction<number[]>>, id: number) => void;
};

function ActivitiesPage({
  activitySectionLabel,
  activitySectionDescription,
  activityOverviewStats,
  showActivityFiltersAndList,
  canManageUsers,
  clubs,
  activityClubFilter,
  setActivityClubFilter,
  activityCategoryFilter,
  setActivityCategoryFilter,
  activityStatusFilter,
  setActivityStatusFilter,
  activityError,
  handleApplyActivitySearch,
  activitySearchInput,
  setActivitySearchInput,
  setActivitySearch,
  setActivityPage,
  activityDateFrom,
  setActivityDateFrom,
  activityDateTo,
  setActivityDateTo,
  activityOrder,
  setActivityOrder,
  activityTab,
  selectedBookIds,
  setSelectedBookIds,
  sortedBooks,
  isDeletingBulkBooks,
  handleBulkDeleteBooks,
  selectedEventIds,
  setSelectedEventIds,
  sortedEvents,
  bulkEventStatus,
  setBulkEventStatus,
  availableEventStatuses,
  isApplyingBulkEvents,
  handleApplyBulkEventStatus,
  isDeletingBulkEvents,
  handleBulkDeleteEvents,
  showActivityForm,
  handleSaveBook,
  editingBookId,
  bookForm,
  setBookForm,
  bookImageFileKey,
  isUploadingBookImage,
  handleUploadBookImage,
  bookFormError,
  isSavingBook,
  resetBookForm,
  handleEditBook,
  deletingBookId,
  handleDeleteBook,
  isLoadingActivities,
  activityTotal,
  activityPage,
  activityTotalPages,
  handleSaveSession,
  editingSessionId,
  sessionForm,
  setSessionForm,
  sessionFormError,
  isSavingSession,
  resetSessionForm,
  handleEditSession,
  deletingSessionId,
  handleDeleteSession,
  sortedSessions,
  handleSaveEvent,
  editingEventId,
  eventForm,
  setEventForm,
  eventImageFileKey,
  isUploadingEventImage,
  handleUploadEventImage,
  eventFormError,
  isSavingEvent,
  resetEventForm,
  handleEditEvent,
  deletingEventId,
  handleDeleteEvent,
  showEventCategories,
  handleSaveCategory,
  categoryForm,
  setCategoryForm,
  categoryFormError,
  isSavingCategory,
  editingCategoryId,
  resetCategoryForm,
  sortedCategories,
  isLoadingCategories,
  handleEditCategory,
  deletingCategoryId,
  handleDeleteCategory,
  toggleSelectedId,
}: ActivitiesPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={CalendarClock}
        title={activitySectionLabel}
        description={activitySectionDescription}
        tone="blue"
        stats={activityOverviewStats}
      />

      {showActivityFiltersAndList ? (
        <section className={adminPanelCard}>
          <div className={adminHeaderRow}>
            <div>
              <h2 className={blockTitle}>{activitySectionLabel}</h2>
              <p className={blockText}>{activitySectionDescription}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {canManageUsers ? (
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="activity-club-filter">
                    Filtrar por clube
                  </label>
                  <select
                    id="activity-club-filter"
                    className={adminInput}
                    value={activityClubFilter}
                    onChange={(event) => setActivityClubFilter(event.target.value)}
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
              {activityTab === 'events' ? (
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="activity-category-filter">
                    Filtrar por categoria
                  </label>
                  <select
                    id="activity-category-filter"
                    className={adminInput}
                    value={activityCategoryFilter}
                    onChange={(event) => setActivityCategoryFilter(event.target.value)}
                  >
                    <option value="all">Todas as categorias</option>
                    {sortedCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {activityTab === 'events' ? (
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="activity-status-filter">
                    Estado editorial
                  </label>
                  <select
                    id="activity-status-filter"
                    className={adminInput}
                    value={activityStatusFilter}
                    onChange={(event) => setActivityStatusFilter(event.target.value)}
                  >
                    <option value="all">Todos os estados</option>
                    {EVENT_WORKFLOW_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {getWorkflowStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          {activityError ? <p className={adminError}>{activityError}</p> : null}

          <div className={`${adminFormGridSpaced} mt-6`}>
            <form onSubmit={handleApplyActivitySearch} className={adminPanelForm}>
              <div className={adminField}>
                <label className={adminLabel} htmlFor="activity-search">
                  Pesquisar{' '}
                  {activityTab === 'books'
                    ? 'livros'
                    : activityTab === 'sessions'
                      ? 'sessoes'
                      : 'eventos'}
                </label>
                <input
                  id="activity-search"
                  className={adminInput}
                  value={activitySearchInput}
                  onChange={(event) => setActivitySearchInput(event.target.value)}
                  placeholder={
                    activityTab === 'books'
                      ? 'Titulo, autor, editora ou clube'
                      : activityTab === 'sessions'
                        ? 'Nome, titulo, descricao ou clube'
                        : 'Titulo, descricao, local ou clube'
                  }
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
                    setActivitySearchInput('');
                    setActivitySearch('');
                    setActivityPage(1);
                  }}
                >
                  Limpar
                </button>
              </div>
            </form>


          </div>

          <div className={adminFormGridSpaced}>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="activity-date-from">
                Data desde
              </label>
              <input
                id="activity-date-from"
                type="date"
                className={adminInput}
                value={activityDateFrom}
                onChange={(event) => setActivityDateFrom(event.target.value)}
              />
            </div>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="activity-date-to">
                Data ate
              </label>
              <input
                id="activity-date-to"
                type="date"
                className={adminInput}
                value={activityDateTo}
                onChange={(event) => setActivityDateTo(event.target.value)}
              />
            </div>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="activity-order">
                Ordenar por
              </label>
              <select
                id="activity-order"
                className={adminInput}
                value={activityOrder}
                onChange={(event) => setActivityOrder(event.target.value)}
              >
                {activityTab === 'books' ? (
                  <>
                    <option value="featured">Destaque primeiro</option>
                    <option value="newest">Mais recentes</option>
                    <option value="oldest">Mais antigos</option>
                    <option value="title_asc">Titulo A-Z</option>
                    <option value="title_desc">Titulo Z-A</option>
                    <option value="year_desc">Ano mais recente</option>
                    <option value="year_asc">Ano mais antigo</option>
                    <option value="club_asc">Clube A-Z</option>
                    <option value="club_desc">Clube Z-A</option>
                  </>
                ) : activityTab === 'sessions' ? (
                  <>
                    <option value="date_asc">Data mais proxima</option>
                    <option value="date_desc">Data mais distante</option>
                    <option value="newest">Mais recentes</option>
                    <option value="oldest">Mais antigas</option>
                    <option value="title_asc">Titulo A-Z</option>
                    <option value="title_desc">Titulo Z-A</option>
                    <option value="club_asc">Clube A-Z</option>
                    <option value="club_desc">Clube Z-A</option>
                  </>
                ) : (
                  <>
                    <option value="date_asc">Data mais proxima</option>
                    <option value="date_desc">Data mais distante</option>
                    <option value="newest">Mais recentes</option>
                    <option value="oldest">Mais antigos</option>
                    <option value="title_asc">Titulo A-Z</option>
                    <option value="title_desc">Titulo Z-A</option>
                    <option value="club_asc">Clube A-Z</option>
                    <option value="club_desc">Clube Z-A</option>
                    <option value="status_asc">Estado A-Z</option>
                    <option value="status_desc">Estado Z-A</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {activityTab === 'books' ? (
            <div className={adminActions}>
              <button
                type="button"
                className={adminBtnSecondary}
                onClick={() =>
                  setSelectedBookIds(
                    selectedBookIds.length === sortedBooks.length
                      ? []
                      : sortedBooks.map((item) => item.id)
                  )
                }
                disabled={sortedBooks.length === 0}
              >
                {selectedBookIds.length === sortedBooks.length && sortedBooks.length > 0
                  ? 'Limpar selecao'
                  : 'Selecionar pagina'}
              </button>
              <button
                type="button"
                className={adminBtnDanger}
                disabled={selectedBookIds.length === 0 || isDeletingBulkBooks}
                onClick={() => void handleBulkDeleteBooks()}
              >
                {isDeletingBulkBooks ? 'A apagar...' : 'Apagar selecionados'}
              </button>
            </div>
          ) : null}

          {activityTab === 'events' ? (
            <div className={adminActions}>
              <button
                type="button"
                className={adminBtnSecondary}
                onClick={() =>
                  setSelectedEventIds(
                    selectedEventIds.length === sortedEvents.length
                      ? []
                      : sortedEvents.map((item) => item.id)
                  )
                }
                disabled={sortedEvents.length === 0}
              >
                {selectedEventIds.length === sortedEvents.length && sortedEvents.length > 0
                  ? 'Limpar selecao'
                  : 'Selecionar pagina'}
              </button>
              <select
                className={adminInput}
                value={bulkEventStatus}
                onChange={(event) => setBulkEventStatus(event.target.value)}
              >
                {availableEventStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getWorkflowStatusLabel(status)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={adminBtnPrimary}
                disabled={selectedEventIds.length === 0 || isApplyingBulkEvents}
                onClick={() => void handleApplyBulkEventStatus()}
              >
                {isApplyingBulkEvents ? 'A aplicar...' : 'Aplicar em lote'}
              </button>
              <button
                type="button"
                className={adminBtnDanger}
                disabled={selectedEventIds.length === 0 || isDeletingBulkEvents}
                onClick={() => void handleBulkDeleteEvents()}
              >
                {isDeletingBulkEvents ? 'A apagar...' : 'Apagar selecionados'}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {activityTab === 'books' ? (
        <>
          {showActivityForm ? (
            <form id="activity-form" onSubmit={handleSaveBook} className={adminPanelForm}>
              <h2 className={blockTitle}>{editingBookId ? 'Editar Livro' : 'Novo Livro'}</h2>

              <div className={adminFormGridSpaced}>
                {canManageUsers ? (
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="book-club-id">
                      Clube
                    </label>
                    <select
                      id="book-club-id"
                      className={adminInput}
                      value={bookForm.club_id}
                      required={canManageUsers && activityClubFilter === 'all'}
                      onChange={(event) => {
                        const nextClubId = event.target.value;
                        if (import.meta.env.DEV) {
                          console.log('[InfoCultura club select]', { nextClubId });
                        }
                        setBookForm((prev) => ({ ...prev, club_id: nextClubId }));
                        if (canManageUsers) {
                          setActivityClubFilter(nextClubId || 'all');
                        }
                      }}
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
                  <label className={adminLabel} htmlFor="book-title">
                    Titulo
                  </label>
                  <input
                    id="book-title"
                    className={adminInput}
                    value={bookForm.title}
                    onChange={(event) =>
                      setBookForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="book-author">
                    Autor
                  </label>
                  <input
                    id="book-author"
                    className={adminInput}
                    value={bookForm.author}
                    onChange={(event) =>
                      setBookForm((prev) => ({ ...prev, author: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="book-year">
                    Ano
                  </label>
                  <input
                    id="book-year"
                    type="number"
                    className={adminInput}
                    value={bookForm.publication_year}
                    onChange={(event) =>
                      setBookForm((prev) => ({
                        ...prev,
                        publication_year: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className={adminFormGridSpaced}>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="book-publisher">
                    Editora
                  </label>
                  <input
                    id="book-publisher"
                    className={adminInput}
                    value={bookForm.publisher}
                    onChange={(event) =>
                      setBookForm((prev) => ({ ...prev, publisher: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="book-cover">
                    Capa
                  </label>
                  <input
                    id="book-cover"
                    key={bookImageFileKey}
                    type="file"
                    accept="image/*"
                    className={adminInput}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      void handleUploadBookImage(file);
                    }}
                  />
                  <p className={blockText}>
                    {isUploadingBookImage
                      ? 'A carregar capa...'
                      : bookForm.cover_image
                        ? 'Capa carregada com sucesso.'
                        : 'Seleciona uma imagem do computador ou telemovel.'}
                  </p>
                  {bookForm.cover_image ? (
                    <img
                      src={resolveInfoCulturaAssetUrl(bookForm.cover_image)}
                      alt="Preview da capa"
                      className="mt-3 h-40 w-full rounded-xl object-cover"
                    />
                  ) : null}
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="book-featured">
                    Destaque
                  </label>
                  <select
                    id="book-featured"
                    className={adminInput}
                    value={bookForm.is_featured ? 'sim' : 'nao'}
                    onChange={(event) =>
                      setBookForm((prev) => ({
                        ...prev,
                        is_featured: event.target.value === 'sim',
                      }))
                    }
                  >
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>

              <div className={adminFieldSpaced}>
                <label className={adminLabel} htmlFor="book-summary">
                  Resumo
                </label>
                <textarea
                  id="book-summary"
                  rows={5}
                  className={adminTextarea}
                  value={bookForm.summary}
                  onChange={(event) =>
                    setBookForm((prev) => ({ ...prev, summary: event.target.value }))
                  }
                />
              </div>

              {bookFormError ? <p className={adminError}>{bookFormError}</p> : null}

              <div className={adminActions}>
                <button
                  type="submit"
                  className={adminBtnPrimary}
                  disabled={
                    isSavingBook ||
                    (canManageUsers && activityClubFilter === 'all' && !bookForm.club_id)
                  }
                >
                  {isSavingBook ? 'A guardar...' : editingBookId ? 'Atualizar' : 'Criar'}
                </button>
                <button type="button" onClick={resetBookForm} className={adminBtnSecondary}>
                  Limpar
                </button>
              </div>
            </form>
          ) : null}

          {showActivityFiltersAndList ? (
            <div id="activity-list" className={adminList}>
              {isLoadingActivities ? <p className={adminInfo}>A carregar livros...</p> : null}
              {!isLoadingActivities && sortedBooks.length === 0 ? (
                <p className={adminInfo}>Nao existem livros para o filtro atual.</p>
              ) : null}
              {sortedBooks.map((item) => (
                <article key={item.id} className={adminListItem}>
                  <div className={adminListTop}>
                    <label className="mr-4 flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedBookIds.includes(item.id)}
                        onChange={() => toggleSelectedId(setSelectedBookIds, item.id)}
                      />
                      Selecionar
                    </label>
                    <div>
                      <h3 className={adminListTitle}>{item.title}</h3>
                      <p className={adminListMeta}>
                        {item.club_name} · {item.author} · {item.publication_year}
                      </p>
                    </div>
                  </div>
                  <p className={adminListDesc}>{item.summary}</p>
                  <div className={adminListTools}>
                    <button type="button" className={adminBtnEdit} onClick={() => handleEditBook(item)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={adminBtnDanger}
                      disabled={deletingBookId === item.id}
                      onClick={() => handleDeleteBook(item.id)}
                    >
                      {deletingBookId === item.id ? 'A apagar...' : 'Apagar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {showActivityFiltersAndList && !isLoadingActivities ? (
            <div className={`${adminActions} mt-6`}>
              <p className={adminInfo}>
                {activityTotal} livro(s) · pagina {activityPage} de {activityTotalPages || 1}
              </p>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={activityPage <= 1}
                onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={activityTotalPages === 0 || activityPage >= activityTotalPages}
                onClick={() => setActivityPage((prev) => prev + 1)}
              >
                Seguinte
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {activityTab === 'sessions' ? (
        <>
          {showActivityForm ? (
            <form id="activity-form" onSubmit={handleSaveSession} className={adminPanelForm}>
              <h2 className={blockTitle}>{editingSessionId ? 'Editar Sessao' : 'Nova Sessao'}</h2>

              <div className={adminFormGridSpaced}>
                {canManageUsers ? (
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="session-club-id">
                      Clube
                    </label>
                    <select
                      id="session-club-id"
                      className={adminInput}
                      value={sessionForm.club_id}
                      onChange={(event) =>
                        setSessionForm((prev) => ({ ...prev, club_id: event.target.value }))
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
                  <label className={adminLabel} htmlFor="session-name">
                    Nome curto
                  </label>
                  <input
                    id="session-name"
                    className={adminInput}
                    pattern={adminNamePattern}
                    title={adminNameTitle}
                    value={sessionForm.name}
                    onChange={(event) =>
                      setSessionForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-title">
                    Titulo
                  </label>
                  <input
                    id="session-title"
                    className={adminInput}
                    value={sessionForm.title}
                    onChange={(event) =>
                      setSessionForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-date">
                    Data
                  </label>
                  <input
                    id="session-date"
                    type="date"
                    className={adminInput}
                    value={sessionForm.session_date}
                    onChange={(event) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        session_date: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className={adminFormGridSpaced}>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-start">
                    Inicio
                  </label>
                  <input
                    id="session-start"
                    type="datetime-local"
                    className={adminInput}
                    value={sessionForm.start_date}
                    onChange={(event) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        start_date: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-end">
                    Fim
                  </label>
                  <input
                    id="session-end"
                    type="datetime-local"
                    className={adminInput}
                    value={sessionForm.end_date}
                    onChange={(event) =>
                      setSessionForm((prev) => ({ ...prev, end_date: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-registrations-enabled">
                    Inscricoes
                  </label>
                  <select
                    id="session-registrations-enabled"
                    className={adminInput}
                    value={sessionForm.enable_registrations ? 'sim' : 'nao'}
                    onChange={(event) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        enable_registrations: event.target.value === 'sim',
                      }))
                    }
                  >
                    <option value="nao">Fechadas</option>
                    <option value="sim">Abertas</option>
                  </select>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-registration-capacity">
                    Lotacao
                  </label>
                  <input
                    id="session-registration-capacity"
                    type="number"
                    min="1"
                    className={adminInput}
                    value={sessionForm.registration_capacity}
                    onChange={(event) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        registration_capacity: event.target.value,
                      }))
                    }
                  />
                  <p className={blockText}>
                    Define o numero maximo de lugares antes de ativar lista de espera.
                  </p>
                </div>
              </div>

              <div className={adminFieldSpaced}>
                <label className={adminLabel} htmlFor="session-description">
                  Descricao
                </label>
                <textarea
                  id="session-description"
                  rows={5}
                  className={adminTextarea}
                  value={sessionForm.description}
                  onChange={(event) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              {sessionFormError ? <p className={adminError}>{sessionFormError}</p> : null}

              <div className={adminActions}>
                <button type="submit" className={adminBtnPrimary} disabled={isSavingSession}>
                  {isSavingSession ? 'A guardar...' : editingSessionId ? 'Atualizar' : 'Criar'}
                </button>
                <button type="button" onClick={resetSessionForm} className={adminBtnSecondary}>
                  Limpar
                </button>
              </div>
            </form>
          ) : null}

          {showActivityFiltersAndList ? (
            <div id="activity-list" className={adminList}>
              {isLoadingActivities ? <p className={adminInfo}>A carregar sessoes...</p> : null}
              {!isLoadingActivities && sortedSessions.length === 0 ? (
                <p className={adminInfo}>Nao existem sessoes para o filtro atual.</p>
              ) : null}
              {sortedSessions.map((item) => (
                <article key={item.id} className={adminListItem}>
                  <div className={adminListTop}>
                    <div>
                      <h3 className={adminListTitle}>{item.title}</h3>
                      <p className={adminListMeta}>
                        {item.club_name} · {formatAdminDateTime(item.start_date)}
                      </p>
                    </div>
                  </div>
                  <p className={adminListDesc}>{item.description}</p>
                  <p className={adminListMeta}>
                    Inscricoes {item.enable_registrations ? 'abertas' : 'fechadas'} ·
                    Confirmadas {item.confirmed_registrations} · Espera {item.waitlist_registrations}
                    {item.registration_capacity !== null && item.registration_capacity !== undefined
                      ? ` · Lotacao ${item.registration_capacity}`
                      : ''}
                  </p>
                  <div className={adminListTools}>
                    <button type="button" className={adminBtnEdit} onClick={() => handleEditSession(item)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={adminBtnDanger}
                      disabled={deletingSessionId === item.id}
                      onClick={() => handleDeleteSession(item.id)}
                    >
                      {deletingSessionId === item.id ? 'A apagar...' : 'Apagar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {showActivityFiltersAndList && !isLoadingActivities ? (
            <div className={`${adminActions} mt-6`}>
              <p className={adminInfo}>
                {activityTotal} sessao(oes) · pagina {activityPage} de {activityTotalPages || 1}
              </p>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={activityPage <= 1}
                onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={activityTotalPages === 0 || activityPage >= activityTotalPages}
                onClick={() => setActivityPage((prev) => prev + 1)}
              >
                Seguinte
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {activityTab === 'events' ? (
        <>
          {showActivityForm ? (
            <form id="activity-form" onSubmit={handleSaveEvent} className={adminPanelForm}>
              <h2 className={blockTitle}>{editingEventId ? 'Editar Evento' : 'Novo Evento'}</h2>

              <div className={adminFormGridSpaced}>
                {canManageUsers ? (
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="event-club-id">
                      Clube
                    </label>
                    <select
                      id="event-club-id"
                      className={adminInput}
                      value={eventForm.club_id}
                      onChange={(event) =>
                        setEventForm((prev) => ({ ...prev, club_id: event.target.value }))
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
                  <label className={adminLabel} htmlFor="event-title">
                    Titulo
                  </label>
                  <input
                    id="event-title"
                    className={adminInput}
                    value={eventForm.title}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-status">
                    Estado
                  </label>
                  <select
                    id="event-status"
                    className={adminInput}
                    value={eventForm.status}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        status: normalizeWorkflowStatus(event.target.value),
                      }))
                    }
                  >
                    {availableEventStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getWorkflowStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <p className={blockText}>
                    {canManageUsers
                      ? 'Podes rever, publicar ou arquivar o evento.'
                      : 'O evento pode ficar em rascunho ou seguir para revisao.'}
                  </p>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-categories">
                    Categorias
                  </label>
                  <select
                    id="event-categories"
                    multiple
                    className={adminInput}
                    value={eventForm.category_ids}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        category_ids: Array.from(event.target.selectedOptions).map(
                          (option) => option.value
                        ),
                      }))
                    }
                  >
                    {sortedCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-date">
                    Data
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    className={adminInput}
                    value={eventForm.event_date}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, event_date: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className={adminFormGridSpaced}>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-start">
                    Inicio
                  </label>
                  <input
                    id="event-start"
                    type="datetime-local"
                    className={adminInput}
                    value={eventForm.start_date}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, start_date: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-end">
                    Fim
                  </label>
                  <input
                    id="event-end"
                    type="datetime-local"
                    className={adminInput}
                    value={eventForm.end_date}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, end_date: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-external">
                    Externo
                  </label>
                  <select
                    id="event-external"
                    className={adminInput}
                    value={eventForm.is_external ? 'sim' : 'nao'}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        is_external: event.target.value === 'sim',
                      }))
                    }
                  >
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-registrations-enabled">
                    Inscricoes
                  </label>
                  <select
                    id="event-registrations-enabled"
                    className={adminInput}
                    value={eventForm.enable_registrations ? 'sim' : 'nao'}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        enable_registrations: event.target.value === 'sim',
                      }))
                    }
                  >
                    <option value="nao">Fechadas</option>
                    <option value="sim">Abertas</option>
                  </select>
                </div>
              </div>

              <div className={adminFormGridSpaced}>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-city">
                    Cidade
                  </label>
                  <input
                    id="event-city"
                    className={adminInput}
                    value={eventForm.city}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-location">
                    Local
                  </label>
                  <input
                    id="event-location"
                    className={adminInput}
                    value={eventForm.location}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-registration-capacity">
                    Lotacao
                  </label>
                  <input
                    id="event-registration-capacity"
                    type="number"
                    min="1"
                    className={adminInput}
                    value={eventForm.registration_capacity}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        registration_capacity: event.target.value,
                      }))
                    }
                  />
                  <p className={blockText}>
                    Quando a lotacao for atingida, novas inscricoes passam para espera.
                  </p>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-image">
                    Imagem
                  </label>
                  <input
                    id="event-image"
                    key={eventImageFileKey}
                    type="file"
                    accept="image/*"
                    className={adminInput}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      void handleUploadEventImage(file);
                    }}
                  />
                  <p className={blockText}>
                    {isUploadingEventImage
                      ? 'A carregar imagem...'
                      : eventForm.image
                        ? 'Imagem carregada com sucesso.'
                        : 'Seleciona uma imagem para o evento.'}
                  </p>
                  {eventForm.image ? (
                    <img
                      src={resolveInfoCulturaAssetUrl(eventForm.image)}
                      alt="Preview do evento"
                      className="mt-3 h-40 w-full rounded-xl object-cover"
                    />
                  ) : null}
                </div>
              </div>

              <div className={adminFieldSpaced}>
                <label className={adminLabel} htmlFor="event-description">
                  Descricao
                </label>
                <textarea
                  id="event-description"
                  rows={5}
                  className={adminTextarea}
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              {eventFormError ? <p className={adminError}>{eventFormError}</p> : null}

              <div className={adminActions}>
                <button type="submit" className={adminBtnPrimary} disabled={isSavingEvent}>
                  {isSavingEvent ? 'A guardar...' : editingEventId ? 'Atualizar' : 'Criar'}
                </button>
                <button type="button" onClick={resetEventForm} className={adminBtnSecondary}>
                  Limpar
                </button>
              </div>
            </form>
          ) : null}

          {showActivityFiltersAndList ? (
            <div id="activity-list" className={adminList}>
              {isLoadingActivities ? <p className={adminInfo}>A carregar eventos...</p> : null}
              {!isLoadingActivities && sortedEvents.length === 0 ? (
                <p className={adminInfo}>Nao existem eventos para o filtro atual.</p>
              ) : null}
              {sortedEvents.map((item) => (
                <article key={item.id} className={adminListItem}>
                  <div className={adminListTop}>
                    <label className="mr-4 flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedEventIds.includes(item.id)}
                        onChange={() => toggleSelectedId(setSelectedEventIds, item.id)}
                      />
                      Selecionar
                    </label>
                    <div>
                      <h3 className={adminListTitle}>{item.title}</h3>
                      <p className={adminListMeta}>
                        {item.club_name || 'Sem clube'} · {getWorkflowStatusLabel(item.status)} ·{' '}
                        {formatAdminDateTime(item.start_date)}
                      </p>
                    </div>
                  </div>
                  <p className={adminListDesc}>{item.description}</p>
                  <p className={adminListMeta}>
                    Inscricoes {item.enable_registrations ? 'abertas' : 'fechadas'} ·
                    Confirmadas {item.confirmed_registrations} · Espera {item.waitlist_registrations}
                    {item.registration_capacity !== null && item.registration_capacity !== undefined
                      ? ` · Lotacao ${item.registration_capacity}`
                      : ''}
                  </p>
                  {item.categories.length > 0 ? (
                    <p className={adminListMeta}>
                      Categorias: {item.categories.map((category) => category.name).join(', ')}
                    </p>
                  ) : null}
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
                    <button type="button" className={adminBtnEdit} onClick={() => handleEditEvent(item)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={adminBtnDanger}
                      disabled={deletingEventId === item.id}
                      onClick={() => handleDeleteEvent(item.id)}
                    >
                      {deletingEventId === item.id ? 'A apagar...' : 'Apagar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {showActivityFiltersAndList && !isLoadingActivities ? (
            <div className={`${adminActions} mt-6`}>
              <p className={adminInfo}>
                {activityTotal} evento(s) · pagina {activityPage} de {activityTotalPages || 1}
              </p>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={activityPage <= 1}
                onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={activityTotalPages === 0 || activityPage >= activityTotalPages}
                onClick={() => setActivityPage((prev) => prev + 1)}
              >
                Seguinte
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {showEventCategories ? (
        <section id="event-categories" className={adminPanelCard}>
          <h2 className={blockTitle}>Categorias de eventos</h2>
          <p className={blockText}>
            Cria categorias para classificar eventos e usar filtros no painel e no publico.
          </p>

          <form onSubmit={handleSaveCategory} className={adminPanelForm}>
            <div className={adminFormGridSpaced}>
              <div className={adminField}>
                <label className={adminLabel} htmlFor="category-name">
                  Nome
                </label>
                <input
                  id="category-name"
                  className={adminInput}
                  pattern={adminNamePattern}
                  title={adminNameTitle}
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div className={adminField}>
                <label className={adminLabel} htmlFor="category-description">
                  Descricao
                </label>
                <textarea
                  id="category-description"
                  rows={3}
                  className={adminTextarea}
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {categoryFormError ? <p className={adminError}>{categoryFormError}</p> : null}

            <div className={adminActions}>
              <button type="submit" className={adminBtnPrimary} disabled={isSavingCategory}>
                {isSavingCategory
                  ? 'A guardar...'
                  : editingCategoryId
                    ? 'Atualizar categoria'
                    : 'Criar categoria'}
              </button>
              <button type="button" onClick={resetCategoryForm} className={adminBtnSecondary}>
                Limpar
              </button>
            </div>
          </form>

          <div className={adminList}>
            {isLoadingCategories ? <p className={adminInfo}>A carregar categorias...</p> : null}
            {!isLoadingCategories && sortedCategories.length === 0 ? (
              <p className={adminInfo}>Nao existem categorias registadas.</p>
            ) : null}
            {sortedCategories.map((category) => (
              <article key={category.id} className={adminListItem}>
                <div className={adminListTop}>
                  <div>
                    <h3 className={adminListTitle}>{category.name}</h3>
                    <p className={adminListMeta}>{category.description}</p>
                  </div>
                </div>
                <div className={adminListTools}>
                  <button type="button" className={adminBtnEdit} onClick={() => handleEditCategory(category)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    disabled={deletingCategoryId === category.id}
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    {deletingCategoryId === category.id ? 'A apagar...' : 'Apagar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ActivitiesPage;
