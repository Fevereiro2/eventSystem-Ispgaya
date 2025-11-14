package ltc.events.classes.hashs;

import ltc.events.Modules.db;
import ltc.events.classes.hashs.PasswordUtil;
import java.sql.*;

public class AuthService {

    public static boolean login(String email, String password) {
        System.out.println("=== DEBUG LOGIN ===");
        System.out.println("Email recebido: " + email);
        System.out.println("Password recebida: " + password);

        String sql = "Select password from participant where email = ?";
        String storedPassword = null;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                System.out.println("DEBUG → Utilizador NÃO encontrado.");
                return false;
            }

            storedPassword = rs.getString("password");

            System.out.println("DEBUG → PASSWORD BD: " + storedPassword);

        } catch (SQLException e) {
            System.out.println("Erro na autenticação: " + e.getMessage());
            return false;
        }

        // 1️⃣ Verificar se está encriptada
        boolean isHashed = PasswordUtil.isHashed(storedPassword);
        System.out.println("DEBUG → Password é hash? " + isHashed);

        if (isHashed) {
            System.out.println("DEBUG → A validar com BCrypt...");
            boolean ok = PasswordUtil.checkPassword(password, storedPassword);
            System.out.println("DEBUG → BCrypt resultado: " + ok);
            return ok;
        }

        // 2️⃣ Password antiga → texto normal
        System.out.println("DEBUG → Password antiga em TEXTO.");

        boolean match = storedPassword.equals(password);
        System.out.println("DEBUG → Match texto simples: " + match);

        if (match) {
            System.out.println("DEBUG → Encriptando password antiga e atualizando BD.");
            try (Connection conn = db.connect();
                 PreparedStatement update = conn.prepareStatement(
                         "UPDATE participant SET password = ? WHERE email = ?"
                 )) {

                String newHash = PasswordUtil.hashPassword(storedPassword);

                update.setString(1, newHash);
                update.setString(2, email);
                update.executeUpdate();

                System.out.println("DEBUG → Password atualizada na BD com hash.");
            } catch (SQLException e) {
                System.out.println("Erro a atualizar password: " + e.getMessage());
            }
        }

        return match;
    }
}
