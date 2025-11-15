package ltc.events.classes.hashs;

import ltc.events.Modules.db;
import ltc.events.classes.Participant;
import ltc.events.classes.Types;

import java.sql.*;
import ltc.events.classes.hashs.PasswordUtil;

public class AuthService {

    public static Participant login(String email, String password) {

        System.out.println("=== DEBUG LOGIN ===");
        System.out.println("Email recebido: " + email);
        System.out.println("Password recebida: " + password);

        String sql = """
            SELECT p.*, t.types_id, t.name AS types_name
            FROM participant p
            INNER JOIN types t ON p.types_id = t.types_id
            WHERE p.email = ?
        """;


        String storedPassword = null;
        Participant user = null;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);

            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                System.out.println("DEBUG → Utilizador NÃO encontrado.");
                return null;
            }

            // 1️⃣ Lê password
            storedPassword = rs.getString("password");
            System.out.println("DEBUG → PASSWORD BD: " + storedPassword);

            user = new Participant(rs);

        } catch (SQLException e) {
            System.out.println("Erro na autenticação: " + e.getMessage());
            return null;
        }

        // 4️⃣ Verificar hash
        boolean isHashed = PasswordUtil.isHashed(storedPassword);
        System.out.println("DEBUG → Password é hash? " + isHashed);

        if (isHashed) {
            boolean ok = PasswordUtil.checkPassword(password, storedPassword);
            System.out.println("DEBUG → BCrypt resultado: " + ok);
            return ok ? user : null;
        }

        // 5️⃣ Password antiga em texto
        boolean match = storedPassword.equals(password);
        System.out.println("DEBUG → Match texto simples: " + match);

        if (match) {
            System.out.println("DEBUG → Atualizando antiga password para hash...");
            try (Connection conn = db.connect();
                 PreparedStatement update = conn.prepareStatement(
                         "UPDATE participant SET password = ? WHERE email = ?"
                 )) {

                update.setString(1, PasswordUtil.hashPassword(storedPassword));
                update.setString(2, email);
                update.executeUpdate();

            } catch (SQLException e) {
                System.out.println("Erro a atualizar password: " + e.getMessage());
            }
        }

        return match ? user : null;
    }
}
