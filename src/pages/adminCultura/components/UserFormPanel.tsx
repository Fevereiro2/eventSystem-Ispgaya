import { Dispatch, FormEvent, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import { Users } from 'lucide-react';

import { InfoCulturaClub, InfoCulturaRole, InfoCulturaUser } from '../../../api/infoculturaApi.js';
import { useUniversityEmailDomain } from '../hooks/useUniversityEmailDomain.js';
import { adminNamePattern, adminNameTitle } from '../nameValidation.js';
import { UserPage, UserFormState } from '../types.js';
import {
  adminActions,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminInfo,
  adminInput,
  adminLabel,
  adminPanelCard,
  adminPanelForm,
} from '../../../styles/ui.js';
import AdminPageHero from './AdminPageHero.js';

function buildEmailLocalPartFromName(name: string): string {
  const normalized = name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return normalized || 'utilizador';
}

type UserFormPanelProps = {
  userPage: UserPage;
  canManageUsers: boolean;
  isLoadingUsers: boolean;
  isSavingUser: boolean;
  isLoadingRoles: boolean;
  clubs: InfoCulturaClub[];
  isLoadingClubs: boolean;
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
  clubs,
  isLoadingClubs,
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
    suggestedLocalPart: buildEmailLocalPartFromName(userForm.name),
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
            <div className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Dados pessoais
                  </h3>
                  <p className={adminInfo}>Nome e contacto institucional do novo utilizador.</p>
                </div>

                <div className="space-y-4">
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="user-name">
                      Nome
                    </label>
                    <input
                      id="user-name"
                      className={adminInput}
                      pattern={adminNamePattern}
                      title={adminNameTitle}
                      value={userForm.name}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                    />
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
                    {university.universityError ? (
                      <p className={adminError}>{university.universityError}</p>
                    ) : null}
                    {university.isSearchingUniversities ? (
                      <p className={adminInfo}>A procurar universidades...</p>
                    ) : null}
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
                              Domínios disponíveis:{' '}
                              {university.selectedUniversity.domains.join(', ') || 'Sem domínio'}
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
                      O email institucional aparece automaticamente quando escolhes a universidade.
                    </p>
                    <p className={adminInfo}>
                      O dominio substitui apenas a parte depois do @ e nao pode ser trocado manualmente.
                    </p>
                  </div>
                </div>
              </section>

              {userPage.mode === 'create' ? (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Clube
                    </h3>
                    <p className={adminInfo}>
                      Associa este utilizador a um clube logo na criação.
                    </p>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="user-club">
                      Clube
                    </label>
                    <select
                      id="user-club"
                      className={adminInput}
                      value={userForm.club_id}
                      required
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, club_id: event.target.value }))
                      }
                    >
                      <option value="">Seleciona um clube</option>
                      {isLoadingClubs ? <option value="">A carregar clubes...</option> : null}
                      {!isLoadingClubs && clubs.length === 0 ? (
                        <option value="">Nao existem clubes disponiveis</option>
                      ) : null}
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                    <p className={adminInfo}>
                      O clube escolhido fica guardado no momento da criacao do utilizador.
                    </p>
                  </div>
                </section>
              ) : null}

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Acesso
                  </h3>
                  <p className={adminInfo}>
                    Define o perfil administrativo que este utilizador vai receber.
                  </p>
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
              </section>
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
