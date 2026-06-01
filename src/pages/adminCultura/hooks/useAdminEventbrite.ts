import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

import {
  EventbriteOrdersPage,
  EventbriteRefundStatus,
  fetchAdminEventbriteOrders,
  InfoCulturaEvent,
  syncAdminEventToEventbrite,
} from '../../../api/infoculturaApi';

type UseAdminEventbriteOptions = {
  token: string;
  setEvents: Dispatch<SetStateAction<InfoCulturaEvent[]>>;
  setActivityError: (value: string) => void;
  handleAuthError: (error: unknown) => boolean;
};

export function useAdminEventbrite({
  token,
  setEvents,
  setActivityError,
  handleAuthError,
}: UseAdminEventbriteOptions) {
  const [syncingEventbriteId, setSyncingEventbriteId] = useState<number | null>(null);
  const [loadingEventbriteOrdersId, setLoadingEventbriteOrdersId] = useState<number | null>(null);
  const [eventbriteRefundStatus, setEventbriteRefundStatus] = useState<EventbriteRefundStatus>('');
  const [eventbriteOrdersByEventId, setEventbriteOrdersByEventId] = useState<
    Record<number, EventbriteOrdersPage>
  >({});

  const handleSyncEventbrite = useCallback(
    async (id: number, publish = false) => {
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
    },
    [token, setActivityError, setEvents, handleAuthError]
  );

  const handleLoadEventbriteOrders = useCallback(
    async (id: number, refundStatus = eventbriteRefundStatus) => {
      if (!token) return;

      setLoadingEventbriteOrdersId(id);
      setActivityError('');

      try {
        const ordersPage = await fetchAdminEventbriteOrders(token, id, refundStatus);
        setEventbriteOrdersByEventId((prev) => ({ ...prev, [id]: ordersPage }));
      } catch (error) {
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar os pedidos da Eventbrite.';
        setActivityError(message);
      } finally {
        setLoadingEventbriteOrdersId(null);
      }
    },
    [token, eventbriteRefundStatus, setActivityError, handleAuthError]
  );

  return {
    syncingEventbriteId,
    loadingEventbriteOrdersId,
    eventbriteRefundStatus,
    setEventbriteRefundStatus,
    eventbriteOrdersByEventId,
    handleSyncEventbrite,
    handleLoadEventbriteOrders,
  };
}
