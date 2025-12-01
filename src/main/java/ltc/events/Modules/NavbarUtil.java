package ltc.events.Modules; // Declara que a classe pertence a este pacote.

import javafx.geometry.Insets;      // Importa a classe para definir espaçamentos (padding/margins).
import javafx.geometry.Pos;         // Importa a classe para definir alinhamentos (ex: CENTER_LEFT).
import javafx.scene.control.Tooltip; // Importa a classe Tooltip para mostrar texto ao passar o rato.
import javafx.scene.layout.BorderPane; // Importa o BorderPane, que será a estrutura da barra ('Top', 'Bottom', 'Left', 'Right', 'Center').
import javafx.scene.layout.HBox;    // Importa o HBox para organizar os botões horizontalmente.
import javafx.scene.paint.Color;    // Importa a classe Color para definir as cores dos botões.
import javafx.scene.shape.Circle;   // Importa a classe Circle para criar os botões em formato circular (estilo macOS).
import javafx.stage.Stage;          // Importa a classe Stage, a janela principal a ser controlada.

// Classe responsável por criar e configurar a barra de título (Navbar) personalizada
public class NavbarUtil {

    // Variáveis de instância para iniciar a posição do cursor (necessárias para mover a janela)
    private double xOffset = 0;
    private double yOffset = 0;

    /**
     * Constrói e retorna um BorderPane que serve como a barra de título personalizada.
     * @param stage O Stage (janela) que será controlada pelos botões e pelo arrasto da barra.
     * @return Um BorderPane (a barra de navegação) totalmente configurado.
     */
    public BorderPane createNavbar(Stage stage) {

        // 1. Criar os botões de controlo de janela (Estilo macOS)
        Circle btnFechar = new Circle(6, Color.web("#FF5F57")); // Vermelho: Fechar
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));    // Amarelo: Minimizar
        Circle btnMax = new Circle(6, Color.web("#28C940"));    // Verde: Maximizar/Restaurar

        // Adicionar tooltips para acessibilidade
        Tooltip.install(btnFechar, new Tooltip("Fechar"));
        Tooltip.install(btnMin, new Tooltip("Minimizar"));
        Tooltip.install(btnMax, new Tooltip("Maximizar/Restaurar"));


        // 2. Configurar as ações dos botões
        btnFechar.setOnMouseClicked(_ -> stage.close());
        btnMin.setOnMouseClicked(_ -> stage.setIconified(true));
        btnMax.setOnMouseClicked(_ -> stage.setMaximized(!stage.isMaximized()));

        // 3. Organizar os botões em um HBox (o conteúdo do canto esquerdo)
        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10)); // Espaçamento à esquerda

        // 4. Criar, estilizar e configurar o arrasto da barra principal
        // O método extraído lida com a aparência e o comportamento de arrasto.
        BorderPane barra = createStyledAndDraggableBar(stage);

        // 5. Adicionar o HBox (botões macOS) ao lado esquerdo da barra
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

        // 1. Cria o BorderPane vazio
        BorderPane barra = new BorderPane();

        // 2. Aplica estilo (Note: correção da sintaxe do Text Block)
        barra.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf);
            -fx-border-color: #b0b0b0;
            -fx-border-width: 0 0 1 0;
        """);

        // 3. Configurar o arrasto (mover a janela)
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