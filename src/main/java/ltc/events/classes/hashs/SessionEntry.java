package ltc.events.classes.hashs;

import ltc.events.classes.Participant;
import ltc.events.Modules.util.LoggingUtil;

public class SessionEntry {

    private static Participant currentUser = null;

    public static void login(Participant user) {
        currentUser = user;
        LoggingUtil.log("LOGIN: " + user.getEmail());
    }

    public static Participant getUser() {
        return currentUser;
    }

    public static boolean isLogged() {
        return currentUser != null;
    }

    public static void logout() {
        if (currentUser != null) {
            LoggingUtil.log("LOGOUT: " + currentUser.getEmail());
        }
        currentUser = null;
    }
}
