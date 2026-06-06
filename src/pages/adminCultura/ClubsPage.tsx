import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Building2 } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
import { adminNamePattern, adminNameTitle } from './nameValidation.js';
import { ClubFormState } from './types';
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
  adminPanelForm,
  adminStatCard,
  adminStatLabel,
  adminStatValue,
  adminStatsGrid,
  adminTextarea,
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
  InfoCulturaUser,
  resolveInfoCulturaAssetUrl,
} from '../../api/infoculturaApi';
import { getLocaleText, useLocale } from '../../i18n/locale';

type AdminHeroStat = { label: string; value: string | number };

type ClubsPageProps = {
  clubsOverviewStats: AdminHeroStat[];
  handleSaveClub: (event: FormEvent<HTMLFormElement>) => void;
  clubForm: ClubFormState;
  setClubForm: Dispatch<SetStateAction<ClubFormState>>;
  clubImageFileKey: number;
  isUploadingClubImage: boolean;
  handleUploadClubImage: (file: File | null) => void | Promise<void>;
  clubFormError: string;
  isSavingClub: boolean;
  editingClubId: number | null;
  resetClubForm: () => void;
  selectedClubUserId: string;
  setSelectedClubUserId: Dispatch<SetStateAction<string>>;
  usersWithoutClub: InfoCulturaUser[];
  isAssigningClubUser: boolean;
  handleAssignUserToClub: () => void;
  clubDateFrom: string;
  clubDateTo: string;
  clubOrder: string;
  setClubDateFrom: Dispatch<SetStateAction<string>>;
  setClubDateTo: Dispatch<SetStateAction<string>>;
  setClubOrder: Dispatch<SetStateAction<string>>;
  filteredClubs: InfoCulturaClub[];
  isLoadingClubs: boolean;
  changingClubStatusId: number | null;
  handleToggleClubActive: (id: number, shouldActivate: boolean) => void | Promise<void>;
  deletingClubId: number | null;
  handleEditClub: (club: InfoCulturaClub) => void;
  handleDeleteClub: (id: number) => void | Promise<void>;
  clubMembers: InfoCulturaUser[];
  removingClubUserId: number | null;
  handleRemoveUserFromClub: (userId: number) => void | Promise<void>;
};

function ClubsPage({
  clubsOverviewStats,
  handleSaveClub,
  clubForm,
  setClubForm,
  clubImageFileKey,
  isUploadingClubImage,
  handleUploadClubImage,
  clubFormError,
  isSavingClub,
  editingClubId,
  resetClubForm,
  selectedClubUserId,
  setSelectedClubUserId,
  usersWithoutClub,
  isAssigningClubUser,
  handleAssignUserToClub,
  clubDateFrom,
  clubDateTo,
  clubOrder,
  setClubDateFrom,
  setClubDateTo,
  setClubOrder,
  filteredClubs,
  isLoadingClubs,
  changingClubStatusId,
  handleToggleClubActive,
  deletingClubId,
  handleEditClub,
  handleDeleteClub,
  clubMembers,
  removingClubUserId,
  handleRemoveUserFromClub,
}: ClubsPageProps) {
  const { locale } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={Building2}
        title={getLocaleText(locale, 'Clubes', 'Clubs')}
        description={getLocaleText(locale, 'Estrutura interna dos clubes, estados de atividade e configuração de inscrições.', 'Internal club structure, activity status and registration settings.')}
        tone="amber"
        stats={clubsOverviewStats}
      />

      <form onSubmit={handleSaveClub} className={adminPanelForm}>
        <h2 className={blockTitle}>{editingClubId ? getLocaleText(locale, 'Editar Clube', 'Edit Club') : getLocaleText(locale, 'Novo Clube', 'New Club')}</h2>
        <p className={blockText}>
          {getLocaleText(locale, 'Cria clubes para organizar a estrutura do InfoCultura. Esta seção é reservada ao superadmin.', 'Create clubs to organize the InfoCultura structure. This section is reserved for the superadmin.')}
        </p>

        <div className={adminFormGridSpaced}>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-name">
              {getLocaleText(locale, 'Nome do clube', 'Club name')}
            </label>
            <input
              id="club-name"
              className={adminInput}
              pattern={adminNamePattern}
              title={adminNameTitle}
              value={clubForm.name}
              onChange={(event) =>
                setClubForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-image">
              {getLocaleText(locale, 'Imagem do clube', 'Club image')}
            </label>
            <input
              id="club-image"
              key={clubImageFileKey}
              type="file"
              accept="image/png, image/jpeg"
              className={adminInput}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                void handleUploadClubImage(file);
              }}
            />
            <p className={blockText}>
              {isUploadingClubImage
                ? getLocaleText(locale, 'A carregar imagem...', 'Uploading image...')
                : clubForm.image
                  ? getLocaleText(locale, 'Imagem carregada com sucesso.', 'Image uploaded successfully.')
                  : getLocaleText(locale, 'Seleciona uma imagem PNG ou JPG do computador ou telemóvel.', 'Select a PNG or JPG image from your computer or phone.')}
            </p>
            {clubForm.image ? (
              <img
                src={resolveInfoCulturaAssetUrl(clubForm.image)}
                alt={getLocaleText(locale, 'Preview do clube', 'Club preview')}
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-mission">
              {getLocaleText(locale, 'Missão', 'Mission')}
            </label>
            <textarea
              id="club-mission"
              rows={3}
              className={adminTextarea}
              value={clubForm.mission}
              onChange={(event) =>
                setClubForm((prev) => ({
                  ...prev,
                  mission: event.target.value,
                }))
              }
            />
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-status">
              {getLocaleText(locale, 'Estado', 'Status')}
            </label>
            <select
              id="club-status"
              className={adminInput}
              value={clubForm.is_active ? 'ativo' : 'inativo'}
              onChange={(event) =>
                setClubForm((prev) => ({
                  ...prev,
                  is_active: event.target.value === 'ativo',
                }))
              }
            >
              <option value="ativo">{getLocaleText(locale, 'Ativo', 'Active')}</option>
              <option value="inativo">{getLocaleText(locale, 'Inativo', 'Inactive')}</option>
            </select>
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-registrations">
              {getLocaleText(locale, 'Permitir inscrições', 'Allow registrations')}
            </label>
            <select
              id="club-registrations"
              className={adminInput}
              value={clubForm.enable_registrations ? 'sim' : 'Não'}
              onChange={(event) =>
                setClubForm((prev) => ({
                  ...prev,
                  enable_registrations: event.target.value === 'sim',
                }))
              }
            >
              <option value="sim">{getLocaleText(locale, 'Sim', 'Yes')}</option>
              <option value="Não">{getLocaleText(locale, 'Não', 'No')}</option>
            </select>
          </div>
        </div>

        <div className={adminFieldSpaced}>
          <label className={adminLabel} htmlFor="club-description">
            {getLocaleText(locale, 'Descrição', 'Description')}
          </label>
          <textarea
            id="club-description"
            rows={4}
            className={adminTextarea}
            value={clubForm.description}
            onChange={(event) =>
              setClubForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
        </div>

        {clubFormError ? <p className={adminError}>{clubFormError}</p> : null}

        <div className={adminActions}>
          <button type="submit" className={adminBtnPrimary} disabled={isSavingClub}>
            {isSavingClub
              ? getLocaleText(locale, 'A guardar...', 'Saving...')
              : editingClubId
                ? getLocaleText(locale, 'Guardar alterações', 'Save changes')
                : getLocaleText(locale, 'Criar clube', 'Create club')}
          </button>
          <button type="button" onClick={resetClubForm} className={adminBtnSecondary}>
            {getLocaleText(locale, 'Limpar', 'Clear')}
          </button>
        </div>

        {editingClubId ? (
          <div className={adminFieldSpaced}>
            <label className={adminLabel} htmlFor="club-user-select">
              {getLocaleText(locale, 'Associar utilizador sem clube', 'Associate user without club')}
            </label>
            <div className={adminActions}>
              <select
                id="club-user-select"
                className={adminInput}
                value={selectedClubUserId}
                onChange={(event) => setSelectedClubUserId(event.target.value)}
              >
                <option value="">{getLocaleText(locale, 'Seleciona um utilizador', 'Select a user')}</option>
                {usersWithoutClub.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.email}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={adminBtnPrimary}
                disabled={!selectedClubUserId || isAssigningClubUser}
                onClick={handleAssignUserToClub}
              >
                {isAssigningClubUser ? getLocaleText(locale, 'A associar...', 'Associating...') : getLocaleText(locale, 'Associar ao clube', 'Associate with club')}
              </button>
            </div>
            {usersWithoutClub.length === 0 ? (
              <p className={adminInfo}>{getLocaleText(locale, 'Não existem utilizadores ativos sem clube.', 'There are no active users without a club.')}</p>
            ) : null}
          </div>
        ) : (
          <p className={adminInfo}>{getLocaleText(locale, 'Guarda o clube primeiro para poderes associar utilizadores.', 'Save the club first so you can associate users.')}</p>
        )}
      </form>

      <section className={adminPanelCard}>
        <h2 className={blockTitle}>{getLocaleText(locale, 'Clubes registados', 'Registered clubs')}</h2>
        <p className={blockText}>
          {getLocaleText(locale, 'Lista de clubes disponiveis para futura associacao a utilizadores e conteudos.', 'List of clubs available for future association with users and content.')}
        </p>

        <div className={adminStatsGrid}>
          <div className={adminStatCard}>
            <p className={adminStatValue}>{filteredClubs.length}</p>
            <p className={adminStatLabel}>{getLocaleText(locale, 'Total', 'Total')}</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>
              {filteredClubs.filter((club) => club.is_active).length}
            </p>
            <p className={adminStatLabel}>{getLocaleText(locale, 'Ativos', 'Active')}</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>
              {filteredClubs.filter((club) => !club.is_active).length}
            </p>
            <p className={adminStatLabel}>{getLocaleText(locale, 'Inativos', 'Inactive')}</p>
          </div>
        </div>

        <div className={adminFormGridSpaced}>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-date-from">
              {getLocaleText(locale, 'Criados desde', 'Created from')}
            </label>
            <input
              id="club-date-from"
              type="date"
              className={adminInput}
              value={clubDateFrom}
              onChange={(event) => setClubDateFrom(event.target.value)}
            />
          </div>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-date-to">
              {getLocaleText(locale, 'Criados até', 'Created until')}
            </label>
            <input
              id="club-date-to"
              type="date"
              className={adminInput}
              value={clubDateTo}
              onChange={(event) => setClubDateTo(event.target.value)}
            />
          </div>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-order">
              {getLocaleText(locale, 'Ordenar por', 'Sort by')}
            </label>
            <select
              id="club-order"
              className={adminInput}
              value={clubOrder}
              onChange={(event) => setClubOrder(event.target.value)}
            >
              <option value="active_name">{getLocaleText(locale, 'Ativos primeiro', 'Active first')}</option>
              <option value="newest">{getLocaleText(locale, 'Mais recentes', 'Newest')}</option>
              <option value="oldest">{getLocaleText(locale, 'Mais antigos', 'Oldest')}</option>
              <option value="name_asc">{getLocaleText(locale, 'Nome A-Z', 'Name A-Z')}</option>
              <option value="name_desc">{getLocaleText(locale, 'Nome Z-A', 'Name Z-A')}</option>
              <option value="registrations_open">{getLocaleText(locale, 'Inscrições abertas primeiro', 'Open registrations first')}</option>
            </select>
          </div>
        </div>

        <div className={adminUserList}>
          {isLoadingClubs ? <p className={adminInfo}>{getLocaleText(locale, 'A carregar clubes...', 'Loading clubs...')}</p> : null}
          {!isLoadingClubs && filteredClubs.length === 0 ? (
            <p className={adminInfo}>{getLocaleText(locale, 'Não existem clubes registados.', 'There are no registered clubs.')}</p>
          ) : null}
          {filteredClubs.map((club) => (
            <article key={club.id} className={adminUserItem}>
              <div>
                {club.image ? (
                  <img
                    src={resolveInfoCulturaAssetUrl(club.image)}
                    alt={club.name}
                    className="mb-4 h-32 w-full rounded-xl object-cover"
                  />
                ) : null}
                <h3 className={adminUserName}>{club.name}</h3>
                <p className={adminUserEmail}>{club.mission || getLocaleText(locale, 'Sem missão definida', 'No mission defined')}</p>
                <p className={adminUserMeta}>{club.description || getLocaleText(locale, 'Sem descrição', 'No description')}</p>
                <p className={adminUserMeta}>
                  {getLocaleText(locale, 'Inscrições:', 'Registrations:')} {club.enable_registrations ? getLocaleText(locale, 'Permitidas', 'Allowed') : getLocaleText(locale, 'Desativadas', 'Disabled')}
                </p>
                <p className={adminUserMeta}>
                  {getLocaleText(locale, 'Criado em:', 'Created at:')} {formatAdminDateTime(club.created_at || '')}
                </p>
              </div>
              <div className={adminListTools}>
                <span
                  className={`${adminUserStatus} ${
                    club.is_active ? adminUserStatusActive : adminUserStatusInactive
                  }`}
                >
                  {club.is_active ? getLocaleText(locale, 'Ativo', 'Active') : getLocaleText(locale, 'Inativo', 'Inactive')}
                </span>
                <button type="button" className={adminBtnEdit} onClick={() => handleEditClub(club)}>
                  {getLocaleText(locale, 'Editar', 'Edit')}
                </button>
                <button
                  type="button"
                  className={club.is_active ? adminBtnSecondary : adminBtnPrimary}
                  disabled={changingClubStatusId === club.id}
                  onClick={() => void handleToggleClubActive(club.id, !club.is_active)}
                >
                  {changingClubStatusId === club.id
                    ? getLocaleText(locale, 'A atualizar...', 'Updating...')
                    : club.is_active
                      ? getLocaleText(locale, 'Desativar', 'Deactivate')
                      : getLocaleText(locale, 'Ativar', 'Activate')}
                </button>
                <button
                  type="button"
                  className={adminBtnDanger}
                  disabled={deletingClubId === club.id}
                  onClick={() => handleDeleteClub(club.id)}
                >
                  {deletingClubId === club.id ? getLocaleText(locale, 'A apagar...', 'Deleting...') : getLocaleText(locale, 'Apagar', 'Delete')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingClubId ? (
        <section className={adminPanelCard}>
          <h2 className={blockTitle}>{getLocaleText(locale, 'Utilizadores deste clube', 'Users in this club')}</h2>
          <p className={blockText}>
            {getLocaleText(locale, 'Aqui podes ver quem pertence ao clube em edição e remover a associação se necessário.', 'Here you can see who belongs to the club being edited and remove the association if needed.')}
          </p>

          <div className={adminUserList}>
            {clubMembers.length === 0 ? (
              <p className={adminInfo}>{getLocaleText(locale, 'Ainda não existem utilizadores associados.', 'There are no associated users yet.')}</p>
            ) : null}
            {clubMembers.map((user) => (
              <article key={user.id} className={adminUserItem}>
                <div>
                  <h3 className={adminUserName}>{user.name}</h3>
                  <p className={adminUserEmail}>{user.email}</p>
                  <p className={adminUserMeta}>{user.role}</p>
                </div>
                <div className={adminListTools}>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    disabled={removingClubUserId === user.id}
                    onClick={() => handleRemoveUserFromClub(user.id)}
                  >
                    {removingClubUserId === user.id ? getLocaleText(locale, 'A remover...', 'Removing...') : getLocaleText(locale, 'Remover do clube', 'Remove from club')}
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

export default ClubsPage;
