package ltc.events.classes.hashs;


import ltc.events.classes.Participant;

/**
 * Classe para gerir a sessão do utilizador autenticado.
 * Funciona como um Singleton global para toda a aplicação JavaFX.
 */
public class SessionEntry {

    // Guarda o utilizador autenticado
    private static Participant currentUser = null;

    /**
     * Inicia sessão para um utilizador.
     */
    public static void login(Participant user) {
        currentUser = user;
        System.out.println("🔐 Sessão iniciada para: " + user.getEmail());
    }

    /**
     * Devolve o utilizador autenticado.
     */
    public static Participant getUser() {
        return currentUser;
    }

    /**
     * Verifica se existe um utilizador autenticado.
     */
    public static boolean isLogged() {
        return currentUser != null;
    }

    /**
     * Termina a sessão do utilizador.
     */
    public static void logout() {
        System.out.println("🔓 Sessão encerrada.");
        currentUser = null;
    }
}
