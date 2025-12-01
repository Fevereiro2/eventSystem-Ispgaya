package ltc.events.classes.hashs; // Declara que a classe pertence ao pacote de classes de hashing.

import ltc.events.Modules.db; // Importa o utilitário de conexão à base de dados.
import ltc.events.classes.Participant; // Importa a classe de modelo Participant.
import java.sql.*; // Importa todas as classes necessárias para manipulação de JDBC/SQL.

public class AuthService { // Início da classe utilitária de Serviço de Autenticação.

    /**
     * Tenta autenticar um utilizador com endereço eletrónico e senha.
     * Suporta a verificação de senhas hasheadas e a migração de senhas em texto simples.
     * @param email O endereço eletrónico fornecido pelo utilizador.
     * @param password A senha fornecida pelo utilizador (texto simples).
     * @return O objeto Participant se a autenticação for bem-sucedida, ou null caso contrário.
     */
    public static Participant login(String email, String password) { // Método estático de login.

        System.out.println("=== DEBUG LOGIN ===");
        System.out.println("Email recebido: " + email);
        System.out.println("Password recebida: " + password);

        // Query SQL para selecionar todos os dados do participante e o seu tipo associado.
        String sql = """
            SELECT p.*, t.types_id, t.name AS types_name, p.password FROM participant p
            INNER JOIN types t ON p.types_id = t.types_id
            WHERE p.email = ?
        """;


        String storedPassword; // Variável para armazenar a senha lida da base de dados.
        Participant user; // Variável para armazenar o objeto Participant se encontrado.

        // ─────────────────────────────────────────────
        // FASE 1: Conexão e Leitura de Dados
        // ─────────────────────────────────────────────

        try (Connection conn = db.connect()) { // ✅ Solução: Inicializa apenas a conexão no try-with-resources externo.

            // O PreparedStatement só é criado AGORA, após a conexão 'conn' estar garantida.
            try (PreparedStatement stmt = conn.prepareStatement(sql)) { // O stmt é fechado automaticamente.

                stmt.setString(1, email); // Define o parâmetro "?" da query.

                try (ResultSet rs = stmt.executeQuery()) { // O ResultSet é fechado automaticamente.

                    if (!rs.next()) { // Verifica se encontrou um utilizador.
                        System.out.println("DEBUG → Utilizador NÃO encontrado.");
                        return null;
                    }

                    // 1️⃣ Lê password
                    storedPassword = rs.getString("password");
                    System.out.println("DEBUG → PASSWORD BD: " + storedPassword);

                    user = new Participant(rs); // Constrói o objeto ‘User’.

                } // ResultSet fechado

            } // PreparedStatement fechado

        } catch (SQLException e) {
            // Captura erros durante a conexão ou a leitura de dados.
            System.out.println("Erro na autenticação: " + e.getMessage());
            return null;
        }

        // ─────────────────────────────────────────────
        // FASE 2: Verificação de Hash e Migração (Sem DB)
        // ─────────────────────────────────────────────

        if (storedPassword == null) {
            System.out.println("DEBUG → storedPassword é null. Falha de leitura da BD.");
            return null;
        }

        // Verifica se a senha lida da base de dados já está em formato hash (BCrypt).
        boolean isHashed = PasswordUtil.isHashed(storedPassword);
        System.out.println("DEBUG → Password é hash? " + isHashed);

        if (isHashed) {
            // Se for hash, verifica.
            boolean ok = PasswordUtil.checkPassword(password, storedPassword);
            System.out.println("DEBUG → BCrypt resultado: " + ok);
            return ok ? user : null;
        }

        // ─────────────────────────────────────────────
        // FASE 3: Password antiga em texto simples (Legacy) e Migração (Com DB)
        // ─────────────────────────────────────────────

        // Compara a senha em texto simples.
        boolean match = storedPassword.equals(password);
        System.out.println("DEBUG → Match texto simples: " + match);

        if (match) {
            // ‘Login’ válido, iniciar migração.
            System.out.println("DEBUG → Atualizando antiga password para hash...");

            String newHashedPassword = PasswordUtil.hashPassword(password);

            // Bloco try-with-resources separado para a operação de escrita (UPDATE).
            try (Connection conn = db.connect();
                 PreparedStatement update = conn.prepareStatement(
                         "UPDATE participant SET password = ? WHERE email = ?"
                 )) {

                update.setString(1, newHashedPassword);
                update.setString(2, email);
                update.executeUpdate();

            } catch (SQLException e) {
                System.out.println("Erro a atualizar password: " + e.getMessage());
                // Não impede o ‘login’, apenas a migração.
            }
        }

        return match ? user : null;
    }
}