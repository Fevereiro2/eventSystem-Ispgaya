import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';

import AdminPageHero from './components/AdminPageHero.js';
import GoogleMapsLocationField from '../../components/ui/GoogleMapsLocationField.js';
import { adminNamePattern, adminNameTitle } from './nameValidation.js';
import { ActivityTab, BookFormState, CategoryFormState, EventFormState, SessionFormState } from './types';
import { formatAdminDateTime, getWorkflowStatusLabel, normalizeWorkflowStatus } from './utils';
import { EVENT_WORKFLOW_ORDER } from './constants';
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
  adminHeaderRow,
  adminInfo,
  adminInput,
  adminLabel,
  adminList,
  adminListDesc,
  adminListHeader,
  adminListItem,
  adminListMeta,
  adminListTitle,
  adminListTools,
  adminListTop,
  adminListBadge,
  adminListCheckbox,
  adminPanelCard,
  adminPanelForm,
  adminTextarea,
  blockText,
  blockTitle,
} from '../../styles/ui';
import {
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaEvent,
  InfoCulturaSession,
  EventbriteOrdersPage,
  EventbriteRefundStatus,
  EventbriteConnectionStatus,
  resolveInfoCulturaAssetUrl,
} from '../../api/infoculturaApi';

type AdminHeroStat = { label: string; value: string | number };

type CountryOption = {
  code: string;
  label: string;
};

type PtDataDistrict = {
  code: string;
  name: string;
};

const PORTUGAL_COUNTRY_CODE = 'PT';
const DEFAULT_COUNTRY_OPTIONS: CountryOption[] = [{ code: PORTUGAL_COUNTRY_CODE, label: 'Portugal' }];
const PORTUGAL_DISTRICT_OPTIONS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Região Autónoma da Madeira',
  'Região Autónoma dos Açores',
];
const PORTUGAL_FALLBACK_MUNICIPALITIES_BY_DISTRICT: Record<string, string[]> = {
  Porto: [
    'Amarante',
    'Baião',
    'Felgueiras',
    'Gondomar',
    'Lousada',
    'Maia',
    'Marco de Canaveses',
    'Matosinhos',
    'Paços de Ferreira',
    'Paredes',
    'Penafiel',
    'Porto',
    'Póvoa de Varzim',
    'Santo Tirso',
    'Trofa',
    'Valongo',
    'Vila do Conde',
    'Vila Nova de Gaia',
  ],
};

function normalizeCountryOptions(payload: unknown): CountryOption[] {
  if (!Array.isArray(payload)) {
    return DEFAULT_COUNTRY_OPTIONS;
  }

  const options = payload
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const code = 'cca2' in item && typeof item.cca2 === 'string' ? item.cca2 : '';
      const name =
        'translations' in item &&
        item.translations &&
        typeof item.translations === 'object' &&
        'por' in item.translations &&
        item.translations.por &&
        typeof item.translations.por === 'object' &&
        'common' in item.translations.por &&
        typeof item.translations.por.common === 'string'
          ? item.translations.por.common
          : 'name' in item &&
              item.name &&
              typeof item.name === 'object' &&
              'common' in item.name &&
              typeof item.name.common === 'string'
            ? item.name.common
            : '';

      if (!code || !name) {
        return null;
      }

      return { code, label: name };
    })
    .filter((item): item is CountryOption => item !== null)
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-PT'));

  return options.length > 0 ? options : DEFAULT_COUNTRY_OPTIONS;
}

function normalizePtDataDistricts(payload: unknown): PtDataDistrict[] {
  if (!payload || typeof payload !== 'object' || !('data' in payload) || !payload.data || typeof payload.data !== 'object') {
    return [];
  }

  const districts =
    'districts' in payload.data && Array.isArray(payload.data.districts) ? payload.data.districts : [];

  return districts
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const code = 'code' in item && typeof item.code === 'string' ? item.code : '';
      const name = 'name' in item && typeof item.name === 'string' ? item.name : '';
      if (!code || !name) {
        return null;
      }

      return { code, name };
    })
    .filter((item): item is PtDataDistrict => item !== null);
}

function normalizePtDataMunicipalities(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object' || !('data' in payload) || !payload.data || typeof payload.data !== 'object') {
    return [];
  }

  const municipalities =
    'municipalities' in payload.data && Array.isArray(payload.data.municipalities)
      ? payload.data.municipalities
      : [];

  return municipalities
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      return 'name' in item && typeof item.name === 'string' ? item.name : null;
    })
    .filter((item): item is string => item !== null)
    .sort((left, right) => left.localeCompare(right, 'pt-PT'));
}

export type ActivitiesPageProps = {
  activitySectionLabel: string;
  activitySectionDescription: string;
  activityOverviewStats: AdminHeroStat[];
  showActivityFiltersAndList: boolean;
  canManageUsers: boolean;
  clubs: InfoCulturaClub[];
  activityClubFilter: string;
  setActivityClubFilter: Dispatch<SetStateAction<string>>;
  activityCategoryFilter: string;
  setActivityCategoryFilter: Dispatch<SetStateAction<string>>;
  activityStatusFilter: string;
  setActivityStatusFilter: Dispatch<SetStateAction<string>>;
  activityBookFeaturedFilter: string;
  setActivityBookFeaturedFilter: Dispatch<SetStateAction<string>>;
  activitySessionLocationFilter: string;
  setActivitySessionLocationFilter: Dispatch<SetStateAction<string>>;
  activitySessionRegistrationsFilter: string;
  setActivitySessionRegistrationsFilter: Dispatch<SetStateAction<string>>;
  activityEventCityFilter: string;
  setActivityEventCityFilter: Dispatch<SetStateAction<string>>;
  activityEventLocationFilter: string;
  setActivityEventLocationFilter: Dispatch<SetStateAction<string>>;
  activityError: string;
  handleApplyActivitySearch: (event: FormEvent<HTMLFormElement>) => void;
  activitySearchInput: string;
  setActivitySearchInput: Dispatch<SetStateAction<string>>;
  setActivitySearch: Dispatch<SetStateAction<string>>;
  setActivityPage: Dispatch<SetStateAction<number>>;
  activityDateFrom: string;
  setActivityDateFrom: Dispatch<SetStateAction<string>>;
  activityDateTo: string;
  setActivityDateTo: Dispatch<SetStateAction<string>>;
  activityOrder: string;
  setActivityOrder: Dispatch<SetStateAction<string>>;
  activityTab: ActivityTab;
  selectedBookIds: number[];
  setSelectedBookIds: Dispatch<SetStateAction<number[]>>;
  sortedBooks: InfoCulturaBook[];
  isDeletingBulkBooks: boolean;
  handleBulkDeleteBooks: () => void | Promise<void>;
  selectedEventIds: number[];
  setSelectedEventIds: Dispatch<SetStateAction<number[]>>;
  sortedEvents: InfoCulturaEvent[];
  bulkEventStatus: string;
  setBulkEventStatus: Dispatch<SetStateAction<string>>;
  availableEventStatuses: string[];
  isApplyingBulkEvents: boolean;
  handleApplyBulkEventStatus: () => void | Promise<void>;
  isDeletingBulkEvents: boolean;
  handleBulkDeleteEvents: () => void | Promise<void>;
  showActivityForm: boolean;
  handleSaveBook: (event: FormEvent<HTMLFormElement>) => void;
  editingBookId: number | null;
  bookForm: BookFormState;
  setBookForm: Dispatch<SetStateAction<BookFormState>>;
  bookImageFileKey: number;
  isUploadingBookImage: boolean;
  handleUploadBookImage: (file: File | null) => void | Promise<void>;
  bookFormError: string;
  isSavingBook: boolean;
  resetBookForm: () => void;
  handleEditBook: (book: InfoCulturaBook) => void;
  deletingBookId: number | null;
  handleDeleteBook: (id: number) => void | Promise<void>;
  changingBookStatusId: number | null;
  handleToggleBookActive: (id: number, shouldActivate: boolean) => void | Promise<void>;
  isLoadingActivities: boolean;
  activityTotal: number;
  activityPage: number;
  activityTotalPages: number;
  handleSaveSession: (event: FormEvent<HTMLFormElement>) => void;
  editingSessionId: number | null;
  sessionForm: SessionFormState;
  setSessionForm: Dispatch<SetStateAction<SessionFormState>>;
  sessionFormError: string;
  isSavingSession: boolean;
  resetSessionForm: () => void;
  handleEditSession: (session: InfoCulturaSession) => void;
  deletingSessionId: number | null;
  handleDeleteSession: (id: number) => void | Promise<void>;
  changingSessionStatusId: number | null;
  handleToggleSessionActive: (id: number, shouldActivate: boolean) => void | Promise<void>;
  sortedSessions: InfoCulturaSession[];
  handleSaveEvent: (event: FormEvent<HTMLFormElement>) => void;
  editingEventId: number | null;
  eventForm: EventFormState;
  setEventForm: Dispatch<SetStateAction<EventFormState>>;
  eventImageFileKey: number;
  isUploadingEventImage: boolean;
  handleUploadEventImage: (file: File | null) => void | Promise<void>;
  eventFormError: string;
  isSavingEvent: boolean;
  resetEventForm: () => void;
  handleEditEvent: (eventItem: InfoCulturaEvent) => void;
  deletingEventId: number | null;
  handleDeleteEvent: (id: number) => void | Promise<void>;
  changingEventStatusId: number | null;
  handleToggleEventActive: (id: number, shouldActivate: boolean) => void | Promise<void>;
  syncingEventbriteId: number | null;
  handleSyncEventbrite: (id: number, publish?: boolean) => void | Promise<void>;
  eventbriteConnection?: EventbriteConnectionStatus | null;
  isCheckingEventbriteConnection?: boolean;
  handleCheckEventbriteConnection?: () => void | Promise<void>;
  loadingEventbriteOrdersId: number | null;
  eventbriteRefundStatus: EventbriteRefundStatus;
  setEventbriteRefundStatus: Dispatch<SetStateAction<EventbriteRefundStatus>>;
  eventbriteOrdersByEventId: Record<number, EventbriteOrdersPage>;
  handleLoadEventbriteOrders: (id: number, refundStatus?: EventbriteRefundStatus) => void | Promise<void>;
  showEventCategories: boolean;
  handleSaveCategory: (event: FormEvent<HTMLFormElement>) => void;
  categoryForm: CategoryFormState;
  setCategoryForm: Dispatch<SetStateAction<CategoryFormState>>;
  categoryFormError: string;
  isSavingCategory: boolean;
  editingCategoryId: number | null;
  resetCategoryForm: () => void;
  sortedCategories: InfoCulturaCategory[];
  isLoadingCategories: boolean;
  handleEditCategory: (category: InfoCulturaCategory) => void;
  deletingCategoryId: number | null;
  handleDeleteCategory: (id: number) => void | Promise<void>;
  toggleSelectedId: (setter: Dispatch<SetStateAction<number[]>>, id: number) => void;
};

function ActivitiesPage({
  activitySectionLabel,
  activitySectionDescription,
  activityOverviewStats,
  showActivityFiltersAndList,
  canManageUsers,
  clubs,
  activityClubFilter,
  setActivityClubFilter,
  activityCategoryFilter,
  setActivityCategoryFilter,
  activityStatusFilter,
  setActivityStatusFilter,
  activityBookFeaturedFilter,
  setActivityBookFeaturedFilter,
  activitySessionLocationFilter,
  setActivitySessionLocationFilter,
  activitySessionRegistrationsFilter,
  setActivitySessionRegistrationsFilter,
  activityEventCityFilter,
  setActivityEventCityFilter,
  activityEventLocationFilter,
  setActivityEventLocationFilter,
  activityError,
  handleApplyActivitySearch,
  activitySearchInput,
  setActivitySearchInput,
  setActivitySearch,
  setActivityPage,
  activityDateFrom,
  setActivityDateFrom,
  activityDateTo,
  setActivityDateTo,
  activityOrder,
  setActivityOrder,
  activityTab,
  selectedBookIds,
  setSelectedBookIds,
  sortedBooks,
  isDeletingBulkBooks,
  handleBulkDeleteBooks,
  selectedEventIds,
  setSelectedEventIds,
  sortedEvents,
  bulkEventStatus,
  setBulkEventStatus,
  availableEventStatuses,
  isApplyingBulkEvents,
  handleApplyBulkEventStatus,
  isDeletingBulkEvents,
  handleBulkDeleteEvents,
  showActivityForm,
  handleSaveBook,
  editingBookId,
  bookForm,
  setBookForm,
  bookImageFileKey,
  isUploadingBookImage,
  handleUploadBookImage,
  bookFormError,
  isSavingBook,
  resetBookForm,
  handleEditBook,
  deletingBookId,
  handleDeleteBook,
  changingBookStatusId,
  handleToggleBookActive,
  isLoadingActivities,
  activityTotal,
  activityPage,
  activityTotalPages,
  handleSaveSession,
  editingSessionId,
  sessionForm,
  setSessionForm,
  sessionFormError,
  isSavingSession,
  resetSessionForm,
  handleEditSession,
  deletingSessionId,
  handleDeleteSession,
  changingSessionStatusId,
  handleToggleSessionActive,
  sortedSessions,
  handleSaveEvent,
  editingEventId,
  eventForm,
  setEventForm,
  eventImageFileKey,
  isUploadingEventImage,
  handleUploadEventImage,
  eventFormError,
  isSavingEvent,
  resetEventForm,
  handleEditEvent,
  deletingEventId,
  handleDeleteEvent,
  changingEventStatusId,
  handleToggleEventActive,
  syncingEventbriteId,
  handleSyncEventbrite,
  eventbriteConnection,
  isCheckingEventbriteConnection = false,
  handleCheckEventbriteConnection,
  loadingEventbriteOrdersId,
  eventbriteRefundStatus,
  setEventbriteRefundStatus,
  eventbriteOrdersByEventId,
  handleLoadEventbriteOrders,
  showEventCategories,
  handleSaveCategory,
  categoryForm,
  setCategoryForm,
  categoryFormError,
  isSavingCategory,
  editingCategoryId,
  resetCategoryForm,
  sortedCategories,
  isLoadingCategories,
  handleEditCategory,
  deletingCategoryId,
  handleDeleteCategory,
  toggleSelectedId,
}: ActivitiesPageProps) {
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(DEFAULT_COUNTRY_OPTIONS);
  const [portugalDistricts, setPortugalDistricts] = useState<string[]>(PORTUGAL_DISTRICT_OPTIONS);
  const [portugalDistrictCodesByName, setPortugalDistrictCodesByName] = useState<Record<string, string>>({});
  const [municipalitiesByDistrict, setMunicipalitiesByDistrict] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let active = true;

    async function loadCountryOptions() {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=cca2,translations,name');
        if (!response.ok) {
          throw new Error('Countries API unavailable');
        }

        const payload = (await response.json()) as unknown;
        if (!active) {
          return;
        }

        setCountryOptions(normalizeCountryOptions(payload));
      } catch {
        if (active) {
          setCountryOptions(DEFAULT_COUNTRY_OPTIONS);
        }
      }
    }

    void loadCountryOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      eventForm.country_code !== PORTUGAL_COUNTRY_CODE ||
      !eventForm.district ||
      municipalitiesByDistrict[eventForm.district]
    ) {
      return;
    }

    let active = true;

    async function loadDistrictMunicipalities() {
      try {
        const districtCode = portugalDistrictCodesByName[eventForm.district];
        if (!districtCode) {
          throw new Error('District code unavailable');
        }

        const response = await fetch(
          `https://api.ptdata.org/v1/geo/municipalities?district=${encodeURIComponent(districtCode)}&limit=500`
        );
        if (!response.ok) {
          throw new Error('District municipalities API unavailable');
        }

        const payload = (await response.json()) as unknown;
        if (!active) {
          return;
        }

        const municipios = normalizePtDataMunicipalities(payload);

        if (municipios.length === 0) {
          return;
        }

        setMunicipalitiesByDistrict((prev) => ({
          ...prev,
          [eventForm.district]: [...municipios].sort((left, right) =>
            left.localeCompare(right, 'pt-PT')
          ),
        }));
      } catch {
        if (!active) {
          return;
        }

        const fallbackMunicipalities =
          PORTUGAL_FALLBACK_MUNICIPALITIES_BY_DISTRICT[eventForm.district];
        if (!fallbackMunicipalities?.length) {
          return;
        }

        setMunicipalitiesByDistrict((prev) => ({
          ...prev,
          [eventForm.district]: fallbackMunicipalities,
        }));
      }
    }

    void loadDistrictMunicipalities();

    return () => {
      active = false;
    };
  }, [eventForm.country_code, eventForm.district, municipalitiesByDistrict]);

  useEffect(() => {
    let active = true;

    async function loadPortugalDistricts() {
      try {
        const response = await fetch('https://api.ptdata.org/v1/geo/districts');
        if (!response.ok) {
          throw new Error('ptdata unavailable');
        }

        const payload = (await response.json()) as unknown;
        if (!active) {
          return;
        }

        const normalized = normalizePtDataDistricts(payload);
        const nextDistricts = normalized
          .map((item) => item.name)
          .sort((left, right) => left.localeCompare(right, 'pt-PT'));
        const nextCodes = normalized.reduce<Record<string, string>>((accumulator, item) => {
          accumulator[item.name] = item.code;
          return accumulator;
        }, {});

        setPortugalDistricts(nextDistricts.length > 0 ? nextDistricts : PORTUGAL_DISTRICT_OPTIONS);
        setPortugalDistrictCodesByName(nextCodes);
      } catch {
        if (!active) {
          return;
        }
        setPortugalDistricts(PORTUGAL_DISTRICT_OPTIONS);
        setPortugalDistrictCodesByName({});
        setMunicipalitiesByDistrict({});
      }
    }

    void loadPortugalDistricts();

    return () => {
      active = false;
    };
  }, []);

  const allPortugalMunicipalities = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(municipalitiesByDistrict).flatMap((municipalities) => municipalities)
        )
      ).sort((left, right) => left.localeCompare(right, 'pt-PT')),
    [municipalitiesByDistrict]
  );

  const districtByMunicipality = useMemo(
    () =>
      Object.entries(municipalitiesByDistrict).reduce<Record<string, string>>(
        (accumulator, [district, municipalities]) => {
          municipalities.forEach((municipality) => {
            accumulator[municipality] = district;
          });
          return accumulator;
        },
        {}
      ),
    [municipalitiesByDistrict]
  );

  const currentDistrictMunicipalities = useMemo(() => {
    if (eventForm.country_code !== PORTUGAL_COUNTRY_CODE || !eventForm.district) {
      return [];
    }

    return (
      municipalitiesByDistrict[eventForm.district] ||
      PORTUGAL_FALLBACK_MUNICIPALITIES_BY_DISTRICT[eventForm.district] ||
      []
    );
  }, [eventForm.country_code, eventForm.district, municipalitiesByDistrict]);

  useEffect(() => {
    if (
      eventForm.country_code !== PORTUGAL_COUNTRY_CODE ||
      !eventForm.municipality ||
      eventForm.district ||
      !districtByMunicipality[eventForm.municipality]
    ) {
      return;
    }

    setEventForm((prev) =>
      prev.country_code === PORTUGAL_COUNTRY_CODE &&
      prev.municipality &&
      !prev.district &&
      districtByMunicipality[prev.municipality]
        ? {
            ...prev,
            district: districtByMunicipality[prev.municipality],
            eventbrite_venue_region:
              prev.eventbrite_venue_region || districtByMunicipality[prev.municipality],
          }
        : prev
    );
  }, [
    districtByMunicipality,
    eventForm.country_code,
    eventForm.district,
    eventForm.municipality,
    setEventForm,
  ]);

  const existingEventCities = useMemo(
    () =>
      Array.from(
        new Set(
          sortedEvents
            .map((item) => item.city.trim())
            .filter((city) => city.length > 0)
        )
      ).sort((left, right) => left.localeCompare(right, 'pt-PT')),
    [sortedEvents]
  );

  const existingEventLocations = useMemo(
    () =>
      Array.from(
        new Set(
          sortedEvents
            .map((item) => item.location.trim())
            .filter((location) => location.length > 0)
        )
      ).sort((left, right) => left.localeCompare(right, 'pt-PT')),
    [sortedEvents]
  );

  const existingSessionLocations = useMemo(
    () =>
      Array.from(
        new Set(
          sortedSessions
            .map((item) => item.location.trim())
            .filter((location) => location.length > 0)
        )
      ).sort((left, right) => left.localeCompare(right, 'pt-PT')),
    [sortedSessions]
  );

  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={CalendarClock}
        title={activitySectionLabel}
        description={activitySectionDescription}
        tone="blue"
        stats={activityOverviewStats}
      />

      {showActivityFiltersAndList ? (
        <section className={adminPanelCard}>
          <div className={adminHeaderRow}>
            <div>
              <h2 className={blockTitle}>{activitySectionLabel}</h2>
              <p className={blockText}>{activitySectionDescription}</p>
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
              {activityTab === 'books' ? (
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="activity-book-featured-filter">
                    Destaque
                  </label>
                  <select
                    id="activity-book-featured-filter"
                    className={adminInput}
                    value={activityBookFeaturedFilter}
                    onChange={(event) => setActivityBookFeaturedFilter(event.target.value)}
                  >
                    <option value="all">Todos os livros</option>
                    <option value="featured">Apenas em destaque</option>
                    <option value="regular">Sem destaque</option>
                  </select>
                </div>
              ) : null}
              {activityTab === 'sessions' ? (
                <>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="activity-session-registrations-filter">
                      Inscricoes
                    </label>
                    <select
                      id="activity-session-registrations-filter"
                      className={adminInput}
                      value={activitySessionRegistrationsFilter}
                      onChange={(event) =>
                        setActivitySessionRegistrationsFilter(event.target.value)
                      }
                    >
                      <option value="all">Todas</option>
                      <option value="open">Abertas</option>
                      <option value="closed">Fechadas</option>
                    </select>
                  </div>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="activity-session-location-filter">
                      Local
                    </label>
                    <input
                      id="activity-session-location-filter"
                      className={adminInput}
                      list={
                        existingSessionLocations.length > 0
                          ? 'activity-session-location-suggestions'
                          : undefined
                      }
                      value={activitySessionLocationFilter}
                      onChange={(event) => setActivitySessionLocationFilter(event.target.value)}
                      placeholder="Rua, sala ou local"
                    />
                    {existingSessionLocations.length > 0 ? (
                      <datalist id="activity-session-location-suggestions">
                        {existingSessionLocations.map((location) => (
                          <option key={location} value={location} />
                        ))}
                      </datalist>
                    ) : null}
                  </div>
                </>
              ) : null}
              {activityTab === 'events' ? (
                <>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="activity-event-city-filter">
                      Cidade
                    </label>
                    <input
                      id="activity-event-city-filter"
                      className={adminInput}
                      list={
                        existingEventCities.length > 0
                          ? 'activity-event-city-suggestions'
                          : undefined
                      }
                      value={activityEventCityFilter}
                      onChange={(event) => setActivityEventCityFilter(event.target.value)}
                      placeholder="Cidade ou concelho"
                    />
                    {existingEventCities.length > 0 ? (
                      <datalist id="activity-event-city-suggestions">
                        {existingEventCities.map((city) => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    ) : null}
                  </div>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="activity-event-location-filter">
                      Local
                    </label>
                    <input
                      id="activity-event-location-filter"
                      className={adminInput}
                      list={
                        existingEventLocations.length > 0
                          ? 'activity-event-location-suggestions'
                          : undefined
                      }
                      value={activityEventLocationFilter}
                      onChange={(event) => setActivityEventLocationFilter(event.target.value)}
                      placeholder="Rua, sala ou local"
                    />
                    {existingEventLocations.length > 0 ? (
                      <datalist id="activity-event-location-suggestions">
                        {existingEventLocations.map((location) => (
                          <option key={location} value={location} />
                        ))}
                      </datalist>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {activityError ? <p className={adminError}>{activityError}</p> : null}

          <div className={`${adminFormGridSpaced} mt-6`}>
            <form onSubmit={handleApplyActivitySearch} className={adminPanelForm}>
              <div className={adminField}>
                <label className={adminLabel} htmlFor="activity-search">
                  Pesquisar{' '}
                  {activityTab === 'books'
                    ? 'livros'
                    : activityTab === 'sessions'
                      ? 'sessoes'
                      : 'eventos'}
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
      ) : null}

      {activityTab === 'books' ? (
        <>
          {showActivityForm ? (
            <form id="activity-form" onSubmit={handleSaveBook} className={adminPanelForm}>
              <h2 className={blockTitle}>{editingBookId ? 'Editar Livro' : 'Novo Livro'}</h2>

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
                      required={canManageUsers && activityClubFilter === 'all'}
                      onChange={(event) => {
                        const nextClubId = event.target.value;
                        if (import.meta.env.DEV) {
                          console.log('[InfoCultura club select]', { nextClubId });
                        }
                        setBookForm((prev) => ({ ...prev, club_id: nextClubId }));
                        if (canManageUsers) {
                          setActivityClubFilter(nextClubId || 'all');
                        }
                      }}
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
                        publication_year: event.target.value,
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
                        is_featured: event.target.value === 'sim',
                      }))
                    }
                  >
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>

	                <div className={adminField}>
	                  <label className={adminLabel} htmlFor="book-available-at">
	                    Publicar em
	                  </label>
                  <input
                    id="book-available-at"
                    type="datetime-local"
                    className={adminInput}
                    value={bookForm.available_at}
                    onChange={(event) =>
                      setBookForm((prev) => ({ ...prev, available_at: event.target.value }))
                    }
                  />
	                  <p className={blockText}>
	                    Usa "Publicar agora" para publicar imediatamente ou escolhe data/hora futura e clica em "Agendar".
	                  </p>
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
                <button
                  type="submit"
                  className={adminBtnPrimary}
                  disabled={
                    isSavingBook ||
                    (canManageUsers && activityClubFilter === 'all' && !bookForm.club_id)
                  }
	                >
	                  {isSavingBook ? 'A guardar...' : editingBookId ? 'Atualizar' : 'Salvar'}
	                </button>
	                <button
	                  type="submit"
	                  name="bookAction"
	                  value="publish_now"
	                  className={adminBtnSecondary}
	                  disabled={isSavingBook}
	                >
	                  Publicar agora
	                </button>
	                <button
	                  type="submit"
	                  name="bookAction"
	                  value="schedule"
	                  className={adminBtnSecondary}
	                  disabled={isSavingBook}
	                >
	                  Agendar
	                </button>
	                <button type="button" onClick={resetBookForm} className={adminBtnSecondary}>
	                  Limpar
	                </button>
              </div>
            </form>
          ) : null}

          {showActivityFiltersAndList ? (
            <div id="activity-list" className={adminList}>
              {isLoadingActivities ? <p className={adminInfo}>A carregar livros...</p> : null}
              {!isLoadingActivities && sortedBooks.length === 0 ? (
                <p className={adminInfo}>Não existem livros para o filtro atual.</p>
              ) : null}
              {sortedBooks.map((item) => (
                <article key={item.id} className={adminListItem}>
                  <div className={adminListTop}>
                    <div className={adminListHeader}>
                      <label className={adminListCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedBookIds.includes(item.id)}
                          onChange={() => toggleSelectedId(setSelectedBookIds, item.id)}
                        />
                        Selecionar
                      </label>
                      <h3 className={adminListTitle}>{item.title}</h3>
                      <p className={adminListMeta}>
                        <span className={adminListBadge}>{item.club_name}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        {item.author} · {item.publication_year}
                      </p>
                    </div>
                    <div className={adminListTools}>
                      <button type="button" className={adminBtnEdit} onClick={() => handleEditBook(item)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={item.is_active ? adminBtnSecondary : adminBtnPrimary}
                        disabled={changingBookStatusId === item.id}
                        onClick={() => void handleToggleBookActive(item.id, !item.is_active)}
                      >
                        {changingBookStatusId === item.id
                          ? 'A atualizar...'
                          : item.is_active
                            ? 'Desativar'
                            : 'Ativar'}
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
                  </div>
                  <p className={adminListDesc}>{item.summary}</p>
                </article>
              ))}
            </div>
          ) : null}
          {showActivityFiltersAndList && !isLoadingActivities ? (
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
          {showActivityForm ? (
            <form id="activity-form" onSubmit={handleSaveSession} className={adminPanelForm}>
              <h2 className={blockTitle}>{editingSessionId ? 'Editar Sessao' : 'Nova Sessao'}</h2>

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
                    pattern={adminNamePattern}
                    title={adminNameTitle}
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
                        start_date: event.target.value,
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
	                  <label className={adminLabel} htmlFor="session-available-at">
	                    Publicar em
	                  </label>
	                  <input
	                    id="session-available-at"
	                    type="datetime-local"
	                    className={adminInput}
	                    value={sessionForm.available_at}
	                    onChange={(event) =>
	                      setSessionForm((prev) => ({ ...prev, available_at: event.target.value }))
	                    }
	                  />
	                  <p className={blockText}>
	                    Usa "Publicar agora" para publicar imediatamente ou escolhe data/hora futura e clica em "Agendar".
	                  </p>
	                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="session-location">
                    Local
                  </label>
                  <GoogleMapsLocationField
                    inputId="session-location"
                    suggestions={existingSessionLocations}
                    citySuggestions={existingEventCities}
                    value={sessionForm.location}
                    onLocationChange={(nextLocation) =>
                      setSessionForm((prev) => ({ ...prev, location: nextLocation }))
                    }
                    onCityChange={() => undefined}
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
                        enable_registrations: event.target.value === 'sim',
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
                        registration_capacity: event.target.value,
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
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              {sessionFormError ? <p className={adminError}>{sessionFormError}</p> : null}

              <div className={adminActions}>
	                <button type="submit" className={adminBtnPrimary} disabled={isSavingSession}>
	                  {isSavingSession ? 'A guardar...' : editingSessionId ? 'Atualizar' : 'Salvar'}
	                </button>
	                <button
	                  type="submit"
	                  name="sessionAction"
	                  value="publish_now"
	                  className={adminBtnSecondary}
	                  disabled={isSavingSession}
	                >
	                  Publicar agora
	                </button>
	                <button
	                  type="submit"
	                  name="sessionAction"
	                  value="schedule"
	                  className={adminBtnSecondary}
	                  disabled={isSavingSession}
	                >
	                  Agendar
	                </button>
	                <button type="button" onClick={resetSessionForm} className={adminBtnSecondary}>
	                  Limpar
	                </button>
              </div>
            </form>
          ) : null}

          {showActivityFiltersAndList ? (
            <div id="activity-list" className={adminList}>
              {isLoadingActivities ? <p className={adminInfo}>A carregar sessoes...</p> : null}
              {!isLoadingActivities && sortedSessions.length === 0 ? (
                <p className={adminInfo}>Nao existem sessoes para o filtro atual.</p>
              ) : null}
              {sortedSessions.map((item) => (
                <article key={item.id} className={adminListItem}>
                  <div className={adminListTop}>
                    <div className={adminListHeader}>
                      <h3 className={adminListTitle}>{item.title}</h3>
                      <p className={adminListMeta}>
                        <span className={adminListBadge}>{item.club_name}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        {formatAdminDateTime(item.start_date)}
                      </p>
                    </div>
                    <div className={adminListTools}>
                      <button type="button" className={adminBtnEdit} onClick={() => handleEditSession(item)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={item.is_active ? adminBtnSecondary : adminBtnPrimary}
                        disabled={changingSessionStatusId === item.id}
                        onClick={() => void handleToggleSessionActive(item.id, !item.is_active)}
                      >
                        {changingSessionStatusId === item.id
                          ? 'A atualizar...'
                          : item.is_active
                            ? 'Desativar'
                            : 'Ativar'}
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
                  </div>
                  <p className={adminListDesc}>{item.description}</p>
                  <p className={adminListMeta}>
                    {item.location ? `Local ${item.location} · ` : ''}
                    Inscricoes {item.enable_registrations ? 'abertas' : 'fechadas'} ·
                    Confirmadas {item.confirmed_registrations} · Espera {item.waitlist_registrations}
                    {item.registration_capacity !== null && item.registration_capacity !== undefined
                      ? ` · Lotacao ${item.registration_capacity}`
                      : ''}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
          {showActivityFiltersAndList && !isLoadingActivities ? (
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
          {showActivityForm ? (
            <form id="activity-form" onSubmit={handleSaveEvent} className={adminPanelForm}>
              <h2 className={blockTitle}>{editingEventId ? 'Editar Evento' : 'Novo Evento'}</h2>
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <button
                  type="button"
                  className={adminBtnSecondary}
                  disabled={isCheckingEventbriteConnection || !handleCheckEventbriteConnection}
                  onClick={() => {
                    void handleCheckEventbriteConnection?.();
                  }}
                >
                  {isCheckingEventbriteConnection ? 'A verificar...' : 'Verificar Eventbrite'}
                </button>
                {eventbriteConnection ? (
                  <p className={eventbriteConnection.connected ? adminInfo : adminError}>
                    {eventbriteConnection.connected
                      ? `Ligado a ${eventbriteConnection.organization_name || eventbriteConnection.organization_id || 'Eventbrite'}`
                      : eventbriteConnection.message || 'Eventbrite nao configurada'}
                  </p>
                ) : null}
              </div>

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
                        status: normalizeWorkflowStatus(event.target.value),
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
                        ),
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
	                  <label className={adminLabel} htmlFor="event-publish-at">
	                    Publicar em
	                  </label>
	                  <input
	                    id="event-publish-at"
	                    type="datetime-local"
	                    className={adminInput}
	                    value={eventForm.publish_at}
	                    onChange={(event) =>
	                      setEventForm((prev) => ({ ...prev, publish_at: event.target.value }))
	                    }
	                  />
	                  <p className={blockText}>
	                    Usa "Publicar agora" para publicar imediatamente ou escolhe data/hora futura e clica em "Agendar".
	                  </p>
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
                        is_external: event.target.value === 'sim',
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
                        enable_registrations: event.target.value === 'sim',
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
                  <label className={adminLabel} htmlFor="event-country">
                    País
                  </label>
                  <select
                    id="event-country"
                    className={adminInput}
                    value={eventForm.country_code}
                    onChange={(event) => {
                      const nextCountryCode = event.target.value;
                      setEventForm((prev) => ({
                        ...prev,
                        country_code: nextCountryCode,
                        district: nextCountryCode === PORTUGAL_COUNTRY_CODE ? prev.district : '',
                        municipality: nextCountryCode === PORTUGAL_COUNTRY_CODE ? prev.municipality : '',
                        eventbrite_venue_country: nextCountryCode,
                        eventbrite_venue_region:
                          nextCountryCode === PORTUGAL_COUNTRY_CODE ? prev.eventbrite_venue_region : '',
                      }));
                    }}
                  >
                    {countryOptions.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                {eventForm.country_code === PORTUGAL_COUNTRY_CODE ? (
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="event-district">
                      Distrito
                    </label>
                    <select
                      id="event-district"
                      className={adminInput}
                      value={eventForm.district}
                      onChange={(event) => {
                        const nextDistrict = event.target.value;
                        setEventForm((prev) => ({
                          ...prev,
                          district: nextDistrict,
                          municipality: '',
                          eventbrite_venue_region: nextDistrict,
                          eventbrite_venue_city: '',
                          city: '',
                        }));
                      }}
                    >
                      <option value="">Seleciona um distrito</option>
                      {portugalDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {eventForm.country_code === PORTUGAL_COUNTRY_CODE ? (
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="event-municipality">
                      Concelho
                    </label>
                    <select
                      id="event-municipality"
                      className={adminInput}
                      value={eventForm.municipality}
                      onChange={(event) => {
                        const nextMunicipality = event.target.value;
                        setEventForm((prev) => ({
                          ...prev,
                          municipality: nextMunicipality,
                          city: nextMunicipality,
                          eventbrite_venue_city: nextMunicipality,
                        }));
                      }}
                      disabled={!eventForm.district}
                    >
                      <option value="">
                        {eventForm.district ? 'Seleciona um concelho' : 'Escolhe primeiro o distrito'}
                      </option>
                      {currentDistrictMunicipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>
                          {municipality}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-city">
                    Cidade / Localidade
                  </label>
                  <input
                    id="event-city"
                    className={adminInput}
                    list={
                      eventForm.country_code === PORTUGAL_COUNTRY_CODE
                        ? 'event-city-suggestions'
                        : existingEventCities.length > 0
                          ? 'event-city-suggestions'
                          : undefined
                    }
                    value={eventForm.city}
                    onChange={(event) => {
                      const nextCity = event.target.value;
                      setEventForm((prev) => ({
                        ...prev,
                        city: nextCity,
                        municipality:
                          prev.country_code === PORTUGAL_COUNTRY_CODE &&
                          allPortugalMunicipalities.includes(nextCity)
                            ? nextCity
                            : prev.country_code === PORTUGAL_COUNTRY_CODE
                              ? ''
                              : prev.municipality,
                      }));
                    }}
                  />
                  {eventForm.country_code === PORTUGAL_COUNTRY_CODE || existingEventCities.length > 0 ? (
                    <datalist id="event-city-suggestions">
                      {(eventForm.country_code === PORTUGAL_COUNTRY_CODE
                        ? allPortugalMunicipalities
                        : existingEventCities
                      ).map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  ) : null}
                  {eventForm.country_code === PORTUGAL_COUNTRY_CODE ? (
                    <p className={blockText}>
                      Lista com municípios de Portugal carregada a partir da GEO API PT.
                    </p>
                  ) : null}
                </div>

                <div className={adminField}>
                  <label className={adminLabel} htmlFor="event-location">
                    Local
                  </label>
                  <GoogleMapsLocationField
                    inputId="event-location"
                    suggestions={existingEventLocations}
                    citySuggestions={
                      eventForm.country_code === PORTUGAL_COUNTRY_CODE
                        ? allPortugalMunicipalities
                        : existingEventCities
                    }
                    value={eventForm.location}
                    onLocationChange={(nextLocation) =>
                      setEventForm((prev) => ({ ...prev, location: nextLocation }))
                    }
                    onCityChange={(nextCity) =>
                      setEventForm((prev) => ({ ...prev, city: nextCity }))
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
                        registration_capacity: event.target.value,
                      }))
                    }
                  />
                  <p className={blockText}>
                    Quando a lotacao for atingida, novas inscricoes passam para espera.
                  </p>
                </div>
              </div>

              <h3 className={blockTitle}>Eventbrite</h3>
              <div className={adminFormGridSpaced}>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-venue-id">
                    ID da sala
                  </label>
                  <input
                    id="eventbrite-venue-id"
                    className={adminInput}
                    value={eventForm.eventbrite_venue_id}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_venue_id: event.target.value }))
                    }
                  />
                  <p className={blockText}>
                    Usa uma sala existente ou deixa vazio para criar pela morada abaixo.
                  </p>
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-venue-name">
                    Sala
                  </label>
                  <input
                    id="eventbrite-venue-name"
                    className={adminInput}
                    value={eventForm.eventbrite_venue_name}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_venue_name: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-venue-address">
                    Morada
                  </label>
                  <input
                    id="eventbrite-venue-address"
                    className={adminInput}
                    value={eventForm.eventbrite_venue_address_1}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_venue_address_1: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-venue-postal">
                    Codigo postal
                  </label>
                  <input
                    id="eventbrite-venue-postal"
                    className={adminInput}
                    value={eventForm.eventbrite_venue_postal_code}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_venue_postal_code: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-venue-city">
                    Cidade Eventbrite
                  </label>
                  <input
                    id="eventbrite-venue-city"
                    className={adminInput}
                    value={eventForm.eventbrite_venue_city}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_venue_city: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-venue-country">
                    Pais
                  </label>
                  <input
                    id="eventbrite-venue-country"
                    className={adminInput}
                    value={eventForm.eventbrite_venue_country}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_venue_country: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-ticket-name">
                    Ticket
                  </label>
                  <input
                    id="eventbrite-ticket-name"
                    className={adminInput}
                    value={eventForm.eventbrite_ticket_name}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_ticket_name: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-ticket-type">
                    Tipo
                  </label>
                  <select
                    id="eventbrite-ticket-type"
                    className={adminInput}
                    value={eventForm.eventbrite_ticket_type}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        eventbrite_ticket_type: event.target.value as EventFormState['eventbrite_ticket_type'],
                      }))
                    }
                  >
                    <option value="free">Gratis</option>
                    <option value="paid">Pago</option>
                    <option value="donation">Donativo</option>
                  </select>
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-ticket-quantity">
                    Quantidade
                  </label>
                  <input
                    id="eventbrite-ticket-quantity"
                    type="number"
                    min="1"
                    className={adminInput}
                    value={eventForm.eventbrite_ticket_quantity}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_ticket_quantity: event.target.value }))
                    }
                  />
                </div>
                <div className={adminField}>
                  <label className={adminLabel} htmlFor="eventbrite-ticket-price">
                    Preco
                  </label>
                  <input
                    id="eventbrite-ticket-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className={adminInput}
                    disabled={eventForm.eventbrite_ticket_type !== 'paid'}
                    value={eventForm.eventbrite_ticket_price}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventbrite_ticket_price: event.target.value }))
                    }
                  />
                </div>
                <label className={`${adminLabel} flex items-center gap-2`}>
                  <input
                    type="checkbox"
                    checked={eventForm.sync_eventbrite_on_save}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, sync_eventbrite_on_save: event.target.checked }))
                    }
                  />
                  Sincronizar ao guardar
                </label>
                <label className={`${adminLabel} flex items-center gap-2`}>
                  <input
                    type="checkbox"
                    checked={eventForm.publish_eventbrite_on_save}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        publish_eventbrite_on_save: event.target.checked,
                        sync_eventbrite_on_save: event.target.checked || prev.sync_eventbrite_on_save,
                      }))
                    }
                  />
                  Publicar na Eventbrite ao guardar
                </label>
              </div>

              <div className={adminFormGridSpaced}>
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
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              {eventFormError ? <p className={adminError}>{eventFormError}</p> : null}

              <div className={adminActions}>
	                <button type="submit" className={adminBtnPrimary} disabled={isSavingEvent}>
	                  {isSavingEvent ? 'A guardar...' : editingEventId ? 'Atualizar' : 'Salvar'}
	                </button>
	                <button
	                  type="submit"
	                  name="eventAction"
	                  value="publish_now"
	                  className={adminBtnSecondary}
	                  disabled={isSavingEvent}
	                >
	                  Publicar agora
	                </button>
	                <button
	                  type="submit"
	                  name="eventAction"
	                  value="schedule"
	                  className={adminBtnSecondary}
	                  disabled={isSavingEvent}
	                >
	                  Agendar
	                </button>
	                <button type="button" onClick={resetEventForm} className={adminBtnSecondary}>
	                  Limpar
	                </button>
              </div>
            </form>
          ) : null}

          {showActivityFiltersAndList ? (
            <div id="activity-list" className={adminList}>
              {isLoadingActivities ? <p className={adminInfo}>A carregar eventos...</p> : null}
              {!isLoadingActivities && sortedEvents.length === 0 ? (
                <p className={adminInfo}>Nao existem eventos para o filtro atual.</p>
              ) : null}
              {sortedEvents.map((item) => (
                <article key={item.id} className={adminListItem}>
                  <div className={adminListTop}>
                    <div className={adminListHeader}>
                      <label className={adminListCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedEventIds.includes(item.id)}
                          onChange={() => toggleSelectedId(setSelectedEventIds, item.id)}
                        />
                        Selecionar
                      </label>
                      <h3 className={adminListTitle}>{item.title}</h3>
                      <p className={adminListMeta}>
                        <span className={adminListBadge}>{item.club_name || 'Sem clube'}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        {getWorkflowStatusLabel(item.status)} ·{' '}
                        {formatAdminDateTime(item.start_date)}
                      </p>
                    </div>
                    <div className={adminListTools}>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        disabled={syncingEventbriteId === item.id}
                        onClick={() => handleSyncEventbrite(item.id, false)}
                      >
                        {syncingEventbriteId === item.id ? 'A sincronizar...' : 'Eventbrite'}
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        disabled={syncingEventbriteId === item.id}
                        onClick={() => handleSyncEventbrite(item.id, true)}
                      >
                        Publicar EB
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        disabled={loadingEventbriteOrdersId === item.id || !item.eventbrite_event_id}
                        onClick={() => handleLoadEventbriteOrders(item.id)}
                      >
                        {loadingEventbriteOrdersId === item.id ? 'A carregar...' : 'Pedidos EB'}
                      </button>
                      <button type="button" className={adminBtnEdit} onClick={() => handleEditEvent(item)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={item.is_active ? adminBtnSecondary : adminBtnPrimary}
                        disabled={changingEventStatusId === item.id}
                        onClick={() => void handleToggleEventActive(item.id, !item.is_active)}
                      >
                        {changingEventStatusId === item.id
                          ? 'A atualizar...'
                          : item.is_active
                            ? 'Desativar'
                            : 'Ativar'}
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
                  </div>
                  <p className={adminListDesc}>{item.description}</p>
                  <p className={adminListMeta}>
                    Inscricoes {item.enable_registrations ? 'abertas' : 'fechadas'} ·
                    Confirmadas {item.confirmed_registrations} · Espera {item.waitlist_registrations}
                    {item.registration_capacity !== null && item.registration_capacity !== undefined
                      ? ` · Lotacao ${item.registration_capacity}`
                      : ''}
                  </p>
                  {item.categories.length > 0 ? (
                    <p className={adminListMeta}>
                      Categorias: {item.categories.map((category) => category.name).join(', ')}
                    </p>
                  ) : null}
                  {item.eventbrite_event_id ? (
                    <p className={adminListMeta}>
                      Eventbrite: {item.eventbrite_status || 'sincronizado'} ·{' '}
                      {item.eventbrite_url ? (
                        <a className="underline" href={item.eventbrite_url} target="_blank" rel="noreferrer">
                          abrir
                        </a>
                      ) : (
                        item.eventbrite_event_id
                      )}
                    </p>
                  ) : null}
                  {item.eventbrite_venue_id || item.eventbrite_ticket_classes?.length ? (
                    <p className={adminListMeta}>
                      {item.eventbrite_venue_id ? `Sala EB ${item.eventbrite_venue_id}` : 'Sala EB por criar'}
                      {item.eventbrite_ticket_classes?.length
                        ? ` · Tickets: ${item.eventbrite_ticket_classes
                            .map((ticket) => `${ticket.name} (${ticket.quantity_total})`)
                            .join(', ')}`
                        : ''}
                    </p>
                  ) : null}
                  {item.eventbrite_last_error ? (
                    <p className={adminError}>Eventbrite: {item.eventbrite_last_error}</p>
                  ) : null}
                  {item.eventbrite_event_id ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-end gap-3">
                        <div className={adminField}>
                          <label className={adminLabel} htmlFor={`eventbrite-refund-${item.id}`}>
                            Reembolsos
                          </label>
                          <select
                            id={`eventbrite-refund-${item.id}`}
                            className={adminInput}
                            value={eventbriteRefundStatus}
                            onChange={(event) => {
                              const nextStatus = event.target.value as EventbriteRefundStatus;
                              setEventbriteRefundStatus(nextStatus);
                              void handleLoadEventbriteOrders(item.id, nextStatus);
                            }}
                          >
                            <option value="">Todos os pedidos</option>
                            <option value="pending">Reembolso pendente</option>
                            <option value="completed">Reembolso concluido</option>
                            <option value="outside_policy">Fora da politica</option>
                            <option value="disputed">Em disputa</option>
                            <option value="denied">Negado</option>
                          </select>
                        </div>
                        {eventbriteOrdersByEventId[item.id]?.eventbrite_manage_orders_url ? (
                          <a
                            className={adminBtnSecondary}
                            href={eventbriteOrdersByEventId[item.id].eventbrite_manage_orders_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Gerir na Eventbrite
                          </a>
                        ) : null}
                      </div>
                      {eventbriteOrdersByEventId[item.id] ? (
                        <div className="mt-3 space-y-2">
                          <p className={adminListMeta}>
                            {eventbriteOrdersByEventId[item.id].pagination.object_count ?? eventbriteOrdersByEventId[item.id].orders.length}{' '}
                            pedido(s) encontrados
                          </p>
                          {eventbriteOrdersByEventId[item.id].orders.slice(0, 5).map((order) => (
                            <p key={order.id} className={adminListMeta}>
                              {order.name || order.email || order.id} · {order.status || 'sem estado'} ·{' '}
                              {formatAdminDateTime(order.created)}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className={`${adminListMeta} mt-3`}>
                          Carrega em “Pedidos EB” para ver encomendas e pedidos de reembolso.
                        </p>
                      )}
                    </div>
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
                </article>
              ))}
            </div>
          ) : null}
          {showActivityFiltersAndList && !isLoadingActivities ? (
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

      {showEventCategories ? (
        <section id="event-categories" className={adminPanelCard}>
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
                  pattern={adminNamePattern}
                  title={adminNameTitle}
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
                      description: event.target.value,
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
              <button type="button" onClick={resetCategoryForm} className={adminBtnSecondary}>
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
                  <button type="button" className={adminBtnEdit} onClick={() => handleEditCategory(category)}>
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
  );
}

export default ActivitiesPage;
