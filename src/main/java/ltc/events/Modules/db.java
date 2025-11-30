package ltc.events.Modules;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
// import io.github.cdimascio.dotenv.Dotenv; // Já não é necessário se não usar variáveis

public class db {

    // Se estiver a usar o driver SQLite, a URL tem de começar com jdbc:sqlite:
    private static final String URL = "jdbc:sqlite:eventos.db";
    // O ficheiro eventos.db será criado/acedido na pasta raiz do projeto.

    public static Connection connect() {
        try {
            // O DriverManager reconhece o driver SQLite através do prefixo da URL.
            Connection conn = DriverManager.getConnection(URL);
            System.out.println("✔ Ligação aberta ao SQLite!");
            return conn;
        } catch (SQLException e) {
            System.err.println("❌ Erro ao ligar ao SQLite: " + e.getMessage());
            return null;
        }
    }
}