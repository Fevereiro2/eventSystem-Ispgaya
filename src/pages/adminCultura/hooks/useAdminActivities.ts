import { useEffect } from 'react';

import {
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaEvent,
  InfoCulturaSession,
  fetchAdminBooks,
  fetchAdminCategories,
  fetchAdminEvents,
  fetchAdminSessions,
} from '../../../api/infoculturaApi';
import { ActivityTab } from '../types';

type UseAdminActivitiesOptions = {
  token: string;
  currentUser: unknown;
  activeSection: string | null;
  canManageUsers: boolean;
  activityTab: ActivityTab;
  activityClubFilter: string;
  activityCategoryFilter: string;
  activityStatusFilter: string;
  activitySearch: string;
  activityOrder: string;
  activityDateFrom: string;
  activityDateTo: string;
  activityPage: number;
  setIsLoadingActivities: (value: boolean) => void;
  setIsLoadingCategories: (value: boolean) => void;
  setCategories: (value: InfoCulturaCategory[]) => void;
  setBooks: (value: InfoCulturaBook[]) => void;
  setSessions: (value: InfoCulturaSession[]) => void;
  setEvents: (value: InfoCulturaEvent[]) => void;
  setActivityTotal: (value: number) => void;
  setActivityTotalPages: (value: number) => void;
  setActivityError: (value: string) => void;
  handleAuthError: (error: unknown) => boolean;
  pageSize: number;
};

export function useAdminActivities({
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
  pageSize,
}: UseAdminActivitiesOptions) {
  useEffect(() => {
    if (
      !token ||
      !currentUser ||
      !activeSection ||
      !['atividades', 'livros', 'sessoes', 'eventos', 'eventbrite'].includes(activeSection)
    ) {
      return;
    }

    let isMounted = true;
    setIsLoadingActivities(true);
    setIsLoadingCategories(true);
    setActivityError('');

    const clubId =
      canManageUsers && activityClubFilter !== 'all' ? Number(activityClubFilter) : undefined;
    const categoryId =
      activityCategoryFilter !== 'all' ? Number(activityCategoryFilter) : undefined;
    const status = activityStatusFilter && activityStatusFilter !== 'all' ? activityStatusFilter : undefined;

    const effectiveTab = activeSection === 'eventbrite' ? 'events' : activityTab;
    const activityRequest =
      effectiveTab === 'books'
        ? fetchAdminBooks(token, {
            clubId,
            search: activitySearch,
            ordering: activityOrder,
            dateFrom: activityDateFrom,
            dateTo: activityDateTo,
            page: activityPage,
            pageSize,
          })
        : effectiveTab === 'sessions'
          ? fetchAdminSessions(token, {
              clubId,
              search: activitySearch,
              ordering: activityOrder,
              dateFrom: activityDateFrom,
              dateTo: activityDateTo,
              page: activityPage,
              pageSize,
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
              pageSize,
            });

    void Promise.all([fetchAdminCategories(token), activityRequest])
      .then(([nextCategories, activityPageData]) => {
        if (!isMounted) return;
        setCategories(nextCategories);
        setActivityTotal(activityPageData.total);
        setActivityTotalPages(activityPageData.total_pages);
        if (effectiveTab === 'books') {
          setBooks(activityPageData.items as InfoCulturaBook[]);
        } else if (effectiveTab === 'sessions') {
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
    activityTab,
  ]);
}
