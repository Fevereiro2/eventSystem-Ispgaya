package ltc.events.Modules; // Declara o pacote (a estrutura de pastas) onde esta classe reside

import ltc.events.classes.Participant; // Importa a classe modelo 'Participant', que contÇ¸m os dados do utilizador
import ltc.events.classes.hashs.SessionEntry; // Importa a classe 'SessionEntry', que armazena o participante atualmente logado (sessÇœo ativa)

// A classe 'Permissions' fornece mÇ¸todos estÇ­ticos para verificar o nÇðvel de acesso (permissÇœo) do utilizador logado
public class Permissions {

    private static boolean matches(Participant u, String... names) {
        if (u == null || u.getType() == null || u.getType().getName() == null) return false;
        String value = u.getType().getName().trim().toLowerCase();
        for (String name : names) {
            if (value.equals(name.trim().toLowerCase())) return true;
        }
        return false;
    }

    // MÇ¸todo estÇ­tico que verifica se o utilizador logado tem a permissÇœo "Moderator"
    public static boolean isModerador(){
        Participant u = SessionEntry.getUser(); // ObtÇ¸m o objeto Participant da sessÇœo ativa
        return matches(u, "moderator", "moderador");
    }

    // MÇ¸todo estÇ­tico que verifica se o utilizador logado tem a permissÇœo "Participant"
    public static boolean isParticipant(){
        Participant u = SessionEntry.getUser(); // ObtÇ¸m o objeto Participant da sessÇœo ativa
        return matches(u, "participant", "participante");
    }

    // MÇ¸todo estÇ­tico que verifica se o utilizador logado tem a permissÇœo "Admin"
    public static boolean isAdmin(){
        Participant u = SessionEntry.getUser(); // ObtÇ¸m o objeto Participant da sessÇœo ativa
        return matches(u, "admin", "administrador");
    }
}
