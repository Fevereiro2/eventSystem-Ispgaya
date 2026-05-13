import { useEffect } from 'react';
import { fetchAdminClubs, fetchAdminContent, fetchAdminRoles, fetchAdminUsers, fetchInfoCulturaMe, } from '../../../api/infoculturaApi';
import { sortClubs } from '../utils';
export function useAdminUsers({ token, canManageUsers, activeSection, userPage, selectedUser, currentUser, setItems, setUsers, setClubs, setRoles, setCurrentUser, setIsLoadingItems, setIsLoadingUsers, setIsLoadingClubs, setIsLoadingRoles, setPanelError, handleAuthError, resetUserForm, resetClubForm, setUserForm, setUserFormError, }) {
    useEffect(() => {
        if (!token)
            return;
        let isMounted = true;
        setIsLoadingItems(true);
        setIsLoadingUsers(true);
        setPanelError('');
        void Promise.all([
            fetchAdminContent(token),
            fetchAdminUsers(token),
            fetchInfoCulturaMe(token),
        ])
            .then(([nextItems, nextUsers, nextCurrentUser]) => {
            if (!isMounted)
                return;
            setItems(nextItems);
            setUsers(nextUsers);
            setCurrentUser(nextCurrentUser);
        })
            .catch((error) => {
            if (!isMounted)
                return;
            if (handleAuthError(error))
                return;
            const message = error instanceof Error ? error.message : 'Nao foi possivel carregar os dados do painel.';
            setPanelError(message);
        })
            .finally(() => {
            if (!isMounted)
                return;
            setIsLoadingItems(false);
            setIsLoadingUsers(false);
        });
        return () => {
            isMounted = false;
        };
    }, [token]);
    useEffect(() => {
        if (!token || !canManageUsers) {
            setRoles([]);
            setClubs([]);
            return;
        }
        let isMounted = true;
        setIsLoadingRoles(true);
        void fetchAdminRoles(token)
            .then((nextRoles) => {
            if (!isMounted)
                return;
            setRoles(nextRoles);
        })
            .catch((error) => {
            if (!isMounted)
                return;
            if (handleAuthError(error))
                return;
            const message = error instanceof Error ? error.message : 'Nao foi possivel carregar os perfis.';
            setPanelError(message);
        })
            .finally(() => {
            if (!isMounted)
                return;
            setIsLoadingRoles(false);
        });
        return () => {
            isMounted = false;
        };
    }, [token, canManageUsers]);
    useEffect(() => {
        if (!token || !canManageUsers) {
            resetClubForm();
            return;
        }
        let isMounted = true;
        setIsLoadingClubs(true);
        void fetchAdminClubs(token)
            .then((nextClubs) => {
            if (!isMounted)
                return;
            setClubs(sortClubs(nextClubs));
        })
            .catch((error) => {
            if (!isMounted)
                return;
            if (handleAuthError(error))
                return;
            const message = error instanceof Error ? error.message : 'Nao foi possivel carregar os clubes.';
            setPanelError(message);
        })
            .finally(() => {
            if (!isMounted)
                return;
            setIsLoadingClubs(false);
        });
        return () => {
            isMounted = false;
        };
    }, [token, canManageUsers]);
    useEffect(() => {
        if (!currentUser)
            return;
        resetUserForm();
    }, [currentUser?.club_id, canManageUsers]);
    useEffect(() => {
        if (activeSection !== 'utilizadores' || !userPage)
            return;
        if (userPage.mode === 'create') {
            resetUserForm();
            return;
        }
        if (userPage.mode === 'edit' && selectedUser) {
            setUserForm({
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
                password: '',
                generate_password: false,
            });
            setUserFormError('');
        }
    }, [activeSection, userPage, selectedUser]);
}
