import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Bell, FolderKanban } from 'lucide-react';
import { NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import infoCulturaBg from '../assets/19825874_uqliU.jpeg';
import ispgayaLogo from '../assets/ispgaya-logo.svg';
import { getLocaleText, useLocale } from '../i18n/locale.js';
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
  adminTextarea,
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
  infoLegacyPage,
  infoLegacyPrimaryButton,
} from '../styles/ui';
import {
  CulturalArea,
  CulturalItem,
  getAreaLabel,
} from '../data/culturalContent';
import AdminPageHero from './adminCultura/components/AdminPageHero.js';
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
  fetchAdminDashboard,
  fetchAdminNotifications,
  InfoCulturaAdminNotification,
  InfoCulturaBook,
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
  NewsPayload,
  removeUserFromClub,
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
import DashboardPage from './adminCultura/pages/DashboardPage';
import ActivitiesPage from './adminCultura/ActivitiesPage';
import ClubsPage from './adminCultura/pages/ClubsPage';
import EventsPage from './adminCultura/pages/EventsPage';
import LogsPage from './adminCultura/pages/LogsPage';
import MetricsPage from './adminCultura/pages/MetricsPage';
import NewsPage from './adminCultura/pages/NewsPage';
import NewslettersPage from './adminCultura/pages/NewslettersPage';
import {
  buildActivityOverviewStats,
  buildContentOverviewStats,
  buildDashboardAgenda,
  buildDashboardAlerts,
  buildDashboardCards,
  buildDashboardHighlights,
  buildDashboardQuickActions,
  buildClubOverviewStats,
  buildNewsOverviewStats,
  buildNotificationOverviewStats,
  buildRegistrationOverviewStats,
  buildUserOverviewStats,
  buildSidebarContextNav,
  getActivityPageLinks,
  getActivitySectionCopy,
  getContentPageLinks,
  getNewsPageLinks,
  getVisibleSectionGroups,
  getVisibleSections,
} from './adminCultura/derived.js';
import { useAdminActivities } from './adminCultura/hooks/useAdminActivities';
import { useAdminAuth } from './adminCultura/hooks/useAdminAuth';
import { useAdminNews } from './adminCultura/hooks/useAdminNews';
import { useAdminRegistrations } from './adminCultura/hooks/useAdminRegistrations';
import { useAdminUsers } from './adminCultura/hooks/useAdminUsers';
import RegistrationsPage from './adminCultura/pages/RegistrationsPage';
import SessionsPage from './adminCultura/pages/SessionsPage';
import UsersPage from './adminCultura/pages/UsersPage';
import {
  ACTIVITY_PAGE_SIZE,
  activityTabBySection,
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
  BookFormState,
  CategoryFormState,
  ClubFormState,
  EventFormState,
  FormState,
  NewsFormState,
  SessionFormState,
  UserFormState,
} from './adminCultura/types';
import {
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
  getWorkflowStatusOptions,
  isWithinDateRange,
  normalizeWorkflowStatus,
  sortClubs,
  sortClubsByOrder,
  sortUsers,
  sortUsersByOrder,
  toDateInputValue,
  toDateTimeLocalValue
} from './adminCultura/utils';





function AdminCultura() {

  const location = useLocation();
  const navigate = useNavigate();
  const { locale, setLocale } = useLocale();
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
  const visibleSections = getVisibleSections(canManageUsers, allowedActivityTabs);
  const visibleSectionGroups = getVisibleSectionGroups(visibleSections);
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
    if (
      !userPage ||
      userPage.mode === 'list' ||
      userPage.mode === 'create'
    ) {
      return null;
    }

    return users.find((user) => user.id === userPage.userId) || null;
  }, [userPage, users]);

  function renderLocaleToggle() {
    return (
      <div className={infoLegacyLang}>
        <button
          type="button"
          title={getLocaleText(locale, 'Idioma', 'Language')}
          aria-pressed={locale === 'pt'}
          className={locale === 'pt' ? 'font-bold text-slate-900' : 'text-slate-500'}
          onClick={() => setLocale('pt')}
        >
          PT
        </button>
        <span className="px-2 text-slate-300">|</span>
        <button
          type="button"
          title={getLocaleText(locale, 'Idioma', 'Language')}
          aria-pressed={locale === 'en'}
          className={locale === 'en' ? 'font-bold text-slate-900' : 'text-slate-500'}
          onClick={() => setLocale('en')}
        >
          EN
        </button>
      </div>
    );
  }

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
  const dashboardCards = buildDashboardCards(dashboardStats);
  const dashboardHighlights = buildDashboardHighlights(
    dashboardStats,
    activeUsers,
    publishedItems,
    pendingRegistrations,
    sessions.length
  );
  const { label: activitySectionLabel, description: activitySectionDescription } =
    getActivitySectionCopy(activityTab);
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
  const newsPageLinks = getNewsPageLinks(editingNewsId);
  const activityPageLinks = getActivityPageLinks(
    activityTab,
    editingBookId,
    editingSessionId,
    editingEventId
  );
  const contentPageLinks = getContentPageLinks(editingId);
  const sidebarContextNavBySection = buildSidebarContextNav(
    activityTab,
    newsPageLinks,
    activityPageLinks,
    contentPageLinks,
    newsPageHref,
    activityPageHref,
    contentPageHref
  );
  const readNotificationIdSet = useMemo(
    () => new Set(readNotificationIds),
    [readNotificationIds]
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !readNotificationIdSet.has(notification.id)),
    [notifications, readNotificationIdSet]
  );
  const dashboardAlerts = buildDashboardAlerts(
    notifications,
    readNotificationIdSet,
    dashboardStats,
    pendingRegistrations
  );
  function openDashboardNotification(notification: {
    id: string;
    title: string;
    detail: string;
    href: string;
    level: string;
    created_at: string | null;
  }) {
    handleOpenNotification({
      id: notification.id,
      kind: 'dashboard',
      level: notification.level,
      title: notification.title,
      message: notification.detail,
      href: notification.href,
      created_at: notification.created_at,
    });
  }
  const dashboardAgenda = buildDashboardAgenda(dashboardStats);
  const dashboardQuickActions = buildDashboardQuickActions(canManageUsers, defaultActivityHref);
  const latestNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        isRead: readNotificationIdSet.has(notification.id),
      })),
    [notifications, readNotificationIdSet]
  );
  const notificationOverviewStats = buildNotificationOverviewStats(
    notifications,
    unreadNotifications.length
  );
  const userOverviewStats = buildUserOverviewStats(filteredUsers);
  const clubsOverviewStats = buildClubOverviewStats(filteredClubs);
  const newsOverviewStats = buildNewsOverviewStats(
    newsTotal,
    dashboardStats,
    selectedNewsIds,
    sortedNews
  );
  const activityOverviewStats = buildActivityOverviewStats(
    activityTab,
    activityTotal,
    selectedBookIds,
    selectedEventIds,
    sortedBooks,
    sortedCategories,
    sortedEvents,
    sortedSessions
  );
  const registrationOverviewStats = buildRegistrationOverviewStats(
    registrationTotal,
    pendingRegistrations,
    approvedRegistrations,
    rejectedRegistrations
  );
  const contentOverviewStats = buildContentOverviewStats(sortedItems, publishedItems);
  const clubMembers = useMemo(() => {
    if (!editingClubId) return [];

    return sortUsers(users.filter((user) => user.club_id === editingClubId));
  }, [editingClubId, users]);
  const usersWithoutClub = useMemo(
    () =>
      sortUsers(users.filter((user) => user.is_active && !user.club_id)),
    [users]
  );

  const { handleLogin: authHandleLogin, handleLogout: authHandleLogout } = useAdminAuth({
    authUser,
    authPass,
    setAuthUser,
    setAuthPass,
    setAuthError,
    setToken,
    clearDomainState: clearAuth,
  });

  useAdminUsers({
    token,
    canManageUsers,
    activeSection,
    userPage,
    selectedUser,
    currentUser,
    setItems,
    setUsers,
    setClubs,
    setRoles,
    setCurrentUser,
    setIsLoadingItems,
    setIsLoadingUsers,
    setIsLoadingClubs,
    setIsLoadingRoles,
    setPanelError,
    handleAuthError,
    resetUserForm,
    resetClubForm,
    setUserForm,
    setUserFormError,
  });

  useAdminNews({
    token,
    currentUser,
    activeSection,
    canManageUsers,
    newsClubFilter,
    newsStatusFilter,
    newsSearch,
    newsOrder,
    newsDateFrom,
    newsDateTo,
    newsPage,
    setIsLoadingNews,
    setIsLoadingNewsStatuses,
    setNewsStatuses,
    setNewsItems,
    setNewsTotal,
    setNewsTotalPages,
    setNewsError,
    handleAuthError,
    pageSize: NEWS_PAGE_SIZE,
  });

  useAdminActivities({
    token,
    currentUser,
    activeSection,
    canManageUsers,
    activityTab,
    activityClubFilter,
    activityCategoryFilter,
    activityStatusFilter,
    activitySearch,
    activityOrder,
    activityDateFrom,
    activityDateTo,
    activityPage,
    setIsLoadingActivities,
    setIsLoadingCategories,
    setCategories,
    setBooks,
    setSessions,
    setEvents,
    setActivityTotal,
    setActivityTotalPages,
    setActivityError,
    handleAuthError,
    pageSize: ACTIVITY_PAGE_SIZE,
  });

  useAdminRegistrations({
    token,
    currentUser,
    activeSection,
    canManageUsers,
    registrationClubFilter,
    registrationStatusFilter,
    registrationSearch,
    registrationOrder,
    registrationDateFrom,
    registrationDateTo,
    registrationPage,
    setIsLoadingRegistrations,
    setIsLoadingRegistrationStatuses,
    setRegistrationStatuses,
    setRegistrations,
    setRegistrationTotal,
    setRegistrationTotalPages,
    setRegistrationError,
    handleAuthError,
    pageSize: REGISTRATION_PAGE_SIZE,
  });

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
      club_id: canManageUsers
        ? activityClubFilter !== 'all'
          ? activityClubFilter
          : ''
        : currentUser?.club_id
          ? String(currentUser.club_id)
          : ''
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  useEffect(() => {
    if (!currentUser) return;

    resetNewsForm();
    resetBookForm();
    resetCategoryForm();
    resetSessionForm();
    resetEventForm();
  }, [currentUser?.club_id, canManageUsers]);

  useEffect(() => {
    if (!canManageUsers || activityTab !== 'books' || editingBookId !== null) {
      return;
    }

    if (activityClubFilter === 'all') {
      return;
    }

    setBookForm((prev) =>
      prev.club_id === activityClubFilter ? prev : { ...prev, club_id: activityClubFilter }
    );
  }, [activityClubFilter, activityTab, canManageUsers, editingBookId]);

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

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    return authHandleLogin(event);
  }

  function handleLogout() {
    authHandleLogout();
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

    const manualPassword = userForm.password.trim();
    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      generate_password: userForm.generate_password,
      ...(userPage.mode === 'create' && userForm.club_id ? { club_id: Number(userForm.club_id) } : {}),
      ...(!userForm.generate_password && manualPassword ? { password: manualPassword } : {})
    };

    if (!payload.name || !payload.email || !payload.role) {
      setUserFormError('Preenche nome, email e role.');
      return;
    }

    if (userPage.mode === 'create' && !userForm.club_id) {
      setUserFormError('Seleciona um clube para associar este utilizador.');
      return;
    }

    if (userPage.mode === 'create' && !userForm.generate_password && !manualPassword) {
      setUserFormError('Ativa a geracao automatica ou indica uma password.');
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

    const resolvedBookClubId = canManageUsers
      ? (bookForm.club_id
          ? Number(bookForm.club_id)
          : activityClubFilter !== 'all'
            ? Number(activityClubFilter)
            : null)
      : currentUser?.club_id ?? null;

    if (!canManageUsers && !resolvedBookClubId) {
      setBookFormError('O teu utilizador precisa de estar associado a um clube para criar livros.');
      return;
    }

    const payload: BookPayload = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      publisher: bookForm.publisher.trim(),
      publication_year: Number(bookForm.publication_year),
      cover_image: bookForm.cover_image.trim(),
      summary: bookForm.summary.trim(),
      is_featured: bookForm.is_featured,
      ...(resolvedBookClubId ? { club_id: resolvedBookClubId } : {})
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
        error instanceof Error ? error.message : 'Nao foi possivel apagar o evento.' ;
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
              {renderLocaleToggle()}
            </div>
          </header>

          <main className={infoLegacyCenter}>
            <div className={infoLegacyPanel}>
              <div className={infoLegacyGrid}>
                <div className={infoLegacyLeft}>
                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>
                      {getLocaleText(locale, 'Laboratorio Cultural', 'Cultural Laboratory')}
                    </h3>
                    <p className={infoLegacyBlockText}>
                      {getLocaleText(locale, 'A nossa abordagem cultural e interdisciplinar, promovendo criacao artistica, participacao academica e ligacao com a comunidade.', 'Our cultural approach is interdisciplinary, promoting artistic creation, academic participation and connection with the community.')}
                    </p>
                    <ul className={infoLegacyBlockList}>
                      <li>{getLocaleText(locale, 'Organizar programacao cultural', 'Organize cultural programming')}</li>
                      <li>{getLocaleText(locale, 'Atualizar noticias por area', 'Update news by area')}</li>
                      <li>{getLocaleText(locale, 'Gerir conteudo em rascunho e publicado', 'Manage content in draft and published')}</li>
                    </ul>
                  </div>

                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>{getLocaleText(locale, 'Primeiro acesso', 'First Access')}</h3>
                    <p className={infoLegacyBlockText}>
                      {getLocaleText(locale, 'Se e a primeira vez a usar o portal, contacte a equipa tecnica para', 'If this is your first time using the portal, contact the technical team to')}
                      {getLocaleText(locale, 'atribuicao de credenciais de administrador.', 'request administrator credentials.')}
                    </p>
                  </div>
                </div>

                <div className={infoLegacyRight}>
                  <h2 className={infoLegacyLoginTitle}>{getLocaleText(locale, 'Entrar', 'Login')}</h2>
                  <p className={infoLegacyLoginHint}>
                    {getLocaleText(locale, 'Acesso reservado aos administradores do InfoCultura.', 'Access reserved for InfoCultura administrators.')}
                  </p>

                  <form className={infoLegacyLoginForm} onSubmit={handleLogin}>
                    <div className={adminField}>
                      <label htmlFor="admin-user" className={adminLabel}>
                        {getLocaleText(locale, 'Utilizador', 'User')}
                      </label>
                      <input
                        id="admin-user"
                        className={infoLegacyInput}
                        placeholder={getLocaleText(locale, 'Utilizador', 'User')}
                        value={authUser}
                        onChange={(event) => setAuthUser(event.target.value)}
                      />
                    </div>

                    <div className={adminField}>
                      <label htmlFor="admin-pass" className={adminLabel}>
                        {getLocaleText(locale, 'Palavra-chave', 'Password')}
                      </label>
                      <input
                        id="admin-pass"
                        type="password"
                        className={infoLegacyInput}
                        placeholder={getLocaleText(locale, 'Palavra-chave', 'Password')}
                        value={authPass}
                        onChange={(event) => setAuthPass(event.target.value)}
                      />
                    </div>

                    {authError ? <p className={adminError}>{authError}</p> : null}

                    <button type="submit" className={infoLegacyPrimaryButton}>
                      {getLocaleText(locale, 'Entrar', 'Login')}
                    </button>
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
              <p className={infoLegacyBrandText}>{getLocaleText(locale, 'InfoCultura', 'InfoCultura')}</p>
              <p className={infoLegacyBrandSub}>{getLocaleText(locale, 'Gestao cultural interna', 'Internal Cultural Management')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleLogout} className={adminBtnSecondary}>
              {getLocaleText(locale, 'Terminar sessao', 'End session')}
            </button>
            {renderLocaleToggle()}
          </div>
        </div>
      </header>

      <main className={infoLegacyMain}>
        <div className={container}>
          {panelError ? <p className={adminError}>{panelError}</p> : null}

          <div className={adminPortalShell}>
            <aside className={adminPortalSidebar} aria-label="Menu lateral do painel">
              <div className={adminPortalSidebarHead}>
                <p className={adminPortalSidebarBrand}>{getLocaleText(locale, 'InfoCultura', 'InfoCultura')}</p>
                <p className={adminPortalSidebarSub}>{getLocaleText(locale, 'Gestao cultural interna', 'Internal Cultural Management')}</p>
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
            <DashboardPage
              currentUser={currentUser}
              isLoadingUsers={isLoadingUsers}
              dashboardStats={dashboardStats}
              isLoadingDashboard={isLoadingDashboard}
              dashboardError={dashboardError}
              unreadNotifications={unreadNotifications.length}
              isLoadingNotifications={isLoadingNotifications}
              notificationError={notificationError}
              dashboardHighlights={dashboardHighlights}
              dashboardAlerts={dashboardAlerts}
              dashboardQuickActions={dashboardQuickActions}
              dashboardCards={dashboardCards}
              dashboardAgenda={dashboardAgenda}
              onOpenNotification={openDashboardNotification}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onNavigate={navigate}
            />
          ) : null}

          {activeSection === 'metricas' ? <MetricsPage /> : null}

          {activeSection === 'logs' ? <LogsPage /> : null}

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
                    {getLocaleText(locale, 'Marcar todas como lidas', 'Mark all as read')}
                  </button>
                }
              />

              <section className={adminPanelCard}>
                {isLoadingNotifications ? (
                  <p className={adminInfo}>{getLocaleText(locale, 'A carregar notificacoes...', 'Loading notifications...')}</p>
                ) : null}
                {notificationError ? <p className={adminError}>{notificationError}</p> : null}

                {!isLoadingNotifications && latestNotifications.length === 0 ? (
                  <p className={adminInfo}>{getLocaleText(locale, 'Nao existem notificacoes para mostrar.', 'There are no notifications to display.')}</p>
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
                                {getLocaleText(locale, 'Nova', 'New')}
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
                            {getLocaleText(locale, 'Abrir', 'Open')}
                          </button>
                          {!notification.isRead ? (
                            <button
                              type="button"
                              className={adminBtnSecondary}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              {getLocaleText(locale, 'Marcar como lida', 'Mark as read')}
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

          {activeSection === 'newsletters' ? <NewslettersPage /> : null}

          {activeSection === 'utilizadores' ? (
            <UsersPage
              userPage={userPage}
              canManageUsers={canManageUsers}
              userOverviewStats={userOverviewStats}
              isLoadingUsers={isLoadingUsers}
              filteredUsers={filteredUsers}
              currentUser={currentUser}
              userDateFrom={userDateFrom}
              userDateTo={userDateTo}
              userOrder={userOrder}
              setUserDateFrom={setUserDateFrom}
              setUserDateTo={setUserDateTo}
              setUserOrder={setUserOrder}
              isSavingUser={isSavingUser}
              isLoadingRoles={isLoadingRoles}
              clubs={clubs}
              isLoadingClubs={isLoadingClubs}
              roles={roles}
              userForm={userForm}
              setUserForm={setUserForm}
              userFormError={userFormError}
              handleSaveUser={handleSaveUser}
              resetUserForm={resetUserForm}
              selectedUser={selectedUser}
              isDeactivatingUser={isDeactivatingUser}
              handleDeactivateUser={handleDeactivateUser}
            />
          ) : null}

          {activeSection === 'clubes' ? (
            <ClubsPage
              clubsOverviewStats={clubsOverviewStats}
              handleSaveClub={handleSaveClub}
              clubForm={clubForm}
              setClubForm={setClubForm}
              clubImageFileKey={clubImageFileKey}
              isUploadingClubImage={isUploadingClubImage}
              handleUploadClubImage={handleUploadClubImage}
              clubFormError={clubFormError}
              isSavingClub={isSavingClub}
              editingClubId={editingClubId}
              resetClubForm={resetClubForm}
              selectedClubUserId={selectedClubUserId}
              setSelectedClubUserId={setSelectedClubUserId}
              usersWithoutClub={usersWithoutClub}
              isAssigningClubUser={isAssigningClubUser}
              handleAssignUserToClub={handleAssignUserToClub}
              clubDateFrom={clubDateFrom}
              clubDateTo={clubDateTo}
              clubOrder={clubOrder}
              setClubDateFrom={setClubDateFrom}
              setClubDateTo={setClubDateTo}
              setClubOrder={setClubOrder}
              filteredClubs={filteredClubs}
              isLoadingClubs={isLoadingClubs}
              deletingClubId={deletingClubId}
              handleEditClub={handleEditClub}
              handleDeleteClub={handleDeleteClub}
              clubMembers={clubMembers}
              removingClubUserId={removingClubUserId}
              handleRemoveUserFromClub={handleRemoveUserFromClub}
            />
          ) : null}

          {activeSection === 'noticias' ? (
            <NewsPage
              canManageUsers={canManageUsers}
              newsOverviewStats={newsOverviewStats}
              showNewsForm={showNewsForm}
              showNewsList={showNewsList}
              handleSaveNews={handleSaveNews}
              editingNewsId={editingNewsId}
              newsForm={newsForm}
              setNewsForm={setNewsForm}
              clubs={clubs}
              isLoadingNewsStatuses={isLoadingNewsStatuses}
              availableNewsStatuses={availableNewsStatuses}
              newsFormError={newsFormError}
              isSavingNews={isSavingNews}
              resetNewsForm={resetNewsForm}
              newsImageFileKey={newsImageFileKey}
              isUploadingNewsImage={isUploadingNewsImage}
              handleUploadNewsImage={handleUploadNewsImage}
              newsError={newsError}
              handleApplyNewsSearch={handleApplyNewsSearch}
              newsSearchInput={newsSearchInput}
              setNewsSearchInput={setNewsSearchInput}
              setNewsSearch={setNewsSearch}
              setNewsPage={setNewsPage}
              newsClubFilter={newsClubFilter}
              setNewsClubFilter={setNewsClubFilter}
              newsStatusFilter={newsStatusFilter}
              setNewsStatusFilter={setNewsStatusFilter}
              newsStatuses={newsStatuses}
              newsDateFrom={newsDateFrom}
              setNewsDateFrom={setNewsDateFrom}
              newsDateTo={newsDateTo}
              setNewsDateTo={setNewsDateTo}
              newsOrder={newsOrder}
              setNewsOrder={setNewsOrder}
              selectedNewsIds={selectedNewsIds}
              setSelectedNewsIds={setSelectedNewsIds}
              sortedNews={sortedNews}
              bulkNewsStatus={bulkNewsStatus}
              setBulkNewsStatus={setBulkNewsStatus}
              isApplyingBulkNews={isApplyingBulkNews}
              handleApplyBulkNewsStatus={handleApplyBulkNewsStatus}
              isDeletingBulkNews={isDeletingBulkNews}
              handleBulkDeleteNews={handleBulkDeleteNews}
              deletingNewsId={deletingNewsId}
              handleDeleteNews={handleDeleteNews}
              handleEditNews={handleEditNews}
              newsTotal={newsTotal}
              newsPage={newsPage}
              newsTotalPages={newsTotalPages}
              isLoadingNews={isLoadingNews}
              toggleSelectedId={toggleSelectedId}
            />
          ) : null}

          {activeSection === 'livros' ? (
            <ActivitiesPage
              activitySectionLabel={activitySectionLabel}
              activitySectionDescription={activitySectionDescription}
              activityOverviewStats={activityOverviewStats}
              showActivityFiltersAndList={showActivityFiltersAndList}
              canManageUsers={canManageUsers}
              clubs={clubs}
              activityClubFilter={activityClubFilter}
              setActivityClubFilter={setActivityClubFilter}
              activityCategoryFilter={activityCategoryFilter}
              setActivityCategoryFilter={setActivityCategoryFilter}
              activityStatusFilter={activityStatusFilter}
              setActivityStatusFilter={setActivityStatusFilter}
              activityError={activityError}
              handleApplyActivitySearch={handleApplyActivitySearch}
              activitySearchInput={activitySearchInput}
              setActivitySearchInput={setActivitySearchInput}
              setActivitySearch={setActivitySearch}
              setActivityPage={setActivityPage}
              activityDateFrom={activityDateFrom}
              setActivityDateFrom={setActivityDateFrom}
              activityDateTo={activityDateTo}
              setActivityDateTo={setActivityDateTo}
              activityOrder={activityOrder}
              setActivityOrder={setActivityOrder}
              activityTab={activityTab}
              selectedBookIds={selectedBookIds}
              setSelectedBookIds={setSelectedBookIds}
              sortedBooks={sortedBooks}
              isDeletingBulkBooks={isDeletingBulkBooks}
              handleBulkDeleteBooks={handleBulkDeleteBooks}
              selectedEventIds={selectedEventIds}
              setSelectedEventIds={setSelectedEventIds}
              sortedEvents={sortedEvents}
              bulkEventStatus={bulkEventStatus}
              setBulkEventStatus={setBulkEventStatus}
              availableEventStatuses={availableEventStatuses}
              isApplyingBulkEvents={isApplyingBulkEvents}
              handleApplyBulkEventStatus={handleApplyBulkEventStatus}
              isDeletingBulkEvents={isDeletingBulkEvents}
              handleBulkDeleteEvents={handleBulkDeleteEvents}
              showActivityForm={showActivityForm}
              handleSaveBook={handleSaveBook}
              editingBookId={editingBookId}
              bookForm={bookForm}
              setBookForm={setBookForm}
              bookImageFileKey={bookImageFileKey}
              isUploadingBookImage={isUploadingBookImage}
              handleUploadBookImage={handleUploadBookImage}
              bookFormError={bookFormError}
              isSavingBook={isSavingBook}
              resetBookForm={resetBookForm}
              handleEditBook={handleEditBook}
              deletingBookId={deletingBookId}
              handleDeleteBook={handleDeleteBook}
              isLoadingActivities={isLoadingActivities}
              activityTotal={activityTotal}
              activityPage={activityPage}
              activityTotalPages={activityTotalPages}
              handleSaveSession={handleSaveSession}
              editingSessionId={editingSessionId}
              sessionForm={sessionForm}
              setSessionForm={setSessionForm}
              sessionFormError={sessionFormError}
              isSavingSession={isSavingSession}
              resetSessionForm={resetSessionForm}
              handleEditSession={handleEditSession}
              deletingSessionId={deletingSessionId}
              handleDeleteSession={handleDeleteSession}
              sortedSessions={sortedSessions}
              handleSaveEvent={handleSaveEvent}
              editingEventId={editingEventId}
              eventForm={eventForm}
              setEventForm={setEventForm}
              eventImageFileKey={eventImageFileKey}
              isUploadingEventImage={isUploadingEventImage}
              handleUploadEventImage={handleUploadEventImage}
              eventFormError={eventFormError}
              isSavingEvent={isSavingEvent}
              resetEventForm={resetEventForm}
              handleEditEvent={handleEditEvent}
              deletingEventId={deletingEventId}
              handleDeleteEvent={handleDeleteEvent}
              showEventCategories={showEventCategories}
              handleSaveCategory={handleSaveCategory}
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              categoryFormError={categoryFormError}
              isSavingCategory={isSavingCategory}
              editingCategoryId={editingCategoryId}
              resetCategoryForm={resetCategoryForm}
              sortedCategories={sortedCategories}
              isLoadingCategories={isLoadingCategories}
              handleEditCategory={handleEditCategory}
              deletingCategoryId={deletingCategoryId}
              handleDeleteCategory={handleDeleteCategory}
              toggleSelectedId={toggleSelectedId}
            />
          ) : null}

          {activeSection === 'sessoes' ? (
            <SessionsPage
              activitySectionLabel={activitySectionLabel}
              activitySectionDescription={activitySectionDescription}
              activityOverviewStats={activityOverviewStats}
              showActivityFiltersAndList={showActivityFiltersAndList}
              canManageUsers={canManageUsers}
              clubs={clubs}
              activityClubFilter={activityClubFilter}
              setActivityClubFilter={setActivityClubFilter}
              activityCategoryFilter={activityCategoryFilter}
              setActivityCategoryFilter={setActivityCategoryFilter}
              activityStatusFilter={activityStatusFilter}
              setActivityStatusFilter={setActivityStatusFilter}
              activityError={activityError}
              handleApplyActivitySearch={handleApplyActivitySearch}
              activitySearchInput={activitySearchInput}
              setActivitySearchInput={setActivitySearchInput}
              setActivitySearch={setActivitySearch}
              setActivityPage={setActivityPage}
              activityDateFrom={activityDateFrom}
              setActivityDateFrom={setActivityDateFrom}
              activityDateTo={activityDateTo}
              setActivityDateTo={setActivityDateTo}
              activityOrder={activityOrder}
              setActivityOrder={setActivityOrder}
              selectedBookIds={selectedBookIds}
              setSelectedBookIds={setSelectedBookIds}
              sortedBooks={sortedBooks}
              isDeletingBulkBooks={isDeletingBulkBooks}
              handleBulkDeleteBooks={handleBulkDeleteBooks}
              selectedEventIds={selectedEventIds}
              setSelectedEventIds={setSelectedEventIds}
              sortedEvents={sortedEvents}
              bulkEventStatus={bulkEventStatus}
              setBulkEventStatus={setBulkEventStatus}
              availableEventStatuses={availableEventStatuses}
              isApplyingBulkEvents={isApplyingBulkEvents}
              handleApplyBulkEventStatus={handleApplyBulkEventStatus}
              isDeletingBulkEvents={isDeletingBulkEvents}
              handleBulkDeleteEvents={handleBulkDeleteEvents}
              showActivityForm={showActivityForm}
              handleSaveBook={handleSaveBook}
              editingBookId={editingBookId}
              bookForm={bookForm}
              setBookForm={setBookForm}
              bookImageFileKey={bookImageFileKey}
              isUploadingBookImage={isUploadingBookImage}
              handleUploadBookImage={handleUploadBookImage}
              bookFormError={bookFormError}
              isSavingBook={isSavingBook}
              resetBookForm={resetBookForm}
              handleEditBook={handleEditBook}
              deletingBookId={deletingBookId}
              handleDeleteBook={handleDeleteBook}
              isLoadingActivities={isLoadingActivities}
              activityTotal={activityTotal}
              activityPage={activityPage}
              activityTotalPages={activityTotalPages}
              handleSaveSession={handleSaveSession}
              editingSessionId={editingSessionId}
              sessionForm={sessionForm}
              setSessionForm={setSessionForm}
              sessionFormError={sessionFormError}
              isSavingSession={isSavingSession}
              resetSessionForm={resetSessionForm}
              handleEditSession={handleEditSession}
              deletingSessionId={deletingSessionId}
              handleDeleteSession={handleDeleteSession}
              sortedSessions={sortedSessions}
              handleSaveEvent={handleSaveEvent}
              editingEventId={editingEventId}
              eventForm={eventForm}
              setEventForm={setEventForm}
              eventImageFileKey={eventImageFileKey}
              isUploadingEventImage={isUploadingEventImage}
              handleUploadEventImage={handleUploadEventImage}
              eventFormError={eventFormError}
              isSavingEvent={isSavingEvent}
              resetEventForm={resetEventForm}
              handleEditEvent={handleEditEvent}
              deletingEventId={deletingEventId}
              handleDeleteEvent={handleDeleteEvent}
              showEventCategories={showEventCategories}
              handleSaveCategory={handleSaveCategory}
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              categoryFormError={categoryFormError}
              isSavingCategory={isSavingCategory}
              editingCategoryId={editingCategoryId}
              resetCategoryForm={resetCategoryForm}
              sortedCategories={sortedCategories}
              isLoadingCategories={isLoadingCategories}
              handleEditCategory={handleEditCategory}
              deletingCategoryId={deletingCategoryId}
              handleDeleteCategory={handleDeleteCategory}
              toggleSelectedId={toggleSelectedId}
            />
          ) : null}

          {activeSection === 'eventos' ? (
            <EventsPage
              activitySectionLabel={activitySectionLabel}
              activitySectionDescription={activitySectionDescription}
              activityOverviewStats={activityOverviewStats}
              showActivityFiltersAndList={showActivityFiltersAndList}
              canManageUsers={canManageUsers}
              clubs={clubs}
              activityClubFilter={activityClubFilter}
              setActivityClubFilter={setActivityClubFilter}
              activityCategoryFilter={activityCategoryFilter}
              setActivityCategoryFilter={setActivityCategoryFilter}
              activityStatusFilter={activityStatusFilter}
              setActivityStatusFilter={setActivityStatusFilter}
              activityError={activityError}
              handleApplyActivitySearch={handleApplyActivitySearch}
              activitySearchInput={activitySearchInput}
              setActivitySearchInput={setActivitySearchInput}
              setActivitySearch={setActivitySearch}
              setActivityPage={setActivityPage}
              activityDateFrom={activityDateFrom}
              setActivityDateFrom={setActivityDateFrom}
              activityDateTo={activityDateTo}
              setActivityDateTo={setActivityDateTo}
              activityOrder={activityOrder}
              setActivityOrder={setActivityOrder}
              selectedBookIds={selectedBookIds}
              setSelectedBookIds={setSelectedBookIds}
              sortedBooks={sortedBooks}
              isDeletingBulkBooks={isDeletingBulkBooks}
              handleBulkDeleteBooks={handleBulkDeleteBooks}
              selectedEventIds={selectedEventIds}
              setSelectedEventIds={setSelectedEventIds}
              sortedEvents={sortedEvents}
              bulkEventStatus={bulkEventStatus}
              setBulkEventStatus={setBulkEventStatus}
              availableEventStatuses={availableEventStatuses}
              isApplyingBulkEvents={isApplyingBulkEvents}
              handleApplyBulkEventStatus={handleApplyBulkEventStatus}
              isDeletingBulkEvents={isDeletingBulkEvents}
              handleBulkDeleteEvents={handleBulkDeleteEvents}
              showActivityForm={showActivityForm}
              handleSaveBook={handleSaveBook}
              editingBookId={editingBookId}
              bookForm={bookForm}
              setBookForm={setBookForm}
              bookImageFileKey={bookImageFileKey}
              isUploadingBookImage={isUploadingBookImage}
              handleUploadBookImage={handleUploadBookImage}
              bookFormError={bookFormError}
              isSavingBook={isSavingBook}
              resetBookForm={resetBookForm}
              handleEditBook={handleEditBook}
              deletingBookId={deletingBookId}
              handleDeleteBook={handleDeleteBook}
              isLoadingActivities={isLoadingActivities}
              activityTotal={activityTotal}
              activityPage={activityPage}
              activityTotalPages={activityTotalPages}
              handleSaveSession={handleSaveSession}
              editingSessionId={editingSessionId}
              sessionForm={sessionForm}
              setSessionForm={setSessionForm}
              sessionFormError={sessionFormError}
              isSavingSession={isSavingSession}
              resetSessionForm={resetSessionForm}
              handleEditSession={handleEditSession}
              deletingSessionId={deletingSessionId}
              handleDeleteSession={handleDeleteSession}
              sortedSessions={sortedSessions}
              handleSaveEvent={handleSaveEvent}
              editingEventId={editingEventId}
              eventForm={eventForm}
              setEventForm={setEventForm}
              eventImageFileKey={eventImageFileKey}
              isUploadingEventImage={isUploadingEventImage}
              handleUploadEventImage={handleUploadEventImage}
              eventFormError={eventFormError}
              isSavingEvent={isSavingEvent}
              resetEventForm={resetEventForm}
              handleEditEvent={handleEditEvent}
              deletingEventId={deletingEventId}
              handleDeleteEvent={handleDeleteEvent}
              showEventCategories={showEventCategories}
              handleSaveCategory={handleSaveCategory}
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              categoryFormError={categoryFormError}
              isSavingCategory={isSavingCategory}
              editingCategoryId={editingCategoryId}
              resetCategoryForm={resetCategoryForm}
              sortedCategories={sortedCategories}
              isLoadingCategories={isLoadingCategories}
              handleEditCategory={handleEditCategory}
              deletingCategoryId={deletingCategoryId}
              handleDeleteCategory={handleDeleteCategory}
              toggleSelectedId={toggleSelectedId}
            />
          ) : null}

          {activeSection === 'inscricoes' ? (
            <RegistrationsPage
              registrationOverviewStats={registrationOverviewStats}
              registrationTotal={registrationTotal}
              pendingRegistrations={pendingRegistrations}
              approvedRegistrations={approvedRegistrations}
              rejectedRegistrations={rejectedRegistrations}
              canManageUsers={canManageUsers}
              clubs={clubs}
              registrationClubFilter={registrationClubFilter}
              setRegistrationClubFilter={setRegistrationClubFilter}
              registrationStatusFilter={registrationStatusFilter}
              setRegistrationStatusFilter={setRegistrationStatusFilter}
              isLoadingRegistrationStatuses={isLoadingRegistrationStatuses}
              registrationStatuses={registrationStatuses}
              registrationDateFrom={registrationDateFrom}
              setRegistrationDateFrom={setRegistrationDateFrom}
              registrationDateTo={registrationDateTo}
              setRegistrationDateTo={setRegistrationDateTo}
              handleRegistrationSearchSubmit={handleRegistrationSearchSubmit}
              registrationSearchInput={registrationSearchInput}
              setRegistrationSearchInput={setRegistrationSearchInput}
              setRegistrationSearch={setRegistrationSearch}
              setRegistrationPage={setRegistrationPage}
              registrationError={registrationError}
              registrationOrder={registrationOrder}
              setRegistrationOrder={setRegistrationOrder}
              selectedRegistrationIds={selectedRegistrationIds}
              setSelectedRegistrationIds={setSelectedRegistrationIds}
              bulkRegistrationStatus={bulkRegistrationStatus}
              setBulkRegistrationStatus={setBulkRegistrationStatus}
              isApplyingBulkRegistrations={isApplyingBulkRegistrations}
              handleApplyBulkRegistrationStatus={handleApplyBulkRegistrationStatus}
              isLoadingRegistrations={isLoadingRegistrations}
              registrationPage={registrationPage}
              registrationTotalPages={registrationTotalPages}
              registrations={registrations}
              updatingRegistrationId={updatingRegistrationId}
              handleUpdateRegistrationStatus={handleUpdateRegistrationStatus}
              toggleSelectedId={toggleSelectedId}
            />
          ) : null}

          {activeSection === 'conteudos' ? (
            <div className="space-y-6">
                <AdminPageHero
                  icon={FolderKanban}
                  title={getLocaleText(locale, 'Conteudos', 'Contents')}
                  description={getLocaleText(locale, 'Gestao editorial das areas permanentes do Laboratorio Cultural.', 'Editorial management of the permanent areas of the Cultural Laboratory.')}
                  tone="emerald"
                  stats={contentOverviewStats}
                />

              {showContentForm ? (
              <form id="content-form" onSubmit={handleSaveContent} className={adminPanelForm}>
                <h2 className={blockTitle}>
                  {editingId ? getLocaleText(locale, 'Editar Conteudo', 'Edit Content') : getLocaleText(locale, 'Novo Conteudo', 'New Content')}
                </h2>
                <p className={blockText}>
                  {getLocaleText(locale, 'Cria ou atualiza conteudo para as paginas do Laboratorio Cultural.', 'Create or update content for the pages of the Cultural Laboratory.')}
                </p>

                <div className={adminFormGridSpaced}>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="area">
                      {getLocaleText(locale, 'Area', 'Area')}
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
                      <option value="tuna">{getLocaleText(locale, 'Tuna Academica', 'Academic Tuna')}</option>
                      <option value="clube-leitura">{getLocaleText(locale, 'Clube de Leitura', 'Reading Club')}</option>
                      <option value="teatro">{getLocaleText(locale, 'Teatro', 'Theater')}</option>
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="date">
                      {getLocaleText(locale, 'Data', 'Date')}
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
                      {getLocaleText(locale, 'Titulo', 'Title')}
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
                      {getLocaleText(locale, 'Estado', 'Status')}
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
                      <option value="rascunho">{getLocaleText(locale, 'Rascunho', 'Draft')}</option>
                      <option value="publicado">{getLocaleText(locale, 'Publicado', 'Published')}</option>
                    </select>
                  </div>
                </div>

                <div className={adminFieldSpaced}>
                  <label className={adminLabel} htmlFor="description">
                    {getLocaleText(locale, 'Descricao', 'Description')}
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
                    {isSavingContent ? 'A guardar...'  : editingId ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetContentForm}
                    className={adminBtnSecondary}
                  >
                    {getLocaleText(locale, 'Limpar', 'Clear')}
                  </button>
                </div>
              </form>
              ) : null}

              {showContentList ? (
              <div id="content-list" className={adminList}>
                {isLoadingItems ? (
                  <p className={adminInfo}> {getLocaleText(locale, 'A carregar conteudos...', 'Loading content...')}</p>  
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
                        {getLocaleText(locale, 'Editar', 'Edit')}
                      </button>
                      <button
                        type="button"
                        className={adminBtnDanger}
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        {getLocaleText(locale, 'Apagar', 'Delete')}
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
          <span>2026 · Instituto Superior Politecnico Gaya  </span>
          <span>InfoCultura </span>
        </div>
      </footer>
    </div>
  );
}

export default AdminCultura;
