package ltc.events.Modules; // Declara o pacote onde esta classe reside

import java.sql.Connection; // Importa a ‘interface’ Connection, usada para gerir a conexão física com a base de dados
import java.sql.DriverManager; // Importa a classe responsável por carregar o condutor JDBC e obter a conexão
import java.sql.SQLException; // Importa a exceção lançada em caso de erros na manipulação do SQL

public class db { // Definição da classe 'db', responsável por gerir a conexão com a base de dados
    private static final String URL = "jdbc:sqlite:eventos.db";// Variável constante e estática que armazena o caminho (URL) para o ficheiro da base de dados SQLite
    public static Connection connect() { // Função estática que tenta estabelecer e retornar a conexão com a base de dados
        try { // Bloco TRY: Tenta executar o código que pode falhar (a tentativa de conexão)
            Connection conn = DriverManager.getConnection(URL);// Tenta estabelecer a conexão usando o URL e armazena o resultado no objeto 'conn'
            System.out.println("✔ Ligação aberta ao SQLite!");// Se a conexão for bem-sucedida, imprime uma mensagem de sucesso no console
            return conn;// Retorna o objeto 'Connection' ativo
        } catch (SQLException e) { // Bloco CATCH: Captura qualquer erro (exceção) que ocorra durante a execução do 'try'
            System.err.println("❌ Erro ao ligar ao SQLite: " + e.getMessage());// Imprime a mensagem de erro específica na consola (usando System.err para indicar um erro)
            return null;// Retorna 'null', indicando que a conexão falhou
        }
    }
}