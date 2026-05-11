import { useEffect } from 'react';
import { fetchAdminBooks, fetchAdminCategories, fetchAdminEvents, fetchAdminSessions, } from '../../../api/infoculturaApi';
export function useAdminActivities({ token, currentUser, activeSection, canManageUsers, activityTab, activityClubFilter, activityCategoryFilter, activityStatusFilter, activitySearch, activityOrder, activityDateFrom, activityDateTo, activityPage, setIsLoadingActivities, setIsLoadingCategories, setCategories, setBooks, setSessions, setEvents, setActivityTotal, setActivityTotalPages, setActivityError, handleAuthError, pageSize, }) {
    useEffect(() => {
        if (!token ||
            !currentUser ||
            !activeSection ||
            !['atividades', 'livros', 'sessoes', 'eventos'].includes(activeSection)) {
            return;
        }
        let isMounted = true;
        setIsLoadingActivities(true);
        setIsLoadingCategories(true);
        setActivityError('');
        const clubId = canManageUsers && activityClubFilter !== 'all' ? Number(activityClubFilter) : undefined;
        const categoryId = activityCategoryFilter !== 'all' ? Number(activityCategoryFilter) : undefined;
        const status = activityStatusFilter && activityStatusFilter !== 'all' ? activityStatusFilter : undefined;
        const activityRequest = activityTab === 'books'
            ? fetchAdminBooks(token, {
                clubId,
                search: activitySearch,
                ordering: activityOrder,
                dateFrom: activityDateFrom,
                dateTo: activityDateTo,
                page: activityPage,
                pageSize,
            })
            : activityTab === 'sessions'
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
            if (!isMounted)
                return;
            setCategories(nextCategories);
            setActivityTotal(activityPageData.total);
            setActivityTotalPages(activityPageData.total_pages);
            if (activityTab === 'books') {
                setBooks(activityPageData.items);
            }
            else if (activityTab === 'sessions') {
                setSessions(activityPageData.items);
            }
            else {
                setEvents(activityPageData.items);
            }
        })
            .catch((error) => {
            if (!isMounted)
                return;
            if (handleAuthError(error))
                return;
            const message = error instanceof Error ? error.message : 'Nao foi possivel carregar as atividades.';
            setActivityError(message);
        })
            .finally(() => {
            if (!isMounted)
                return;
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
