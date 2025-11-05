package ltc.events.Modules;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import io.github.cdimascio.dotenv.Dotenv;

public class db {
    private static Connection conn;

    public static Connection connect() {
        if (conn != null) return conn; // reutiliza se já estiver ligada

        try {
            Dotenv env = Dotenv.load();

            String url = env.get("DB_URL");
            String user = env.get("DB_USER");
            String pass = env.get("DB_PASS");

            conn = DriverManager.getConnection(url, user, pass);
            System.out.println("✅ Ligação bem-sucedida ao PostgreSQL!");
        } catch (SQLException e) {
            System.err.println("❌ Erro ao ligar ao PostgreSQL: " + e.getMessage());
        }

        return conn;
    }

    public static void close() {
        if (conn != null) {
            try {
                conn.close();
                System.out.println("🔒 Ligação fechada.");
            } catch (SQLException e) {
                System.err.println("❌ Erro ao fechar ligação: " + e.getMessage());
            }
        }
    }
}
