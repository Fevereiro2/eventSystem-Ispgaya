import { Dispatch, FormEvent, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import { Users } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
import { UserPage, UserFormState } from './types';
import { formatAdminDateTime } from './utils';
import {
  adminActions,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminFormGridSpaced,
  adminInfo,
  adminInput,
  adminLabel,
  adminListTools,
  adminPanelCard,
  adminPanelForm,
  adminUserEmail,
  adminUserItem,
  adminUserList,
  adminUserMeta,
  adminUserName,
  adminUserStatus,
  adminUserStatusActive,
  adminUserStatusInactive,
} from '../../styles/ui';
import { InfoCulturaRole, InfoCulturaUser } from '../../api/infoculturaApi';
import UserFormPanel from './components/UserFormPanel.js';

type AdminHeroStat = { label: string; value: string | number };

type UsersPageProps = {
  userPage: UserPage | null;
  canManageUsers: boolean;
  isExportingUsers: boolean;
  handleExportUsersCsv: () => void | Promise<void>;
  userOverviewStats: AdminHeroStat[];
  isLoadingUsers: boolean;
  filteredUsers: InfoCulturaUser[];
  currentUser: InfoCulturaUser | null;
  userDateFrom: string;
  userDateTo: string;
  userOrder: string;
  setUserDateFrom: Dispatch<SetStateAction<string>>;
  setUserDateTo: Dispatch<SetStateAction<string>>;
  setUserOrder: Dispatch<SetStateAction<string>>;
  isSavingUser: boolean;
  isLoadingRoles: boolean;
  roles: InfoCulturaRole[];
  userForm: UserFormState;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
  userFormError: string;
  handleSaveUser: (event: FormEvent<HTMLFormElement>) => void;
  resetUserForm: () => void;
  selectedUser: InfoCulturaUser | null;
  isDeactivatingUser: boolean;
  handleDeactivateUser: (event: FormEvent<HTMLFormElement>) => void;
};

function UsersPage({
  userPage,
  canManageUsers,
  isExportingUsers,
  handleExportUsersCsv,
  userOverviewStats,
  isLoadingUsers,
  filteredUsers,
  currentUser,
  userDateFrom,
  userDateTo,
  userOrder,
  setUserDateFrom,
  setUserDateTo,
  setUserOrder,
  isSavingUser,
  isLoadingRoles,
  roles,
  userForm,
  setUserForm,
  userFormError,
  handleSaveUser,
  resetUserForm,
  selectedUser,
  isDeactivatingUser,
  handleDeactivateUser,
}: UsersPageProps) {
  if (!userPage) return null;

  if (userPage.mode === 'list') {
    return (
      <div className="space-y-6">
      <AdminPageHero
        icon={Users}
        title="Utilizadores"
        description="Gestao e consulta dos acessos administrativos do InfoCultura."
        tone="slate"
        stats={userOverviewStats}
        actions={
          canManageUsers ? (
            <>
              <NavLink to="/infocultura/utilizadores/novo" className={adminBtnPrimary}>
                Criar utilizador
              </NavLink>
              <button
                type="button"
                className={adminBtnSecondary}
                onClick={() => void handleExportUsersCsv()}
                disabled={isExportingUsers}
              >
                {isExportingUsers ? 'A exportar...' : 'Exportar CSV'}
              </button>
            </>
          ) : undefined
        }
      />

        <section className={adminPanelCard}>
          <div className={adminFormGridSpaced}>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="user-date-from">
                Criados desde
              </label>
              <input
                id="user-date-from"
                type="date"
                className={adminInput}
                value={userDateFrom}
                onChange={(event) => setUserDateFrom(event.target.value)}
              />
            </div>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="user-date-to">
                Criados ate
              </label>
              <input
                id="user-date-to"
                type="date"
                className={adminInput}
                value={userDateTo}
                onChange={(event) => setUserDateTo(event.target.value)}
              />
            </div>
            <div className={adminField}>
              <label className={adminLabel} htmlFor="user-order">
                Ordenar por
              </label>
              <select
                id="user-order"
                className={adminInput}
                value={userOrder}
                onChange={(event) => setUserOrder(event.target.value)}
              >
                <option value="active_name">Ativos primeiro</option>
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="name_asc">Nome A-Z</option>
                <option value="name_desc">Nome Z-A</option>
                <option value="email_asc">Email A-Z</option>
                <option value="email_desc">Email Z-A</option>
              </select>
            </div>
          </div>

          {canManageUsers ? null : (
            <p className={adminInfo}>
              Apenas o superadmin pode criar, editar e desativar utilizadores.
            </p>
          )}

          <div className={adminUserList}>
            {isLoadingUsers ? <p className={adminInfo}>A carregar utilizadores...</p> : null}
            {!isLoadingUsers && filteredUsers.length === 0 ? (
              <p className={adminInfo}>Nao existem utilizadores para mostrar.</p>
            ) : null}
            {filteredUsers.map((user) => (
              <article key={user.id} className={adminUserItem}>
                <div>
                  <h3 className={adminUserName}>{user.name}</h3>
                  <p className={adminUserEmail}>{user.email}</p>
                  <p className={adminUserMeta}>
                    {user.role}
                    {currentUser?.id === user.id ? ' · sessao atual' : ''}
                  </p>
                  <p className={adminUserMeta}>
                    Criado em: {formatAdminDateTime(user.created_at || '')}
                  </p>
                </div>
                <div className={adminListTools}>
                  <span
                    className={`${adminUserStatus} ${
                      user.is_active ? adminUserStatusActive : adminUserStatusInactive
                    }`}
                  >
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <NavLink
                    to={`/infocultura/utilizadores/${user.id}/perfil`}
                    className={adminBtnSecondary}
                  >
                    Perfil
                  </NavLink>
                  {canManageUsers ? (
                    <>
                      <NavLink
                        to={`/infocultura/utilizadores/${user.id}/editar`}
                        className={adminBtnEdit}
                      >
                        Editar
                      </NavLink>
                      {user.is_active && currentUser?.id !== user.id ? (
                        <NavLink
                          to={`/infocultura/utilizadores/${user.id}/desativar`}
                          className={adminBtnDanger}
                        >
                          Desativar
                        </NavLink>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (userPage.mode === 'profile') {
    return (
      <div className="space-y-6">
        <AdminPageHero
          icon={Users}
          title="Perfil de Utilizador"
          description="Detalhe completo do acesso e da filiação do utilizador no InfoCultura."
          tone="blue"
          actions={
            <NavLink to="/infocultura/utilizadores" className={adminBtnSecondary}>
              Voltar aos utilizadores
            </NavLink>
          }
        />

        <section className={adminPanelCard}>
          {!selectedUser ? (
            <p className={adminInfo}>
              {isLoadingUsers ? 'A carregar utilizador...' : 'Utilizador nao encontrado.'}
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className={adminUserName}>{selectedUser.name}</h3>
                  <p className={adminUserEmail}>{selectedUser.email}</p>
                  <p className={adminUserMeta}>
                    {selectedUser.role}
                    {currentUser?.id === selectedUser.id ? ' · sessao atual' : ''}
                  </p>
                </div>
                <span
                  className={`${adminUserStatus} ${
                    selectedUser.is_active ? adminUserStatusActive : adminUserStatusInactive
                  }`}
                >
                  {selectedUser.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{selectedUser.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Função
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{selectedUser.role}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Clube
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedUser.club_name || 'Sem clube associado'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Estado
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedUser.is_active ? 'Conta ativa' : 'Conta inativa'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Criado em
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {formatAdminDateTime(selectedUser.created_at || '')}
                  </p>
                </div>
              </div>

              {canManageUsers ? (
                <div className="flex flex-wrap gap-3">
                  <NavLink
                    to={`/infocultura/utilizadores/${selectedUser.id}/editar`}
                    className={adminBtnEdit}
                  >
                    Editar utilizador
                  </NavLink>
                  {selectedUser.is_active && currentUser?.id !== selectedUser.id ? (
                    <NavLink
                      to={`/infocultura/utilizadores/${selectedUser.id}/desativar`}
                      className={adminBtnDanger}
                    >
                      Desativar
                    </NavLink>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (userPage.mode === 'create' || userPage.mode === 'edit') {
    return (
      <UserFormPanel
        userPage={userPage}
        canManageUsers={canManageUsers}
        isLoadingUsers={isLoadingUsers}
        isSavingUser={isSavingUser}
        isLoadingRoles={isLoadingRoles}
        roles={roles}
        userForm={userForm}
        setUserForm={setUserForm}
        userFormError={userFormError}
        handleSaveUser={handleSaveUser}
        resetUserForm={resetUserForm}
        selectedUser={selectedUser}
      />
    );
  }

  if (userPage.mode === 'deactivate') {
    return (
      <div className="space-y-6">
        <AdminPageHero
          icon={Users}
          title="Desativar Utilizador"
          description="Confirma a desativacao do utilizador selecionado antes de remover o acesso."
          tone="rose"
          actions={
            <NavLink to="/infocultura/utilizadores" className={adminBtnSecondary}>
              Voltar aos utilizadores
            </NavLink>
          }
        />

        <section className={adminPanelCard}>
          {!canManageUsers ? (
            <p className={adminError}>Apenas o superadmin pode aceder a esta pagina.</p>
          ) : !selectedUser ? (
            <p className={adminInfo}>
              {isLoadingUsers ? 'A carregar utilizador...' : 'Utilizador nao encontrado.'}
            </p>
          ) : (
            <form onSubmit={handleDeactivateUser} className={adminPanelForm}>
              <div className={adminUserItem}>
                <div>
                  <h3 className={adminUserName}>{selectedUser.name}</h3>
                  <p className={adminUserEmail}>{selectedUser.email}</p>
                  <p className={adminUserMeta}>{selectedUser.role}</p>
                </div>
                <span
                  className={`${adminUserStatus} ${
                    selectedUser.is_active
                      ? adminUserStatusActive
                      : adminUserStatusInactive
                  }`}
                >
                  {selectedUser.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {userFormError ? <p className={adminError}>{userFormError}</p> : null}

              <div className={adminActions}>
                <button
                  type="submit"
                  className={adminBtnDanger}
                  disabled={isDeactivatingUser || !selectedUser.is_active}
                >
                  {isDeactivatingUser ? 'A desativar...' : 'Confirmar desativacao'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    );
  }

  return null;
}

export default UsersPage;
