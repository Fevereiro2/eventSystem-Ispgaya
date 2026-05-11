import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Bell,
  Building2,
  BookOpen,
  CalendarClock,
  FilePlus2,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Newspaper,
  Sparkles,
  Users,
} from 'lucide-react';
import { NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import infoCulturaBg from '../assets/19825874_uqliU.jpeg';
import ispgayaLogo from '../assets/ispgaya-logo.svg';
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
  adminPortalContent,
  adminPortalShell,
  adminPortalSidebar,
  adminPortalSidebarBrand,
  adminPortalSidebarHead,
  adminPortalSidebarLink,
  adminPortalSidebarLinkActive,
  adminPortalSidebarNav,
  adminPortalSidebarSection,
  adminPortalSidebarSub,
  adminPortalSidebarTitle,
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
  bulkDeleteAdminBooks,
  bulkDeleteAdminEvents,
  bulkDeleteAdminNews,
  assignUserToClub,
  bulkUpdateAdminEventStatus,
  bulkUpdateAdminNewsStatus,
  bulkUpdateAdminRegistrationStatus,
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
  exportAdminBooksCsv,
  exportAdminEventsCsv,
  exportAdminNewsCsv,
  exportAdminRegistrationsCsv,
  exportAdminSessionsCsv,
  fetchAdminBooks,
  fetchAdminCategories,
  fetchAdminClubs,
  fetchAdminContent,
  fetchAdminDashboard,
  fetchAdminNotifications,
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
  InfoCulturaAdminNotification,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaDashboardStats,
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
  logoutInfoCultura,
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
} from '../api/infoculturaApi';
import AdminPageHero from './adminCultura/AdminPageHero';
import {
  ACTIVITY_PAGE_SIZE,
  activityTabBySection,
  adminSectionGroups,
  adminSections,
  EVENT_WORKFLOW_ORDER,
  initialBookForm,
  initialCategoryForm,
  initialClubForm,
  initialContentForm,
  initialEventForm,
  initialNewsForm,
  initialSessionForm,
  initialUserForm,
  NEWS_PAGE_SIZE,
  NEWS_WORKFLOW_ORDER,
  NOTIFICATION_READ_KEY,
  REGISTRATION_PAGE_SIZE,
  TOKEN_KEY
} from './adminCultura/constants';
import {
  ActivityTab,
  AdminContextLink,
  AdminSection,
  BookFormState,
  CategoryFormState,
  ClubFormState,
  EventFormState,
  FormState,
  NewsFormState,
  SessionFormState,
  UserFormState
} from './adminCultura/types';
import {
  downloadBlobFile,
  escapeCsvValue,
  formatAdminDateTime,
  getActivityRoute,
  getActivitySubpage,
  getAdminSection,
  getAllowedActivityTabs,
  getContentRoute,
  getContentSubpage,
  getDefaultActivityOrdering,
  getDefaultActivityTab,
  getNewsRoute,
  getNewsSubpage,
  getStoredReadNotificationIds,
  getUserPage,
  getWorkflowStatusLabel,
  getWorkflowStatusOptions,
  isActivitySection,
  isWithinDateRange,
  normalizeWorkflowStatus,
  sortClubs,
  sortClubsByOrder,
  sortUsers,
  sortUsersByOrder,
  toDateInputValue,
  toDateTimeLocalValue
} from './adminCultura/utils';

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
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
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
  const [dashboardStats, setDashboardStats] = useState<InfoCulturaDashboardStats | null>(null);
  const [notifications, setNotifications] = useState<InfoCulturaAdminNotification[]>([]);
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
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [isLoadingRegistrationStatuses, setIsLoadingRegistrationStatuses] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [dashboardError, setDashboardError] = useState('');
  const [notificationError, setNotificationError] = useState('');
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
  const [userDateFrom, setUserDateFrom] = useState('');
  const [userDateTo, setUserDateTo] = useState('');
  const [userOrder, setUserOrder] = useState('active_name');
  const [clubDateFrom, setClubDateFrom] = useState('');
  const [clubDateTo, setClubDateTo] = useState('');
  const [clubOrder, setClubOrder] = useState('active_name');
  const [newsClubFilter, setNewsClubFilter] = useState('all');
  const [newsStatusFilter, setNewsStatusFilter] = useState('all');
  const [newsSearchInput, setNewsSearchInput] = useState('');
  const [newsSearch, setNewsSearch] = useState('');
  const [newsOrder, setNewsOrder] = useState('newest');
  const [newsDateFrom, setNewsDateFrom] = useState('');
  const [newsDateTo, setNewsDateTo] = useState('');
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotal, setNewsTotal] = useState(0);
  const [newsTotalPages, setNewsTotalPages] = useState(0);
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([]);
  const [bulkNewsStatus, setBulkNewsStatus] = useState('review');
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [activityClubFilter, setActivityClubFilter] = useState('all');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');
  const [activitySearchInput, setActivitySearchInput] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityOrder, setActivityOrder] = useState(getDefaultActivityOrdering('books'));
  const [activityDateFrom, setActivityDateFrom] = useState('');
  const [activityDateTo, setActivityDateTo] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityTotalPages, setActivityTotalPages] = useState(0);
  const [activityTab, setActivityTab] = useState<ActivityTab>('books');
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [bulkEventStatus, setBulkEventStatus] = useState('review');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState('pending');
  const [registrationClubFilter, setRegistrationClubFilter] = useState('all');
  const [registrationSearchInput, setRegistrationSearchInput] = useState('');
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationOrder, setRegistrationOrder] = useState('newest');
  const [registrationDateFrom, setRegistrationDateFrom] = useState('');
  const [registrationDateTo, setRegistrationDateTo] = useState('');
  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrationTotal, setRegistrationTotal] = useState(0);
  const [registrationTotalPages, setRegistrationTotalPages] = useState(0);
  const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<number[]>([]);
  const [bulkRegistrationStatus, setBulkRegistrationStatus] = useState('approved');
  const [isExportingNews, setIsExportingNews] = useState(false);
  const [isExportingActivities, setIsExportingActivities] = useState(false);
  const [isExportingUsers, setIsExportingUsers] = useState(false);
  const [isExportingClubs, setIsExportingClubs] = useState(false);
  const [isExportingRegistrations, setIsExportingRegistrations] = useState(false);
  const [isApplyingBulkNews, setIsApplyingBulkNews] = useState(false);
  const [isApplyingBulkEvents, setIsApplyingBulkEvents] = useState(false);
  const [isApplyingBulkRegistrations, setIsApplyingBulkRegistrations] = useState(false);
  const [isDeletingBulkNews, setIsDeletingBulkNews] = useState(false);
  const [isDeletingBulkBooks, setIsDeletingBulkBooks] = useState(false);
  const [isDeletingBulkEvents, setIsDeletingBulkEvents] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() =>
    getStoredReadNotificationIds()
  );
  const [userFormError, setUserFormError] = useState('');
  const [clubFormError, setClubFormError] = useState('');
  const [newsFormError, setNewsFormError] = useState('');
  const [bookFormError, setBookFormError] = useState('');
  const [categoryFormError, setCategoryFormError] = useState('');
  const [sessionFormError, setSessionFormError] = useState('');
  const [eventFormError, setEventFormError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const activeSection = getAdminSection(location.pathname);
  const activeNewsSubpage = useMemo(() => getNewsSubpage(location.pathname), [location.pathname]);
  const activeActivitySubpage = useMemo(
    () => getActivitySubpage(location.pathname),
    [location.pathname]
  );
  const activeContentSubpage = useMemo(
    () => getContentSubpage(location.pathname),
    [location.pathname]
  );
  const userPage = useMemo(() => getUserPage(location.pathname), [location.pathname]);
  const canManageUsers = currentUser?.role === 'superadmin';
  const allowedActivityTabs = useMemo(
    () => getAllowedActivityTabs(currentUser),
    [currentUser]
  );
  const defaultActivityTab = useMemo(
    () => getDefaultActivityTab(currentUser),
    [currentUser]
  );
  const defaultActivityHref = useMemo(
    () => getActivityRoute(defaultActivityTab, 'list'),
    [defaultActivityTab]
  );
  const visibleSections = useMemo(
    () =>
      adminSections.filter((section) => {
        if (section.id === 'clubes') {
          return canManageUsers;
        }

        if (section.id === 'livros' || section.id === 'sessoes' || section.id === 'eventos') {
          return allowedActivityTabs.includes(activityTabBySection[section.id]);
        }

        return true;
      }),
    [allowedActivityTabs, canManageUsers]
  );
  const visibleSectionGroups = useMemo(
    () =>
      adminSectionGroups
        .map((group) => ({
          ...group,
          sections: visibleSections.filter((section) => group.ids.includes(section.id)),
        }))
        .filter((group) => group.sections.length > 0),
    [visibleSections]
  );
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [items]
  );
  const sortedUsers = useMemo(() => sortUsersByOrder(users, userOrder), [users, userOrder]);
  const sortedClubs = useMemo(() => sortClubsByOrder(clubs, clubOrder), [clubs, clubOrder]);
  const filteredUsers = useMemo(
    () =>
      sortedUsers.filter((user) =>
        isWithinDateRange(user.created_at, userDateFrom, userDateTo)
      ),
    [sortedUsers, userDateFrom, userDateTo]
  );
  const filteredClubs = useMemo(
    () =>
      sortedClubs.filter((club) =>
        isWithinDateRange(club.created_at, clubDateFrom, clubDateTo)
      ),
    [sortedClubs, clubDateFrom, clubDateTo]
  );
  const sortedNews = useMemo(() => [...newsItems], [newsItems]);
  const sortedBooks = useMemo(() => [...books], [books]);
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );
  const sortedSessions = useMemo(() => [...sessions], [sessions]);
  const sortedEvents = useMemo(() => [...events], [events]);
  const availableNewsStatuses = useMemo(() => {
    const allowedNames = getWorkflowStatusOptions(
      canManageUsers ? NEWS_WORKFLOW_ORDER : NEWS_WORKFLOW_ORDER.slice(0, 2),
      newsForm.news_status
    );
    const statusMap = new Map(
      newsStatuses.map((status) => [normalizeWorkflowStatus(status.name), status])
    );

    return allowedNames
      .map((name) => statusMap.get(name))
      .filter((status): status is InfoCulturaNewsStatus => Boolean(status));
  }, [canManageUsers, newsForm.news_status, newsStatuses]);
  const availableEventStatuses = useMemo(
    () =>
      getWorkflowStatusOptions(
        canManageUsers ? EVENT_WORKFLOW_ORDER : EVENT_WORKFLOW_ORDER.slice(0, 2),
        eventForm.status
      ),
    [canManageUsers, eventForm.status]
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
  const dashboardCards = useMemo(
    () =>
      dashboardStats
        ? [
            { label: 'Utilizadores ativos', value: dashboardStats.active_users },
            { label: 'Noticias publicadas', value: dashboardStats.news_published },
            { label: 'Noticias em revisao', value: dashboardStats.news_review },
            { label: 'Eventos em revisao', value: dashboardStats.events_review },
            { label: 'Livros em destaque', value: dashboardStats.featured_books },
            { label: 'Sessoes proximas', value: dashboardStats.upcoming_sessions },
            { label: 'Inscricoes pendentes', value: dashboardStats.registrations_pending },
            {
              label: 'Clubes com inscricoes abertas',
              value: dashboardStats.clubs_with_registrations_open
            }
          ]
        : [],
    [dashboardStats]
  );
  const dashboardHighlights = useMemo(
    () => [
      {
        label: 'Utilizadores ativos',
        value: dashboardStats?.active_users ?? activeUsers,
        tone: 'slate',
        icon: Users,
      },
      {
        label: 'Noticias publicadas',
        value: dashboardStats?.news_published ?? publishedItems,
        tone: 'amber',
        icon: Newspaper,
      },
      {
        label: 'Sessoes proximas',
        value: dashboardStats?.upcoming_sessions ?? sessions.length,
        tone: 'blue',
        icon: CalendarClock,
      },
      {
        label: 'Inscricoes pendentes',
        value: dashboardStats?.registrations_pending ?? pendingRegistrations,
        tone: 'rose',
        icon: Bell,
      },
    ],
    [activeUsers, dashboardStats, pendingRegistrations, publishedItems, sessions.length]
  );
  const activitySectionLabel =
    activityTab === 'books' ? 'Livros' : activityTab === 'sessions' ? 'Sessoes' : 'Eventos';
  const activitySectionDescription =
    activityTab === 'books'
      ? 'Gestao editorial dos livros associados aos clubes.'
      : activityTab === 'sessions'
        ? 'Planeamento e acompanhamento das sessoes de cada clube.'
        : 'Programacao e workflow editorial dos eventos culturais.';
  const newsPageHref = activeNewsSubpage ? getNewsRoute(activeNewsSubpage) : null;
  const activityPageHref = activeActivitySubpage
    ? getActivityRoute(activityTab, activeActivitySubpage)
    : null;
  const contentPageHref = activeContentSubpage ? getContentRoute(activeContentSubpage) : null;
  const showNewsForm = activeNewsSubpage === 'form';
  const showNewsList = activeNewsSubpage === 'list';
  const showActivityFiltersAndList = activeActivitySubpage === 'list';
  const showActivityForm = activeActivitySubpage === 'form';
  const showEventCategories = activityTab === 'events' && activeActivitySubpage === 'categories';
  const showContentForm = activeContentSubpage === 'form';
  const showContentList = activeContentSubpage === 'list';
  const newsPageLinks = useMemo<AdminContextLink[]>(
    () => [
      { label: editingNewsId ? 'Editar Noticia' : 'Nova Noticia', href: getNewsRoute('form') },
      { label: 'Noticias Registadas', href: getNewsRoute('list') },
    ],
    [editingNewsId]
  );
  const activityPageLinks = useMemo<AdminContextLink[]>(
    () =>
      activityTab === 'books'
        ? [
            { label: editingBookId ? 'Editar Livro' : 'Novo Livro', href: getActivityRoute(activityTab, 'form') },
            { label: 'Livros Registados', href: getActivityRoute(activityTab, 'list') },
          ]
        : activityTab === 'sessions'
          ? [
              { label: editingSessionId ? 'Editar Sessao' : 'Nova Sessao', href: getActivityRoute(activityTab, 'form') },
              { label: 'Sessoes Registadas', href: getActivityRoute(activityTab, 'list') },
            ]
          : [
              { label: editingEventId ? 'Editar Evento' : 'Novo Evento', href: getActivityRoute(activityTab, 'form') },
              { label: 'Eventos Registados', href: getActivityRoute(activityTab, 'list') },
              { label: 'Categorias de Eventos', href: getActivityRoute(activityTab, 'categories') },
            ],
    [activityTab, editingBookId, editingEventId, editingSessionId]
  );
  const contentPageLinks = useMemo<AdminContextLink[]>(
    () => [
      { label: editingId ? 'Editar Conteudo' : 'Novo Conteudo', href: getContentRoute('form') },
      { label: 'Conteudos Registados', href: getContentRoute('list') },
    ],
    [editingId]
  );
  const sidebarContextNavBySection = useMemo<
    Partial<Record<AdminSection, { links: AdminContextLink[]; activeHref?: string | null }>>
  >(
    () => ({
      noticias: {
        links: newsPageLinks,
        activeHref: newsPageHref,
      },
      livros: {
        links: activityTab === 'books' ? activityPageLinks : [],
        activeHref: activityTab === 'books' ? activityPageHref : null,
      },
      sessoes: {
        links: activityTab === 'sessions' ? activityPageLinks : [],
        activeHref: activityTab === 'sessions' ? activityPageHref : null,
      },
      eventos: {
        links: activityTab === 'events' ? activityPageLinks : [],
        activeHref: activityTab === 'events' ? activityPageHref : null,
      },
      conteudos: {
        links: contentPageLinks,
        activeHref: contentPageHref,
      },
    }),
    [
      activityPageHref,
      activityPageLinks,
      activityTab,
      contentPageHref,
      contentPageLinks,
      newsPageHref,
      newsPageLinks,
    ]
  );
  const readNotificationIdSet = useMemo(
    () => new Set(readNotificationIds),
    [readNotificationIds]
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !readNotificationIdSet.has(notification.id)),
    [notifications, readNotificationIdSet]
  );
  const dashboardAlerts = useMemo(
    () =>
      notifications.length > 0
        ? notifications.slice(0, 4).map((notification) => ({
            id: notification.id,
            title: notification.title,
            detail: notification.message,
            href: notification.href,
            level: notification.level,
            is_read: readNotificationIdSet.has(notification.id),
            created_at: notification.created_at || null,
          }))
        : [
            {
              id: 'editorial-review',
              title: 'Revisao editorial',
              detail: `${dashboardStats?.news_review ?? 0} noticias e ${dashboardStats?.events_review ?? 0} eventos aguardam revisao.`,
              href: '/infocultura/noticias',
              level: 'warning',
              is_read: false,
              created_at: null,
            },
            {
              id: 'registrations-pending',
              title: 'Inscricoes por validar',
              detail: `${dashboardStats?.registrations_pending ?? pendingRegistrations} inscricoes pendentes de decisao.`,
              href: '/infocultura/inscricoes',
              level: 'warning',
              is_read: false,
              created_at: null,
            },
            {
              id: 'clubs-open',
              title: 'Clubes com atividade aberta',
              detail: `${dashboardStats?.clubs_with_registrations_open ?? 0} clubes com inscricoes atualmente ativas.`,
              href: '/infocultura/clubes',
              level: 'info',
              is_read: false,
              created_at: null,
            },
          ],
    [dashboardStats, notifications, pendingRegistrations, readNotificationIdSet]
  );
  const dashboardAgenda = useMemo(
    () =>
      [
        dashboardStats?.latest_news
          ? {
              label: 'Ultima noticia',
              title: dashboardStats.latest_news.title,
              meta: `${dashboardStats.latest_news.club_name || 'Sem clube'} · ${
                dashboardStats.latest_news.status
                  ? getWorkflowStatusLabel(dashboardStats.latest_news.status)
                  : 'Sem estado'
              }`,
              date: formatAdminDateTime(dashboardStats.latest_news.date || ''),
              href: '/infocultura/noticias',
            }
          : null,
        dashboardStats?.next_session
          ? {
              label: 'Proxima sessao',
              title: dashboardStats.next_session.title,
              meta: dashboardStats.next_session.club_name || 'Sem clube',
              date: formatAdminDateTime(dashboardStats.next_session.date || ''),
              href: '/infocultura/sessoes',
            }
          : null,
        dashboardStats?.next_event
          ? {
              label: 'Proximo evento',
              title: dashboardStats.next_event.title,
              meta: `${dashboardStats.next_event.club_name || 'Sem clube'}${
                dashboardStats.next_event.status
                  ? ` · ${getWorkflowStatusLabel(dashboardStats.next_event.status)}`
                  : ''
              }`,
              date: formatAdminDateTime(dashboardStats.next_event.date || ''),
              href: '/infocultura/eventos',
            }
          : null,
      ].filter(Boolean) as Array<{
        label: string;
        title: string;
        meta: string;
        date: string;
        href: string;
      }>,
    [dashboardStats]
  );
  const dashboardQuickActions = useMemo(
    () => {
      const actions = [
        {
          label: 'Nova noticia',
          hint: 'Abrir publicacao editorial',
          href: '/infocultura/noticias',
          icon: Newspaper,
        },
        {
          label: 'Nova atividade',
          hint: 'Gerir livros, sessoes e eventos',
          href: defaultActivityHref,
          icon: CalendarClock,
        },
        {
          label: 'Conteudos culturais',
          hint: 'Atualizar Tuna, Leitura e Teatro',
          href: '/infocultura/conteudos',
          icon: FilePlus2,
        },
        {
          label: 'Inscricoes',
          hint: 'Validar pedidos pendentes',
          href: '/infocultura/inscricoes',
          icon: Bell,
        },
      ];

      if (canManageUsers) {
        actions.unshift({
          label: 'Utilizadores',
          hint: 'Criar ou editar acessos',
          href: '/infocultura/utilizadores',
          icon: Users,
        });
      }

      return actions;
    },
    [canManageUsers, defaultActivityHref]
  );
  const latestNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        isRead: readNotificationIdSet.has(notification.id),
      })),
    [notifications, readNotificationIdSet]
  );
  const notificationOverviewStats = useMemo(
    () => [
      { label: 'Total', value: notifications.length },
      { label: 'Por ler', value: unreadNotifications.length },
      {
        label: 'Editoriais',
        value: notifications.filter((notification) => notification.kind === 'editorial').length,
      },
      {
        label: 'Agenda',
        value: notifications.filter((notification) => notification.kind === 'schedule').length,
      },
    ],
    [notifications, unreadNotifications.length]
  );
  const userOverviewStats = useMemo(
    () => [
      { label: 'Total', value: filteredUsers.length },
      {
        label: 'Ativos',
        value: filteredUsers.filter((user) => user.is_active).length,
      },
      {
        label: 'Inativos',
        value: filteredUsers.filter((user) => !user.is_active).length,
      },
      {
        label: 'Club admins',
        value: filteredUsers.filter((user) => user.role === 'club_admin').length,
      },
    ],
    [filteredUsers]
  );
  const clubsOverviewStats = useMemo(
    () => [
      { label: 'Total', value: filteredClubs.length },
      {
        label: 'Ativos',
        value: filteredClubs.filter((club) => club.is_active).length,
      },
      {
        label: 'Inscricoes abertas',
        value: filteredClubs.filter((club) => club.enable_registrations).length,
      },
      {
        label: 'Com imagem',
        value: filteredClubs.filter((club) => Boolean(club.image)).length,
      },
    ],
    [filteredClubs]
  );
  const newsOverviewStats = useMemo(
    () => [
      { label: 'Total filtrado', value: newsTotal },
      {
        label: 'Em revisao',
        value:
          dashboardStats?.news_review ??
          sortedNews.filter(
            (item) => normalizeWorkflowStatus(item.news_status_name) === 'review'
          ).length,
      },
      { label: 'Selecionadas', value: selectedNewsIds.length },
      {
        label: 'Publicadas',
        value:
          dashboardStats?.news_published ??
          sortedNews.filter(
            (item) => normalizeWorkflowStatus(item.news_status_name) === 'published'
          ).length,
      },
    ],
    [dashboardStats, newsTotal, selectedNewsIds.length, sortedNews]
  );
  const activityOverviewStats = useMemo(() => {
    if (activityTab === 'books') {
      return [
        { label: 'Total filtrado', value: activityTotal },
        {
          label: 'Em destaque',
          value: sortedBooks.filter((item) => item.is_featured).length,
        },
        { label: 'Selecionados', value: selectedBookIds.length },
        {
          label: 'Clubes na pagina',
          value: new Set(sortedBooks.map((item) => item.club_id)).size,
        },
      ];
    }

    if (activityTab === 'sessions') {
      return [
        { label: 'Total filtrado', value: activityTotal },
        {
          label: 'Proximas',
          value: sortedSessions.filter(
            (item) => new Date(item.start_date).getTime() >= Date.now()
          ).length,
        },
        {
          label: 'Inscricoes abertas',
          value: sortedSessions.filter((item) => item.enable_registrations).length,
        },
        {
          label: 'Clubes na pagina',
          value: new Set(sortedSessions.map((item) => item.club_id)).size,
        },
      ];
    }

    return [
      { label: 'Total filtrado', value: activityTotal },
      {
        label: 'Em revisao',
        value: sortedEvents.filter((item) => normalizeWorkflowStatus(item.status) === 'review')
          .length,
      },
      { label: 'Selecionados', value: selectedEventIds.length },
      { label: 'Categorias', value: sortedCategories.length },
    ];
  }, [
    activityTab,
    activityTotal,
    selectedBookIds.length,
    selectedEventIds.length,
    sortedBooks,
    sortedCategories.length,
    sortedEvents,
    sortedSessions,
  ]);
  const registrationOverviewStats = useMemo(
    () => [
      { label: 'Total filtrado', value: registrationTotal },
      { label: 'Pendentes', value: pendingRegistrations },
      { label: 'Aprovadas', value: approvedRegistrations },
      { label: 'Rejeitadas', value: rejectedRegistrations },
    ],
    [approvedRegistrations, pendingRegistrations, registrationTotal, rejectedRegistrations]
  );
  const contentOverviewStats = useMemo(
    () => [
      { label: 'Total', value: sortedItems.length },
      { label: 'Publicados', value: publishedItems },
      { label: 'Rascunhos', value: Math.max(0, sortedItems.length - publishedItems) },
      {
        label: 'Areas',
        value: new Set(sortedItems.map((item) => item.area)).size,
      },
    ],
    [publishedItems, sortedItems]
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
    setDashboardStats(null);
    setNotifications([]);
    setBooks([]);
    setCategories([]);
    setSessions([]);
    setEvents([]);
    setRegistrations([]);
    setRegistrationStatuses([]);
    setUserDateFrom('');
    setUserDateTo('');
    setUserOrder('active_name');
    setClubDateFrom('');
    setClubDateTo('');
    setClubOrder('active_name');
    setRegistrationSearchInput('');
    setRegistrationSearch('');
    setRegistrationOrder('newest');
    setRegistrationDateFrom('');
    setRegistrationDateTo('');
    setRegistrationPage(1);
    setRegistrationTotal(0);
    setRegistrationTotalPages(0);
    setSelectedRegistrationIds([]);
    setNewsClubFilter('all');
    setNewsStatusFilter('all');
    setNewsSearchInput('');
    setNewsSearch('');
    setNewsOrder('newest');
    setNewsDateFrom('');
    setNewsDateTo('');
    setNewsPage(1);
    setNewsTotal(0);
    setNewsTotalPages(0);
    setSelectedNewsIds([]);
    setActivityClubFilter('all');
    setActivityCategoryFilter('all');
    setActivityStatusFilter('all');
    setActivitySearchInput('');
    setActivitySearch('');
    setActivityOrder(getDefaultActivityOrdering('books'));
    setActivityDateFrom('');
    setActivityDateTo('');
    setActivityPage(1);
    setActivityTotal(0);
    setActivityTotalPages(0);
    setSelectedBookIds([]);
    setSelectedEventIds([]);
    setCurrentUser(null);
    setPanelError('');
    setDashboardError('');
    setNotificationError('');
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

  function handleApplyNewsSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsPage(1);
    setNewsSearch(newsSearchInput.trim());
  }

  function handleApplyActivitySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivityPage(1);
    setActivitySearch(activitySearchInput.trim());
  }

  async function handleExportNewsCsv() {
    if (!token) return;

    setIsExportingNews(true);
    setNewsError('');

    try {
      const blob = await exportAdminNewsCsv(token, {
        clubId: canManageUsers && newsClubFilter !== 'all' ? Number(newsClubFilter) : undefined,
        status: newsStatusFilter,
        search: newsSearch,
        ordering: newsOrder,
        dateFrom: newsDateFrom,
        dateTo: newsDateTo
      });
      downloadBlobFile(blob, 'infocultura-news.csv');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel exportar as noticias.';
      setNewsError(message);
    } finally {
      setIsExportingNews(false);
    }
  }

  async function handleExportActivitiesCsv() {
    if (!token) return;

    setIsExportingActivities(true);
    setActivityError('');

    const clubId =
      canManageUsers && activityClubFilter !== 'all' ? Number(activityClubFilter) : undefined;

    try {
      const blob =
        activityTab === 'books'
          ? await exportAdminBooksCsv(token, {
              clubId,
              search: activitySearch,
              ordering: activityOrder,
              dateFrom: activityDateFrom,
              dateTo: activityDateTo
            })
          : activityTab === 'sessions'
            ? await exportAdminSessionsCsv(token, {
                clubId,
                search: activitySearch,
                ordering: activityOrder,
                dateFrom: activityDateFrom,
                dateTo: activityDateTo
              })
            : await exportAdminEventsCsv(token, {
                clubId,
                categoryId:
                  activityCategoryFilter !== 'all'
                    ? Number(activityCategoryFilter)
                    : undefined,
                status: activityStatusFilter,
                search: activitySearch,
                ordering: activityOrder,
                dateFrom: activityDateFrom,
                dateTo: activityDateTo
              });

      const filename =
        activityTab === 'books'
          ? 'infocultura-books.csv'
          : activityTab === 'sessions'
            ? 'infocultura-sessions.csv'
            : 'infocultura-events.csv';
      downloadBlobFile(blob, filename);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel exportar a lista atual.';
      setActivityError(message);
    } finally {
      setIsExportingActivities(false);
    }
  }

  async function handleExportUsersCsv() {
    setIsExportingUsers(true);
    setPanelError('');

    try {
      const rows = [
        ['id', 'name', 'email', 'role', 'club', 'is_active', 'created_at'],
        ...filteredUsers.map((user) => [
          user.id,
          user.name,
          user.email,
          user.role,
          user.club_name || '',
          user.is_active ? 'sim' : 'nao',
          user.created_at || ''
        ])
      ];
      const csvText = rows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
      downloadBlobFile(new Blob([csvText], { type: 'text/csv;charset=utf-8' }), 'infocultura-users.csv');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel exportar os utilizadores.';
      setPanelError(message);
    } finally {
      setIsExportingUsers(false);
    }
  }

  async function handleExportClubsCsv() {
    setIsExportingClubs(true);
    setPanelError('');

    try {
      const rows = [
        ['id', 'name', 'description', 'mission', 'is_active', 'enable_registrations', 'created_at'],
        ...filteredClubs.map((club) => [
          club.id,
          club.name,
          club.description,
          club.mission,
          club.is_active ? 'sim' : 'nao',
          club.enable_registrations ? 'sim' : 'nao',
          club.created_at || ''
        ])
      ];
      const csvText = rows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
      downloadBlobFile(new Blob([csvText], { type: 'text/csv;charset=utf-8' }), 'infocultura-clubs.csv');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel exportar os clubes.';
      setPanelError(message);
    } finally {
      setIsExportingClubs(false);
    }
  }

  async function handleExportRegistrationsCsv() {
    if (!token) return;

    setIsExportingRegistrations(true);
    setRegistrationError('');

    try {
      const blob = await exportAdminRegistrationsCsv(token, {
        clubId:
          canManageUsers && registrationClubFilter !== 'all'
            ? Number(registrationClubFilter)
            : undefined,
        status: registrationStatusFilter,
        search: registrationSearch,
        ordering: registrationOrder,
        dateFrom: registrationDateFrom,
        dateTo: registrationDateTo
      });
      downloadBlobFile(blob, 'infocultura-registrations.csv');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel exportar as inscricoes.';
      setRegistrationError(message);
    } finally {
      setIsExportingRegistrations(false);
    }
  }

  function toggleSelectedId(setter: Dispatch<SetStateAction<number[]>>, id: number) {
    setter((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  }

  async function handleApplyBulkNewsStatus() {
    if (!token || selectedNewsIds.length === 0) return;

    setIsApplyingBulkNews(true);
    setNewsError('');

    try {
      const updatedItems = await bulkUpdateAdminNewsStatus(token, selectedNewsIds, bulkNewsStatus);
      const updatedMap = new Map(updatedItems.map((item) => [item.id, item]));
      setNewsItems((prev) =>
        prev
          .map((item) => updatedMap.get(item.id) || item)
          .filter((item) =>
            newsStatusFilter === 'all'
              ? true
              : normalizeWorkflowStatus(item.news_status_name) === newsStatusFilter
          )
      );
      setSelectedNewsIds([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel aplicar a acao em lote.';
      setNewsError(message);
    } finally {
      setIsApplyingBulkNews(false);
    }
  }

  async function handleBulkDeleteNews() {
    if (!token || selectedNewsIds.length === 0) return;
    if (!window.confirm('Apagar as noticias selecionadas?')) return;

    setIsDeletingBulkNews(true);
    setNewsError('');

    try {
      const deleted = await bulkDeleteAdminNews(token, selectedNewsIds);
      const selectedSet = new Set(selectedNewsIds);
      setNewsItems((prev) => prev.filter((item) => !selectedSet.has(item.id)));
      setSelectedNewsIds([]);
      setNewsTotal((prev) => Math.max(0, prev - deleted));
      if (editingNewsId !== null && selectedSet.has(editingNewsId)) {
        resetNewsForm();
      }
      if (deleted > 0 && selectedSet.size >= newsItems.length && newsPage > 1) {
        setNewsPage((prev) => Math.max(1, prev - 1));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar as noticias selecionadas.';
      setNewsError(message);
    } finally {
      setIsDeletingBulkNews(false);
    }
  }

  async function handleApplyBulkEventStatus() {
    if (!token || selectedEventIds.length === 0) return;

    setIsApplyingBulkEvents(true);
    setActivityError('');

    try {
      const updatedItems = await bulkUpdateAdminEventStatus(token, selectedEventIds, bulkEventStatus);
      const updatedMap = new Map(updatedItems.map((item) => [item.id, item]));
      setEvents((prev) =>
        prev
          .map((item) => updatedMap.get(item.id) || item)
          .filter((item) =>
            activityStatusFilter === 'all'
              ? true
              : normalizeWorkflowStatus(item.status) === activityStatusFilter
          )
      );
      setSelectedEventIds([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel aplicar a acao em lote.';
      setActivityError(message);
    } finally {
      setIsApplyingBulkEvents(false);
    }
  }

  async function handleBulkDeleteBooks() {
    if (!token || selectedBookIds.length === 0) return;
    if (!window.confirm('Apagar os livros selecionados?')) return;

    setIsDeletingBulkBooks(true);
    setActivityError('');

    try {
      const deleted = await bulkDeleteAdminBooks(token, selectedBookIds);
      const selectedSet = new Set(selectedBookIds);
      setBooks((prev) => prev.filter((item) => !selectedSet.has(item.id)));
      setSelectedBookIds([]);
      setActivityTotal((prev) => Math.max(0, prev - deleted));
      if (editingBookId !== null && selectedSet.has(editingBookId)) {
        resetBookForm();
      }
      if (deleted > 0 && selectedSet.size >= books.length && activityPage > 1) {
        setActivityPage((prev) => Math.max(1, prev - 1));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar os livros selecionados.';
      setActivityError(message);
    } finally {
      setIsDeletingBulkBooks(false);
    }
  }

  async function handleBulkDeleteEvents() {
    if (!token || selectedEventIds.length === 0) return;
    if (!window.confirm('Apagar os eventos selecionados?')) return;

    setIsDeletingBulkEvents(true);
    setActivityError('');

    try {
      const deleted = await bulkDeleteAdminEvents(token, selectedEventIds);
      const selectedSet = new Set(selectedEventIds);
      setEvents((prev) => prev.filter((item) => !selectedSet.has(item.id)));
      setSelectedEventIds([]);
      setActivityTotal((prev) => Math.max(0, prev - deleted));
      if (editingEventId !== null && selectedSet.has(editingEventId)) {
        resetEventForm();
      }
      if (deleted > 0 && selectedSet.size >= events.length && activityPage > 1) {
        setActivityPage((prev) => Math.max(1, prev - 1));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar os eventos selecionados.';
      setActivityError(message);
    } finally {
      setIsDeletingBulkEvents(false);
    }
  }

  async function handleApplyBulkRegistrationStatus() {
    if (!token || selectedRegistrationIds.length === 0) return;

    setIsApplyingBulkRegistrations(true);
    setRegistrationError('');

    try {
      const updatedItems = await bulkUpdateAdminRegistrationStatus(
        token,
        selectedRegistrationIds,
        bulkRegistrationStatus
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.id, item]));
      setRegistrations((prev) =>
        prev
          .map((item) => updatedMap.get(item.id) || item)
          .filter((item) =>
            registrationStatusFilter === 'all'
              ? true
              : item.status === registrationStatusFilter
          )
      );
      setSelectedRegistrationIds([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel aplicar a acao em lote.';
      setRegistrationError(message);
    } finally {
      setIsApplyingBulkRegistrations(false);
    }
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
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

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
    if (!currentUser) return;

    if (activeSection === 'atividades') {
      navigate(defaultActivityHref, { replace: true });
      return;
    }

    if (
      (activeSection === 'livros' || activeSection === 'sessoes' || activeSection === 'eventos') &&
      !allowedActivityTabs.includes(activityTabBySection[activeSection])
    ) {
      navigate(defaultActivityHref, { replace: true });
    }
  }, [activeSection, allowedActivityTabs, currentUser, defaultActivityHref, navigate]);

  useEffect(() => {
    if (activeSection === 'livros' || activeSection === 'sessoes' || activeSection === 'eventos') {
      setActivityTab(activityTabBySection[activeSection]);
      return;
    }

    if (activeSection === 'atividades') {
      setActivityTab(defaultActivityTab);
    }
  }, [activeSection, defaultActivityTab]);

  useEffect(() => {
    if (activeSection === 'noticias' && !activeNewsSubpage) {
      navigate(getNewsRoute('list'), { replace: true });
      return;
    }

    if (
      (activeSection === 'livros' || activeSection === 'sessoes' || activeSection === 'eventos') &&
      !activeActivitySubpage
    ) {
      navigate(getActivityRoute(activityTabBySection[activeSection], 'list'), { replace: true });
      return;
    }

    if (activeSection === 'conteudos' && !activeContentSubpage) {
      navigate(getContentRoute('list'), { replace: true });
    }
  }, [activeActivitySubpage, activeContentSubpage, activeNewsSubpage, activeSection, navigate]);

  useEffect(() => {
    setNewsPage(1);
  }, [newsClubFilter, newsStatusFilter, newsOrder, newsDateFrom, newsDateTo]);

  useEffect(() => {
    setActivityPage(1);
  }, [activityTab, activityClubFilter, activityCategoryFilter, activityStatusFilter, activityOrder, activityDateFrom, activityDateTo]);

  useEffect(() => {
    setRegistrationPage(1);
  }, [registrationClubFilter, registrationStatusFilter, registrationOrder, registrationDateFrom, registrationDateTo]);

  useEffect(() => {
    setSelectedNewsIds([]);
  }, [newsPage, newsClubFilter, newsStatusFilter, newsSearch, newsDateFrom, newsDateTo]);

  useEffect(() => {
    setSelectedEventIds([]);
    setSelectedBookIds([]);
  }, [activityPage, activityTab, activityClubFilter, activityCategoryFilter, activityStatusFilter, activitySearch, activityOrder, activityDateFrom, activityDateTo]);

  useEffect(() => {
    setSelectedRegistrationIds([]);
  }, [registrationPage, registrationClubFilter, registrationStatusFilter, registrationSearch, registrationOrder, registrationDateFrom, registrationDateTo]);

  useEffect(() => {
    setActivityOrder(getDefaultActivityOrdering(activityTab));
  }, [activityTab]);

  useEffect(() => {
    if (!token || !currentUser || activeSection !== 'resumo') {
      return;
    }

    let isMounted = true;
    setIsLoadingDashboard(true);
    setDashboardError('');

    void fetchAdminDashboard(token)
      .then((nextDashboardStats) => {
        if (!isMounted) return;
        setDashboardStats(nextDashboardStats);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o resumo.';
        setDashboardError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingDashboard(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSection, token, currentUser]);

  useEffect(() => {
    if (!token || !currentUser || (activeSection !== 'resumo' && activeSection !== 'notificacoes')) {
      return;
    }

    let isMounted = true;
    setIsLoadingNotifications(true);
    setNotificationError('');

    void fetchAdminNotifications(token)
      .then((nextNotifications) => {
        if (!isMounted) return;
        setNotifications(nextNotifications);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar as notificacoes.';
        setNotificationError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingNotifications(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSection, token, currentUser]);

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
    const status =
      newsStatusFilter && newsStatusFilter !== 'all' ? newsStatusFilter : undefined;

    void Promise.all([
      fetchAdminNewsStatuses(token),
      fetchAdminNews(token, {
        clubId,
        status,
        search: newsSearch,
        ordering: newsOrder,
        dateFrom: newsDateFrom,
        dateTo: newsDateTo,
        page: newsPage,
        pageSize: NEWS_PAGE_SIZE
      })
    ])
      .then(([nextStatuses, newsPageData]) => {
        if (!isMounted) return;
        setNewsStatuses(nextStatuses);
        setNewsItems(newsPageData.items);
        setNewsTotal(newsPageData.total);
        setNewsTotalPages(newsPageData.total_pages);
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
  }, [
    activeSection,
    token,
    currentUser,
    canManageUsers,
    newsClubFilter,
    newsStatusFilter,
    newsSearch,
    newsOrder,
    newsDateFrom,
    newsDateTo,
    newsPage
  ]);

  useEffect(() => {
    if (!token || !currentUser || !isActivitySection(activeSection)) {
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
    const status =
      activityStatusFilter && activityStatusFilter !== 'all'
        ? activityStatusFilter
        : undefined;

    const activityRequest =
      activityTab === 'books'
        ? fetchAdminBooks(token, {
            clubId,
            search: activitySearch,
            ordering: activityOrder,
            dateFrom: activityDateFrom,
            dateTo: activityDateTo,
            page: activityPage,
            pageSize: ACTIVITY_PAGE_SIZE
          })
        : activityTab === 'sessions'
          ? fetchAdminSessions(token, {
              clubId,
              search: activitySearch,
              ordering: activityOrder,
              dateFrom: activityDateFrom,
              dateTo: activityDateTo,
              page: activityPage,
              pageSize: ACTIVITY_PAGE_SIZE
            })
          : fetchAdminEvents(token, {
              clubId,
              categoryId,
              status,
              search: activitySearch,
              ordering: activityOrder,
              dateFrom: activityDateFrom,
              dateTo: activityDateTo,
              page: activityPage,
              pageSize: ACTIVITY_PAGE_SIZE
            });

    void Promise.all([fetchAdminCategories(token), activityRequest])
      .then(([nextCategories, activityPageData]) => {
        if (!isMounted) return;
        setCategories(nextCategories);
        setActivityTotal(activityPageData.total);
        setActivityTotalPages(activityPageData.total_pages);
        if (activityTab === 'books') {
          setBooks(activityPageData.items as InfoCulturaBook[]);
        } else if (activityTab === 'sessions') {
          setSessions(activityPageData.items as InfoCulturaSession[]);
        } else {
          setEvents(activityPageData.items as InfoCulturaEvent[]);
        }
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
  }, [
    activeSection,
    token,
    currentUser,
    canManageUsers,
    activityClubFilter,
    activityCategoryFilter,
    activityStatusFilter,
    activitySearch,
    activityOrder,
    activityDateFrom,
    activityDateTo,
    activityPage,
    activityTab
  ]);

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
        ordering: registrationOrder,
        dateFrom: registrationDateFrom,
        dateTo: registrationDateTo,
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
    registrationOrder,
    registrationDateFrom,
    registrationDateTo,
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
    void logoutInfoCultura();
    clearAuth();
    setAuthUser('');
    setAuthPass('');
    resetContentForm();
    resetUserForm();
    resetClubForm();
  }

  function markNotificationAsRead(notificationId: string) {
    setReadNotificationIds((prev) =>
      prev.includes(notificationId) ? prev : [...prev, notificationId]
    );
  }

  function markAllNotificationsAsRead() {
    setReadNotificationIds((prev) => {
      const merged = new Set(prev);
      notifications.forEach((notification) => merged.add(notification.id));
      return Array.from(merged);
    });
  }

  function handleOpenNotification(notification: InfoCulturaAdminNotification) {
    markNotificationAsRead(notification.id);
    navigate(notification.href);
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
        navigate(getContentRoute('list'));
        return;
      }

      const created = await createAdminContent(token, payload);
      setItems((prev) => [created, ...prev]);
      resetContentForm();
      navigate(getContentRoute('list'));
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
    navigate(getContentRoute('form'));
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
      news_status: normalizeWorkflowStatus(item.news_status_name),
      published_at: toDateTimeLocalValue(item.published_at),
      club_id: item.club_id ? String(item.club_id) : ''
    });
    setNewsFormError('');
    navigate(getNewsRoute('form'));
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
      navigate(getNewsRoute('list'));
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
      setSelectedNewsIds((prev) => prev.filter((itemId) => itemId !== id));
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
    navigate(getActivityRoute('books', 'form'));
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
      navigate(getActivityRoute('books', 'list'));
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
      setSelectedBookIds((prev) => prev.filter((itemId) => itemId !== id));
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
    navigate(getActivityRoute('events', 'categories'));
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
      navigate(getActivityRoute('events', 'categories'));
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
      enable_registrations: Boolean(item.enable_registrations),
      registration_capacity:
        item.registration_capacity === null || item.registration_capacity === undefined
          ? ''
          : String(item.registration_capacity),
      club_id: String(item.club_id)
    });
    setSessionFormError('');
    setActivityTab('sessions');
    navigate(getActivityRoute('sessions', 'form'));
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
      enable_registrations: sessionForm.enable_registrations,
      registration_capacity: sessionForm.registration_capacity
        ? Number(sessionForm.registration_capacity)
        : null,
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
      navigate(getActivityRoute('sessions', 'list'));
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
      enable_registrations: Boolean(item.enable_registrations),
      registration_capacity:
        item.registration_capacity === null || item.registration_capacity === undefined
          ? ''
          : String(item.registration_capacity),
      status: normalizeWorkflowStatus(item.status),
      city: item.city || '',
      location: item.location || '',
      club_id: item.club_id ? String(item.club_id) : '',
      category_ids: item.category_ids.map(String)
    });
    setEventFormError('');
    setActivityTab('events');
    navigate(getActivityRoute('events', 'form'));
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
      enable_registrations: eventForm.enable_registrations,
      registration_capacity: eventForm.registration_capacity
        ? Number(eventForm.registration_capacity)
        : null,
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
      navigate(getActivityRoute('events', 'list'));
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
      setSelectedEventIds((prev) => prev.filter((itemId) => itemId !== id));
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

  if (!isDesktopViewport) {
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
            <div className="w-full max-w-xl rounded-xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur">
              <h2 className={infoLegacyLoginTitle}>Acesso apenas em computador</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                O portal InfoCultura esta disponivel apenas em ecras de desktop. Para continuar,
                acede a partir de um computador.
              </p>
              <p className={infoLegacyMeta}>
                Dispositivos moveis e tablets nao suportam esta area administrativa.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
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
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleLogout} className={adminBtnSecondary}>
              Terminar sessao
            </button>
            <p className={infoLegacyLang}>PT | EN</p>
          </div>
        </div>
      </header>

      <main className={infoLegacyMain}>
        <div className={container}>
          {panelError ? <p className={adminError}>{panelError}</p> : null}

          <div className={adminPortalShell}>
            <aside className={adminPortalSidebar} aria-label="Menu lateral do painel">
              <div className={adminPortalSidebarHead}>
                <p className={adminPortalSidebarBrand}>InfoCultura</p>
                <p className={adminPortalSidebarSub}>Gestao cultural interna</p>
              </div>

              {visibleSectionGroups.map((group) => (
                <div key={group.title} className={adminPortalSidebarSection}>
                  <p className={adminPortalSidebarTitle}>{group.title}</p>
                  <nav className={adminPortalSidebarNav} aria-label={group.title}>
                    {group.sections.map((section) => (
                      <div key={section.id}>
                        <NavLink
                          to={section.href}
                          className={({ isActive }) =>
                            isActive ? adminPortalSidebarLinkActive : adminPortalSidebarLink
                          }
                        >
                          {section.id === 'notificacoes' && unreadNotifications.length > 0
                            ? `${section.label} (${unreadNotifications.length})`
                            : section.label}
                        </NavLink>
                        {section.id === activeSection &&
                        sidebarContextNavBySection[section.id]?.links.length ? (
                          <div className="border-l-[4px] border-[#f4a24d] bg-white/75 px-4 py-2">
                            <div className="flex flex-col gap-1">
                              {sidebarContextNavBySection[section.id]?.links.map((link) => (
                                <NavLink
                                  key={link.href}
                                  to={link.href}
                                  className={({ isActive }) =>
                                    `block w-full rounded-md px-3 py-2 text-sm transition-colors ${
                                      isActive ||
                                      sidebarContextNavBySection[section.id]?.activeHref === link.href
                                        ? 'bg-orange-50 font-semibold text-[#dd8609]'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                  }
                                >
                                  {link.label}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </nav>
                </div>
              ))}
            </aside>

            <div className={adminPortalContent}>
          {activeSection === 'resumo' ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dd8609] text-white">
                        <LayoutDashboard className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-3xl font-semibold text-slate-900">Dashboard</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          Vista inicial com alertas, agenda e atalhos operacionais.
                        </p>
                      </div>
                    </div>
                    {dashboardStats ? (
                      <p className="mt-4 text-sm font-medium text-slate-500">
                        Ambito atual: {dashboardStats.scope_label}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Sessao atual
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {currentUser?.name || (isLoadingUsers ? 'A carregar...' : 'Sem dados')}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {currentUser ? `${currentUser.email} · ${currentUser.role}` : 'InfoCultura'}
                    </p>
                    {currentUser ? (
                      <span
                        className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          currentUser.is_active ? adminUserStatusActive : adminUserStatusInactive
                        }`}
                      >
                        {currentUser.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    ) : null}
                  </div>
                </div>

                {isLoadingDashboard ? <p className="mt-4 text-sm text-slate-500">A carregar metricas...</p> : null}
                {dashboardError ? <p className="mt-4 text-sm text-red-600">{dashboardError}</p> : null}
              </section>

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                {dashboardHighlights.map((item) => {
                  const Icon = item.icon;
                  const toneClass =
                    item.tone === 'amber'
                      ? 'bg-amber-100 text-amber-700'
                      : item.tone === 'blue'
                        ? 'bg-sky-100 text-sky-700'
                        : item.tone === 'rose'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700';

                  return (
                    <article
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
                        </div>
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </section>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">Alertas</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {unreadNotifications.length > 0
                          ? `${unreadNotifications.length} notificacoes por ler.`
                          : 'Itens que merecem atencao imediata.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-100 px-3 text-slate-700"
                      onClick={() => navigate('/infocultura/notificacoes')}
                    >
                      <Bell className="h-5 w-5" />
                    </button>
                  </div>

                  {isLoadingNotifications ? (
                    <p className="mt-4 text-sm text-slate-500">A carregar notificacoes...</p>
                  ) : null}
                  {notificationError ? (
                    <p className="mt-4 text-sm text-red-600">{notificationError}</p>
                  ) : null}

                  <div className="mt-6 space-y-3">
                    {dashboardAlerts.map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors hover:border-[#dd8609] hover:bg-white ${
                          alert.is_read
                            ? 'border-slate-200 bg-slate-50'
                            : alert.level === 'warning'
                              ? 'border-amber-200 bg-amber-50'
                              : alert.level === 'success'
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-sky-200 bg-sky-50'
                        }`}
                        onClick={() =>
                          handleOpenNotification({
                            id: alert.id,
                            kind: 'dashboard',
                            level: alert.level,
                            title: alert.title,
                            message: alert.detail,
                            href: alert.href,
                            created_at: alert.created_at,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                          {!alert.is_read ? (
                            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#dd8609]" />
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{alert.detail}</p>
                        {alert.created_at ? (
                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                            {formatAdminDateTime(alert.created_at)}
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">Acoes Rapidas</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Atalhos para as operacoes mais frequentes.
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Sparkles className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {dashboardQuickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => navigate(action.href)}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-colors hover:border-[#dd8609] hover:bg-white"
                        >
                          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#dd8609] shadow-sm">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {action.label}
                            </span>
                            <span className="mt-1 block text-sm text-slate-600">{action.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">Fluxo Editorial</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Estado atual das publicacoes e atividades.
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <BookOpen className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className={adminStatCard}>
                      <p className={adminStatValue}>{dashboardStats?.news_draft ?? 0}</p>
                      <p className={adminStatLabel}>Noticias em rascunho</p>
                    </div>
                    <div className={adminStatCard}>
                      <p className={adminStatValue}>{dashboardStats?.news_review ?? 0}</p>
                      <p className={adminStatLabel}>Noticias em revisao</p>
                    </div>
                    <div className={adminStatCard}>
                      <p className={adminStatValue}>{dashboardStats?.events_draft ?? 0}</p>
                      <p className={adminStatLabel}>Eventos em rascunho</p>
                    </div>
                    <div className={adminStatCard}>
                      <p className={adminStatValue}>{dashboardStats?.events_review ?? 0}</p>
                      <p className={adminStatLabel}>Eventos em revisao</p>
                    </div>
                  </div>

                  {dashboardCards.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {dashboardCards.slice(0, 6).map((card) => (
                        <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            {card.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">Agenda e Destaques</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Proximos pontos relevantes do panorama cultural.
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <CalendarClock className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {dashboardAgenda.length > 0 ? (
                      dashboardAgenda.map((entry) => (
                        <button
                          key={`${entry.label}-${entry.title}`}
                          type="button"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-colors hover:border-[#dd8609] hover:bg-white"
                          onClick={() => navigate(entry.href)}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#dd8609]">
                            {entry.label}
                          </p>
                          <p className="mt-2 text-base font-semibold text-slate-900">{entry.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{entry.meta}</p>
                          <p className="mt-3 text-sm font-medium text-slate-500">{entry.date}</p>
                        </button>
                      ))
                    ) : (
                      <p className={adminInfo}>Ainda nao existem registos suficientes para mostrar.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {activeSection === 'notificacoes' ? (
            <div className="space-y-6">
              <AdminPageHero
                icon={Bell}
                title="Centro de Notificacoes"
                description="Alertas editoriais, operacionais e de agenda gerados a partir da atividade do sistema."
                tone="amber"
                stats={notificationOverviewStats}
                actions={
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={notifications.length === 0}
                    onClick={markAllNotificationsAsRead}
                  >
                    Marcar todas como lidas
                  </button>
                }
              />

              <section className={adminPanelCard}>
                {isLoadingNotifications ? (
                  <p className={adminInfo}>A carregar notificacoes...</p>
                ) : null}
                {notificationError ? <p className={adminError}>{notificationError}</p> : null}

                {!isLoadingNotifications && latestNotifications.length === 0 ? (
                  <p className={adminInfo}>Nao existem notificacoes para mostrar.</p>
                ) : null}

                <div className="space-y-4">
                  {latestNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      className={`rounded-2xl border p-5 shadow-sm ${
                        notification.isRead
                          ? 'border-slate-200 bg-white'
                          : notification.level === 'warning'
                            ? 'border-amber-200 bg-amber-50'
                            : notification.level === 'success'
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-sky-200 bg-sky-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead ? (
                              <span className="inline-flex items-center rounded-full bg-[#dd8609] px-2.5 py-1 text-xs font-semibold text-white">
                                Nova
                              </span>
                            ) : null}
                            <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                              {notification.kind}
                            </span>
                          </div>
                          <p className="mt-3 leading-7 text-slate-700">{notification.message}</p>
                          <p className="mt-3 text-sm font-medium text-slate-500">
                            {formatAdminDateTime(notification.created_at || '')}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            className={adminBtnPrimary}
                            onClick={() => handleOpenNotification(notification)}
                          >
                            Abrir
                          </button>
                          {!notification.isRead ? (
                            <button
                              type="button"
                              className={adminBtnSecondary}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Marcar como lida
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeSection === 'utilizadores' && userPage?.mode === 'list' ? (
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
          ) : null}

          {activeSection === 'utilizadores' &&
          (userPage?.mode === 'create' || userPage?.mode === 'edit') ? (
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
            </div>
          ) : null}

          {activeSection === 'utilizadores' && userPage?.mode === 'deactivate' ? (
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
            </div>
          ) : null}

          {activeSection === 'clubes' ? (
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
                    <p className={adminStatValue}>{filteredClubs.length}</p>
                    <p className={adminStatLabel}>Total</p>
                  </div>
                  <div className={adminStatCard}>
                    <p className={adminStatValue}>{filteredClubs.filter((club) => club.is_active).length}</p>
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
                        <p className={adminUserEmail}>
                          {club.mission || 'Sem missao definida'}
                        </p>
                        <p className={adminUserMeta}>
                          {club.description || 'Sem descricao'}
                        </p>
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
            </div>
          ) : null}

          {activeSection === 'noticias' ? (
            <div className="space-y-6">
                <AdminPageHero
                  icon={Newspaper}
                  title="Noticias"
                  description="Workflow editorial, publicacao e acompanhamento das noticias por clube."
                  tone="blue"
                  stats={newsOverviewStats}
                  actions={
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={isExportingNews}
                      onClick={() => void handleExportNewsCsv()}
                    >
                      {isExportingNews ? 'A exportar...' : 'Exportar CSV'}
                    </button>
                  }
                />

              {showNewsForm ? (
              <form id="news-form" onSubmit={handleSaveNews} className={adminPanelForm}>
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
                        setNewsForm((prev) => ({
                          ...prev,
                          news_status: normalizeWorkflowStatus(event.target.value)
                        }))
                      }
                    >
                      {isLoadingNewsStatuses ? (
                        <option value="">A carregar estados...</option>
                      ) : null}
                      {availableNewsStatuses.map((status) => (
                        <option key={status.id} value={status.name}>
                          {getWorkflowStatusLabel(status.name)}
                        </option>
                      ))}
                    </select>
                    <p className={blockText}>
                      {canManageUsers
                        ? 'O superadmin pode publicar ou arquivar diretamente.'
                        : 'O club_admin trabalha em rascunho ou envia para revisao.'}
                    </p>
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
                      disabled={
                        !canManageUsers &&
                        !['published', 'archived'].includes(normalizeWorkflowStatus(newsForm.news_status))
                      }
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
              ) : null}

              {showNewsList ? (
              <section id="news-list" className={adminPanelCard}>
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
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="news-status-filter">
                      Estado editorial
                    </label>
                    <select
                      id="news-status-filter"
                      className={adminInput}
                      value={newsStatusFilter}
                      onChange={(event) => setNewsStatusFilter(event.target.value)}
                    >
                      <option value="all">Todos os estados</option>
                      {newsStatuses.map((status) => (
                        <option key={status.id} value={normalizeWorkflowStatus(status.name)}>
                          {getWorkflowStatusLabel(status.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {newsError ? <p className={adminError}>{newsError}</p> : null}

                <div className={`${adminFormGridSpaced} mt-6`}>
                  <form onSubmit={handleApplyNewsSearch} className={adminPanelForm}>
                    <div className={adminField}>
                      <label className={adminLabel} htmlFor="news-search">
                        Pesquisar noticias
                      </label>
                      <input
                        id="news-search"
                        className={adminInput}
                        value={newsSearchInput}
                        onChange={(event) => setNewsSearchInput(event.target.value)}
                        placeholder="Titulo, resumo, conteudo ou clube"
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
                          setNewsSearchInput('');
                          setNewsSearch('');
                          setNewsPage(1);
                        }}
                      >
                        Limpar
                      </button>
                    </div>
                  </form>

                  <div className={adminActions}>
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={isExportingNews}
                      onClick={() => void handleExportNewsCsv()}
                    >
                      {isExportingNews ? 'A exportar...' : 'Exportar CSV'}
                    </button>
                  </div>
                </div>

                <div className={adminFormGridSpaced}>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="news-date-from">
                      Criadas desde
                    </label>
                    <input
                      id="news-date-from"
                      type="date"
                      className={adminInput}
                      value={newsDateFrom}
                      onChange={(event) => setNewsDateFrom(event.target.value)}
                    />
                  </div>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="news-date-to">
                      Criadas ate
                    </label>
                    <input
                      id="news-date-to"
                      type="date"
                      className={adminInput}
                      value={newsDateTo}
                      onChange={(event) => setNewsDateTo(event.target.value)}
                    />
                  </div>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="news-order">
                      Ordenar por
                    </label>
                    <select
                      id="news-order"
                      className={adminInput}
                      value={newsOrder}
                      onChange={(event) => setNewsOrder(event.target.value)}
                    >
                      <option value="newest">Mais recentes</option>
                      <option value="oldest">Mais antigas</option>
                      <option value="title_asc">Titulo A-Z</option>
                      <option value="title_desc">Titulo Z-A</option>
                      <option value="club_asc">Clube A-Z</option>
                      <option value="club_desc">Clube Z-A</option>
                      <option value="status_asc">Estado A-Z</option>
                      <option value="status_desc">Estado Z-A</option>
                    </select>
                  </div>
                </div>

                <div className={adminActions}>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    onClick={() =>
                      setSelectedNewsIds(
                        selectedNewsIds.length === sortedNews.length
                          ? []
                          : sortedNews.map((item) => item.id)
                      )
                    }
                    disabled={sortedNews.length === 0}
                  >
                    {selectedNewsIds.length === sortedNews.length && sortedNews.length > 0
                      ? 'Limpar selecao'
                      : 'Selecionar pagina'}
                  </button>
                  <select
                    className={adminInput}
                    value={bulkNewsStatus}
                    onChange={(event) => setBulkNewsStatus(event.target.value)}
                  >
                    {availableNewsStatuses.map((status) => (
                      <option key={status.id} value={normalizeWorkflowStatus(status.name)}>
                        {getWorkflowStatusLabel(status.name)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={adminBtnPrimary}
                    disabled={selectedNewsIds.length === 0 || isApplyingBulkNews}
                    onClick={() => void handleApplyBulkNewsStatus()}
                  >
                    {isApplyingBulkNews ? 'A aplicar...' : 'Aplicar em lote'}
                  </button>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    disabled={selectedNewsIds.length === 0 || isDeletingBulkNews}
                    onClick={() => void handleBulkDeleteNews()}
                  >
                    {isDeletingBulkNews ? 'A apagar...' : 'Apagar selecionadas'}
                  </button>
                </div>

                <div className={adminList}>
                  {isLoadingNews ? <p className={adminInfo}>A carregar noticias...</p> : null}
                  {!isLoadingNews && sortedNews.length === 0 ? (
                    <p className={adminInfo}>Nao existem noticias para o filtro atual.</p>
                  ) : null}
                  {sortedNews.map((item) => (
                    <article key={item.id} className={adminListItem}>
                      <div className={adminListTop}>
                        <label className="mr-4 flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={selectedNewsIds.includes(item.id)}
                            onChange={() => toggleSelectedId(setSelectedNewsIds, item.id)}
                          />
                          Selecionar
                        </label>
                        <div>
                            <h3 className={adminListTitle}>{item.title}</h3>
                            <p className={adminListMeta}>
                              {item.club_name} · {getWorkflowStatusLabel(item.news_status_name)} ·{' '}
                              {formatAdminDateTime(item.published_at || item.created_at)}
                            </p>
                        </div>
                      </div>
                      <p className={adminListDesc}>{item.summary}</p>
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

                {!isLoadingNews ? (
                  <div className={`${adminActions} mt-6`}>
                    <p className={adminInfo}>
                      {newsTotal} noticia(s) · pagina {newsPage} de {newsTotalPages || 1}
                    </p>
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={newsPage <= 1}
                      onClick={() => setNewsPage((prev) => Math.max(1, prev - 1))}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={newsTotalPages === 0 || newsPage >= newsTotalPages}
                      onClick={() => setNewsPage((prev) => prev + 1)}
                    >
                      Seguinte
                    </button>
                  </div>
                ) : null}
              </section>
              ) : null}
            </div>
          ) : null}

          {(activeSection === 'atividades' ||
            activeSection === 'livros' ||
            activeSection === 'sessoes' ||
            activeSection === 'eventos') ? (
            <div className="space-y-6">
                <AdminPageHero
                  icon={CalendarClock}
                  title={activitySectionLabel}
                  description={activitySectionDescription}
                  tone="blue"
                  stats={activityOverviewStats}
                  actions={
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={isExportingActivities}
                      onClick={() => void handleExportActivitiesCsv()}
                    >
                      {isExportingActivities ? 'A exportar...' : 'Exportar CSV'}
                    </button>
                  }
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
                        Pesquisar {activityTab === 'books' ? 'livros' : activityTab === 'sessions' ? 'sessoes' : 'eventos'}
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

                  <div className={adminActions}>
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={isExportingActivities}
                      onClick={() => void handleExportActivitiesCsv()}
                    >
                      {isExportingActivities ? 'A exportar...' : 'Exportar CSV'}
                    </button>
                  </div>
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
                              enable_registrations: event.target.value === 'sim'
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
                              registration_capacity: event.target.value
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
                          Confirmadas {item.confirmed_registrations} · Espera{' '}
                          {item.waitlist_registrations}
                          {item.registration_capacity !== null &&
                          item.registration_capacity !== undefined
                            ? ` · Lotacao ${item.registration_capacity}`
                            : ''}
                        </p>
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
                        <select
                          id="event-status"
                          className={adminInput}
                          value={eventForm.status}
                          onChange={(event) =>
                            setEventForm((prev) => ({
                              ...prev,
                              status: normalizeWorkflowStatus(event.target.value)
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
                              enable_registrations: event.target.value === 'sim'
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
                              registration_capacity: event.target.value
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
                          Confirmadas {item.confirmed_registrations} · Espera{' '}
                          {item.waitlist_registrations}
                          {item.registration_capacity !== null &&
                          item.registration_capacity !== undefined
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
            </div>
          ) : null}

          {activeSection === 'inscricoes' ? (
            <div className="space-y-6">
              <AdminPageHero
                icon={Inbox}
                title="Inscricoes"
                description="Consulta, triagem e validacao dos pedidos submetidos pelos clubes."
                tone="rose"
                stats={registrationOverviewStats}
                actions={
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={isExportingRegistrations}
                    onClick={() => void handleExportRegistrationsCsv()}
                  >
                    {isExportingRegistrations ? 'A exportar...' : 'Exportar CSV'}
                  </button>
                }
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
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      disabled={isExportingRegistrations}
                      onClick={() => void handleExportRegistrationsCsv()}
                    >
                      {isExportingRegistrations ? 'A exportar...' : 'Exportar CSV'}
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
                        <label className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={selectedRegistrationIds.includes(registration.id)}
                            onChange={() =>
                              toggleSelectedId(setSelectedRegistrationIds, registration.id)
                            }
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
            </div>
          ) : null}

          {activeSection === 'conteudos' ? (
            <div className="space-y-6">
                <AdminPageHero
                  icon={FolderKanban}
                  title="Conteudos"
                  description="Gestao editorial das areas permanentes do Laboratorio Cultural."
                  tone="emerald"
                  stats={contentOverviewStats}
                />

              {showContentForm ? (
              <form id="content-form" onSubmit={handleSaveContent} className={adminPanelForm}>
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
              ) : null}

              {showContentList ? (
              <div id="content-list" className={adminList}>
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
              ) : null}
            </div>
          ) : null}
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
  );
}

export default AdminCultura;
