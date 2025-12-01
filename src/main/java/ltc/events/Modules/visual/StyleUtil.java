package ltc.events.Modules.visual;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;
import ltc.events.Modules.NavbarUtil;

/**
 * Utilitário para aplicar estilos consistentes a elementos JavaFX em toda a aplicação.
 */
public class StyleUtil {

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
        Button button = new Button(text);

        // O bloco CSS unificado que define o estilo padrão
        button.setStyle(
                String.format("""
            -fx-background-color: linear-gradient(to bottom, %s, %s);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 8 18 8 18;
        """, colorStart, colorEnd)
        );

        button.setOnAction(handler);
        return button;
    }
    // Dentro da classe StyleUtil.java

    /**
     * Cria e estiliza o layout raiz padrão (BorderPane) para janelas modais.
     * Aplica a Navbar no topo e o estilo de sombra/cantos arredondados.
     *
     * @param stage O Stage (janela) a ser controlada pela Navbar.
     * @param centerContent O nó JavaFX (ex: VBox) que será colocado no centro.
     * @return O BorderPane raiz totalmente estilizado e configurado.
     */
    public static BorderPane createRootLayout(Stage stage, javafx.scene.Node centerContent) {
        NavbarUtil navbar = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);

        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(centerContent);
        raiz.setStyle("""
            -fx-background-color: white;
            -fx-background-radius: 10;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 15, 0.3, 0, 4);
        """);
        return raiz;
    }
}