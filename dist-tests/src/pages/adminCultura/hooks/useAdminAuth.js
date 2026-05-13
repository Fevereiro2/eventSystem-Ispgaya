import { loginInfoCultura, logoutInfoCultura } from '../../../api/infoculturaApi';
import { TOKEN_KEY } from '../constants';
export function useAdminAuth({ authUser, authPass, setAuthUser, setAuthPass, setAuthError, setToken, clearDomainState, }) {
    async function handleLogin(event) {
        event.preventDefault();
        setAuthError('');
        try {
            const nextToken = await loginInfoCultura(authUser, authPass);
            setToken(nextToken);
            sessionStorage.setItem(TOKEN_KEY, nextToken);
            setAuthPass('');
            setAuthUser('');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Credenciais invalidas.';
            setAuthError(message);
        }
    }
    function handleLogout() {
        void logoutInfoCultura();
        clearDomainState();
        setAuthUser('');
        setAuthPass('');
    }
    return {
        handleLogin,
        handleLogout,
    };
}
