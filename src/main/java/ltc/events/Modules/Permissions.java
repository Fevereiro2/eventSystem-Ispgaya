package ltc.events.Modules;

import ltc.events.classes.Participant;
import ltc.events.classes.hashs.SessionEntry;

/**
 * Helpers estaticos para validar o tipo/permissao do utilizador logado.
 */
public class Permissions {

    private static boolean matches(Participant u, String... names) {
        if (u == null || u.getType() == null || u.getType().getName() == null) return false;
        String value = u.getType().getName().trim().toLowerCase();
        for (String name : names) {
            if (value.equals(name.trim().toLowerCase())) return true;
        }
        return false;
    }

    /** Verifica se o utilizador atual tem perfil de moderador. */
    public static boolean isModerador() {
        Participant u = SessionEntry.getUser(); // Participante da sessão ativa
        return matches(u, "moderator", "moderador");
    }

    /** Verifica se o utilizador atual tem perfil de participante. */
    public static boolean isParticipant() {
        Participant u = SessionEntry.getUser(); // Participante da sessão ativa
        return matches(u, "participant", "participante");
    }

    /** Verifica se o utilizador atual tem perfil de administrador. */
    public static boolean isAdmin() {
        Participant u = SessionEntry.getUser(); // Participante da sessão ativa
        return matches(u, "admin", "administrador");
    }
}
