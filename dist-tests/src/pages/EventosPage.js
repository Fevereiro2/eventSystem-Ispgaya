import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import PaginatedCollection from '../components/containers/PaginatedCollection';
import PublicMediaListItem from '../components/containers/PublicMediaListItem';
import PublicPageContainer from '../components/containers/PublicPageContainer';
import { fetchPublicEvents, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { formatPublicDate } from '../utils/dateFormat';
const ITEMS_PER_PAGE = 8;
function EventosPage() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    useEffect(() => {
        let active = true;
        async function loadEvents() {
            try {
                const response = await fetchPublicEvents();
                if (!active)
                    return;
                setEvents(response);
            }
            catch (error) {
                if (!active)
                    return;
                setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os eventos.');
            }
            finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }
        void loadEvents();
        return () => {
            active = false;
        };
    }, []);
    const sortedEvents = useMemo(() => [...events].sort((left, right) => {
        const leftTime = new Date(left.start_date || left.event_date).getTime();
        const rightTime = new Date(right.start_date || right.event_date).getTime();
        return rightTime - leftTime;
    }), [events]);
    return (_jsx(PublicPageContainer, { title: "Eventos", description: "Agenda p\u00FAblica de eventos.", parentLabel: "Vida Acad\u00E9mica", parentHref: "/vida-academica/eventos", currentLabel: "Eventos", currentHref: "/vida-academica/eventos", children: _jsx(PaginatedCollection, { items: sortedEvents, isLoading: isLoading, error: loadError, loadingMessage: "A carregar eventos...", emptyMessage: "Ainda n\u00E3o existem eventos publicados.", itemsPerPage: ITEMS_PER_PAGE, renderItem: (item) => {
                const itemDate = item.start_date || item.event_date;
                return (_jsx(PublicMediaListItem, { title: item.title, href: `/vida-academica/eventos/${item.id}`, imageUrl: resolveInfoCulturaAssetUrl(item.image), imageAlt: item.title, dateTime: itemDate, formattedDate: formatPublicDate(itemDate), description: item.description, tags: item.categories.map((category) => (_jsxs("span", { className: "inline-block text-sm font-medium text-orange-400", children: ["#", category.name.toLowerCase().replace(/\s+/g, '')] }, category.id))) }, item.id));
            } }) }));
}
export default EventosPage;
