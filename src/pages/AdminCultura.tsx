import { FormEvent, useEffect, useMemo, useState } from 'react';
import { NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import infoCulturaBg from '../assets/19825874_uqliU.jpeg';
import ispgayaLogo from '../assets/ispgaya-logo.svg';
import {
  adminActions,
  adminBadge,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminBtnSecondary,
  adminDashboardGrid,
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
  adminSectionLink,
  adminSectionLinkActive,
  adminSectionNav,
  adminStatCard,
  adminStatLabel,
  adminStatsGrid,
  adminStatValue,
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
  container,
  infoLegacyBackdropImage,
  infoLegacyBackdropOverlay,
  infoLegacyBrandLogo,
  infoLegacyBrandSub,
  infoLegacyBrandText,
  infoLegacyBrandWrap,
  infoLegacyCenter,
  infoLegacyChrome,
  infoLegacyGrid,
  infoLegacyFooter,
  infoLegacyFooterInner,
  infoLegacyHeader,
  infoLegacyHeaderInner,
  infoLegacyLeft,
  infoLegacyBlock,
  infoLegacyBlockTitle,
  infoLegacyBlockText,
  infoLegacyBlockList,
  infoLegacyInput,
  infoLegacyLang,
  infoLegacyLoginForm,
  infoLegacyLoginHint,
  infoLegacyPanel,
  infoLegacyRight,
  infoLegacyLoginStage,
  infoLegacyLoginTitle,
  infoLegacyMain,
  infoLegacyMeta,
  infoLegacyPage,
  infoLegacyPrimaryButton,
} from '../styles/ui';
import {
  CulturalArea,
  CulturalItem,
  getAreaLabel,
} from '../data/culturalContent';
import {
  assignUserToClub,
  createAdminClub,
  createAdminContent,
  createAdminUser,
  deactivateAdminUser,
  deleteAdminClub,
  deleteAdminContent,
  fetchAdminClubs,
  fetchAdminContent,
  fetchAdminRoles,
  fetchAdminUsers,
  fetchInfoCulturaMe,
  InfoCulturaClub,
  InfoCulturaRole,
  InfoCulturaUser,
  loginInfoCultura,
  removeUserFromClub,
  updateAdminClub,
  updateAdminContent,
  updateAdminUser,
} from '../data/infoculturaApi';

const TOKEN_KEY = 'ispgaya_cultura_token';

type FormState = {
  area: CulturalArea;
  title: string;
  description: string;
  date: string;
  status: 'rascunho' | 'publicado';
};

type UserFormState = {
  name: string;
  email: string;
  role: string;
  password: string;
};

type ClubFormState = {
  name: string;
  description: string;
  mission: string;
  is_active: boolean;
};

type AdminSection = 'resumo' | 'utilizadores' | 'conteudos' | 'clubes';

type UserPage =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; userId: number }
  | { mode: 'deactivate'; userId: number };

const initialContentForm: FormState = {
  area: 'tuna',
  title: '',
  description: '',
  date: '',
  status: 'rascunho'
};

const initialUserForm: UserFormState = {
  name: '',
  email: '',
  role: 'club_admin',
  password: ''
};

const initialClubForm: ClubFormState = {
  name: '',
  description: '',
  mission: '',
  is_active: true
};

const adminSections: { id: AdminSection; label: string; href: string }[] = [
  { id: 'resumo', label: 'Resumo', href: '/infocultura/resumo' },
  { id: 'utilizadores', label: 'Utilizadores', href: '/infocultura/utilizadores' },
  { id: 'conteudos', label: 'Conteudos', href: '/infocultura/conteudos' },
  { id: 'clubes', label: 'Clubes', href: '/infocultura/clubes' }
];

function getAdminSection(pathname: string): AdminSection | null {
  if (pathname === '/infocultura' || pathname === '/infocultura/' || pathname === '/infocultura/resumo') {
    return 'resumo';
  }

  if (
    pathname === '/infocultura/utilizadores' ||
    pathname.startsWith('/infocultura/utilizadores/')
  ) {
    return 'utilizadores';
  }

  if (pathname === '/infocultura/conteudos') {
    return 'conteudos';
  }

  if (pathname === '/infocultura/clubes') {
    return 'clubes';
  }

  return null;
}

function getUserPage(pathname: string): UserPage | null {
  if (pathname === '/infocultura/utilizadores') {
    return { mode: 'list' };
  }

  if (pathname === '/infocultura/utilizadores/novo') {
    return { mode: 'create' };
  }

  const editMatch = pathname.match(/^\/infocultura\/utilizadores\/(\d+)\/editar\/?$/);
  if (editMatch) {
    return { mode: 'edit', userId: Number(editMatch[1]) };
  }

  const deactivateMatch = pathname.match(
    /^\/infocultura\/utilizadores\/(\d+)\/desativar\/?$/
  );
  if (deactivateMatch) {
    return { mode: 'deactivate', userId: Number(deactivateMatch[1]) };
  }

  return null;
}

function sortUsers(list: InfoCulturaUser[]): InfoCulturaUser[] {
  return [...list].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }

    return a.name.localeCompare(b.name) || a.email.localeCompare(b.email);
  });
}

function sortClubs(list: InfoCulturaClub[]): InfoCulturaClub[] {
  return [...list].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

function AdminCultura() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [token, setToken] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(TOKEN_KEY) || '';
  });
  const isAuth = token.length > 0;
  const [items, setItems] = useState<CulturalItem[]>([]);
  const [users, setUsers] = useState<InfoCulturaUser[]>([]);
  const [clubs, setClubs] = useState<InfoCulturaClub[]>([]);
  const [roles, setRoles] = useState<InfoCulturaRole[]>([]);
  const [currentUser, setCurrentUser] = useState<InfoCulturaUser | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingClub, setIsSavingClub] = useState(false);
  const [isAssigningClubUser, setIsAssigningClubUser] = useState(false);
  const [isDeactivatingUser, setIsDeactivatingUser] = useState(false);
  const [deletingClubId, setDeletingClubId] = useState<number | null>(null);
  const [removingClubUserId, setRemovingClubUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contentForm, setContentForm] = useState<FormState>(initialContentForm);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm);
  const [clubForm, setClubForm] = useState<ClubFormState>(initialClubForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingClubId, setEditingClubId] = useState<number | null>(null);
  const [selectedClubUserId, setSelectedClubUserId] = useState('');
  const [userFormError, setUserFormError] = useState('');
  const [clubFormError, setClubFormError] = useState('');

  const activeSection = getAdminSection(location.pathname);
  const userPage = useMemo(() => getUserPage(location.pathname), [location.pathname]);
  const canManageUsers = currentUser?.role === 'superadmin';
  const visibleSections = useMemo(
    () => adminSections.filter((section) => section.id !== 'clubes' || canManageUsers),
    [canManageUsers]
  );
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [items]
  );
  const sortedUsers = useMemo(() => sortUsers(users), [users]);
  const sortedClubs = useMemo(() => sortClubs(clubs), [clubs]);
  const selectedUser = useMemo(() => {
    if (!userPage || userPage.mode === 'list' || userPage.mode === 'create') {
      return null;
    }

    return users.find((user) => user.id === userPage.userId) || null;
  }, [userPage, users]);
  const publishedItems = useMemo(
    () => items.filter((item) => item.status === 'publicado').length,
    [items]
  );
  const activeUsers = useMemo(
    () => users.filter((user) => user.is_active).length,
    [users]
  );
  const activeClubs = useMemo(
    () => clubs.filter((club) => club.is_active).length,
    [clubs]
  );
  const clubMembers = useMemo(() => {
    if (!editingClubId) return [];

    return sortUsers(users.filter((user) => user.club_id === editingClubId));
  }, [editingClubId, users]);
  const usersWithoutClub = useMemo(
    () =>
      sortUsers(users.filter((user) => user.is_active && !user.club_id)),
    [users]
  );

  function clearAuth() {
    setToken('');
    setItems([]);
    setUsers([]);
    setClubs([]);
    setRoles([]);
    setCurrentUser(null);
    setPanelError('');
    setUserFormError('');
    setClubFormError('');
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function resetContentForm() {
    setContentForm(initialContentForm);
    setEditingId(null);
  }

  function resetUserForm(defaultRole?: string) {
    setUserForm({
      ...initialUserForm,
      role: defaultRole || roles[0]?.name || initialUserForm.role
    });
    setUserFormError('');
  }

  function resetClubForm() {
    setClubForm(initialClubForm);
    setEditingClubId(null);
    setSelectedClubUserId('');
    setClubFormError('');
  }

  async function loadAdminData(authToken: string) {
    setIsLoadingItems(true);
    setIsLoadingUsers(true);
    setPanelError('');

    try {
      const [nextItems, nextUsers, nextCurrentUser] = await Promise.all([
        fetchAdminContent(authToken),
        fetchAdminUsers(authToken),
        fetchInfoCulturaMe(authToken)
      ]);
      setItems(nextItems);
      setUsers(nextUsers);
      setCurrentUser(nextCurrentUser);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar os dados do painel.';
      setPanelError(message);

      if (message.toLowerCase().includes('token')) {
        clearAuth();
      }
    } finally {
      setIsLoadingItems(false);
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadAdminData(token);
  }, [token]);

  useEffect(() => {
    if (!token || !canManageUsers) {
      setRoles([]);
      setClubs([]);
      return;
    }

    let isMounted = true;
    setIsLoadingRoles(true);

    void fetchAdminRoles(token)
      .then((nextRoles) => {
        if (!isMounted) return;
        setRoles(nextRoles);
      })
      .catch((error) => {
        if (!isMounted) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar os perfis.';
        setPanelError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingRoles(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, canManageUsers]);

  useEffect(() => {
    if (!token || !canManageUsers) {
      resetClubForm();
      return;
    }

    let isMounted = true;
    setIsLoadingClubs(true);

    void fetchAdminClubs(token)
      .then((nextClubs) => {
        if (!isMounted) return;
        setClubs(sortClubs(nextClubs));
      })
      .catch((error) => {
        if (!isMounted) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar os clubes.';
        setPanelError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingClubs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, canManageUsers]);

  useEffect(() => {
    if (activeSection !== 'utilizadores' || !userPage) return;

    if (userPage.mode === 'create') {
      resetUserForm();
      return;
    }

    if (userPage.mode === 'edit' && selectedUser) {
      setUserForm({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        password: ''
      });
      setUserFormError('');
    }
  }, [activeSection, userPage, selectedUser, roles]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError('');

    try {
      const nextToken = await loginInfoCultura(authUser, authPass);
      setToken(nextToken);
      sessionStorage.setItem(TOKEN_KEY, nextToken);
      setAuthPass('');
      setAuthUser('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciais invalidas.';
      setAuthError(message);
    }
  }

  function handleLogout() {
    clearAuth();
    setAuthUser('');
    setAuthPass('');
    resetContentForm();
    resetUserForm();
    resetClubForm();
  }

  async function handleSaveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload = {
      area: contentForm.area,
      title: contentForm.title.trim(),
      description: contentForm.description.trim(),
      date: contentForm.date,
      status: contentForm.status
    };

    if (!payload.title || !payload.description || !payload.date) {
      setPanelError('Preenche todos os campos obrigatorios.');
      return;
    }

    setIsSavingContent(true);
    setPanelError('');

    try {
      if (editingId) {
        const updated = await updateAdminContent(token, editingId, payload);
        setItems((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        resetContentForm();
        return;
      }

      const created = await createAdminContent(token, payload);
      setItems((prev) => [created, ...prev]);
      resetContentForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar o conteudo.';
      setPanelError(message);
    } finally {
      setIsSavingContent(false);
    }
  }

  function handleEditContent(item: CulturalItem) {
    setEditingId(item.id);
    setContentForm({
      area: item.area,
      title: item.title,
      description: item.description,
      date: item.date,
      status: item.status
    });
  }

  async function handleDeleteContent(id: string) {
    if (!token) return;

    setDeletingId(id);
    setPanelError('');

    try {
      await deleteAdminContent(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));

      if (editingId === id) {
        resetContentForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar o conteudo.';
      setPanelError(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !canManageUsers || !userPage) return;

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      ...(userForm.password.trim() ? { password: userForm.password.trim() } : {})
    };

    if (!payload.name || !payload.email || !payload.role) {
      setUserFormError('Preenche nome, email e role.');
      return;
    }

    if (userPage.mode === 'create' && !payload.password) {
      setUserFormError('A password e obrigatoria para criar um utilizador.');
      return;
    }

    setIsSavingUser(true);
    setUserFormError('');

    try {
      const savedUser =
        userPage.mode === 'create'
          ? await createAdminUser(token, payload)
          : userPage.mode === 'edit'
            ? await updateAdminUser(token, userPage.userId, payload)
            : null;

      if (!savedUser) {
        return;
      }

      setUsers((prev) =>
        userPage.mode === 'create'
          ? sortUsers([savedUser, ...prev])
          : sortUsers(prev.map((user) => (user.id === savedUser.id ? savedUser : user)))
      );

      if (currentUser?.id === savedUser.id) {
        setCurrentUser(savedUser);
      }

      resetUserForm();
      navigate('/infocultura/utilizadores');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar o utilizador.';
      setUserFormError(message);
    } finally {
      setIsSavingUser(false);
    }
  }

  async function handleDeactivateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !canManageUsers || !selectedUser) return;

    setIsDeactivatingUser(true);
    setUserFormError('');

    try {
      const updatedUser = await deactivateAdminUser(token, selectedUser.id);
      setUsers((prev) =>
        sortUsers(prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      );
      navigate('/infocultura/utilizadores');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel desativar o utilizador.';
      setUserFormError(message);
    } finally {
      setIsDeactivatingUser(false);
    }
  }

  async function handleSaveClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !canManageUsers) return;

    const payload = {
      name: clubForm.name.trim(),
      description: clubForm.description.trim(),
      mission: clubForm.mission.trim(),
      is_active: clubForm.is_active
    };

    if (!payload.name) {
      setClubFormError('O nome do clube e obrigatorio.');
      return;
    }

    setIsSavingClub(true);
    setClubFormError('');

    try {
      const savedClub = editingClubId
        ? await updateAdminClub(token, editingClubId, payload)
        : await createAdminClub(token, payload);

      setClubs((prev) =>
        editingClubId
          ? sortClubs(prev.map((club) => (club.id === savedClub.id ? savedClub : club)))
          : sortClubs([savedClub, ...prev])
      );

      if (editingClubId) {
        setUsers((prev) =>
          sortUsers(
            prev.map((user) =>
              user.club_id === savedClub.id
                ? { ...user, club_name: savedClub.name }
                : user
            )
          )
        );
      }

      resetClubForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar o clube.';
      setClubFormError(message);
    } finally {
      setIsSavingClub(false);
    }
  }

  function handleEditClub(club: InfoCulturaClub) {
    setEditingClubId(club.id);
    setSelectedClubUserId('');
    setClubForm({
      name: club.name,
      description: club.description || '',
      mission: club.mission || '',
      is_active: club.is_active
    });
    setClubFormError('');
  }

  async function handleDeleteClub(id: number) {
    if (!token || !canManageUsers) return;

    setDeletingClubId(id);
    setClubFormError('');

    try {
      await deleteAdminClub(token, id);
      setClubs((prev) => prev.filter((club) => club.id !== id));

      if (editingClubId === id) {
        resetClubForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar o clube.';
      setClubFormError(message);
    } finally {
      setDeletingClubId(null);
    }
  }

  async function handleAssignUserToClub() {
    if (!token || !canManageUsers || !editingClubId || !selectedClubUserId) return;

    setIsAssigningClubUser(true);
    setClubFormError('');

    try {
      const updatedUser = await assignUserToClub(token, editingClubId, Number(selectedClubUserId));
      setUsers((prev) =>
        sortUsers(prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      );
      setSelectedClubUserId('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel associar o utilizador.';
      setClubFormError(message);
    } finally {
      setIsAssigningClubUser(false);
    }
  }

  async function handleRemoveUserFromClub(userId: number) {
    if (!token || !canManageUsers || !editingClubId) return;

    setRemovingClubUserId(userId);
    setClubFormError('');

    try {
      const updatedUser = await removeUserFromClub(token, editingClubId, userId);
      setUsers((prev) =>
        sortUsers(prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel remover o utilizador do clube.';
      setClubFormError(message);
    } finally {
      setRemovingClubUserId(null);
    }
  }

  if (location.pathname === '/infocultura' || location.pathname === '/infocultura/') {
    return <Navigate to="/infocultura/resumo" replace />;
  }

  if (!activeSection) {
    return <Navigate to="/infocultura/resumo" replace />;
  }

  if (activeSection === 'utilizadores' && !userPage) {
    return <Navigate to="/infocultura/utilizadores" replace />;
  }

  if (activeSection === 'clubes' && currentUser && !canManageUsers) {
    return <Navigate to="/infocultura/resumo" replace />;
  }

  if (!isAuth) {
    return (
      <div className={infoLegacyLoginStage}>
        <img src={infoCulturaBg} alt="" className={infoLegacyBackdropImage} />
        <div className={infoLegacyBackdropOverlay} />
        <div className={infoLegacyChrome}>
          <header className={infoLegacyHeader}>
            <div className={infoLegacyHeaderInner}>
              <div className={infoLegacyBrandWrap}>
                <img src={ispgayaLogo} alt="ISPGAYA" className={infoLegacyBrandLogo} />
                <div>
                  <p className={infoLegacyBrandText}>InfoCultura</p>
                  <p className={infoLegacyBrandSub}>Gestao cultural interna</p>
                </div>
              </div>
              <p className={infoLegacyLang}>PT | EN</p>
            </div>
          </header>

          <main className={infoLegacyCenter}>
            <div className={infoLegacyPanel}>
              <div className={infoLegacyGrid}>
                <div className={infoLegacyLeft}>
                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>Laboratorio Cultural</h3>
                    <p className={infoLegacyBlockText}>
                      A nossa abordagem cultural e interdisciplinar, promovendo criacao
                      artistica, participacao academica e ligacao com a comunidade.
                    </p>
                    <ul className={infoLegacyBlockList}>
                      <li>Organizar programacao cultural</li>
                      <li>Atualizar noticias por area</li>
                      <li>Gerir conteudo em rascunho e publicado</li>
                    </ul>
                  </div>

                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>Primeiro acesso</h3>
                    <p className={infoLegacyBlockText}>
                      Se e a primeira vez a usar o portal, contacte a equipa tecnica para
                      atribuicao de credenciais de administrador.
                    </p>
                  </div>
                </div>

                <div className={infoLegacyRight}>
                  <h2 className={infoLegacyLoginTitle}>Entrar</h2>
                  <p className={infoLegacyLoginHint}>
                    Acesso reservado aos administradores do InfoCultura.
                  </p>

                  <form className={infoLegacyLoginForm} onSubmit={handleLogin}>
                    <div className={adminField}>
                      <label htmlFor="admin-user" className={adminLabel}>
                        Utilizador
                      </label>
                      <input
                        id="admin-user"
                        className={infoLegacyInput}
                        placeholder="Utilizador"
                        value={authUser}
                        onChange={(event) => setAuthUser(event.target.value)}
                      />
                    </div>

                    <div className={adminField}>
                      <label htmlFor="admin-pass" className={adminLabel}>
                        Palavra-chave
                      </label>
                      <input
                        id="admin-pass"
                        type="password"
                        className={infoLegacyInput}
                        placeholder="Palavra-chave"
                        value={authPass}
                        onChange={(event) => setAuthPass(event.target.value)}
                      />
                    </div>

                    {authError ? <p className={adminError}>{authError}</p> : null}

                    <button type="submit" className={infoLegacyPrimaryButton}>
                      Entrar
                    </button>

                    <p className={infoLegacyMeta}>
                      Demo local: utilizador <strong>admin</strong> e password{' '}
                      <strong>cultura2026</strong>.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </main>

          <footer className={infoLegacyFooter}>
            <div className={infoLegacyFooterInner}>
              <span>2026 · Instituto Superior Politecnico Gaya</span>
              <span>InfoCultura</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={infoLegacyPage}>
      <header className={infoLegacyHeader}>
        <div className={infoLegacyHeaderInner}>
          <div className={infoLegacyBrandWrap}>
            <img src={ispgayaLogo} alt="ISPGAYA" className={infoLegacyBrandLogo} />
            <div>
              <p className={infoLegacyBrandText}>InfoCultura</p>
              <p className={infoLegacyBrandSub}>Gestao cultural interna</p>
            </div>
          </div>
          <p className={infoLegacyLang}>PT | EN</p>
        </div>
      </header>

      <main className={infoLegacyMain}>
        <div className={container}>
          <div className={adminHeaderRow}>
            <span className={adminBadge}>InfoCultura</span>
            <p className={adminInfo}>
              {activeSection === 'utilizadores'
                ? 'Gestao e consulta dos utilizadores do InfoCultura.'
                : activeSection === 'clubes'
                  ? 'Criacao e manutencao dos clubes internos.'
                : activeSection === 'conteudos'
                  ? 'Gestao de Tuna, Clube de Leitura e Teatro.'
                  : 'Visao geral do painel administrativo.'}
            </p>
            <button type="button" onClick={handleLogout} className={adminBtnSecondary}>
              Terminar sessao
            </button>
          </div>
          {panelError ? <p className={adminError}>{panelError}</p> : null}

          <nav className={adminSectionNav} aria-label="Secoes do painel">
            {visibleSections.map((section) => (
              <NavLink
                key={section.id}
                to={section.href}
                className={({ isActive }) =>
                  isActive ? adminSectionLinkActive : adminSectionLink
                }
              >
                {section.label}
              </NavLink>
            ))}
          </nav>

          {activeSection === 'resumo' ? (
            <div className={adminDashboardGrid}>
              <section className={adminPanelCard}>
                <h2 className={blockTitle}>Painel InfoCultura</h2>
                <p className={blockText}>
                  Consulta a sessao atual e os principais indicadores do sistema.
                </p>

                <div className={adminStatsGrid}>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{users.length}</p>
                    <p className={adminStatLabel}>Utilizadores</p>
                  </div>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{activeUsers}</p>
                    <p className={adminStatLabel}>Ativos</p>
                  </div>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{publishedItems}</p>
                    <p className={adminStatLabel}>Publicados</p>
                  </div>
                  {canManageUsers ? (
                    <div className={adminStatCard}>
                      <p className={adminStatValue}>{clubs.length}</p>
                      <p className={adminStatLabel}>Clubes</p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className={adminPanelCard}>
                <h2 className={blockTitle}>Sessao Atual</h2>
                <p className={blockText}>Informacao do utilizador autenticado neste momento.</p>

                <div className={adminUserList}>
                  <div className={adminUserItem}>
                    <div>
                      <h3 className={adminUserName}>Administrador autenticado</h3>
                      <p className={adminUserEmail}>
                        {currentUser?.name || (isLoadingUsers ? 'A carregar...' : 'Sem dados')}
                      </p>
                      <p className={adminUserMeta}>
                        {currentUser
                          ? `${currentUser.email} · ${currentUser.role}`
                          : 'InfoCultura'}
                      </p>
                    </div>
                    {currentUser ? (
                      <span
                        className={`${adminUserStatus} ${
                          currentUser.is_active
                            ? adminUserStatusActive
                            : adminUserStatusInactive
                        }`}
                      >
                        {currentUser.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {activeSection === 'utilizadores' && userPage?.mode === 'list' ? (
            <section className={adminPanelCard}>
              <h2 className={blockTitle}>Utilizadores</h2>
              <p className={blockText}>
                Nesta pagina aparecem todos os utilizadores do InfoCultura.
              </p>

              <div className={adminStatsGrid}>
                <div className={adminStatCard}>
                  <p className={adminStatValue}>{users.length}</p>
                  <p className={adminStatLabel}>Total</p>
                </div>
                <div className={adminStatCard}>
                  <p className={adminStatValue}>{activeUsers}</p>
                  <p className={adminStatLabel}>Ativos</p>
                </div>
                <div className={adminStatCard}>
                  <p className={adminStatValue}>{users.length - activeUsers}</p>
                  <p className={adminStatLabel}>Inativos</p>
                </div>
              </div>

              {canManageUsers ? (
                <div className={adminActions}>
                  <NavLink to="/infocultura/utilizadores/novo" className={adminBtnPrimary}>
                    Criar utilizador
                  </NavLink>
                </div>
              ) : (
                <p className={adminInfo}>
                  Apenas o superadmin pode criar, editar e desativar utilizadores.
                </p>
              )}

              <div className={adminUserList}>
                {isLoadingUsers ? <p className={adminInfo}>A carregar utilizadores...</p> : null}
                {!isLoadingUsers && sortedUsers.length === 0 ? (
                  <p className={adminInfo}>Nao existem utilizadores para mostrar.</p>
                ) : null}
                {sortedUsers.map((user) => (
                  <article key={user.id} className={adminUserItem}>
                    <div>
                      <h3 className={adminUserName}>{user.name}</h3>
                      <p className={adminUserEmail}>{user.email}</p>
                      <p className={adminUserMeta}>
                        {user.role}
                        {currentUser?.id === user.id ? ' · sessao atual' : ''}
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
          ) : null}

          {activeSection === 'utilizadores' &&
          (userPage?.mode === 'create' || userPage?.mode === 'edit') ? (
            <section className={adminPanelCard}>
              <h2 className={blockTitle}>
                {userPage.mode === 'create' ? 'Criar Utilizador' : 'Editar Utilizador'}
              </h2>
              <p className={blockText}>
                {userPage.mode === 'create'
                  ? 'Cria um novo utilizador para o InfoCultura.'
                  : 'Atualiza os dados do utilizador selecionado.'}
              </p>

              <div className={adminActions}>
                <NavLink to="/infocultura/utilizadores" className={adminBtnSecondary}>
                  Voltar aos utilizadores
                </NavLink>
              </div>

              {!canManageUsers ? (
                <p className={adminError}>
                  Apenas o superadmin pode aceder a esta pagina.
                </p>
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
                        onChange={(event) =>
                          setUserForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
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
                          ? 'Password'
                          : 'Nova password (opcional)'}
                      </label>
                      <input
                        id="user-password"
                        type="password"
                        className={adminInput}
                        value={userForm.password}
                        onChange={(event) =>
                          setUserForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                      />
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
          ) : null}

          {activeSection === 'utilizadores' && userPage?.mode === 'deactivate' ? (
            <section className={adminPanelCard}>
              <h2 className={blockTitle}>Desativar Utilizador</h2>
              <p className={blockText}>
                Confirma a desativacao do utilizador selecionado.
              </p>

              <div className={adminActions}>
                <NavLink to="/infocultura/utilizadores" className={adminBtnSecondary}>
                  Voltar aos utilizadores
                </NavLink>
              </div>

              {!canManageUsers ? (
                <p className={adminError}>
                  Apenas o superadmin pode aceder a esta pagina.
                </p>
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
          ) : null}

          {activeSection === 'clubes' ? (
            <>
              <form onSubmit={handleSaveClub} className={adminPanelForm}>
                <h2 className={blockTitle}>
                  {editingClubId ? 'Editar Clube' : 'Novo Clube'}
                </h2>
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
                          mission: event.target.value
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
                          is_active: event.target.value === 'ativo'
                        }))
                      }
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
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
                        description: event.target.value
                      }))
                    }
                  />
                </div>

                {clubFormError ? <p className={adminError}>{clubFormError}</p> : null}

                <div className={adminActions}>
                  <button
                    type="submit"
                    className={adminBtnPrimary}
                    disabled={isSavingClub}
                  >
                    {isSavingClub
                      ? 'A guardar...'
                      : editingClubId
                        ? 'Guardar alteracoes'
                        : 'Criar clube'}
                  </button>
                  <button
                    type="button"
                    onClick={resetClubForm}
                    className={adminBtnSecondary}
                  >
                    Limpar
                  </button>
                </div>
              </form>

              <section className={adminPanelCard}>
                <h2 className={blockTitle}>Clubes registados</h2>
                <p className={blockText}>
                  Lista de clubes disponiveis para futura associacao a utilizadores e conteudos.
                </p>

                <div className={adminStatsGrid}>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{clubs.length}</p>
                    <p className={adminStatLabel}>Total</p>
                  </div>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{activeClubs}</p>
                    <p className={adminStatLabel}>Ativos</p>
                  </div>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{clubs.length - activeClubs}</p>
                    <p className={adminStatLabel}>Inativos</p>
                  </div>
                </div>

                <div className={adminUserList}>
                  {isLoadingClubs ? <p className={adminInfo}>A carregar clubes...</p> : null}
                  {!isLoadingClubs && sortedClubs.length === 0 ? (
                    <p className={adminInfo}>Nao existem clubes registados.</p>
                  ) : null}
                  {sortedClubs.map((club) => (
                    <article key={club.id} className={adminUserItem}>
                      <div>
                        <h3 className={adminUserName}>{club.name}</h3>
                        <p className={adminUserEmail}>
                          {club.mission || 'Sem missao definida'}
                        </p>
                        <p className={adminUserMeta}>
                          {club.description || 'Sem descricao'}
                        </p>
                      </div>
                      <div className={adminListTools}>
                        <span
                          className={`${adminUserStatus} ${
                            club.is_active
                              ? adminUserStatusActive
                              : adminUserStatusInactive
                          }`}
                        >
                          {club.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        <button
                          type="button"
                          className={adminBtnEdit}
                          onClick={() => handleEditClub(club)}
                        >
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
            </>
          ) : null}

          {activeSection === 'conteudos' ? (
            <>
              <form onSubmit={handleSaveContent} className={adminPanelForm}>
                <h2 className={blockTitle}>
                  {editingId ? 'Editar Conteudo' : 'Novo Conteudo'}
                </h2>
                <p className={blockText}>
                  Cria ou atualiza conteudo para as paginas do Laboratorio Cultural.
                </p>

                <div className={adminFormGridSpaced}>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="area">
                      Area
                    </label>
                    <select
                      id="area"
                      className={adminInput}
                      value={contentForm.area}
                      onChange={(event) =>
                        setContentForm((prev) => ({
                          ...prev,
                          area: event.target.value as CulturalArea
                        }))
                      }
                    >
                      <option value="tuna">Tuna Academica</option>
                      <option value="clube-leitura">Clube de Leitura</option>
                      <option value="teatro">Teatro</option>
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="date">
                      Data
                    </label>
                    <input
                      id="date"
                      type="date"
                      className={adminInput}
                      value={contentForm.date}
                      onChange={(event) =>
                        setContentForm((prev) => ({ ...prev, date: event.target.value }))
                      }
                    />
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="title">
                      Titulo
                    </label>
                    <input
                      id="title"
                      className={adminInput}
                      value={contentForm.title}
                      onChange={(event) =>
                        setContentForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                    />
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="status">
                      Estado
                    </label>
                    <select
                      id="status"
                      className={adminInput}
                      value={contentForm.status}
                      onChange={(event) =>
                        setContentForm((prev) => ({
                          ...prev,
                          status: event.target.value as 'rascunho' | 'publicado'
                        }))
                      }
                    >
                      <option value="rascunho">Rascunho</option>
                      <option value="publicado">Publicado</option>
                    </select>
                  </div>
                </div>

                <div className={adminFieldSpaced}>
                  <label className={adminLabel} htmlFor="description">
                    Descricao
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={adminTextarea}
                    value={contentForm.description}
                    onChange={(event) =>
                      setContentForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                </div>

                <div className={adminActions}>
                  <button
                    type="submit"
                    className={adminBtnPrimary}
                    disabled={isSavingContent}
                  >
                    {isSavingContent ? 'A guardar...' : editingId ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetContentForm}
                    className={adminBtnSecondary}
                  >
                    Limpar
                  </button>
                </div>
              </form>

              <div className={adminList}>
                {isLoadingItems ? (
                  <p className={adminInfo}>A carregar conteudos...</p>
                ) : null}
                {sortedItems.map((item) => (
                  <article key={item.id} className={adminListItem}>
                    <div className={adminListTop}>
                      <div>
                        <h3 className={adminListTitle}>{item.title}</h3>
                        <p className={adminListMeta}>
                          {getAreaLabel(item.area)} · {item.date} · {item.status}
                        </p>
                      </div>
                    </div>

                    <p className={adminListDesc}>{item.description}</p>

                    <div className={adminListTools}>
                      <button
                        type="button"
                        className={adminBtnEdit}
                        onClick={() => handleEditContent(item)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={adminBtnDanger}
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        {deletingId === item.id ? 'A apagar...' : 'Apagar'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>

      <footer className={infoLegacyFooter}>
        <div className={infoLegacyFooterInner}>
          <span>2026 · Instituto Superior Politecnico Gaya</span>
          <span>InfoCultura</span>
        </div>
      </footer>
    </div>
  );
}

export default AdminCultura;
