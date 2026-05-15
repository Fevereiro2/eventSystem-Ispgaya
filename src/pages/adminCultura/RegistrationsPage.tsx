import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Inbox } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
import { formatAdminDateTime } from './utils';
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
  adminInfo,
  adminInput,
  adminLabel,
  adminListTools,
  adminPanelCard,
  adminStatCard,
  adminStatLabel,
  adminStatValue,
  adminStatsGrid,
  adminUserEmail,
  adminUserItem,
  adminUserList,
  adminUserMeta,
  adminUserName,
  adminUserStatus,
  adminUserStatusActive,
  adminUserStatusInactive,
  blockText,
  blockTitle,
} from '../../styles/ui';
import {
  InfoCulturaClub,
  InfoCulturaRegistration,
  InfoCulturaRegistrationStatus,
} from '../../api/infoculturaApi';

type AdminHeroStat = { label: string; value: string | number };

type RegistrationsPageProps = {
  registrationOverviewStats: AdminHeroStat[];
  isExportingRegistrations: boolean;
  handleExportRegistrationsCsv: () => void | Promise<void>;
  registrationTotal: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  canManageUsers: boolean;
  clubs: InfoCulturaClub[];
  registrationClubFilter: string;
  setRegistrationClubFilter: Dispatch<SetStateAction<string>>;
  registrationStatusFilter: string;
  setRegistrationStatusFilter: Dispatch<SetStateAction<string>>;
  isLoadingRegistrationStatuses: boolean;
  registrationStatuses: InfoCulturaRegistrationStatus[];
  registrationDateFrom: string;
  setRegistrationDateFrom: Dispatch<SetStateAction<string>>;
  registrationDateTo: string;
  setRegistrationDateTo: Dispatch<SetStateAction<string>>;
  handleRegistrationSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  registrationSearchInput: string;
  setRegistrationSearchInput: Dispatch<SetStateAction<string>>;
  setRegistrationSearch: Dispatch<SetStateAction<string>>;
  setRegistrationPage: Dispatch<SetStateAction<number>>;
  registrationError: string;
  registrationOrder: string;
  setRegistrationOrder: Dispatch<SetStateAction<string>>;
  selectedRegistrationIds: number[];
  setSelectedRegistrationIds: Dispatch<SetStateAction<number[]>>;
  bulkRegistrationStatus: string;
  setBulkRegistrationStatus: Dispatch<SetStateAction<string>>;
  isApplyingBulkRegistrations: boolean;
  handleApplyBulkRegistrationStatus: () => void | Promise<void>;
  isLoadingRegistrations: boolean;
  registrationPage: number;
  registrationTotalPages: number;
  registrations: InfoCulturaRegistration[];
  updatingRegistrationId: number | null;
  handleUpdateRegistrationStatus: (registrationId: number, status: string) => void | Promise<void>;
  toggleSelectedId: (setter: Dispatch<SetStateAction<number[]>>, id: number) => void;
};

function getRegistrationStatusBadge(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'approved') {
    return `${adminUserStatus} ${adminUserStatusActive}`;
  }

  if (normalized === 'rejected' || normalized === 'cancelled') {
    return `${adminUserStatus} ${adminUserStatusInactive}`;
  }

  return `${adminUserStatus} bg-amber-100 text-amber-700`;
}

function RegistrationsPage({
  registrationOverviewStats,
  isExportingRegistrations,
  handleExportRegistrationsCsv,
  registrationTotal,
  pendingRegistrations,
  approvedRegistrations,
  rejectedRegistrations,
  canManageUsers,
  clubs,
  registrationClubFilter,
  setRegistrationClubFilter,
  registrationStatusFilter,
  setRegistrationStatusFilter,
  isLoadingRegistrationStatuses,
  registrationStatuses,
  registrationDateFrom,
  setRegistrationDateFrom,
  registrationDateTo,
  setRegistrationDateTo,
  handleRegistrationSearchSubmit,
  registrationSearchInput,
  setRegistrationSearchInput,
  setRegistrationSearch,
  setRegistrationPage,
  registrationError,
  registrationOrder,
  setRegistrationOrder,
  selectedRegistrationIds,
  setSelectedRegistrationIds,
  bulkRegistrationStatus,
  setBulkRegistrationStatus,
  isApplyingBulkRegistrations,
  handleApplyBulkRegistrationStatus,
  isLoadingRegistrations,
  registrationPage,
  registrationTotalPages,
  registrations,
  updatingRegistrationId,
  handleUpdateRegistrationStatus,
  toggleSelectedId,
}: RegistrationsPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={Inbox}
        title="Inscricoes"
        description="Consulta, triagem e validacao dos pedidos submetidos pelos clubes."
        tone="rose"
        stats={registrationOverviewStats}

      />

      <section className={adminPanelCard}>
        <h2 className={blockTitle}>Inscricoes</h2>
        <p className={blockText}>
          Consulta os pedidos submetidos pelos clubes e atualiza o respetivo estado.
        </p>

        <div className={adminStatsGrid}>
          <div className={adminStatCard}>
            <p className={adminStatValue}>{registrationTotal}</p>
            <p className={adminStatLabel}>Total filtrado</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>{pendingRegistrations}</p>
            <p className={adminStatLabel}>Pendentes na pagina</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>{approvedRegistrations}</p>
            <p className={adminStatLabel}>Aprovadas na pagina</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>{rejectedRegistrations}</p>
            <p className={adminStatLabel}>Rejeitadas na pagina</p>
          </div>
        </div>

        <div className={adminFormGridSpaced}>
          {canManageUsers ? (
            <div className={adminField}>
              <label className={adminLabel} htmlFor="registration-club-filter">
                Clube
              </label>
              <select
                id="registration-club-filter"
                className={adminInput}
                value={registrationClubFilter}
                onChange={(event) => {
                  setRegistrationClubFilter(event.target.value);
                  setRegistrationPage(1);
                }}
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
            <label className={adminLabel} htmlFor="registration-status-filter">
              Estado
            </label>
            <select
              id="registration-status-filter"
              className={adminInput}
              value={registrationStatusFilter}
              onChange={(event) => {
                setRegistrationStatusFilter(event.target.value);
                setRegistrationPage(1);
              }}
            >
              <option value="all">Todos</option>
              {isLoadingRegistrationStatuses ? <option value="">A carregar estados...</option> : null}
              {registrationStatuses.map((status) => (
                <option key={status.id} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="registration-date-from">
              Submetidas desde
            </label>
            <input
              id="registration-date-from"
              type="date"
              className={adminInput}
              value={registrationDateFrom}
              onChange={(event) => setRegistrationDateFrom(event.target.value)}
            />
          </div>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="registration-date-to">
              Submetidas ate
            </label>
            <input
              id="registration-date-to"
              type="date"
              className={adminInput}
              value={registrationDateTo}
              onChange={(event) => setRegistrationDateTo(event.target.value)}
            />
          </div>
        </div>

        <form onSubmit={handleRegistrationSearchSubmit} className={adminFieldSpaced}>
          <label className={adminLabel} htmlFor="registration-search">
            Pesquisar por nome ou email
          </label>
          <div className={adminActions}>
            <input
              id="registration-search"
              className={adminInput}
              value={registrationSearchInput}
              onChange={(event) => setRegistrationSearchInput(event.target.value)}
              placeholder="Ex.: maria ou maria@email.pt"
            />
            <button type="submit" className={adminBtnPrimary}>
              Pesquisar
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() => {
                setRegistrationSearchInput('');
                setRegistrationSearch('');
                setRegistrationPage(1);
              }}
            >
              Limpar
            </button>
          </div>
        </form>

        {registrationError ? <p className={adminError}>{registrationError}</p> : null}

        <div className={adminActions}>
          <select
            className={adminInput}
            value={registrationOrder}
            onChange={(event) => setRegistrationOrder(event.target.value)}
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="name_asc">Nome A-Z</option>
            <option value="name_desc">Nome Z-A</option>
            <option value="email_asc">Email A-Z</option>
            <option value="email_desc">Email Z-A</option>
            <option value="club_asc">Clube A-Z</option>
            <option value="club_desc">Clube Z-A</option>
            <option value="status_asc">Estado A-Z</option>
            <option value="status_desc">Estado Z-A</option>
          </select>
          <button
            type="button"
            className={adminBtnSecondary}
            onClick={() =>
              setSelectedRegistrationIds(
                selectedRegistrationIds.length === registrations.length
                  ? []
                  : registrations.map((item) => item.id)
              )
            }
            disabled={registrations.length === 0}
          >
            {selectedRegistrationIds.length === registrations.length && registrations.length > 0
              ? 'Limpar selecao'
              : 'Selecionar pagina'}
          </button>
          <select
            className={adminInput}
            value={bulkRegistrationStatus}
            onChange={(event) => setBulkRegistrationStatus(event.target.value)}
          >
            {registrationStatuses.map((status) => (
              <option key={status.id} value={status.name}>
                {status.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={adminBtnPrimary}
            disabled={selectedRegistrationIds.length === 0 || isApplyingBulkRegistrations}
            onClick={() => void handleApplyBulkRegistrationStatus()}
          >
            {isApplyingBulkRegistrations ? 'A aplicar...' : 'Aplicar em lote'}
          </button>
        </div>

        {!isLoadingRegistrations ? (
          <div className={adminActions}>
            <p className={blockText}>
              Pagina {registrationPage}
              {registrationTotalPages > 0 ? ` de ${registrationTotalPages}` : ''} ·{' '}
              {registrationTotal} resultado{registrationTotal === 1 ? '' : 's'}
            </p>
            <div className={adminActions}>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={registrationPage <= 1}
                onClick={() => setRegistrationPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={registrationTotalPages === 0 || registrationPage >= registrationTotalPages}
                onClick={() =>
                  setRegistrationPage((prev) =>
                    registrationTotalPages === 0
                      ? prev
                      : Math.min(registrationTotalPages, prev + 1)
                  )
                }
              >
                Seguinte
              </button>
            </div>
          </div>
        ) : null}

        <div className={adminUserList}>
          {isLoadingRegistrations ? <p className={adminInfo}>A carregar inscricoes...</p> : null}
          {!isLoadingRegistrations && registrations.length === 0 ? (
            <p className={adminInfo}>Nao existem inscricoes para os filtros atuais.</p>
          ) : null}
          {registrations.map((registration) => (
            <article key={registration.id} className={adminUserItem}>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedRegistrationIds.includes(registration.id)}
                    onChange={() => toggleSelectedId(setSelectedRegistrationIds, registration.id)}
                  />
                  Selecionar
                </label>
                <h3 className={adminUserName}>{registration.name}</h3>
                <p className={adminUserEmail}>{registration.email}</p>
                <p className={adminUserMeta}>
                  {registration.club_name} · {formatAdminDateTime(registration.created_at)}
                </p>
                {registration.phone ? (
                  <p className={adminUserMeta}>Telefone: {registration.phone}</p>
                ) : null}
                <p className={adminUserMeta}>
                  {registration.message || 'Sem mensagem adicional.'}
                </p>
              </div>
              <div className={adminListTools}>
                <span className={getRegistrationStatusBadge(registration.status)}>
                  {registration.status}
                </span>
                <button
                  type="button"
                  className={adminBtnEdit}
                  disabled={
                    updatingRegistrationId === registration.id ||
                    registration.status === 'approved'
                  }
                  onClick={() => handleUpdateRegistrationStatus(registration.id, 'approved')}
                >
                  {updatingRegistrationId === registration.id ? 'A atualizar...' : 'Aprovar'}
                </button>
                <button
                  type="button"
                  className={adminBtnDanger}
                  disabled={
                    updatingRegistrationId === registration.id ||
                    registration.status === 'rejected'
                  }
                  onClick={() => handleUpdateRegistrationStatus(registration.id, 'rejected')}
                >
                  {updatingRegistrationId === registration.id ? 'A atualizar...' : 'Rejeitar'}
                </button>
                <button
                  type="button"
                  className={adminBtnSecondary}
                  disabled={
                    updatingRegistrationId === registration.id ||
                    registration.status === 'pending'
                  }
                  onClick={() => handleUpdateRegistrationStatus(registration.id, 'pending')}
                >
                  {updatingRegistrationId === registration.id ? 'A atualizar...' : 'Pendente'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RegistrationsPage;
