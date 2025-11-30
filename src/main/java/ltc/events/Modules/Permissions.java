package ltc.events.Modules; // Declara o pacote onde esta classe reside

import ltc.events.classes.Participant;
import ltc.events.classes.hashs.SessionEntry;

public class Permissions {
    public static boolean isModerador(){
        Participant u = SessionEntry.getUser();
        return u != null &&
                u.getType() != null &&
                u.getType().getName().equalsIgnoreCase("moderator");
    }
    public static boolean isParticipant(){
        Participant u = SessionEntry.getUser();
        return u != null &&
                u.getType() != null &&
                u.getType().getName().equalsIgnoreCase("participant");
    }
    public static boolean isAdmin(){
        Participant u = SessionEntry.getUser();
        return u != null &&
                u.getType() != null &&
                u.getType().getName().equalsIgnoreCase("admin");
    }
}
