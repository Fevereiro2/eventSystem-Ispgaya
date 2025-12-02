package ltc.events.classes; // Declara que a classe Types pertence a este pacote de modelos de dados.

import java.sql.ResultSet; // Importa a classe ResultSet para poder ler dados de consultas SQL.
import java.sql.SQLException; // Importa SQLException para lidar com erros durante a leitura do ResultSet.

public class Types { // Início da classe Types (modelo para tipos de utilizador/estado).

    // ─────────────────────────────────────────────
    // ATRIBUTOS (CAMPOS DE DADOS)
    // ─────────────────────────────────────────────

    private final int id; // Identificador único do tipo (imutável, por isso 'final').
    private final String name; // Nome descritivo do tipo (ex: "Participant", "Admin").

    // ─────────────────────────────────────────────
    // CONSTRUTORES
    // ─────────────────────────────────────────────

    /**
     * Construtor padrão.
     * @param id O ID único do tipo.
     * @param name O nome descritivo do tipo.
     */
    public Types(int id, String name) {
        this.id = id; // Inicializa o ID.
        this.name = name; // Inicializa o Nome.
    }

    /**
     * Construtor automático a partir de um ResultSet (lido da BD).
     * @param rs O ResultSet posicionado na linha de dados a ser lida.
     * @throws SQLException Propagada se houver um erro de leitura do DB.
     */
    public Types(ResultSet rs) throws SQLException {
        // Chama o construtor padrão (encadeamento de construtores).
        this(
                // Obtém o valor inteiro da coluna "types_id" do ResultSet.
                rs.getInt("types_id"),
                // Obtém o valor ‘string’ da coluna "name" do ResultSet.
                rs.getString("name")
        );
    }

    // ─────────────────────────────────────────────
    // GETTERS
    // ─────────────────────────────────────────────

    /**
     * @return O ID do tipo.
     */
    public int getId() { return id; }

    /**
     * @return O nome do tipo.
     */
    public String getName() { return name; }

    // ─────────────────────────────────────────────
    // MÉTODOS STANDARD
    // ─────────────────────────────────────────────

    /**
     * Sobrescreve o método padrão para fornecer uma representação legível do objeto.
     * (Útil para logs, debug ou preenchimento direto de componentes UI).
     * @return O nome do tipo.
     */
    @Override
    public String toString() {
        return name; // Devolve o nome do tipo.
    }
} // Fim da classe Types.