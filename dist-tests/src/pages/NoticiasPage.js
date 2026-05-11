import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import PaginatedCollection from '../components/containers/PaginatedCollection';
import PublicMediaListItem from '../components/containers/PublicMediaListItem';
import PublicPageContainer from '../components/containers/PublicPageContainer';
import { fetchPublicNews, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { formatPublicDate } from '../utils/dateFormat';
const ITEMS_PER_PAGE = 8;
function NoticiasPage() {
    const [newsItems, setNewsItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    useEffect(() => {
        let active = true;
        async function loadNews() {
            try {
                const response = await fetchPublicNews();
                if (!active)
                    return;
                setNewsItems(response);
            }
            catch (error) {
                if (!active)
                    return;
                setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as notícias.');
            }
            finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }
        void loadNews();
        return () => {
            active = false;
        };
    }, []);
    const sortedNews = useMemo(() => [...newsItems].sort((left, right) => {
        const leftTime = new Date(left.published_at || left.created_at).getTime();
        const rightTime = new Date(right.published_at || right.created_at).getTime();
        return rightTime - leftTime;
    }), [newsItems]);
    return (_jsx(PublicPageContainer, { title: "Not\u00EDcias", description: "Arquivo p\u00FAblico de not\u00EDcias.", parentLabel: "Vida Acad\u00E9mica", parentHref: "/vida-academica/noticias", currentLabel: "Not\u00EDcias", currentHref: "/vida-academica/noticias", children: _jsx(PaginatedCollection, { items: sortedNews, isLoading: isLoading, error: loadError, loadingMessage: "A carregar not\u00EDcias...", emptyMessage: "Ainda n\u00E3o existem not\u00EDcias publicadas.", itemsPerPage: ITEMS_PER_PAGE, renderItem: (item) => {
                const itemDate = item.published_at || item.created_at;
                return (_jsx(PublicMediaListItem, { title: item.title, href: `/vida-academica/noticias/${item.id}`, imageUrl: resolveInfoCulturaAssetUrl(item.image), imageAlt: item.title, dateTime: itemDate, formattedDate: formatPublicDate(itemDate), description: item.summary, tags: item.club_name ? (_jsxs("span", { className: "inline-block text-sm font-medium text-orange-400", children: ["#", item.club_name.toLowerCase().replace(/\s+/g, '')] })) : null }, item.id));
            } }) }));
}
export default NoticiasPage;
