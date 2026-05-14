import { useEffect } from 'react';
import { fetchAdminNews, fetchAdminNewsStatuses, } from '../../../api/infoculturaApi';
export function useAdminNews({ token, currentUser, activeSection, canManageUsers, newsClubFilter, newsStatusFilter, newsSearch, newsOrder, newsDateFrom, newsDateTo, newsPage, setIsLoadingNews, setIsLoadingNewsStatuses, setNewsStatuses, setNewsItems, setNewsTotal, setNewsTotalPages, setNewsError, handleAuthError, pageSize, }) {
    useEffect(() => {
        if (!token || !currentUser || activeSection !== 'noticias') {
            return;
        }
        let isMounted = true;
        setIsLoadingNews(true);
        setIsLoadingNewsStatuses(true);
        setNewsError('');
        const clubId = canManageUsers && newsClubFilter !== 'all' ? Number(newsClubFilter) : undefined;
        const status = newsStatusFilter && newsStatusFilter !== 'all' ? newsStatusFilter : undefined;
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
                pageSize,
            }),
        ])
            .then(([nextStatuses, newsPageData]) => {
            if (!isMounted)
                return;
            setNewsStatuses(nextStatuses);
            setNewsItems(newsPageData.items);
            setNewsTotal(newsPageData.total);
            setNewsTotalPages(newsPageData.total_pages);
        })
            .catch((error) => {
            if (!isMounted)
                return;
            if (handleAuthError(error))
                return;
            const message = error instanceof Error ? error.message : 'Nao foi possivel carregar as noticias.';
            setNewsError(message);
        })
            .finally(() => {
            if (!isMounted)
                return;
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
        newsPage,
    ]);
}
