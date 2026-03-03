package ltc.events.Modules; // Declara o pacote onde esta classe reside

import org.jetbrains.annotations.NotNull;
import java.sql.Connection;      // ‘Interface’ usada para representar uma ligação ativa à base de dados
import java.sql.DriverManager;  // Responsável por criar a conexão JDBC
import java.sql.SQLException;   // Exceção para capturar erros de SQL / ligação

/**
 * Classe responsável por fornecer conexões à base de dados SQLite.
 * Esta classe atua como um "módulo" de acesso à base de dados.
 */
public class db {

    // Caminho do ficheiro SQLite. O prefixo 'jdbc:sqlite:' indica que vamos usar o driver SQLite.
    private static final String URL = "jdbc:sqlite:eventos.db";

    /**
     * Estabelece uma ligação à base de dados.
     * Este método NUNCA deve retornar null — se falhar, deve lançar exceção.
     * A anotação @NotNull informa o IntelliJ que este método garante sempre um valor válido.
     */
    @NotNull
    public static Connection connect() {
        try {
            // Tenta abrir a ligação ao ficheiro SQLite.
            Connection conn = DriverManager.getConnection(URL);
            System.out.println("✔ Ligação aberta ao SQLite!");
            return conn;

        } catch (SQLException e) {
            // Em caso de falha, imprime erro e relança uma exceção Runtime,
            // garantindo assim que NUNCA devolvemos null.
            System.err.println("❌ Erro ao ligar ao SQLite: " + e.getMessage());
            throw new IllegalStateException("Falha na ligação à base de dados", e);
        }
    }
}
