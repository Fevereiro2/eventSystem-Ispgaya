import { Bell, CalendarClock, FilePlus2, Newspaper, Users, type LucideIcon } from 'lucide-react';

import type {
  InfoCulturaAdminNotification,
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaDashboardStats,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaSession,
  InfoCulturaUser,
} from '../../api/infoculturaApi.js';
import {
  adminSectionGroups,
  adminSections,
  activityTabBySection,
} from './constants.js';
import type { ActivityTab, AdminContextLink, AdminSection } from './types.js';
import { formatAdminDateTime, getWorkflowStatusLabel, normalizeWorkflowStatus } from './utils.js';

export type AdminOverviewStat = { label: string; value: string | number };

export type DashboardHighlight = {
  label: string;
  value: string | number;
  tone: 'slate' | 'amber' | 'blue' | 'rose';
  icon: LucideIcon;
};

export type DashboardAlert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  level: string;
  is_read: boolean;
  created_at: string | null;
};

export type DashboardAction = {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardAgendaEntry = {
  label: string;
  title: string;
  meta: string;
  date: string;
  href: string;
};

export function getVisibleSections(canManageUsers: boolean, allowedActivityTabs: ActivityTab[]) {
  return adminSections.filter((section) => {
    if (section.id === 'clubes') {
      return canManageUsers;
    }

    if (section.id === 'livros' || section.id === 'sessoes' || section.id === 'eventos') {
      return allowedActivityTabs.includes(activityTabBySection[section.id]);
    }

    return true;
  });
}

export function getVisibleSectionGroups(visibleSections: typeof adminSections) {
  return adminSectionGroups
    .map((group) => ({
      ...group,
      sections: visibleSections.filter((section) => group.ids.includes(section.id)),
    }))
    .filter((group) => group.sections.length > 0);
}

export function getActivitySectionCopy(activityTab: ActivityTab) {
  if (activityTab === 'books') {
    return {
      label: 'Livros',
      description: 'Gestao editorial dos livros associados aos clubes.',
    };
  }

  if (activityTab === 'sessions') {
    return {
      label: 'Sessoes',
      description: 'Planeamento e acompanhamento das sessoes de cada clube.',
    };
  }

  return {
    label: 'Eventos',
    description: 'Programacao e workflow editorial dos eventos culturais.',
  };
}

export function getNewsPageLinks(editingNewsId: number | null): AdminContextLink[] {
  return [
    { label: editingNewsId ? 'Editar Noticia' : 'Nova Noticia', href: '/infocultura/noticias/nova' },
    { label: 'Noticias Registadas', href: '/infocultura/noticias/registadas' },
  ];
}

export function getActivityPageLinks(
  activityTab: ActivityTab,
  editingBookId: number | null,
  editingSessionId: number | null,
  editingEventId: number | null
): AdminContextLink[] {
  if (activityTab === 'books') {
    return [
      { label: editingBookId ? 'Editar Livro' : 'Novo Livro', href: '/infocultura/livros/novo' },
      { label: 'Livros Registados', href: '/infocultura/livros/registados' },
    ];
  }

  if (activityTab === 'sessions') {
    return [
      { label: editingSessionId ? 'Editar Sessao' : 'Nova Sessao', href: '/infocultura/sessoes/novo' },
      { label: 'Sessoes Registadas', href: '/infocultura/sessoes/registados' },
    ];
  }

  return [
    { label: editingEventId ? 'Editar Evento' : 'Novo Evento', href: '/infocultura/eventos/novo' },
    { label: 'Eventos Registados', href: '/infocultura/eventos/registados' },
    { label: 'Categorias de Eventos', href: '/infocultura/eventos/categorias' },
  ];
}

export function getContentPageLinks(editingId: string | null): AdminContextLink[] {
  return [
    { label: editingId ? 'Editar Conteudo' : 'Novo Conteudo', href: '/infocultura/conteudos/novo' },
    { label: 'Conteudos Registados', href: '/infocultura/conteudos/registados' },
  ];
}

export function buildSidebarContextNav(
  activityTab: ActivityTab,
  newsPageLinks: AdminContextLink[],
  activityPageLinks: AdminContextLink[],
  contentPageLinks: AdminContextLink[],
  newsPageHref: string | null,
  activityPageHref: string | null,
  contentPageHref: string | null
): Partial<Record<AdminSection, { links: AdminContextLink[]; activeHref?: string | null }>> {
  return {
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
  };
}

export function buildDashboardCards(
  dashboardStats: InfoCulturaDashboardStats | null
): AdminOverviewStat[] {
  if (!dashboardStats) {
    return [];
  }

  return [
    { label: 'Utilizadores ativos', value: dashboardStats.active_users },
    { label: 'Noticias publicadas', value: dashboardStats.news_published },
    { label: 'Noticias em revisao', value: dashboardStats.news_review },
    { label: 'Eventos em revisao', value: dashboardStats.events_review },
    { label: 'Livros em destaque', value: dashboardStats.featured_books },
    { label: 'Sessoes proximas', value: dashboardStats.upcoming_sessions },
    { label: 'Inscricoes pendentes', value: dashboardStats.registrations_pending },
    { label: 'Clubes com inscricoes abertas', value: dashboardStats.clubs_with_registrations_open },
  ];
}

export function buildDashboardHighlights(
  dashboardStats: InfoCulturaDashboardStats | null,
  activeUsers: number,
  publishedItems: number,
  pendingRegistrations: number,
  sessionsLength: number
): DashboardHighlight[] {
  return [
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
      value: dashboardStats?.upcoming_sessions ?? sessionsLength,
      tone: 'blue',
      icon: CalendarClock,
    },
    {
      label: 'Inscricoes pendentes',
      value: dashboardStats?.registrations_pending ?? pendingRegistrations,
      tone: 'rose',
      icon: Bell,
    },
  ];
}

export function buildDashboardAlerts(
  notifications: InfoCulturaAdminNotification[],
  readNotificationIdSet: Set<string>,
  dashboardStats: InfoCulturaDashboardStats | null,
  pendingRegistrations: number
): DashboardAlert[] {
  if (notifications.length > 0) {
    return notifications.slice(0, 4).map((notification) => ({
      id: notification.id,
      title: notification.title,
      detail: notification.message,
      href: notification.href,
      level: notification.level,
      is_read: readNotificationIdSet.has(notification.id),
      created_at: notification.created_at || null,
    }));
  }

  return [
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
  ];
}

export function buildDashboardAgenda(dashboardStats: InfoCulturaDashboardStats | null): DashboardAgendaEntry[] {
  return [
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
            dashboardStats.next_event.status ? ` · ${getWorkflowStatusLabel(dashboardStats.next_event.status)}` : ''
          }`,
          date: formatAdminDateTime(dashboardStats.next_event.date || ''),
          href: '/infocultura/eventos',
        }
      : null,
  ].filter(Boolean) as DashboardAgendaEntry[];
}

export function buildDashboardQuickActions(
  canManageUsers: boolean,
  defaultActivityHref: string
): DashboardAction[] {
  const actions: DashboardAction[] = [
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
}

export function buildNotificationOverviewStats(
  notifications: InfoCulturaAdminNotification[],
  unreadCount: number
): AdminOverviewStat[] {
  return [
    { label: 'Total', value: notifications.length },
    { label: 'Por ler', value: unreadCount },
    {
      label: 'Editoriais',
      value: notifications.filter((notification) => notification.kind === 'editorial').length,
    },
    {
      label: 'Agenda',
      value: notifications.filter((notification) => notification.kind === 'schedule').length,
    },
  ];
}

export function buildUserOverviewStats(users: InfoCulturaUser[]): AdminOverviewStat[] {
  return [
    { label: 'Total', value: users.length },
    { label: 'Ativos', value: users.filter((user) => user.is_active).length },
    { label: 'Inativos', value: users.filter((user) => !user.is_active).length },
    { label: 'Club admins', value: users.filter((user) => user.role === 'club_admin').length },
  ];
}

export function buildClubOverviewStats(clubs: InfoCulturaClub[]): AdminOverviewStat[] {
  return [
    { label: 'Total', value: clubs.length },
    { label: 'Ativos', value: clubs.filter((club) => club.is_active).length },
    { label: 'Inscricoes abertas', value: clubs.filter((club) => club.enable_registrations).length },
    { label: 'Com imagem', value: clubs.filter((club) => Boolean(club.image)).length },
  ];
}

export function buildNewsOverviewStats(
  newsTotal: number,
  dashboardStats: InfoCulturaDashboardStats | null,
  selectedNewsIds: number[],
  sortedNews: InfoCulturaNews[]
): AdminOverviewStat[] {
  return [
    { label: 'Total filtrado', value: newsTotal },
    {
      label: 'Em revisao',
      value:
        dashboardStats?.news_review ??
        sortedNews.filter((item) => normalizeWorkflowStatus(item.news_status_name) === 'review').length,
    },
    { label: 'Selecionadas', value: selectedNewsIds.length },
    {
      label: 'Publicadas',
      value:
        dashboardStats?.news_published ??
        sortedNews.filter((item) => normalizeWorkflowStatus(item.news_status_name) === 'published').length,
    },
  ];
}

export function buildActivityOverviewStats(
  activityTab: ActivityTab,
  activityTotal: number,
  selectedBookIds: number[],
  selectedEventIds: number[],
  sortedBooks: InfoCulturaBook[],
  sortedCategories: InfoCulturaCategory[],
  sortedEvents: InfoCulturaEvent[],
  sortedSessions: InfoCulturaSession[]
): AdminOverviewStat[] {
  if (activityTab === 'books') {
    return [
      { label: 'Total filtrado', value: activityTotal },
      { label: 'Em destaque', value: sortedBooks.filter((item) => item.is_featured).length },
      { label: 'Selecionados', value: selectedBookIds.length },
      { label: 'Clubes na pagina', value: new Set(sortedBooks.map((item) => item.club_id)).size },
    ];
  }

  if (activityTab === 'sessions') {
    return [
      { label: 'Total filtrado', value: activityTotal },
      {
        label: 'Proximas',
        value: sortedSessions.filter((item) => new Date(item.start_date).getTime() >= Date.now())
          .length,
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
    { label: 'Em revisao', value: sortedEvents.filter((item) => normalizeWorkflowStatus(item.status) === 'review').length },
    { label: 'Selecionados', value: selectedEventIds.length },
    { label: 'Categorias', value: sortedCategories.length },
  ];
}

export function buildRegistrationOverviewStats(
  registrationTotal: number,
  pendingRegistrations: number,
  approvedRegistrations: number,
  rejectedRegistrations: number
): AdminOverviewStat[] {
  return [
    { label: 'Total filtrado', value: registrationTotal },
    { label: 'Pendentes', value: pendingRegistrations },
    { label: 'Aprovadas', value: approvedRegistrations },
    { label: 'Rejeitadas', value: rejectedRegistrations },
  ];
}

export function buildContentOverviewStats(
  sortedItems: { area: string }[],
  publishedItems: number
): AdminOverviewStat[] {
  return [
    { label: 'Total', value: sortedItems.length },
    { label: 'Publicados', value: publishedItems },
    { label: 'Rascunhos', value: Math.max(0, sortedItems.length - publishedItems) },
    {
      label: 'Areas',
      value: new Set(sortedItems.map((item) => item.area)).size,
    },
  ];
}
