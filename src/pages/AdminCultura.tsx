import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
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
  adminListBadge,
  adminListDesc,
  adminListHeader,
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
  fetchAdminEventbriteConnection,
  fetchAdminEventbriteOrders,
  fetchAdminNotifications,
  InfoCulturaAdminNotification,
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaDashboardStats,
  InfoCulturaEvent,
  EventbriteOrdersPage,
  EventbriteRefundStatus,
  EventbriteConnectionStatus,
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
  syncAdminEventToEventbrite,
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
<<<<<<< Updated upstream
} from '../data/infoculturaApi';
=======
} from '../api/infoculturaApi';
import DashboardPage from './adminCultura/pages/DashboardPage';
import ActivitiesPage from './adminCultura/ActivitiesPage';
import ClubsPage from './adminCultura/pages/ClubsPage';
import EventbritePage from './adminCultura/pages/EventbritePage';
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
>>>>>>> Stashed changes

const TOKEN_KEY = 'ispgaya_cultura_token';
const NOTIFICATION_READ_KEY = 'ispgaya_cultura_notifications_read';
const REGISTRATION_PAGE_SIZE = 10;
const NEWS_PAGE_SIZE = 8;
const ACTIVITY_PAGE_SIZE = 8;
const NEWS_WORKFLOW_ORDER = ['draft', 'review', 'published', 'archived'];
const EVENT_WORKFLOW_ORDER = ['draft', 'review', 'published', 'archived'];
const WORKFLOW_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  review: 'Em revisao',
  published: 'Publicado',
  archived: 'Arquivado',
  rascunho: 'Rascunho',
  publicado: 'Publicado'
};

function getDefaultActivityOrdering(tab: ActivityTab): string {
  if (tab === 'books') return 'featured';
  if (tab === 'sessions') return 'date_asc';
  return 'date_asc';
}

function normalizeWorkflowStatus(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'rascunho') return 'draft';
  if (normalized === 'publicado') return 'published';
  return normalized;
}

function getWorkflowStatusLabel(value: string): string {
  return WORKFLOW_LABELS[normalizeWorkflowStatus(value)] || value;
}

function getWorkflowStatusOptions(order: string[], currentValue: string): string[] {
  const normalizedCurrent = normalizeWorkflowStatus(currentValue || '');
  const nextValues = [...order];

  if (normalizedCurrent && !nextValues.includes(normalizedCurrent)) {
    nextValues.push(normalizedCurrent);
  }

  return nextValues;
}

function downloadBlobFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function getStoredReadNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_READ_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

function isWithinDateRange(value: string | null | undefined, fromDate: string, toDate: string): boolean {
  const target = value ? value.slice(0, 10) : '';

  if (fromDate && (!target || target < fromDate)) {
    return false;
  }

  if (toDate && (!target || target > toDate)) {
    return false;
  }

  return true;
}

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
  enable_registrations: boolean;
  registration_capacity: string;
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
  enable_registrations: boolean;
  registration_capacity: string;
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
  | 'notificacoes'
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
  enable_registrations: false,
  registration_capacity: '',
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
  enable_registrations: false,
  registration_capacity: '',
  status: 'draft',
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
  { id: 'notificacoes', label: 'Notificacoes', href: '/infocultura/notificacoes' },
  { id: 'utilizadores', label: 'Utilizadores', href: '/infocultura/utilizadores' },
  { id: 'noticias', label: 'Noticias', href: '/infocultura/noticias' },
  { id: 'atividades', label: 'Atividades', href: '/infocultura/atividades' },
  { id: 'conteudos', label: 'Conteudos', href: '/infocultura/conteudos' },
  { id: 'inscricoes', label: 'Inscricoes', href: '/infocultura/inscricoes' },
  { id: 'clubes', label: 'Clubes', href: '/infocultura/clubes' }
];

const adminSectionGroups: {
  title: string;
  ids: AdminSection[];
}[] = [
  { title: 'Painel', ids: ['resumo', 'notificacoes'] },
  { title: 'Gestao', ids: ['utilizadores', 'clubes', 'inscricoes'] },
  { title: 'Conteudos', ids: ['noticias', 'atividades', 'conteudos'] }
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

  if (pathname === '/infocultura/notificacoes') {
    return 'notificacoes';
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

function sortUsersByOrder(list: InfoCulturaUser[], ordering: string): InfoCulturaUser[] {
  const sorted = [...list];

  switch (ordering) {
    case 'newest':
      return sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    case 'oldest':
      return sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name) || b.email.localeCompare(a.email));
    case 'email_asc':
      return sorted.sort((a, b) => a.email.localeCompare(b.email) || a.name.localeCompare(b.name));
    case 'email_desc':
      return sorted.sort((a, b) => b.email.localeCompare(a.email) || b.name.localeCompare(a.name));
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email));
    default:
      return sortUsers(sorted);
  }
}

function sortClubs(list: InfoCulturaClub[]): InfoCulturaClub[] {
  return [...list].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

function sortClubsByOrder(list: InfoCulturaClub[], ordering: string): InfoCulturaClub[] {
  const sorted = [...list];

  switch (ordering) {
    case 'newest':
      return sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    case 'oldest':
      return sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'registrations_open':
      return sorted.sort(
        (a, b) =>
          Number(Boolean(b.enable_registrations)) - Number(Boolean(a.enable_registrations)) ||
          a.name.localeCompare(b.name)
      );
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sortClubs(sorted);
  }
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

type AdminHeroTone = 'amber' | 'blue' | 'slate' | 'rose' | 'emerald';

type AdminHeroStat = {
  label: string;
  value: string | number;
};

type AdminPageHeroProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone?: AdminHeroTone;
  stats?: AdminHeroStat[];
  actions?: ReactNode;
};

function getAdminHeroToneClasses(tone: AdminHeroTone): string {
  if (tone === 'blue') return 'bg-sky-100 text-sky-700';
  if (tone === 'rose') return 'bg-rose-100 text-rose-700';
  if (tone === 'emerald') return 'bg-emerald-100 text-emerald-700';
  if (tone === 'slate') return 'bg-slate-100 text-slate-700';
  return 'bg-amber-100 text-amber-700';
}

function AdminPageHero({
  icon: Icon,
  title,
  description,
  tone = 'amber',
  stats = [],
  actions,
}: AdminPageHeroProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${getAdminHeroToneClasses(
                tone
              )}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {stats.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

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
  const [syncingEventbriteId, setSyncingEventbriteId] = useState<number | null>(null);
  const [loadingEventbriteOrdersId, setLoadingEventbriteOrdersId] = useState<number | null>(null);
  const [eventbriteRefundStatus, setEventbriteRefundStatus] = useState<EventbriteRefundStatus>('');
  const [eventbriteConnection, setEventbriteConnection] =
    useState<EventbriteConnectionStatus | null>(null);
  const [isCheckingEventbriteConnection, setIsCheckingEventbriteConnection] = useState(false);
  const [eventbriteOrdersByEventId, setEventbriteOrdersByEventId] = useState<
    Record<number, EventbriteOrdersPage>
  >({});
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

  const clearAuth = useCallback(() => {
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
  }, []);

  const handleAuthError = useCallback((error: unknown): boolean => {
    if (isInfoCulturaAuthError(error)) {
      clearAuth();
      return true;
    }

    return false;
  }, [clearAuth]);

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
        error instanceof Error ? error.message : 'Não foi possível aplicar a ação em lote.';
      setNewsError(message);
    } finally {
      setIsApplyingBulkNews(false);
    }
  }

  async function handleBulkDeleteNews() {
    if (!token || selectedNewsIds.length === 0) return;
    if (!window.confirm('Apagar as notícias selecionadas?')) return;

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
        error instanceof Error ? error.message : 'Não foi possível apagar as notícias selecionadas.';
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
        error instanceof Error ? error.message : 'Não foi possível aplicar a ação em lote.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar os livros selecionados.';
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
      if (handleAuthError(error)) return;
      const message =
        error instanceof Error ? error.message : 'Não foi possível apagar os eventos selecionados.';
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
        error instanceof Error ? error.message : 'Não foi possível aplicar a ação em lote.';
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
<<<<<<< Updated upstream
=======
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

    if (activeSection === 'eventbrite') {
      setActivityTab('events');
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
>>>>>>> Stashed changes
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
          error instanceof Error ? error.message : 'Não foi possível carregar o resumo.';
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
          error instanceof Error ? error.message : 'Não foi possível carregar as notificacoes.';
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

  function getSubmitAction(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    return submitter?.value || '';
  }

  function getTodayInputValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async function handleSaveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const submitAction = getSubmitAction(event);

    const payload = {
      area: contentForm.area,
      title: contentForm.title.trim(),
      description: contentForm.description.trim(),
      date: contentForm.date,
      status: contentForm.status
    };

    if (submitAction === 'publish_now') {
      payload.status = 'publicado';
      payload.date = getTodayInputValue();
    }

    if (submitAction === 'schedule') {
      payload.status = 'publicado';
      if (!payload.date) {
        setPanelError('Escolhe a data para agendar o conteúdo.');
        return;
      }
    }

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
        error instanceof Error ? error.message : 'Não foi possível guardar o conteúdo.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar o conteúdo.';
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
      setUserFormError('Ativa a geração automatica ou indica uma password.');
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
        error instanceof Error ? error.message : 'Não foi possível guardar o utilizador.';
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
        error instanceof Error ? error.message : 'Não foi possível desativar o utilizador.';
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
      setClubFormError('O nome do clube é obrigatório.');
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
        error instanceof Error ? error.message : 'Não foi possível guardar o clube.';
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
        error instanceof Error ? error.message : 'Não foi possível carregar a imagem do clube.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar o clube.';
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
        error instanceof Error ? error.message : 'Não foi possível associar o utilizador.';
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
          : 'Não foi possível remover o utilizador do clube.';
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

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submitAction = submitter?.value || '';
    const payload: NewsPayload = {
      title: newsForm.title.trim(),
      summary: newsForm.summary.trim(),
      image: newsForm.image.trim(),
      content: newsForm.content.trim(),
      news_status: newsForm.news_status,
      published_at: newsForm.published_at || null,
      ...(newsForm.club_id ? { club_id: Number(newsForm.club_id) } : {})
    };

    if (submitAction === 'publish_now') {
      payload.news_status = 'published';
      payload.published_at = payload.published_at || toDateTimeLocalValue(new Date().toISOString());
    }

    if (submitAction === 'schedule') {
      payload.news_status = 'published';
      if (!payload.published_at) {
        setNewsFormError('Seleciona a data e hora para agendar a publicação.');
        return;
      }
    }

    if (!payload.title || !payload.summary || !payload.content || !payload.news_status) {
      setNewsFormError('Preenche o título, resumo, conteúdo e estado.');
      return;
    }

    if (canManageUsers && !payload.club_id) {
      setNewsFormError('Seleciona o clube da notícia.');
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
        error instanceof Error ? error.message : 'Não foi possível guardar a noticia.';
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
        error instanceof Error ? error.message : 'Não foi possível carregar a imagem.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar a noticia.';
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
      available_at: toDateTimeLocalValue(item.created_at),
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
        error instanceof Error ? error.message : 'Não foi possível carregar a capa.';
      setBookFormError(message);
    } finally {
      setIsUploadingBookImage(false);
      setBookImageFileKey((prev) => prev + 1);
    }
  }

  async function handleSaveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const submitAction = getSubmitAction(event);

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
      created_at: bookForm.available_at || null,
      ...(resolvedBookClubId ? { club_id: resolvedBookClubId } : {})
    };

    if (submitAction === 'publish_now') {
      payload.created_at = toDateTimeLocalValue(new Date().toISOString());
    }

    if (submitAction === 'schedule' && !payload.created_at) {
      setBookFormError('Escolhe a data/hora para agendar o livro.');
      return;
    }

    if (!payload.title || !payload.author || !payload.summary || !payload.publication_year) {
      setBookFormError('Preenche o título, autor, ano e resumo.');
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
        error instanceof Error ? error.message : 'Não foi possível guardar o livro.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar o livro.';
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
      setCategoryFormError('Preenche o nome e a descrição da categoria.');
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
        error instanceof Error ? error.message : 'Não foi possível guardar a categoria.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar a categoria.';
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
      available_at: toDateTimeLocalValue(item.created_at),
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
    const submitAction = getSubmitAction(event);

    const resolvedSessionClubId = canManageUsers
      ? (sessionForm.club_id ? Number(sessionForm.club_id) : null)
      : currentUser?.club_id ?? null;

    const payload: SessionPayload = {
      name: sessionForm.name.trim(),
      title: sessionForm.title.trim(),
      description: sessionForm.description.trim(),
      session_date: sessionForm.session_date,
      start_date: sessionForm.start_date,
      end_date: sessionForm.end_date,
      created_at: sessionForm.available_at || null,
      enable_registrations: sessionForm.enable_registrations,
      registration_capacity: sessionForm.registration_capacity
        ? Number(sessionForm.registration_capacity)
        : null,
      ...(resolvedSessionClubId ? { club_id: resolvedSessionClubId } : {})
    };

    if (submitAction === 'publish_now') {
      payload.created_at = toDateTimeLocalValue(new Date().toISOString());
    }

    if (submitAction === 'schedule' && !payload.created_at) {
      setSessionFormError('Escolhe a data/hora para agendar a sessão.');
      return;
    }

    if (
      !payload.name ||
      !payload.title ||
      !payload.description ||
      !payload.session_date ||
      !payload.start_date ||
      !payload.end_date
    ) {
      setSessionFormError('Preenche o nome, título, descrição e datas da sessão.');
      return;
    }

    if (!payload.club_id) {
      setSessionFormError('Seleciona o clube da sessão.');
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
        error instanceof Error ? error.message : 'Não foi possível guardar a sessão.';
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
        error instanceof Error ? error.message : 'Não foi possível apagar a sessão.';
      setActivityError(message);
    } finally {
      setDeletingSessionId(null);
    }
  }

  function handleEditEvent(item: InfoCulturaEvent) {
    const venue = item.eventbrite_venue || null;
    const firstTicket = item.eventbrite_ticket_classes?.[0] || null;
    setEditingEventId(item.id);
    setEventImageFileKey((prev) => prev + 1);
    setEventForm({
      title: item.title,
      description: item.description,
      event_date: toDateInputValue(item.event_date),
      start_date: toDateTimeLocalValue(item.start_date),
      end_date: toDateTimeLocalValue(item.end_date),
      publish_at: toDateTimeLocalValue(item.created_at),
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
      eventbrite_venue_id: item.eventbrite_venue_id || '',
      eventbrite_venue_name: venue?.name || item.location || '',
      eventbrite_venue_address_1: venue?.address_1 || item.location || '',
      eventbrite_venue_address_2: venue?.address_2 || '',
      eventbrite_venue_city: venue?.city || item.city || '',
      eventbrite_venue_region: venue?.region || '',
      eventbrite_venue_postal_code: venue?.postal_code || '',
      eventbrite_venue_country: venue?.country || 'PT',
      eventbrite_venue_capacity:
        venue?.capacity === null || venue?.capacity === undefined ? '' : String(venue.capacity),
      eventbrite_ticket_name: firstTicket?.name || 'Entrada geral',
      eventbrite_ticket_type: firstTicket?.type || 'free',
      eventbrite_ticket_quantity:
        firstTicket?.quantity_total === null || firstTicket?.quantity_total === undefined
          ? item.registration_capacity
            ? String(item.registration_capacity)
            : ''
          : String(firstTicket.quantity_total),
      eventbrite_ticket_price:
        firstTicket?.price === null || firstTicket?.price === undefined ? '' : String(firstTicket.price),
      sync_eventbrite_on_save: false,
      publish_eventbrite_on_save: false,
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
    const submitAction = getSubmitAction(event);

    const venuePayload =
      eventForm.eventbrite_venue_name.trim() ||
      eventForm.eventbrite_venue_address_1.trim() ||
      eventForm.eventbrite_venue_city.trim()
        ? {
            name: eventForm.eventbrite_venue_name.trim() || eventForm.location.trim(),
            address_1: eventForm.eventbrite_venue_address_1.trim() || eventForm.location.trim(),
            address_2: eventForm.eventbrite_venue_address_2.trim(),
            city: eventForm.eventbrite_venue_city.trim() || eventForm.city.trim(),
            region: eventForm.eventbrite_venue_region.trim(),
            postal_code: eventForm.eventbrite_venue_postal_code.trim(),
            country: eventForm.eventbrite_venue_country.trim() || 'PT',
            capacity: eventForm.eventbrite_venue_capacity
              ? Number(eventForm.eventbrite_venue_capacity)
              : null,
          }
        : null;
    const ticketPayload =
      eventForm.eventbrite_ticket_name.trim() || eventForm.eventbrite_ticket_quantity
        ? [
            {
              name: eventForm.eventbrite_ticket_name.trim() || 'Entrada geral',
              type: eventForm.eventbrite_ticket_type,
              quantity_total: eventForm.eventbrite_ticket_quantity
                ? Number(eventForm.eventbrite_ticket_quantity)
                : Number(eventForm.registration_capacity || 100),
              price:
                eventForm.eventbrite_ticket_type === 'paid' && eventForm.eventbrite_ticket_price
                  ? Number(eventForm.eventbrite_ticket_price)
                  : null,
            },
          ]
        : null;
    const payload: EventPayload = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      event_date: eventForm.event_date,
      start_date: eventForm.start_date,
      end_date: eventForm.end_date,
      created_at: eventForm.publish_at || null,
      image: eventForm.image.trim(),
      is_external: eventForm.is_external,
      enable_registrations: eventForm.enable_registrations,
      registration_capacity: eventForm.registration_capacity
        ? Number(eventForm.registration_capacity)
        : null,
      status: eventForm.status.trim(),
      city: eventForm.city.trim(),
      location: eventForm.location.trim(),
      eventbrite_venue_id: eventForm.eventbrite_venue_id.trim(),
      eventbrite_venue: venuePayload,
      eventbrite_ticket_classes: ticketPayload,
      ...(eventForm.club_id ? { club_id: Number(eventForm.club_id) } : {}),
      category_ids: eventForm.category_ids.map(Number)
    };

    if (submitAction === 'publish_now') {
      payload.status = 'published';
      payload.created_at = toDateTimeLocalValue(new Date().toISOString());
    }

    if (submitAction === 'schedule') {
      payload.status = 'published';
      if (!payload.created_at) {
        setEventFormError('Escolhe a data/hora para agendar o evento.');
        return;
      }
    }

    if (
      !payload.title ||
      !payload.description ||
      !payload.event_date ||
      !payload.start_date ||
      !payload.end_date ||
      !payload.status
    ) {
      setEventFormError('Preenche o título, descrição, estado e datas do evento.');
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
      const finalEvent =
        eventForm.sync_eventbrite_on_save || eventForm.publish_eventbrite_on_save
          ? await syncAdminEventToEventbrite(
              token,
              savedEvent.id,
              eventForm.publish_eventbrite_on_save
            )
          : savedEvent;

      setEvents((prev) =>
        editingEventId === null
          ? [...prev, finalEvent]
          : prev.map((item) => (item.id === finalEvent.id ? finalEvent : item))
      );
      resetEventForm();
      navigate(getActivityRoute('events', 'list'));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível guardar o evento.';
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
        error instanceof Error ? error.message : 'Não foi possível carregar a imagem.';
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
      if (handleAuthError(error)) return;
      const message =
        error instanceof Error ? error.message : 'Não foi possível apagar o evento.';
      setActivityError(message);
    } finally {
      setDeletingEventId(null);
    }
  }

  async function handleSyncEventbrite(id: number, publish = false) {
    if (!token) return;

    setSyncingEventbriteId(id);
    setActivityError('');

    try {
      const syncedEvent = await syncAdminEventToEventbrite(token, id, publish);
      setEvents((prev) => prev.map((item) => (item.id === syncedEvent.id ? syncedEvent : item)));
    } catch (error) {
      if (handleAuthError(error)) return;
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel sincronizar com a Eventbrite.';
      setActivityError(message);
    } finally {
      setSyncingEventbriteId(null);
    }
  }

  async function handleCheckEventbriteConnection() {
    if (!token) return;

    setIsCheckingEventbriteConnection(true);
    setActivityError('');

    try {
      const connection = await fetchAdminEventbriteConnection(token);
      setEventbriteConnection(connection);
    } catch (error) {
      if (handleAuthError(error)) return;
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel verificar a Eventbrite.';
      setEventbriteConnection({ connected: false, message });
      setActivityError(message);
    } finally {
      setIsCheckingEventbriteConnection(false);
    }
  }

  async function handleLoadEventbriteOrders(id: number, refundStatus = eventbriteRefundStatus) {
    if (!token) return;

    setLoadingEventbriteOrdersId(id);
    setActivityError('');

    try {
      const ordersPage = await fetchAdminEventbriteOrders(token, id, refundStatus);
      setEventbriteOrdersByEventId((prev) => ({ ...prev, [id]: ordersPage }));
    } catch (error) {
      if (handleAuthError(error)) return;
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar os pedidos da Eventbrite.';
      setActivityError(message);
    } finally {
      setLoadingEventbriteOrdersId(null);
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
        error instanceof Error ? error.message : 'Não foi possível atualizar a inscricao.';
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
                  <p className={infoLegacyBrandSub}>Gestão cultural interna</p>
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
                      {getLocaleText(locale, 'Laboratório Cultural', 'Cultural Laboratory')}
                    </h3>
                    <p className={infoLegacyBlockText}>
                      {getLocaleText(locale, 'A nossa abordagem cultural e interdisciplinar, promove a criação artística, participação académica e ligação com a comunidade.', 'Our cultural approach is interdisciplinary, promoting artistic creation, academic participation and connection with the community.')}
                    </p>
                    <ul className={infoLegacyBlockList}>
                      <li>{getLocaleText(locale, 'Organizar programação cultural', 'Organize cultural programming')}</li>
                      <li>{getLocaleText(locale, 'Atualizar notícias por área', 'Update news by area')}</li>
                      <li>{getLocaleText(locale, 'Gerir conteúdo em rascunho e publicado', 'Manage content in draft and published')}</li>
                    </ul>
                  </div>

                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>{getLocaleText(locale, 'Primeiro acesso', 'First Access')}</h3>
                    <p className={infoLegacyBlockText}>
                      {getLocaleText(locale, 'Se é a primeira vez a usar o portal, contacte a equipa técnica para ', 'If this is your first time using the portal, contact the technical team to')}
                      {getLocaleText(locale, 'atribuição de credênciais de administrador.', 'request administrator credentials.')}
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
              {getLocaleText(locale, 'Terminar sessão', 'End session')}
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
                <p className={adminPortalSidebarSub}>{getLocaleText(locale, 'Gestão cultural interna', 'Internal Cultural Management')}</p>
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
                title="Centro de Notificações"
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
                  <p className={adminInfo}>{getLocaleText(locale, 'A carregar notificações...', 'Loading notifications...')}</p>
                ) : null}
                {notificationError ? <p className={adminError}>{notificationError}</p> : null}

                {!isLoadingNotifications && latestNotifications.length === 0 ? (
                  <p className={adminInfo}>{getLocaleText(locale, 'Não existem notificações para mostrar.', 'There are no notifications to display.')}</p>
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
            </div>
          ) : null}

          {activeSection === 'atividades' ? (
            <div className="space-y-6">
              <AdminPageHero
                icon={CalendarClock}
                title="Atividades"
                description="Gestao integrada de livros, sessoes e eventos com filtros, agenda e workflow."
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
                  {!isLoadingActivities ? (
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
                  {!isLoadingActivities ? (
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

                  <div className={adminList}>
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
                  {!isLoadingActivities ? (
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
            </div>
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
                  description={getLocaleText(locale, 'Gestão editorial das áreas permanentes do Laboratório Cultural.', 'Editorial management of the permanent areas of the Cultural Laboratory.')}
                  tone="emerald"
                  stats={contentOverviewStats}
                />

              {showContentForm ? (
              <form id="content-form" onSubmit={handleSaveContent} className={adminPanelForm}>
                <h2 className={blockTitle}>
                  {editingId ? getLocaleText(locale, 'Editar Conteúdo', 'Edit Content') : getLocaleText(locale, 'Novo Conteúdo', 'New Content')}
                </h2>
                <p className={blockText}>
                  {getLocaleText(locale, 'Cria ou atualiza conteúdo para as páginas do Laboratório Cultural.', 'Create or update content for the pages of the Cultural Laboratory.')}
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
                      <option value="tuna">{getLocaleText(locale, 'Tuna Académica', 'Academic Tuna')}</option>
                      <option value="clube-leitura">{getLocaleText(locale, 'Clube de Leitura', 'Reading Club')}</option>
                      <option value="teatro">{getLocaleText(locale, 'Teatro', 'Theater')}</option>
                    </select>
                  </div>

                  <div className={adminField}>
	                    <label className={adminLabel} htmlFor="date">
	                      {getLocaleText(locale, 'Publicar em', 'Publish on')}
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
	                    <p className={blockText}>
	                      {getLocaleText(
	                        locale,
	                        'Usa "Publicar agora" para publicar imediatamente ou escolhe uma data futura e clica em "Agendar".',
	                        'Use "Publish now" to publish immediately or choose a future date and click "Schedule".'
	                      )}
	                    </p>
	                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="title">
                      {getLocaleText(locale, 'Título', 'Title')}
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
                    {getLocaleText(locale, 'Descrição', 'Description')}
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
	                    type="submit"
	                    name="contentAction"
	                    value="publish_now"
	                    className={adminBtnSecondary}
	                    disabled={isSavingContent}
	                  >
	                    {getLocaleText(locale, 'Publicar agora', 'Publish now')}
	                  </button>
	                  <button
	                    type="submit"
	                    name="contentAction"
	                    value="schedule"
	                    className={adminBtnSecondary}
	                    disabled={isSavingContent}
	                  >
	                    {getLocaleText(locale, 'Agendar', 'Schedule')}
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
                  <p className={adminInfo}> {getLocaleText(locale, 'A carregar conteúdos...', 'Loading content...')}</p>  
                ) : null}
                {sortedItems.map((item) => (
                  <article key={item.id} className={adminListItem}>
                    <div className={adminListTop}>
                      <div className={adminListHeader}>
                        <h3 className={`${adminListTitle} break-words leading-snug`}>{item.title}</h3>
                        <p className={adminListMeta}>
                          <span className={adminListBadge}>{getAreaLabel(item.area)}</span>
                          <span className="mx-2 text-slate-300">·</span>
                          {item.date} · {item.status}
                        </p>
                      </div>

                      <div className={`${adminListTools} mt-0 shrink-0`}>
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
                    </div>

                    <p className={`${adminListDesc} break-words`}>{item.description}</p>
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
