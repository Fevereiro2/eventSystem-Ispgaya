import { Dispatch, FormEvent, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import { Users } from 'lucide-react';

import { InfoCulturaRole, InfoCulturaUser } from '../../../api/infoculturaApi.js';
import { useUniversityEmailDomain } from '../hooks/useUniversityEmailDomain.js';
import { UserPage, UserFormState } from '../types.js';
import {
  adminActions,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminFormGridSpaced,
  adminInfo,
  adminInput,
  adminLabel,
  adminPanelCard,
  adminPanelForm,
} from '../../../styles/ui.js';
import AdminPageHero from './AdminPageHero.js';

type UserFormPanelProps = {
  userPage: UserPage;
  canManageUsers: boolean;
  isLoadingUsers: boolean;
  isSavingUser: boolean;
  isLoadingRoles: boolean;
  roles: InfoCulturaRole[];
  userForm: UserFormState;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
  userFormError: string;
  handleSaveUser: (event: FormEvent<HTMLFormElement>) => void;
  resetUserForm: () => void;
  selectedUser: InfoCulturaUser | null;
};

export default function UserFormPanel({
  userPage,
  canManageUsers,
  isLoadingUsers,
  isSavingUser,
  isLoadingRoles,
  roles,
  userForm,
  setUserForm,
  userFormError,
  handleSaveUser,
  resetUserForm,
  selectedUser,
}: UserFormPanelProps) {
  const university = useUniversityEmailDomain({
    enabled: userPage.mode === 'create' || userPage.mode === 'edit',
    email: userForm.email,
    onEmailChange: (nextEmail) =>
      setUserForm((current) => ({
        ...current,
        email: nextEmail,
      })),
  });

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
                  onChange={(event) => university.handleEmailChange(event.target.value)}
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
              <button type="button" onClick={() => resetUserForm()} className={adminBtnSecondary}>
                Limpar
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
