package ltc.events.classes.hashs; // Declara que a classe pertence ao pacote de utilitários de hashing.

import org.mindrot.jbcrypt.BCrypt; // Importa a biblioteca BCrypt (geralmente org.mindrot.jbcrypt), essencial para hashing seguro.


public class PasswordUtil { // Início da classe utilitária estática para manipulação de senhas.

    // ─────────────────────────────────────────────
    // MÉTODO 1: GERAÇÃO DE HASH
    // ─────────────────────────────────────────────

    /**
     * Gera um hash seguro (BCrypt) para uma senha em texto simples.
     * @param password A senha em texto simples a ser hasheada.
     * @return A ‘string’ da senha hasheada.
     */
    public static String hashPassword(String password) {
        // Gera o hash usando o 'salt' (valor aleatório) gerado automaticamente.
        // O fator 12 define a força do hashing (custo/complexidade).
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    // ─────────────────────────────────────────────
    // MÉTODO 2: VERIFICAÇÃO DE FORMATO
    // ─────────────────────────────────────────────

    /**
     * Verifica se uma ‘string’ parece ser um hash BCrypt válido.
     * (Usado para diferenciar senhas hashes de senhas antigas/texto simples na BD).
     * @param password A ‘string’ (lida do DB) a ser verificada.
     * @return true se começar com um prefixo BCrypt conhecido, false caso contrário.
     */
    public static boolean isHashed(String password) {
        return password != null && // Garante que a string não é nula antes de verificar o prefixo.
                (password.startsWith("$2a$") // Prefixo padrão do BCrypt.
                        || password.startsWith("$2b$") // Outro prefixo comum (versões mais recentes).
                        || password.startsWith("$2y$")); // Outro prefixo comum.
    }

    // ─────────────────────────────────────────────
    // MÉTODO 3: COMPARAÇÃO (AUTENTICAÇÃO)
    // ─────────────────────────────────────────────

    /**
     * Compara uma senha fornecida pelo utilizador (texto simples) com um hash armazenado.
     * Este é o método usado para a autenticação.
     * @param rawPassword A senha em texto simples introduzida.
     * @param hashedPassword O hash lido da base de dados.
     * @return true se as senhas corresponderem, false caso contrário.
     */
    public static boolean checkPassword(String rawPassword, String hashedPassword) {
        // BCrypt.checkpw compara de forma segura, a rawPassword internamente e comparando com o hash.
        return BCrypt.checkpw(rawPassword, hashedPassword);
    }
} // Fim da classe PasswordUtil.