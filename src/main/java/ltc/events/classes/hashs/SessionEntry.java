package ltc.events.classes.hashs; // Declara que a classe pertence a este pacote (apesar de gerir a sessão).

import ltc.events.classes.Participant; // Importa a classe de modelo do Participante.

/**
 * Classe para gerir a sessão do utilizador autenticado.
 * Funciona como um Singleton global para toda a aplicação JavaFX.
 */
public class SessionEntry { // Início da classe SessionEntry.

    // ─────────────────────────────────────────────
    // PROPRIEDADES DO SINGLETON
    // ─────────────────────────────────────────────

    // Guarda o utilizador autenticado
    // 'static' garante que esta é a ÚNICA instância para toda a aplicação (Singleton).
    // 'Private' restringe o acesso direto, forçando o uso dos métodos estáticos (getUser, ‘login’).
    private static Participant currentUser = null;

    // ─────────────────────────────────────────────
    // MÉTODOS DE CONTROLO DE SESSÃO
    // ─────────────────────────────────────────────

    /**
     * Inicia sessão para um utilizador.
     * @param user O objeto Participant autenticado, recebido após um ‘login’ bem-sucedido.
     */
    public static void login(Participant user) {
        currentUser = user; // Atribui o objeto Participant à variável estática.
        System.out.println("🔐 Sessão iniciada para: " + user.getEmail()); // Mensagem de confirmação na consola.
    }

    /**
     * Devolve o utilizador autenticado.
     * @return O objeto Participant atualmente autenticado, ou null se ninguém estiver logado.
     */
    public static Participant getUser() {
        return currentUser; // Retorna a referência do utilizador atual.
    }

    /**
     * Verifica se existe um utilizador autenticado.
     * @return true se currentUser não for null, false caso contrário.
     */
    public static boolean isLogged() {
        // Método conveniente para verificar rapidamente o estado da sessão.
        return currentUser != null;
    }

    /**
     * Termina a sessão do utilizador.
     */
    public static void logout() {
        System.out.println("🔓 Sessão encerrada."); // Mensagem de confirmação na consola.
        currentUser = null; // Define o utilizador atual como null, terminando a sessão.
    }
} // Fim da classe SessionEntry.