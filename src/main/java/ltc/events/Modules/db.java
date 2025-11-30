package ltc.events.Modules; //Referenciar aonde esta o db.java

import java.sql.Connection; //Importar librarys da base de dados
import java.sql.DriverManager; //Importar librarys da base de dados
import java.sql.SQLException; //Importar librarys da base de dados

public class db {
    private static final String URL = "jdbc:sqlite:eventos.db"; //String para a conexão entre o ficheiro eventos.db onde contem toda a info do programa
    public static Connection connect() { //função para conectar a base de dados
        try { //tenta executar senão salta para o catch
            Connection conn = DriverManager.getConnection(URL);//Tenta estabelecer a conexão com a base de dados. Assume-se que 'URL' é uma constante  que contém o caminho/endereço do banco de dados SQLite.
            System.out.println("✔ Ligação aberta ao SQLite!");// Se a linha acima for bem-sucedida, esta linha será executada.
            return conn; //Retorna o objeto 'conn' para a instancia que foi declarada
        } catch (SQLException e) { //senão conseguir executar, inicia o bloco de captura de erros e mostra o erro especifico aonde esta a dar conflito
            System.err.println("❌ Erro ao ligar ao SQLite: " + e.getMessage()); //Imprime a mensagem de erro
            return null; //Retorna o objeto como null , indicando que não foi possivel estabelecer a ligação
        }
    }
}