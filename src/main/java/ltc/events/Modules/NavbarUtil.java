package ltc.events.Modules;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

// Classe responsável por criar e configurar a barra de título (Navbar) personalizada
public class NavbarUtil {

    // Variáveis de instância para rastrear a posição do cursor (necessárias para mover a janela)
    private double xOffset = 0;
    private double yOffset = 0;

    /**
     * Constrói e retorna um BorderPane que serve como a barra de título personalizada.
     * @param stage O Stage (janela) que será controlada pelos botões e pelo arrasto da barra.
     * @return Um BorderPane (a barra de navegação) totalmente configurado.
     */
    public BorderPane createNavbar(Stage stage) {

        // 1. Criar os botões de controle de janela (Estilo macOS)
        Circle btnFechar = new Circle(6, Color.web("#FF5F57")); // Vermelho: Fechar
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));    // Amarelo: Minimizar
        Circle btnMax = new Circle(6, Color.web("#28C940"));    // Verde: Maximizar/Restaurar

        // Adicionar tooltips para acessibilidade
        Tooltip.install(btnFechar, new Tooltip("Fechar"));
        Tooltip.install(btnMin, new Tooltip("Minimizar"));
        Tooltip.install(btnMax, new Tooltip("Maximizar/Restaurar"));


        // 2. Configurar as ações dos botões
        btnFechar.setOnMouseClicked(e -> stage.close());
        btnMin.setOnMouseClicked(e -> stage.setIconified(true));
        btnMax.setOnMouseClicked(e -> stage.setMaximized(!stage.isMaximized()));

        // 3. Organizar os botões em um HBox
        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10)); // Espaçamento à esquerda

        // 4. Criar o BorderPane (a barra) e posicionar os botões
        BorderPane barra = new BorderPane(botoesMac, null, null, null, null);
        barra.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf);
            -fx-border-color: #b0b0b0;
            -fx-border-width: 0 0 1 0;
        """);

        // 5. Configurar o arrasto (mover a janela)
        barra.setOnMousePressed(e -> {
            // Captura as coordenadas iniciais do clique dentro da Scene
            xOffset = e.getSceneX();
            yOffset = e.getSceneY();
        });

        barra.setOnMouseDragged(e -> {
            // Move o Stage para as novas coordenadas da tela
            stage.setX(e.getScreenX() - xOffset);
            stage.setY(e.getScreenY() - yOffset);
        });

        return barra;
    }
}