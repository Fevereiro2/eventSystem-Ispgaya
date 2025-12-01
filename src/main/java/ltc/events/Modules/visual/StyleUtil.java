package ltc.events.Modules.visual; // Declara que a classe StyleUtil pertence a este pacote.

import javafx.event.ActionEvent; // Importa a classe de eventos para a ação do botão.
import javafx.event.EventHandler; // Importa a interface para o manipulador de eventos.
import javafx.scene.control.Button; // Importa o componente Button.
import javafx.scene.layout.BorderPane; // Importa o BorderPane para o layout raiz.
import javafx.stage.Stage; // Importa o Stage (janela).
import ltc.events.Modules.NavbarUtil; // Importa o utilitário para a barra de navegação personalizada.

/**
 * Utilitário para aplicar estilos consistentes a elementos JavaFX em toda a aplicação.
 */
public class StyleUtil { // Início da classe utilitária StyleUtil.

    /**
     * Cria e retorna um botão estilizado com um gradiente de cor e ação.
     * Este método é estático e público para ser usado em qualquer classe do projeto.
     * * @param text O texto a exibir no botão.
     * @param colorStart A cor inicial do gradiente CSS (ex: "#34c759").
     * @param colorEnd A cor final do gradiente CSS (ex: "#2ca02c").
     * @param handler A ação (EventHandler) a ser executada ao clicar no botão.
     * @return O botão JavaFX estilizado.
     */
    public static Button createStyledButton(String text, String colorStart, String colorEnd, EventHandler<ActionEvent> handler) {
        Button button = new Button(text); // Cria uma instância do botão com o texto fornecido.

        // O bloco CSS unificado que define o estilo padrão
        button.setStyle( // Define o estilo CSS do botão.
                String.format(""" 
            -fx-background-color: linear-gradient(to bottom, %s, %s);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 8 18 8 18;
        """, colorStart, colorEnd) // Insere as cores dinamicamente no gradiente.
        );

        button.setOnAction(handler); // Associa a ação (EventHandler) a ser executada ao clique do botão.
        return button; // Devolve a instância do botão estilizado.
    }

    /**
     * Cria e estiliza o layout raiz padrão (BorderPane) para janelas modais.
     * Aplica a Navbar no topo e o estilo de sombra/cantos arredondados.
     *
     * @param stage O Stage (janela) a ser controlada pela Navbar.
     * @param centerContent O nó JavaFX (ex: VBox) que será colocado no centro.
     * @return O BorderPane raiz totalmente estilizado e configurado.
     */
    public static BorderPane createRootLayout(Stage stage, javafx.scene.Node centerContent) {
        NavbarUtil navbar = new NavbarUtil(); // Cria uma instância da classe utilitária para a barra de título.
        BorderPane barra = navbar.createNavbar(stage); // Cria a barra de título personalizada (com arrasto e botões de fechar).

        BorderPane raiz = new BorderPane(); // Cria o layout raiz principal.
        raiz.setTop(barra); // Coloca a barra de título personalizada no topo (Top).
        raiz.setCenter(centerContent); // Coloca o conteúdo específico da janela no centro (Center).
        raiz.setStyle("""
            -fx-background-color: white;
            -fx-background-radius: 10;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 15, 0.3, 0, 4);
        """);
        return raiz; // Devolve o BorderPane raiz, pronto para ser usado numa Scene.
    }
} // Fim da classe StyleUtil.