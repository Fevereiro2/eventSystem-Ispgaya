package ltc.events.Modules.visual; // Declara que a classe pertence a este pacote (visual).

import javafx.geometry.Insets;      // Importa a classe para definir espaçamentos internos (padding).
import javafx.geometry.Pos;         // Importa a classe para definir o alinhamento de componentes.
import javafx.scene.Scene;          // Importa a Scene, o contentor do conteúdo gráfico.
import javafx.scene.control.Button; // Importa o componente Button.
import javafx.scene.control.Label;  // Importa o componente Label.
import javafx.scene.layout.BorderPane; // Importa o BorderPane, usado como layout raiz.
import javafx.scene.layout.HBox;    // Importa o HBox, usado para organizar botões horizontalmente.
import javafx.scene.layout.VBox;    // Importa o VBox, usado para organizar conteúdo verticalmente.
import javafx.stage.Modality;       // Importa a Modality para definir o comportamento modal da janela.
import javafx.stage.Stage;          // Importa a classe Stage, que representa a janela.
import javafx.stage.StageStyle;     // Importa o StageStyle para remover a decoração padrão da janela.
import ltc.events.Modules.NavbarUtil; // Importa a sua NavbarUtil para criar a barra de título personalizada.

public class CustomAlert { // Início da classe utilitária CustomAlert.

 /**
    * Exibe um alerta com ‘design’ personalizado e a NavbarUtil.
    * @param titulo O título da janela de alerta.
    * @param mensagem A mensagem a ser exibida.
    */
    public static void show(String titulo, String mensagem) { // Método estático para exibir o alerta.
     // 1. Configurar o Stage
        Stage stage = new Stage(); // Cria uma janela (Stage).
        stage.initStyle(StageStyle.UNDECORATED); // Define o estilo para remover a barra de título e bordas padrão do sistema.
        stage.initModality(Modality.APPLICATION_MODAL); // Define a janela como modal, bloqueando a interação com as outras janelas da aplicação até ser fechada.

        // Usar a sua NavbarUtil para o arrasto e botões de fechar
        NavbarUtil navbar = new NavbarUtil(); // Cria uma instância da sua classe de utilidade para a navbar.
        BorderPane barra = navbar.createNavbar(stage); // Cria a barra de título personalizada (com botões e arrasto) e associa-a a este Stage.

        // Comentários sobre a Navbar:
        // Ajusta a barra: remove os botões Min/Max se a NavbarUtil não foi refatorada
        // Se a NavbarUtil foi refatorada para usar createMacButtonsHBox, pode precisar de ajuste manual aqui.
        // Assumindo o NavbarUtil não refatorado (versão mais simples):
        // Se a NavbarUtil usar o BorderPane(center) para o HBox, o rightBox é nulo.

        // 2. Conteúdo Principal
        Label lblTitulo = new Label(titulo); // Cria um Label para o título da mensagem.
        lblTitulo.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-padding: 0 0 10 0;"); // Estiliza o título (negrito, tamanho e padding inferior).

        Label lblMensagem = new Label(mensagem); // Cria um Label para a mensagem principal.
        lblMensagem.setStyle("-fx-font-size: 13px; -fx-text-fill: #555;"); // Estiliza a mensagem (cor cinza).
        lblMensagem.setWrapText(true); // Permite que o texto quebre linhas se for muito longo.
        lblMensagem.setMaxWidth(300); // Define uma largura máxima para o texto.

        Button btnOK = new Button("OK"); // Cria o botão de ação principal.
        btnOK.setStyle(""" 
            -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 6 18;
        """); // Fim do bloco de estilo.
        btnOK.setOnAction(_ -> stage.close()); // Define a ação do botão: fechar a janela ao ser clicado.

        HBox botoes = new HBox(btnOK); // Cria um HBox e insere o botão OK.
        botoes.setAlignment(Pos.CENTER_RIGHT); // Alinha o botão à direita dentro do HBox.

        VBox conteudo = new VBox(15, lblTitulo, lblMensagem, botoes); // Cria um VBox para o conteúdo principal, com 15px de espaçamento.
        conteudo.setAlignment(Pos.TOP_LEFT); // Alinha o conteúdo ao topo-esquerda.
        conteudo.setPadding(new Insets(20)); // Aplica 20px de padding (espaçamento interno) em toda a volta do conteúdo.

         // 3. Layout Raiz (usando o seu design de sombra)
         BorderPane raiz = new BorderPane(); // Cria o BorderPane raiz.
         raiz.setTop(barra); // Coloca a barra de título personalizada no topo.
         raiz.setCenter(conteudo); // Coloca o VBox com a mensagem no centro.
         raiz.setStyle(""" 
            -fx-background-color: white;
            -fx-background-radius: 10;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 15, 0.3, 0, 4);
        """); // Fim do bloco de estilo.

        // 4. Exibir
        Scene scene = new Scene(raiz, 350, 200); // Cria a Scene, definindo o tamanho inicial da janela (350x200).
        stage.setScene(scene); // Define a Scene criada como o conteúdo da janela.
        stage.centerOnScreen(); // Centraliza a janela no ecrã do utilizador.
        stage.showAndWait(); // Exibe a janela e BLOQUEIA o código de execução até que esta janela seja fechada (o que é crucial para um alerta modal).
    } // Fim do método show.
} // Fim da classe CustomAlert.