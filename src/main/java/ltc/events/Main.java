package ltc.events; // Declara o pacote (pasta) onde esta classe reside

import javafx.application.Application; // Importa a classe base para todas as aplicações JavaFX
import javafx.stage.Stage; // Importa a classe Stage, que representa a janela principal da aplicação
import javafx.scene.control.*; // Importa todos os componentes de ‘interface’ (como botões, labels, etc.) do JavaFX
import ltc.events.Modules.Window; // Importa a classe Window que contém a lógica para criar a interface gráfica
import ltc.events.Modules.db; // Importa a classe db, que contém o método 'connect' para ligar à base de dados

public class Main extends Application { // A classe principal estende (herda) de Application para ser uma aplicação JavaFX

    @Override // Anotação que garante que este método sobrescreve o método 'start' da classe Application
    public void start(Stage palco) { // Método obrigatório do JavaFX, chamado após a inicialização, para configurar a UI
        db.connect(); // Chama a função para conectar à base de dados (tentar abrir a ligação)
        Window janela = new Window();   // Instancia (cria) um novo objeto da classe Window
        janela.mostrar(palco);  // Chama o método 'mostrar' na instância da janela, passando o objeto Stage (a janela) como argumento para a visualização
    }
     static void main(String[] args) { // O ponto de entrada principal de qualquer aplicação Java (executado primeiro pela JVM)

        launch(args); // Método estático que inicia o ciclo de vida do JavaFX e, por sua vez, chama o método 'start' acima
    }
}