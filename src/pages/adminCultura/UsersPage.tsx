import { Dispatch, FormEvent, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import { Users } from 'lucide-react';

import AdminPageHero from './AdminPageHero';
import { useUniversityEmailDomain } from './hooks/useUniversityEmailDomain';
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
  const university = useUniversityEmailDomain({
    enabled: Boolean(userPage && (userPage.mode === 'create' || userPage.mode === 'edit')),
    email: userForm.email,
    onEmailChange: (nextEmail) =>
      setUserForm((current) => ({
        ...current,
        email: nextEmail,
      })),
  });

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
                  disabled={isExportingUsers}
                  onClick={() => void handleExportUsersCsv()}
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

  if (userPage.mode === 'create' || userPage.mode === 'edit') {
    return (
      <div className="space-y-6">
        <AdminPageHero
          icon={Users}
          title={userPage.mode === 'create' ? 'Criar Utilizador' : 'Editar Utilizador'}
          description={
            userPage.mode === 'create'
              ? 'Criacao de novos acessos administrativos no InfoCultura.'
              : 'Atualizacao dos dados e permissoes do utilizador selecionado.'
          }
          tone="slate"
          actions={
            <NavLink to="/infocultura/utilizadores" className={adminBtnSecondary}>
              Voltar aos utilizadores
            </NavLink>
          }
        />

        <section className={adminPanelCard}>
          {!canManageUsers ? (
            <p className={adminError}>Apenas o superadmin pode aceder a esta pagina.</p>
          ) : userPage.mode === 'edit' && !selectedUser ? (
            <p className={adminInfo}>
              {isLoadingUsers ? 'A carregar utilizador...' : 'Utilizador nao encontrado.'}
            </p>
          ) : (
            <form onSubmit={handleSaveUser} className={adminPanelForm}>
              <div className={adminFormGridSpaced}>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="user-name">
                    Nome
                  </label>
                  <input
                    id="user-name"
                    className={adminInput}
                    value={userForm.name}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="user-email">
                    Email
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    className={adminInput}
                    value={userForm.email}
                    onChange={(event) => {
                      const inputValue = event.target.value;
                      university.handleEmailChange(inputValue);
                    }}
                  />
                  <p className={adminInfo}>
                    Selecione uma universidade portuguesa e o email fica preso ao dominio institucional.
                  </p>
                  <p className={adminInfo}>
                    O dominio substitui apenas a parte depois do @ e nao pode ser trocado manualmente.
                  </p>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="university-country">
                    País
                  </label>
                    <select
                    id="university-country"
                    className={adminInput}
                    value={university.universityCountry}
                    onChange={(event) => university.setUniversityCountry(event.target.value)}
                  >
                    <option value="Portugal">Portugal</option>
                    <option value="all">Todos os países</option>
                  </select>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="university-search">
                    Universidade
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="university-search"
                      className={adminInput}
                      value={university.universityQuery}
                      onChange={(event) => university.setUniversityQuery(event.target.value)}
                      placeholder="Pesquisar universidade"
                    />
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      onClick={() =>
                        void university.loadUniversities(
                          university.universityQuery,
                          university.universityCountry
                        )
                      }
                    >
                      Pesquisar
                    </button>
                  </div>
                  {university.universityError ? <p className={adminError}>{university.universityError}</p> : null}
                  {university.isSearchingUniversities ? <p className={adminInfo}>A procurar universidades...</p> : null}
                  {!university.isSearchingUniversities && university.universityResults.length > 0 ? (
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <label className={adminLabel} htmlFor="university-result">
                          Resultados
                        </label>
                        <select
                          id="university-result"
                          className={adminInput}
                          value={university.selectedUniversityIndex}
                          onChange={(event) =>
                            university.handleSelectUniversity(Number(event.target.value))
                          }
                        >
                          {university.universityResults.map((item, index) => (
                            <option key={`${item.name}-${item.country}-${index}`} value={index}>
                              {item.name} · {item.country}
                            </option>
                          ))}
                        </select>
                      </div>

                      {university.selectedUniversity ? (
                        <div className="space-y-2">
                          <p className={adminInfo}>
                            Domínios disponíveis: {university.selectedUniversity.domains.join(', ') || 'Sem domínio'}
                          </p>
                          {university.selectedUniversity.domains.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              <select
                                className={adminInput}
                                value={university.selectedUniversityDomain}
                                onChange={(event) =>
                                  university.handleUniversityDomainChange(event.target.value)
                                }
                              >
                                {university.selectedUniversity.domains.map((domain) => (
                                  <option key={domain} value={domain}>
                                    {domain}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}
                          {university.selectedUniversityDomain ? (
                            <p className={adminInfo}>
                              Domínio selecionado: {university.selectedUniversityDomain}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="user-role">
                    Role
                  </label>
                  <select
                    id="user-role"
                    className={adminInput}
                    value={userForm.role}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, role: event.target.value }))
                    }
                  >
                    {isLoadingRoles ? <option>A carregar roles...</option> : null}
                    {!isLoadingRoles && roles.length === 0 ? (
                      <option value="">Sem roles disponiveis</option>
                    ) : null}
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="user-password">
                    {userPage.mode === 'create'
                      ? 'Password manual'
                      : 'Nova password manual (opcional)'}
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={userForm.generate_password}
                      onChange={(event) =>
                        setUserForm((prev) => ({
                          ...prev,
                          generate_password: event.target.checked,
                          ...(event.target.checked ? { password: '' } : {})
                        }))
                      }
                    />
                    {userPage.mode === 'create'
                      ? 'Gerar password automaticamente e enviar por email'
                      : 'Gerar nova password e enviar por email'}
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    className={adminInput}
                    value={userForm.password}
                    disabled={userForm.generate_password}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                  <p className={adminInfo}>
                    {userForm.generate_password
                      ? 'A password sera criada automaticamente e enviada para o email institucional.'
                      : 'A password escrita aqui sera usada no acesso do utilizador.'}
                  </p>
                </div>
              </div>

              {userFormError ? <p className={adminError}>{userFormError}</p> : null}

              <div className={adminActions}>
                <button
                  type="submit"
                  className={adminBtnPrimary}
                  disabled={isSavingUser || isLoadingRoles || roles.length === 0}
                >
                  {isSavingUser
                    ? 'A guardar...'
                    : userPage.mode === 'create'
                      ? 'Criar utilizador'
                      : 'Guardar alteracoes'}
                </button>
                <button
                  type="button"
                  onClick={() => resetUserForm()}
                  className={adminBtnSecondary}
                >
                  Limpar
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
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
