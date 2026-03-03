package ltc.events.Modules; // Declara que a classe pertence a este pacote.

import javafx.geometry.Insets;      // Padding/margens.
import javafx.geometry.Pos;         // Alinhamentos (ex: CENTER_LEFT).
import javafx.scene.control.Tooltip; // Tooltip ao passar o rato.
import javafx.scene.layout.BorderPane; // Estrutura da barra (Top/Bottom/Left/Right/Center).
import javafx.scene.layout.HBox;    // Layout horizontal dos botoes.
import javafx.scene.paint.Color;    // Cores dos botoes.
import javafx.scene.shape.Circle;   // Botões circulares estilo macOS.
import javafx.stage.Stage;          // Janela principal a controlar.

// Cria e configura a barra de titulo (Navbar) personalizada.
public class NavbarUtil {

    // Offsets usados para arrastar a janela.
    private double xOffset = 0;
    private double yOffset = 0;

    /**
     * Constrói e retorna um BorderPane que serve como a barra de título personalizada.
     * @param stage O Stage (janela) que será controlada pelos botões e pelo arrasto da barra.
     * @return Um BorderPane (a barra de navegação) totalmente configurado.
     */
    public BorderPane createNavbar(Stage stage) {

        // 1) Botões de controlo de janela (estilo macOS)
        Circle btnFechar = new Circle(6, Color.web("#FF5F57")); // Fechar
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));    // Minimizar
        Circle btnMax = new Circle(6, Color.web("#28C940"));    // Maximizar/Restaurar

        // Tooltips para acessibilidade
        Tooltip.install(btnFechar, new Tooltip("Fechar"));
        Tooltip.install(btnMin, new Tooltip("Minimizar"));
        Tooltip.install(btnMax, new Tooltip("Maximizar/Restaurar"));


        // 2) Ações
        btnFechar.setOnMouseClicked(_ -> stage.close());
        btnMin.setOnMouseClicked(_ -> stage.setIconified(true));
        btnMax.setOnMouseClicked(_ -> stage.setMaximized(!stage.isMaximized()));

        // 3) Layout dos botoes
        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10)); // Espaçamento a esquerda

        // 4) Barra estilizada e movível.
        BorderPane barra = createStyledAndDraggableBar(stage);

        // 5) Colocar os botoes à esquerda
        barra.setLeft(botoesMac);

        return barra;
    }

    /**
     * Método extraído: Cria e configura o BorderPane base da barra de navegação com estilo e
     * a lógica de arrasto da janela.
     * @param stage O Stage que a barra vai controlar (movimento).
     * @return O BorderPane base, pronto para receber conteúdo (left/right/center).
     */
    private BorderPane createStyledAndDraggableBar(Stage stage) {

        // 1) BorderPane base
        BorderPane barra = new BorderPane();

        // 2) Estilo
        barra.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf);
            -fx-border-color: #b0b0b0;
            -fx-border-width: 0 0 1 0;
        """);

        // 3) Arrastar a janela
        barra.setOnMousePressed(e -> {
            xOffset = e.getSceneX();
            yOffset = e.getSceneY();
        });

        barra.setOnMouseDragged(e -> {
            stage.setX(e.getScreenX() - xOffset);
            stage.setY(e.getScreenY() - yOffset);
        });

        return barra;
    }
}
