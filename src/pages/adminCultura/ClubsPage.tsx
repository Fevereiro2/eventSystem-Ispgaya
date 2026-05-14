import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Building2 } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
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

type AdminHeroStat = { label: string; value: string | number };

type ClubsPageProps = {
  clubsOverviewStats: AdminHeroStat[];
  isExportingClubs: boolean;
  handleExportClubsCsv: () => void | Promise<void>;
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
  deletingClubId: number | null;
  handleEditClub: (club: InfoCulturaClub) => void;
  handleDeleteClub: (id: number) => void | Promise<void>;
  clubMembers: InfoCulturaUser[];
  removingClubUserId: number | null;
  handleRemoveUserFromClub: (userId: number) => void | Promise<void>;
};

function ClubsPage({
  clubsOverviewStats,
  isExportingClubs,
  handleExportClubsCsv,
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
  deletingClubId,
  handleEditClub,
  handleDeleteClub,
  clubMembers,
  removingClubUserId,
  handleRemoveUserFromClub,
}: ClubsPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={Building2}
        title="Clubes"
        description="Estrutura interna dos clubes, estados de atividade e configuracao de inscricoes."
        tone="amber"
        stats={clubsOverviewStats}
        actions={
          <button
            type="button"
            className={adminBtnSecondary}
            disabled={isExportingClubs}
            onClick={() => void handleExportClubsCsv()}
          >
            {isExportingClubs ? 'A exportar...' : 'Exportar CSV'}
          </button>
        }
      />

      <form onSubmit={handleSaveClub} className={adminPanelForm}>
        <h2 className={blockTitle}>{editingClubId ? 'Editar Clube' : 'Novo Clube'}</h2>
        <p className={blockText}>
          Cria clubes para organizar a estrutura do InfoCultura. Esta secao e reservada
          ao superadmin.
        </p>

        <div className={adminFormGridSpaced}>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-name">
              Nome do clube
            </label>
            <input
              id="club-name"
              className={adminInput}
              value={clubForm.name}
              onChange={(event) =>
                setClubForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-image">
              Imagem do clube
            </label>
            <input
              id="club-image"
              key={clubImageFileKey}
              type="file"
              accept="image/*"
              className={adminInput}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                void handleUploadClubImage(file);
              }}
            />
            <p className={blockText}>
              {isUploadingClubImage
                ? 'A carregar imagem...'
                : clubForm.image
                  ? 'Imagem carregada com sucesso.'
                  : 'Seleciona uma imagem do computador ou telemovel.'}
            </p>
            {clubForm.image ? (
              <img
                src={resolveInfoCulturaAssetUrl(clubForm.image)}
                alt="Preview do clube"
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-mission">
              Missao
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
              Estado
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
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-registrations">
              Permitir inscricoes
            </label>
            <select
              id="club-registrations"
              className={adminInput}
              value={clubForm.enable_registrations ? 'sim' : 'nao'}
              onChange={(event) =>
                setClubForm((prev) => ({
                  ...prev,
                  enable_registrations: event.target.value === 'sim',
                }))
              }
            >
              <option value="sim">Sim</option>
              <option value="nao">Nao</option>
            </select>
          </div>
        </div>

        <div className={adminFieldSpaced}>
          <label className={adminLabel} htmlFor="club-description">
            Descricao
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
              ? 'A guardar...'
              : editingClubId
                ? 'Guardar alteracoes'
                : 'Criar clube'}
          </button>
          <button type="button" onClick={resetClubForm} className={adminBtnSecondary}>
            Limpar
          </button>
        </div>

        {editingClubId ? (
          <div className={adminFieldSpaced}>
            <label className={adminLabel} htmlFor="club-user-select">
              Associar utilizador sem clube
            </label>
            <div className={adminActions}>
              <select
                id="club-user-select"
                className={adminInput}
                value={selectedClubUserId}
                onChange={(event) => setSelectedClubUserId(event.target.value)}
              >
                <option value="">Seleciona um utilizador</option>
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
                {isAssigningClubUser ? 'A associar...' : 'Associar ao clube'}
              </button>
            </div>
            {usersWithoutClub.length === 0 ? (
              <p className={adminInfo}>Nao existem utilizadores ativos sem clube.</p>
            ) : null}
          </div>
        ) : (
          <p className={adminInfo}>Guarda o clube primeiro para poderes associar utilizadores.</p>
        )}
      </form>

      <section className={adminPanelCard}>
        <h2 className={blockTitle}>Clubes registados</h2>
        <p className={blockText}>
          Lista de clubes disponiveis para futura associacao a utilizadores e conteudos.
        </p>

        <div className={adminStatsGrid}>
          <div className={adminStatCard}>
            <p className={adminStatValue}>{filteredClubs.length}</p>
            <p className={adminStatLabel}>Total</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>
              {filteredClubs.filter((club) => club.is_active).length}
            </p>
            <p className={adminStatLabel}>Ativos</p>
          </div>
          <div className={adminStatCard}>
            <p className={adminStatValue}>
              {filteredClubs.filter((club) => !club.is_active).length}
            </p>
            <p className={adminStatLabel}>Inativos</p>
          </div>
        </div>

        <div className={adminFormGridSpaced}>
          <div className={adminField}>
            <label className={adminLabel} htmlFor="club-date-from">
              Criados desde
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
              Criados ate
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
              Ordenar por
            </label>
            <select
              id="club-order"
              className={adminInput}
              value={clubOrder}
              onChange={(event) => setClubOrder(event.target.value)}
            >
              <option value="active_name">Ativos primeiro</option>
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="name_asc">Nome A-Z</option>
              <option value="name_desc">Nome Z-A</option>
              <option value="registrations_open">Inscricoes abertas primeiro</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className={adminBtnSecondary}
              disabled={isExportingClubs}
              onClick={() => void handleExportClubsCsv()}
            >
              {isExportingClubs ? 'A exportar...' : 'Exportar CSV'}
            </button>
          </div>
        </div>

        <div className={adminUserList}>
          {isLoadingClubs ? <p className={adminInfo}>A carregar clubes...</p> : null}
          {!isLoadingClubs && filteredClubs.length === 0 ? (
            <p className={adminInfo}>Nao existem clubes registados.</p>
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
                <p className={adminUserEmail}>{club.mission || 'Sem missao definida'}</p>
                <p className={adminUserMeta}>{club.description || 'Sem descricao'}</p>
                <p className={adminUserMeta}>
                  Inscricoes: {club.enable_registrations ? 'Permitidas' : 'Desativadas'}
                </p>
                <p className={adminUserMeta}>
                  Criado em: {formatAdminDateTime(club.created_at || '')}
                </p>
              </div>
              <div className={adminListTools}>
                <span
                  className={`${adminUserStatus} ${
                    club.is_active ? adminUserStatusActive : adminUserStatusInactive
                  }`}
                >
                  {club.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <button type="button" className={adminBtnEdit} onClick={() => handleEditClub(club)}>
                  Editar
                </button>
                <button
                  type="button"
                  className={adminBtnDanger}
                  disabled={deletingClubId === club.id}
                  onClick={() => handleDeleteClub(club.id)}
                >
                  {deletingClubId === club.id ? 'A apagar...' : 'Apagar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingClubId ? (
        <section className={adminPanelCard}>
          <h2 className={blockTitle}>Utilizadores deste clube</h2>
          <p className={blockText}>
            Aqui podes ver quem pertence ao clube em edicao e remover a associacao se
            necessario.
          </p>

          <div className={adminUserList}>
            {clubMembers.length === 0 ? (
              <p className={adminInfo}>Ainda nao existem utilizadores associados.</p>
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
                    {removingClubUserId === user.id ? 'A remover...' : 'Remover do clube'}
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
