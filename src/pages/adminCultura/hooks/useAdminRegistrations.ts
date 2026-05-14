import { useEffect } from 'react';

import {
  InfoCulturaRegistration,
  InfoCulturaRegistrationStatus,
  fetchAdminRegistrations,
  fetchAdminRegistrationStatuses,
} from '../../../api/infoculturaApi';

type UseAdminRegistrationsOptions = {
  token: string;
  currentUser: unknown;
  activeSection: string | null;
  canManageUsers: boolean;
  registrationClubFilter: string;
  registrationStatusFilter: string;
  registrationSearch: string;
  registrationOrder: string;
  registrationDateFrom: string;
  registrationDateTo: string;
  registrationPage: number;
  setIsLoadingRegistrations: (value: boolean) => void;
  setIsLoadingRegistrationStatuses: (value: boolean) => void;
  setRegistrationStatuses: (value: InfoCulturaRegistrationStatus[]) => void;
  setRegistrations: (value: InfoCulturaRegistration[]) => void;
  setRegistrationTotal: (value: number) => void;
  setRegistrationTotalPages: (value: number) => void;
  setRegistrationError: (value: string) => void;
  handleAuthError: (error: unknown) => boolean;
  pageSize: number;
};

export function useAdminRegistrations({
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
  pageSize,
}: UseAdminRegistrationsOptions) {
  useEffect(() => {
    if (!token || !currentUser || activeSection !== 'inscricoes') {
      return;
    }

    let isMounted = true;
    setIsLoadingRegistrationStatuses(true);
    setIsLoadingRegistrations(true);
    setRegistrationError('');

    const clubId =
      canManageUsers && registrationClubFilter !== 'all'
        ? Number(registrationClubFilter)
        : undefined;
    const status =
      registrationStatusFilter && registrationStatusFilter !== 'all'
        ? registrationStatusFilter
        : undefined;

    void Promise.all([
      fetchAdminRegistrationStatuses(token),
      fetchAdminRegistrations(token, {
        clubId,
        status,
        search: registrationSearch,
        ordering: registrationOrder,
        dateFrom: registrationDateFrom,
        dateTo: registrationDateTo,
        page: registrationPage,
        pageSize,
      }),
    ])
      .then(([nextStatuses, registrationPageData]) => {
        if (!isMounted) return;
        setRegistrationStatuses(nextStatuses);
        setRegistrations(registrationPageData.items);
        setRegistrationTotal(registrationPageData.total);
        setRegistrationTotalPages(registrationPageData.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar as inscricoes.';
        setRegistrationError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingRegistrationStatuses(false);
        setIsLoadingRegistrations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeSection,
    token,
    currentUser,
    canManageUsers,
    registrationClubFilter,
    registrationStatusFilter,
    registrationSearch,
    registrationOrder,
    registrationDateFrom,
    registrationDateTo,
    registrationPage,
  ]);
}
