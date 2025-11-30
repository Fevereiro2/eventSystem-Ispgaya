package ltc.events.Modules; // Declara o pacote (a estrutura de pastas) onde esta classe reside

import ltc.events.classes.Participant; // Importa a classe modelo 'Participant', que contém os dados do utilizador
import ltc.events.classes.hashs.SessionEntry; // Importa a classe 'SessionEntry', que armazena o participante atualmente logado (sessão ativa)

// A classe 'Permissions' fornece métodos estáticos para verificar o nível de acesso (permissão) do utilizador logado
public class Permissions {

    // Método estático que verifica se o utilizador logado tem a permissão "Moderator"
    public static boolean isModerador(){
        Participant u = SessionEntry.getUser(); // Obtém o objeto Participant da sessão ativa
        return u != null && // Verifica se o utilizador não é nulo (está logado)
                u.getType() != null && // Verifica se o tipo de utilizador não é nulo
                u.getType().getName().equalsIgnoreCase("moderator"); // Compara o nome do tipo, ignorando maiúsculas/minúsculas
    }

    // Método estático que verifica se o utilizador logado tem a permissão "Participant"
    public static boolean isParticipant(){
        Participant u = SessionEntry.getUser(); // Obtém o objeto Participant da sessão ativa
        return u != null && // Verifica se o utilizador não é nulo (está logado)
                u.getType() != null && // Verifica se o tipo de utilizador não é nulo
                u.getType().getName().equalsIgnoreCase("participant"); // Compara o nome do tipo, ignorando maiúsculas/minúsculas
    }

    // Método estático que verifica se o utilizador logado tem a permissão "Admin"
    public static boolean isAdmin(){
        Participant u = SessionEntry.getUser(); // Obtém o objeto Participant da sessão ativa
        return u != null && // Verifica se o utilizador não é nulo (está logado)
                u.getType() != null && // Verifica se o tipo de utilizador não é nulo
                u.getType().getName().equalsIgnoreCase("admin"); // Compara o nome do tipo, ignorando maiúsculas/minúsculas
    }
}