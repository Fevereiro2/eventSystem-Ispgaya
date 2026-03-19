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
  createAdminBook,
  createAdminCategory,
  createAdminClub,
  createAdminContent,
  createAdminEvent,
  createAdminNews,
  createAdminSession,
  createAdminUser,
  deactivateAdminUser,
  deleteAdminBook,
  deleteAdminCategory,
  deleteAdminClub,
  deleteAdminContent,
  deleteAdminEvent,
  deleteAdminNews,
  deleteAdminSession,
  fetchAdminBooks,
  fetchAdminCategories,
  fetchAdminClubs,
  fetchAdminContent,
  fetchAdminEvents,
  fetchAdminNews,
  fetchAdminNewsStatuses,
  fetchAdminRegistrations,
  fetchAdminRegistrationStatuses,
  fetchAdminRoles,
  fetchAdminSessions,
  fetchAdminUsers,
  fetchInfoCulturaMe,
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaNewsStatus,
  InfoCulturaRegistration,
  InfoCulturaRegistrationStatus,
  InfoCulturaRole,
  InfoCulturaSession,
  InfoCulturaUser,
  isInfoCulturaAuthError,
  BookPayload,
  CategoryPayload,
  EventPayload,
  loginInfoCultura,
  NewsPayload,
  removeUserFromClub,
  resolveInfoCulturaAssetUrl,
  SessionPayload,
  uploadAdminImage,
  updateAdminBook,
  updateAdminCategory,
  updateAdminRegistrationStatus,
  updateAdminClub,
  updateAdminContent,
  updateAdminEvent,
  updateAdminNews,
  updateAdminSession,
  updateAdminUser,
} from '../data/infoculturaApi';

const TOKEN_KEY = 'ispgaya_cultura_token';
const REGISTRATION_PAGE_SIZE = 10;

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
  image: string;
  is_active: boolean;
  enable_registrations: boolean;
};

type NewsFormState = {
  title: string;
  summary: string;
  image: string;
  content: string;
  news_status: string;
  published_at: string;
  club_id: string;
};

type BookFormState = {
  title: string;
  author: string;
  publisher: string;
  publication_year: string;
  cover_image: string;
  summary: string;
  is_featured: boolean;
  club_id: string;
};

type SessionFormState = {
  name: string;
  title: string;
  description: string;
  session_date: string;
  start_date: string;
  end_date: string;
  club_id: string;
};

type EventFormState = {
  title: string;
  description: string;
  event_date: string;
  start_date: string;
  end_date: string;
  image: string;
  is_external: boolean;
  status: string;
  city: string;
  location: string;
  club_id: string;
  category_ids: string[];
};

type CategoryFormState = {
  name: string;
  description: string;
};

type ActivityTab = 'books' | 'sessions' | 'events';

type AdminSection =
  | 'resumo'
  | 'utilizadores'
  | 'conteudos'
  | 'noticias'
  | 'atividades'
  | 'clubes'
  | 'inscricoes';

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
  image: '',
  is_active: true,
  enable_registrations: false
};

const initialNewsForm: NewsFormState = {
  title: '',
  summary: '',
  image: '',
  content: '',
  news_status: 'draft',
  published_at: '',
  club_id: ''
};

const initialBookForm: BookFormState = {
  title: '',
  author: '',
  publisher: '',
  publication_year: '',
  cover_image: '',
  summary: '',
  is_featured: false,
  club_id: ''
};

const initialSessionForm: SessionFormState = {
  name: '',
  title: '',
  description: '',
  session_date: '',
  start_date: '',
  end_date: '',
  club_id: ''
};

const initialEventForm: EventFormState = {
  title: '',
  description: '',
  event_date: '',
  start_date: '',
  end_date: '',
  image: '',
  is_external: false,
  status: 'published',
  city: '',
  location: '',
  club_id: '',
  category_ids: []
};

const initialCategoryForm: CategoryFormState = {
  name: '',
  description: ''
};

const adminSections: { id: AdminSection; label: string; href: string }[] = [
  { id: 'resumo', label: 'Resumo', href: '/infocultura/resumo' },
  { id: 'utilizadores', label: 'Utilizadores', href: '/infocultura/utilizadores' },
  { id: 'noticias', label: 'Noticias', href: '/infocultura/noticias' },
  { id: 'atividades', label: 'Atividades', href: '/infocultura/atividades' },
  { id: 'conteudos', label: 'Conteudos', href: '/infocultura/conteudos' },
  { id: 'inscricoes', label: 'Inscricoes', href: '/infocultura/inscricoes' },
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

  if (pathname === '/infocultura/noticias') {
    return 'noticias';
  }

  if (pathname === '/infocultura/atividades') {
    return 'atividades';
  }

  if (pathname === '/infocultura/inscricoes') {
    return 'inscricoes';
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

function formatAdminDateTime(value?: string | null): string {
  if (!value) return 'Sem data';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 16);
}

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
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [newsStatuses, setNewsStatuses] = useState<InfoCulturaNewsStatus[]>([]);
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);
  const [categories, setCategories] = useState<InfoCulturaCategory[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [registrations, setRegistrations] = useState<InfoCulturaRegistration[]>([]);
  const [registrationStatuses, setRegistrationStatuses] = useState<
    InfoCulturaRegistrationStatus[]
  >([]);
  const [currentUser, setCurrentUser] = useState<InfoCulturaUser | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingNewsStatuses, setIsLoadingNewsStatuses] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [isLoadingRegistrationStatuses, setIsLoadingRegistrationStatuses] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [newsError, setNewsError] = useState('');
  const [activityError, setActivityError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingClub, setIsSavingClub] = useState(false);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isUploadingClubImage, setIsUploadingClubImage] = useState(false);
  const [isUploadingNewsImage, setIsUploadingNewsImage] = useState(false);
  const [isUploadingBookImage, setIsUploadingBookImage] = useState(false);
  const [isUploadingEventImage, setIsUploadingEventImage] = useState(false);
  const [updatingRegistrationId, setUpdatingRegistrationId] = useState<number | null>(null);
  const [isAssigningClubUser, setIsAssigningClubUser] = useState(false);
  const [isDeactivatingUser, setIsDeactivatingUser] = useState(false);
  const [deletingNewsId, setDeletingNewsId] = useState<number | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deletingClubId, setDeletingClubId] = useState<number | null>(null);
  const [removingClubUserId, setRemovingClubUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contentForm, setContentForm] = useState<FormState>(initialContentForm);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm);
  const [clubForm, setClubForm] = useState<ClubFormState>(initialClubForm);
  const [newsForm, setNewsForm] = useState<NewsFormState>(initialNewsForm);
  const [bookForm, setBookForm] = useState<BookFormState>(initialBookForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [sessionForm, setSessionForm] = useState<SessionFormState>(initialSessionForm);
  const [eventForm, setEventForm] = useState<EventFormState>(initialEventForm);
  const [clubImageFileKey, setClubImageFileKey] = useState(0);
  const [newsImageFileKey, setNewsImageFileKey] = useState(0);
  const [bookImageFileKey, setBookImageFileKey] = useState(0);
  const [eventImageFileKey, setEventImageFileKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingClubId, setEditingClubId] = useState<number | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [selectedClubUserId, setSelectedClubUserId] = useState('');
  const [newsClubFilter, setNewsClubFilter] = useState('all');
  const [activityClubFilter, setActivityClubFilter] = useState('all');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [activityTab, setActivityTab] = useState<ActivityTab>('books');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState('pending');
  const [registrationClubFilter, setRegistrationClubFilter] = useState('all');
  const [registrationSearchInput, setRegistrationSearchInput] = useState('');
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrationTotal, setRegistrationTotal] = useState(0);
  const [registrationTotalPages, setRegistrationTotalPages] = useState(0);
  const [userFormError, setUserFormError] = useState('');
  const [clubFormError, setClubFormError] = useState('');
  const [newsFormError, setNewsFormError] = useState('');
  const [bookFormError, setBookFormError] = useState('');
  const [categoryFormError, setCategoryFormError] = useState('');
  const [sessionFormError, setSessionFormError] = useState('');
  const [eventFormError, setEventFormError] = useState('');

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
  const sortedNews = useMemo(
    () =>
      [...newsItems].sort((a, b) =>
        (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at)
      ),
    [newsItems]
  );
  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.title.localeCompare(b.title)),
    [books]
  );
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [sessions]
  );
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [events]
  );
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
  const pendingRegistrations = useMemo(
    () => registrations.filter((registration) => registration.status === 'pending').length,
    [registrations]
  );
  const approvedRegistrations = useMemo(
    () => registrations.filter((registration) => registration.status === 'approved').length,
    [registrations]
  );
  const rejectedRegistrations = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === 'rejected' || registration.status === 'cancelled'
      ).length,
    [registrations]
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

  function handleAuthError(error: unknown): boolean {
    if (isInfoCulturaAuthError(error)) {
      clearAuth();
      return true;
    }

    return false;
  }

  function clearAuth() {
    setToken('');
    setItems([]);
    setUsers([]);
    setClubs([]);
    setRoles([]);
    setNewsItems([]);
    setNewsStatuses([]);
    setBooks([]);
    setCategories([]);
    setSessions([]);
    setEvents([]);
    setRegistrations([]);
    setRegistrationStatuses([]);
    setRegistrationSearchInput('');
    setRegistrationSearch('');
    setRegistrationPage(1);
    setRegistrationTotal(0);
    setRegistrationTotalPages(0);
    setNewsClubFilter('all');
    setActivityClubFilter('all');
    setActivityCategoryFilter('all');
    setCurrentUser(null);
    setPanelError('');
    setNewsError('');
    setActivityError('');
    setRegistrationError('');
    setUserFormError('');
    setClubFormError('');
    setNewsFormError('');
    setBookFormError('');
    setCategoryFormError('');
    setSessionFormError('');
    setEventFormError('');
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
    setClubImageFileKey((prev) => prev + 1);
    setEditingClubId(null);
    setSelectedClubUserId('');
    setClubFormError('');
  }

  function resetNewsForm() {
    setNewsForm({
      ...initialNewsForm,
      club_id: canManageUsers ? '' : currentUser?.club_id ? String(currentUser.club_id) : ''
    });
    setNewsImageFileKey((prev) => prev + 1);
    setEditingNewsId(null);
    setNewsFormError('');
  }

  function resetBookForm() {
    setBookForm({
      ...initialBookForm,
      club_id: canManageUsers ? '' : currentUser?.club_id ? String(currentUser.club_id) : ''
    });
    setBookImageFileKey((prev) => prev + 1);
    setEditingBookId(null);
    setBookFormError('');
  }

  function resetSessionForm() {
    setSessionForm({
      ...initialSessionForm,
      club_id: canManageUsers ? '' : currentUser?.club_id ? String(currentUser.club_id) : ''
    });
    setEditingSessionId(null);
    setSessionFormError('');
  }

  function resetEventForm() {
    setEventForm({
      ...initialEventForm,
      club_id: canManageUsers ? '' : currentUser?.club_id ? String(currentUser.club_id) : ''
    });
    setEventImageFileKey((prev) => prev + 1);
    setEditingEventId(null);
    setEventFormError('');
  }

  function resetCategoryForm() {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
    setCategoryFormError('');
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
      if (handleAuthError(error)) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar os dados do painel.';
      setPanelError(message);
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
        if (handleAuthError(error)) return;
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
        if (handleAuthError(error)) return;
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
    if (!currentUser) return;

    resetNewsForm();
    resetBookForm();
    resetCategoryForm();
    resetSessionForm();
    resetEventForm();
  }, [currentUser?.club_id, canManageUsers]);

  useEffect(() => {
    if (!token || !currentUser || activeSection !== 'noticias') {
      return;
    }

    let isMounted = true;
    setIsLoadingNews(true);
    setIsLoadingNewsStatuses(true);
    setNewsError('');

    const clubId =
      canManageUsers && newsClubFilter !== 'all' ? Number(newsClubFilter) : undefined;

    void Promise.all([
      fetchAdminNewsStatuses(token),
      fetchAdminNews(token, clubId)
    ])
      .then(([nextStatuses, nextNews]) => {
        if (!isMounted) return;
        setNewsStatuses(nextStatuses);
        setNewsItems(nextNews);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar as noticias.';
        setNewsError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingNews(false);
        setIsLoadingNewsStatuses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSection, token, currentUser, canManageUsers, newsClubFilter]);

  useEffect(() => {
    if (!token || !currentUser || activeSection !== 'atividades') {
      return;
    }

    let isMounted = true;
    setIsLoadingActivities(true);
    setIsLoadingCategories(true);
    setActivityError('');

    const clubId =
      canManageUsers && activityClubFilter !== 'all'
        ? Number(activityClubFilter)
        : undefined;
    const categoryId =
      activityCategoryFilter !== 'all' ? Number(activityCategoryFilter) : undefined;

    void Promise.all([
      fetchAdminCategories(token),
      fetchAdminBooks(token, clubId),
      fetchAdminSessions(token, clubId),
      fetchAdminEvents(token, { clubId, categoryId })
    ])
      .then(([nextCategories, nextBooks, nextSessions, nextEvents]) => {
        if (!isMounted) return;
        setCategories(nextCategories);
        setBooks(nextBooks);
        setSessions(nextSessions);
        setEvents(nextEvents);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar as atividades.';
        setActivityError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingActivities(false);
        setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSection, token, currentUser, canManageUsers, activityClubFilter, activityCategoryFilter]);

  useEffect(() => {
    if (!token || !currentUser || activeSection !== 'inscricoes') {
      return;
    }

    let isMounted = true;
    setIsLoadingRegistrationStatuses(true);
    setIsLoadingRegistrations(true);
    setRegistrationError('');

    const clubId =
      canManageUsers && registrationClubFilter !== 'all'
        ? Number(registrationClubFilter)
        : undefined;
    const status =
      registrationStatusFilter && registrationStatusFilter !== 'all'
        ? registrationStatusFilter
        : undefined;

    void Promise.all([
      fetchAdminRegistrationStatuses(token),
      fetchAdminRegistrations(token, {
        clubId,
        status,
        search: registrationSearch,
        page: registrationPage,
        pageSize: REGISTRATION_PAGE_SIZE
      })
    ])
      .then(([nextStatuses, registrationPageData]) => {
        if (!isMounted) return;
        setRegistrationStatuses(nextStatuses);
        setRegistrations(registrationPageData.items);
        setRegistrationTotal(registrationPageData.total);
        setRegistrationTotalPages(registrationPageData.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar as inscricoes.';
        setRegistrationError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingRegistrationStatuses(false);
        setIsLoadingRegistrations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeSection,
    token,
    currentUser,
    canManageUsers,
    registrationClubFilter,
    registrationStatusFilter,
    registrationSearch,
    registrationPage
  ]);

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
      image: clubForm.image.trim(),
      is_active: clubForm.is_active,
      enable_registrations: clubForm.enable_registrations
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

        if (currentUser?.club_id === savedClub.id) {
          setCurrentUser((prev) => (prev ? { ...prev, club_name: savedClub.name } : prev));
        }
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

  async function handleUploadClubImage(file: File | null) {
    if (!token || !file) return;

    setIsUploadingClubImage(true);
    setClubFormError('');

    try {
      const imagePath = await uploadAdminImage(token, file, 'clubs');
      setClubForm((prev) => ({ ...prev, image: imagePath }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem do clube.';
      setClubFormError(message);
    } finally {
      setIsUploadingClubImage(false);
      setClubImageFileKey((prev) => prev + 1);
    }
  }

  function handleEditClub(club: InfoCulturaClub) {
    setEditingClubId(club.id);
    setSelectedClubUserId('');
    setClubImageFileKey((prev) => prev + 1);
    setClubForm({
      name: club.name,
      description: club.description || '',
      mission: club.mission || '',
      image: club.image || '',
      is_active: club.is_active,
      enable_registrations: Boolean(club.enable_registrations)
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
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
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
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
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

  function handleEditNews(item: InfoCulturaNews) {
    setEditingNewsId(item.id);
    setNewsImageFileKey((prev) => prev + 1);
    setNewsForm({
      title: item.title,
      summary: item.summary,
      image: item.image || '',
      content: item.content,
      news_status: item.news_status_name,
      published_at: toDateTimeLocalValue(item.published_at),
      club_id: item.club_id ? String(item.club_id) : ''
    });
    setNewsFormError('');
  }

  async function handleSaveNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload: NewsPayload = {
      title: newsForm.title.trim(),
      summary: newsForm.summary.trim(),
      image: newsForm.image.trim(),
      content: newsForm.content.trim(),
      news_status: newsForm.news_status,
      published_at: newsForm.published_at || null,
      ...(newsForm.club_id ? { club_id: Number(newsForm.club_id) } : {})
    };

    if (!payload.title || !payload.summary || !payload.content || !payload.news_status) {
      setNewsFormError('Preenche titulo, resumo, conteudo e estado.');
      return;
    }

    if (canManageUsers && !payload.club_id) {
      setNewsFormError('Seleciona o clube da noticia.');
      return;
    }

    setIsSavingNews(true);
    setNewsFormError('');
    setNewsError('');

    try {
      const savedNews =
        editingNewsId === null
          ? await createAdminNews(token, payload)
          : await updateAdminNews(token, editingNewsId, payload);

      setNewsItems((prev) =>
        editingNewsId === null
          ? [savedNews, ...prev]
          : prev.map((item) => (item.id === savedNews.id ? savedNews : item))
      );
      resetNewsForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar a noticia.';
      setNewsFormError(message);
    } finally {
      setIsSavingNews(false);
    }
  }

  async function handleUploadNewsImage(file: File | null) {
    if (!token || !file) return;

    setIsUploadingNewsImage(true);
    setNewsFormError('');

    try {
      const imagePath = await uploadAdminImage(token, file, 'news');
      setNewsForm((prev) => ({ ...prev, image: imagePath }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.';
      setNewsFormError(message);
    } finally {
      setIsUploadingNewsImage(false);
      setNewsImageFileKey((prev) => prev + 1);
    }
  }

  async function handleDeleteNews(id: number) {
    if (!token) return;

    setDeletingNewsId(id);
    setNewsError('');

    try {
      await deleteAdminNews(token, id);
      setNewsItems((prev) => prev.filter((item) => item.id !== id));
      if (editingNewsId === id) {
        resetNewsForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar a noticia.';
      setNewsError(message);
    } finally {
      setDeletingNewsId(null);
    }
  }

  function handleEditBook(item: InfoCulturaBook) {
    setEditingBookId(item.id);
    setBookImageFileKey((prev) => prev + 1);
    setBookForm({
      title: item.title,
      author: item.author,
      publisher: item.publisher,
      publication_year: String(item.publication_year),
      cover_image: item.cover_image || '',
      summary: item.summary,
      is_featured: item.is_featured,
      club_id: String(item.club_id)
    });
    setBookFormError('');
    setActivityTab('books');
  }

  async function handleUploadBookImage(file: File | null) {
    if (!token || !file) return;

    setIsUploadingBookImage(true);
    setBookFormError('');

    try {
      const imagePath = await uploadAdminImage(token, file, 'books');
      setBookForm((prev) => ({ ...prev, cover_image: imagePath }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar a capa.';
      setBookFormError(message);
    } finally {
      setIsUploadingBookImage(false);
      setBookImageFileKey((prev) => prev + 1);
    }
  }

  async function handleSaveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload: BookPayload = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      publisher: bookForm.publisher.trim(),
      publication_year: Number(bookForm.publication_year),
      cover_image: bookForm.cover_image.trim(),
      summary: bookForm.summary.trim(),
      is_featured: bookForm.is_featured,
      ...(bookForm.club_id ? { club_id: Number(bookForm.club_id) } : {})
    };

    if (!payload.title || !payload.author || !payload.summary || !payload.publication_year) {
      setBookFormError('Preenche titulo, autor, ano e resumo.');
      return;
    }

    if (canManageUsers && !payload.club_id) {
      setBookFormError('Seleciona o clube do livro.');
      return;
    }

    setIsSavingBook(true);
    setBookFormError('');
    setActivityError('');

    try {
      const savedBook =
        editingBookId === null
          ? await createAdminBook(token, payload)
          : await updateAdminBook(token, editingBookId, payload);

      setBooks((prev) =>
        editingBookId === null
          ? [savedBook, ...prev]
          : prev.map((item) => (item.id === savedBook.id ? savedBook : item))
      );
      resetBookForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar o livro.';
      setBookFormError(message);
    } finally {
      setIsSavingBook(false);
    }
  }

  async function handleDeleteBook(id: number) {
    if (!token) return;

    setDeletingBookId(id);
    setActivityError('');

    try {
      await deleteAdminBook(token, id);
      setBooks((prev) => prev.filter((item) => item.id !== id));
      if (editingBookId === id) {
        resetBookForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar o livro.';
      setActivityError(message);
    } finally {
      setDeletingBookId(null);
    }
  }

  function handleEditCategory(item: InfoCulturaCategory) {
    setEditingCategoryId(item.id);
    setCategoryForm({
      name: item.name,
      description: item.description
    });
    setCategoryFormError('');
    setActivityTab('events');
  }

  async function handleSaveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload: CategoryPayload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim()
    };

    if (!payload.name || !payload.description) {
      setCategoryFormError('Preenche o nome e a descricao da categoria.');
      return;
    }

    setIsSavingCategory(true);
    setCategoryFormError('');
    setActivityError('');

    try {
      const savedCategory =
        editingCategoryId === null
          ? await createAdminCategory(token, payload)
          : await updateAdminCategory(token, editingCategoryId, payload);

      setCategories((prev) =>
        editingCategoryId === null
          ? [...prev, savedCategory]
          : prev.map((item) => (item.id === savedCategory.id ? savedCategory : item))
      );
      resetCategoryForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar a categoria.';
      setCategoryFormError(message);
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!token) return;

    setDeletingCategoryId(id);
    setActivityError('');

    try {
      await deleteAdminCategory(token, id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
      if (editingCategoryId === id) {
        resetCategoryForm();
      }
      setEvents((prev) =>
        prev.map((item) => ({
          ...item,
          categories: item.categories.filter((category) => category.id !== id),
          category_ids: item.category_ids.filter((categoryId) => categoryId !== id)
        }))
      );
      if (activityCategoryFilter === String(id)) {
        setActivityCategoryFilter('all');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar a categoria.';
      setActivityError(message);
    } finally {
      setDeletingCategoryId(null);
    }
  }

  function handleEditSession(item: InfoCulturaSession) {
    setEditingSessionId(item.id);
    setSessionForm({
      name: item.name,
      title: item.title,
      description: item.description,
      session_date: toDateInputValue(item.session_date),
      start_date: toDateTimeLocalValue(item.start_date),
      end_date: toDateTimeLocalValue(item.end_date),
      club_id: String(item.club_id)
    });
    setSessionFormError('');
    setActivityTab('sessions');
  }

  async function handleSaveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload: SessionPayload = {
      name: sessionForm.name.trim(),
      title: sessionForm.title.trim(),
      description: sessionForm.description.trim(),
      session_date: sessionForm.session_date,
      start_date: sessionForm.start_date,
      end_date: sessionForm.end_date,
      ...(sessionForm.club_id ? { club_id: Number(sessionForm.club_id) } : {})
    };

    if (
      !payload.name ||
      !payload.title ||
      !payload.description ||
      !payload.session_date ||
      !payload.start_date ||
      !payload.end_date
    ) {
      setSessionFormError('Preenche nome, titulo, descricao e datas da sessao.');
      return;
    }

    if (canManageUsers && !payload.club_id) {
      setSessionFormError('Seleciona o clube da sessao.');
      return;
    }

    setIsSavingSession(true);
    setSessionFormError('');
    setActivityError('');

    try {
      const savedSession =
        editingSessionId === null
          ? await createAdminSession(token, payload)
          : await updateAdminSession(token, editingSessionId, payload);

      setSessions((prev) =>
        editingSessionId === null
          ? [...prev, savedSession]
          : prev.map((item) => (item.id === savedSession.id ? savedSession : item))
      );
      resetSessionForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar a sessao.';
      setSessionFormError(message);
    } finally {
      setIsSavingSession(false);
    }
  }

  async function handleDeleteSession(id: number) {
    if (!token) return;

    setDeletingSessionId(id);
    setActivityError('');

    try {
      await deleteAdminSession(token, id);
      setSessions((prev) => prev.filter((item) => item.id !== id));
      if (editingSessionId === id) {
        resetSessionForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar a sessao.';
      setActivityError(message);
    } finally {
      setDeletingSessionId(null);
    }
  }

  function handleEditEvent(item: InfoCulturaEvent) {
    setEditingEventId(item.id);
    setEventImageFileKey((prev) => prev + 1);
    setEventForm({
      title: item.title,
      description: item.description,
      event_date: toDateInputValue(item.event_date),
      start_date: toDateTimeLocalValue(item.start_date),
      end_date: toDateTimeLocalValue(item.end_date),
      image: item.image || '',
      is_external: item.is_external,
      status: item.status,
      city: item.city || '',
      location: item.location || '',
      club_id: item.club_id ? String(item.club_id) : '',
      category_ids: item.category_ids.map(String)
    });
    setEventFormError('');
    setActivityTab('events');
  }

  async function handleSaveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload: EventPayload = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      event_date: eventForm.event_date,
      start_date: eventForm.start_date,
      end_date: eventForm.end_date,
      image: eventForm.image.trim(),
      is_external: eventForm.is_external,
      status: eventForm.status.trim(),
      city: eventForm.city.trim(),
      location: eventForm.location.trim(),
      ...(eventForm.club_id ? { club_id: Number(eventForm.club_id) } : {}),
      category_ids: eventForm.category_ids.map(Number)
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.event_date ||
      !payload.start_date ||
      !payload.end_date ||
      !payload.status
    ) {
      setEventFormError('Preenche titulo, descricao, estado e datas do evento.');
      return;
    }

    if (canManageUsers && !payload.club_id) {
      setEventFormError('Seleciona o clube do evento.');
      return;
    }

    setIsSavingEvent(true);
    setEventFormError('');
    setActivityError('');

    try {
      const savedEvent =
        editingEventId === null
          ? await createAdminEvent(token, payload)
          : await updateAdminEvent(token, editingEventId, payload);

      setEvents((prev) =>
        editingEventId === null
          ? [...prev, savedEvent]
          : prev.map((item) => (item.id === savedEvent.id ? savedEvent : item))
      );
      resetEventForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar o evento.';
      setEventFormError(message);
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleUploadEventImage(file: File | null) {
    if (!token || !file) return;

    setIsUploadingEventImage(true);
    setEventFormError('');

    try {
      const imagePath = await uploadAdminImage(token, file, 'events');
      setEventForm((prev) => ({ ...prev, image: imagePath }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.';
      setEventFormError(message);
    } finally {
      setIsUploadingEventImage(false);
      setEventImageFileKey((prev) => prev + 1);
    }
  }

  async function handleDeleteEvent(id: number) {
    if (!token) return;

    setDeletingEventId(id);
    setActivityError('');

    try {
      await deleteAdminEvent(token, id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
      if (editingEventId === id) {
        resetEventForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar o evento.';
      setActivityError(message);
    } finally {
      setDeletingEventId(null);
    }
  }

  async function handleUpdateRegistrationStatus(
    registrationId: number,
    status: string
  ) {
    if (!token) return;

    setUpdatingRegistrationId(registrationId);
    setRegistrationError('');

    try {
      const updatedRegistration = await updateAdminRegistrationStatus(
        token,
        registrationId,
        status
      );
      setRegistrations((prev) =>
        prev
          .map((registration) =>
            registration.id === updatedRegistration.id ? updatedRegistration : registration
          )
          .filter((registration) =>
            registrationStatusFilter === 'all'
              ? true
              : registration.status === registrationStatusFilter
          )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel atualizar a inscricao.';
      setRegistrationError(message);
    } finally {
      setUpdatingRegistrationId(null);
    }
  }

  function handleRegistrationSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistrationPage(1);
    setRegistrationSearch(registrationSearchInput.trim());
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
                : activeSection === 'noticias'
                  ? 'Criacao, publicacao e arquivo de noticias por clube.'
                : activeSection === 'atividades'
                  ? 'Gestao de livros, sessoes e eventos ligados aos clubes.'
                : activeSection === 'clubes'
                  ? 'Criacao e manutencao dos clubes internos.'
                : activeSection === 'inscricoes'
                  ? 'Consulta e validacao das inscricoes submetidas pelos clubes.'
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
                          enable_registrations: event.target.value === 'sim'
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
                  <p className={adminInfo}>
                    Guarda o clube primeiro para poderes associar utilizadores.
                  </p>
                )}
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
                        {club.image ? (
                          <img
                            src={resolveInfoCulturaAssetUrl(club.image)}
                            alt={club.name}
                            className="mb-4 h-32 w-full rounded-xl object-cover"
                          />
                        ) : null}
                        <h3 className={adminUserName}>{club.name}</h3>
                        <p className={adminUserEmail}>
                          {club.mission || 'Sem missao definida'}
                        </p>
                        <p className={adminUserMeta}>
                          {club.description || 'Sem descricao'}
                        </p>
                        <p className={adminUserMeta}>
                          Inscricoes: {club.enable_registrations ? 'Permitidas' : 'Desativadas'}
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
                            {removingClubUserId === user.id
                              ? 'A remover...'
                              : 'Remover do clube'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          {activeSection === 'noticias' ? (
            <>
              <form onSubmit={handleSaveNews} className={adminPanelForm}>
                <h2 className={blockTitle}>
                  {editingNewsId ? 'Editar Noticia' : 'Nova Noticia'}
                </h2>
                <p className={blockText}>
                  Publica novidades de cada clube e controla o respetivo estado.
                </p>

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
                        setNewsForm((prev) => ({ ...prev, news_status: event.target.value }))
                      }
                    >
                      {isLoadingNewsStatuses ? (
                        <option value="">A carregar estados...</option>
                      ) : null}
                      {newsStatuses.map((status) => (
                        <option key={status.id} value={status.name}>
                          {status.name}
                        </option>
                      ))}
                    </select>
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
                  <button
                    type="button"
                    onClick={resetNewsForm}
                    className={adminBtnSecondary}
                  >
                    Limpar
                  </button>
                </div>
              </form>

              <section className={adminPanelCard}>
                <div className={adminHeaderRow}>
                  <div>
                    <h2 className={blockTitle}>Noticias registadas</h2>
                    <p className={blockText}>
                      Lista das noticias criadas no InfoCultura.
                    </p>
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
                </div>

                {newsError ? <p className={adminError}>{newsError}</p> : null}

                <div className={adminList}>
                  {isLoadingNews ? <p className={adminInfo}>A carregar noticias...</p> : null}
                  {!isLoadingNews && sortedNews.length === 0 ? (
                    <p className={adminInfo}>Nao existem noticias para o filtro atual.</p>
                  ) : null}
                  {sortedNews.map((item) => (
                    <article key={item.id} className={adminListItem}>
                      <div className={adminListTop}>
                        <div>
                          <h3 className={adminListTitle}>{item.title}</h3>
                          <p className={adminListMeta}>
                            {item.club_name} · {item.news_status_name} ·{' '}
                            {formatAdminDateTime(item.published_at || item.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className={adminListDesc}>{item.summary}</p>
                      <div className={adminListTools}>
                        <button
                          type="button"
                          className={adminBtnEdit}
                          onClick={() => handleEditNews(item)}
                        >
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
              </section>
            </>
          ) : null}

          {activeSection === 'atividades' ? (
            <>
              <section className={adminPanelCard}>
                <div className={adminHeaderRow}>
                  <div>
                    <h2 className={blockTitle}>Atividades dos clubes</h2>
                    <p className={blockText}>
                      Gere livros, sessoes e eventos ligados aos clubes.
                    </p>
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
                  </div>
                </div>

                <div className={adminSectionNav}>
                  <button
                    type="button"
                    className={activityTab === 'books' ? adminSectionLinkActive : adminSectionLink}
                    onClick={() => setActivityTab('books')}
                  >
                    Livros
                  </button>
                  <button
                    type="button"
                    className={activityTab === 'sessions' ? adminSectionLinkActive : adminSectionLink}
                    onClick={() => setActivityTab('sessions')}
                  >
                    Sessoes
                  </button>
                  <button
                    type="button"
                    className={activityTab === 'events' ? adminSectionLinkActive : adminSectionLink}
                    onClick={() => setActivityTab('events')}
                  >
                    Eventos
                  </button>
                </div>

                {activityError ? <p className={adminError}>{activityError}</p> : null}
              </section>

              {activityTab === 'books' ? (
                <>
                  <form onSubmit={handleSaveBook} className={adminPanelForm}>
                    <h2 className={blockTitle}>
                      {editingBookId ? 'Editar Livro' : 'Novo Livro'}
                    </h2>

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
                            onChange={(event) =>
                              setBookForm((prev) => ({ ...prev, club_id: event.target.value }))
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
                              publication_year: event.target.value
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
                              is_featured: event.target.value === 'sim'
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
                      <button type="submit" className={adminBtnPrimary} disabled={isSavingBook}>
                        {isSavingBook ? 'A guardar...' : editingBookId ? 'Atualizar' : 'Criar'}
                      </button>
                      <button type="button" onClick={resetBookForm} className={adminBtnSecondary}>
                        Limpar
                      </button>
                    </div>
                  </form>

                  <div className={adminList}>
                    {isLoadingActivities ? <p className={adminInfo}>A carregar livros...</p> : null}
                    {!isLoadingActivities && sortedBooks.length === 0 ? (
                      <p className={adminInfo}>Nao existem livros para o filtro atual.</p>
                    ) : null}
                    {sortedBooks.map((item) => (
                      <article key={item.id} className={adminListItem}>
                        <div className={adminListTop}>
                          <div>
                            <h3 className={adminListTitle}>{item.title}</h3>
                            <p className={adminListMeta}>
                              {item.club_name} · {item.author} · {item.publication_year}
                            </p>
                          </div>
                        </div>
                        <p className={adminListDesc}>{item.summary}</p>
                        <div className={adminListTools}>
                          <button
                            type="button"
                            className={adminBtnEdit}
                            onClick={() => handleEditBook(item)}
                          >
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
                </>
              ) : null}

              {activityTab === 'sessions' ? (
                <>
                  <form onSubmit={handleSaveSession} className={adminPanelForm}>
                    <h2 className={blockTitle}>
                      {editingSessionId ? 'Editar Sessao' : 'Nova Sessao'}
                    </h2>

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
                              session_date: event.target.value
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
                              start_date: event.target.value
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
                            description: event.target.value
                          }))
                        }
                      />
                    </div>

                    {sessionFormError ? <p className={adminError}>{sessionFormError}</p> : null}

                    <div className={adminActions}>
                      <button
                        type="submit"
                        className={adminBtnPrimary}
                        disabled={isSavingSession}
                      >
                        {isSavingSession ? 'A guardar...' : editingSessionId ? 'Atualizar' : 'Criar'}
                      </button>
                      <button
                        type="button"
                        onClick={resetSessionForm}
                        className={adminBtnSecondary}
                      >
                        Limpar
                      </button>
                    </div>
                  </form>

                  <div className={adminList}>
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
                        <div className={adminListTools}>
                          <button
                            type="button"
                            className={adminBtnEdit}
                            onClick={() => handleEditSession(item)}
                          >
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
                </>
              ) : null}

              {activityTab === 'events' ? (
                <>
                  <form onSubmit={handleSaveEvent} className={adminPanelForm}>
                    <h2 className={blockTitle}>
                      {editingEventId ? 'Editar Evento' : 'Novo Evento'}
                    </h2>

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
                        <input
                          id="event-status"
                          className={adminInput}
                          value={eventForm.status}
                          onChange={(event) =>
                            setEventForm((prev) => ({ ...prev, status: event.target.value }))
                          }
                        />
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
                              )
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
                              is_external: event.target.value === 'sim'
                            }))
                          }
                        >
                          <option value="nao">Nao</option>
                          <option value="sim">Sim</option>
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
                            description: event.target.value
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

                  <div className={adminList}>
                    {isLoadingActivities ? <p className={adminInfo}>A carregar eventos...</p> : null}
                    {!isLoadingActivities && sortedEvents.length === 0 ? (
                      <p className={adminInfo}>Nao existem eventos para o filtro atual.</p>
                    ) : null}
                    {sortedEvents.map((item) => (
                      <article key={item.id} className={adminListItem}>
                        <div className={adminListTop}>
                          <div>
                            <h3 className={adminListTitle}>{item.title}</h3>
                            <p className={adminListMeta}>
                              {item.club_name || 'Sem clube'} · {item.status} ·{' '}
                              {formatAdminDateTime(item.start_date)}
                            </p>
                          </div>
                        </div>
                        <p className={adminListDesc}>{item.description}</p>
                        {item.categories.length > 0 ? (
                          <p className={adminListMeta}>
                            Categorias: {item.categories.map((category) => category.name).join(', ')}
                          </p>
                        ) : null}
                        <div className={adminListTools}>
                          <button
                            type="button"
                            className={adminBtnEdit}
                            onClick={() => handleEditEvent(item)}
                          >
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
                </>
              ) : null}

              {activityTab === 'events' ? (
                <section className={adminPanelCard}>
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
                              description: event.target.value
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
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className={adminBtnSecondary}
                      >
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
                          <button
                            type="button"
                            className={adminBtnEdit}
                            onClick={() => handleEditCategory(category)}
                          >
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
            </>
          ) : null}

          {activeSection === 'inscricoes' ? (
            <>
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
                      {isLoadingRegistrationStatuses ? (
                        <option value="">A carregar estados...</option>
                      ) : null}
                      {registrationStatuses.map((status) => (
                        <option key={status.id} value={status.name}>
                          {status.name}
                        </option>
                      ))}
                    </select>
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

                {!isLoadingRegistrations ? (
                  <div className={adminHeaderRow}>
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
                        disabled={
                          registrationTotalPages === 0 || registrationPage >= registrationTotalPages
                        }
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
                  {isLoadingRegistrations ? (
                    <p className={adminInfo}>A carregar inscricoes...</p>
                  ) : null}
                  {!isLoadingRegistrations && registrations.length === 0 ? (
                    <p className={adminInfo}>Nao existem inscricoes para os filtros atuais.</p>
                  ) : null}
                  {registrations.map((registration) => (
                    <article key={registration.id} className={adminUserItem}>
                      <div>
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
                          onClick={() =>
                            handleUpdateRegistrationStatus(registration.id, 'approved')
                          }
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
                          onClick={() =>
                            handleUpdateRegistrationStatus(registration.id, 'rejected')
                          }
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
                          onClick={() =>
                            handleUpdateRegistrationStatus(registration.id, 'pending')
                          }
                        >
                          {updatingRegistrationId === registration.id ? 'A atualizar...' : 'Pendente'}
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
