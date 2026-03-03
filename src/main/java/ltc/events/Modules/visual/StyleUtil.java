package ltc.events.Modules.visual;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;
import ltc.events.Modules.NavbarUtil;

public class StyleUtil {

    // Botão com gradiente (mantido do original)
    public static Button gradientButton(String text, String colorStart, String colorEnd, EventHandler<ActionEvent> handler) {
        Button button = new Button(text);

        button.setStyle(String.format("""
            -fx-background-color: linear-gradient(to bottom, %s, %s);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 8 18 8 18;
        """, colorStart, colorEnd));

        if (handler != null) {
            button.setOnAction(handler);
        }

        return button;
    }

    // Botão de admin: tamanho fixo e cor consistente
    public static Button adminButton(String text, EventHandler<ActionEvent> handler) {
        Button button = new Button(text);

        button.setStyle("""
        -fx-background-color: #007aff;
        -fx-text-fill: white;
        -fx-font-size: 14px;
        -fx-font-weight: bold;
        -fx-padding: 10;
        -fx-background-radius: 6;
        -fx-pref-width: 200px;  // largura fixa
        -fx-pref-height: 50px;  // altura fixa
        """);

        if (handler != null) {
            button.setOnAction(handler);
        }

        return button;
    }

    // ==== BOTÕES MODERNOS ====
    public static Button primaryButton(String text, EventHandler<ActionEvent> handler) {
        return gradientButton(text, "#2EC4B6", "#1A9E8C", handler);
    }

    public static Button secondaryButton(String text, EventHandler<ActionEvent> handler) {
        Button b = new Button(text);

        b.setStyle("""
            -fx-background-color: #e0e0e0;
            -fx-text-fill: #333;
            -fx-font-weight: bold;
            -fx-background-radius: 8;
            -fx-padding: 8 16;
            -fx-cursor: hand;
        """);

        b.setOnMouseEntered(_ -> b.setStyle("""
            -fx-background-color: #d5d5d5;
            -fx-text-fill: #111;
            -fx-font-weight: bold;
            -fx-background-radius: 8;
            -fx-padding: 8 16;
        """));

        b.setOnMouseExited(_ -> b.setStyle("""
            -fx-background-color: #e0e0e0;
            -fx-text-fill: #333;
            -fx-font-weight: bold;
            -fx-background-radius: 8;
            -fx-padding: 8 16;
        """));

        if (handler != null) {
            b.setOnAction(handler);
        }

        return b;
    }

    public static Button dangerButton(String text, EventHandler<ActionEvent> handler) {
        return gradientButton(text, "#FF5C5C", "#E64545", handler);
    }

    // Layout raiz com navbar
    public static BorderPane createRootLayout(Stage stage, Node centerContent) {
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
