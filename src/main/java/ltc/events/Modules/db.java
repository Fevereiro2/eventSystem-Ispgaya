package ltc.events.Modules;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import io.github.cdimascio.dotenv.Dotenv;

public class db {

    private static final Dotenv env = Dotenv.load();

    private static final String URL  = env.get("URL");
    private static final String USER = env.get("DB_USER");
    private static final String PASS = env.get("DB_PASSWORD");

    public static Connection connect() {
        try {
            Connection conn = DriverManager.getConnection(URL, USER, PASS);
            System.out.println("✔ Ligação aberta ao PostgreSQL!");
            return conn;
        } catch (SQLException e) {
            System.err.println("❌ Erro ao ligar ao PostgreSQL: " + e.getMessage());
            return null;
        }
    }
}
