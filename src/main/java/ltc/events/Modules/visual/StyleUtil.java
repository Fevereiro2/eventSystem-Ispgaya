package ltc.events.Modules.visual;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.control.Button;

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
}