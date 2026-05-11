import { useEffect, useMemo, useState } from 'react';
import PaginatedCollection from '../components/containers/PaginatedCollection';
import PublicMediaListItem from '../components/containers/PublicMediaListItem';
import PublicPageContainer from '../components/containers/PublicPageContainer';
import {
  fetchPublicEvents,
  InfoCulturaEvent,
  resolveInfoCulturaAssetUrl
} from '../api/infoculturaApi';
import { formatPublicDate } from '../utils/dateFormat';

const ITEMS_PER_PAGE = 8;

function EventosPage() {
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const response = await fetchPublicEvents();
        if (!active) return;
        setEvents(response);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os eventos.');
      } finally {
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

  const sortedEvents = useMemo(
    () =>
      [...events].sort((left, right) => {
        const leftTime = new Date(left.start_date || left.event_date).getTime();
        const rightTime = new Date(right.start_date || right.event_date).getTime();
        return rightTime - leftTime;
      }),
    [events]
  );

  return (
    <PublicPageContainer
      title="Eventos"
      description="Agenda pública de eventos."
      parentLabel="Vida Académica"
      parentHref="/vida-academica/eventos"
      currentLabel="Eventos"
      currentHref="/vida-academica/eventos"
    >
      <PaginatedCollection
        items={sortedEvents}
        isLoading={isLoading}
        error={loadError}
        loadingMessage="A carregar eventos..."
        emptyMessage="Ainda não existem eventos publicados."
        itemsPerPage={ITEMS_PER_PAGE}
        renderItem={(item) => {
          const itemDate = item.start_date || item.event_date;
          return (
            <PublicMediaListItem
              key={item.id}
              title={item.title}
              href={`/vida-academica/eventos/${item.id}`}
              imageUrl={resolveInfoCulturaAssetUrl(item.image)}
              imageAlt={item.title}
              dateTime={itemDate}
              formattedDate={formatPublicDate(itemDate)}
              description={item.description}
              tags={item.categories.map((category) => (
                <span key={category.id} className="inline-block text-sm font-medium text-orange-400">
                  #{category.name.toLowerCase().replace(/\s+/g, '')}
                </span>
              ))}
            />
          );
        }}
      />
    </PublicPageContainer>
  );
}

export default EventosPage;
