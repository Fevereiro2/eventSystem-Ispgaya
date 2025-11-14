package ltc.events.classes.hashs;

import org.mindrot.jbcrypt.BCrypt;


public class PasswordUtil {

    // Gera hash seguro
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    // Verifica se string parece um hash BCrypt
    public static boolean isHashed(String password) {
        return password != null &&
                (password.startsWith("$2a$")
                        || password.startsWith("$2b$")
                        || password.startsWith("$2y$"));
    }

    // Compara password introduzida com hash da BD
    public static boolean checkPassword(String rawPassword, String hashedPassword) {
        return BCrypt.checkpw(rawPassword, hashedPassword);
    }
}