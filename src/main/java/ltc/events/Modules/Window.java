package ltc.events.Modules;

import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.geometry.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import ltc.events.Modules.con.EventDB;
import ltc.events.Modules.visual.Login;
import ltc.events.classes.Event;

public class Window {
    private double xOffset = 0;
    private double yOffset = 0;

    public void mostrar(Stage palco) {
        palco.initStyle(StageStyle.UNDECORATED); // remove navbar e título padrão

        //#################################################################################
        // Botões estilo macOS
        Circle btnFechar = new Circle(6, Color.web("#FF5F57"));
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));
        Circle btnMax = new Circle(6, Color.web("#28C940"));

        btnFechar.setOnMouseClicked(_ -> palco.close());
        btnMin.setOnMouseClicked(_ -> palco.setIconified(true));
        btnMax.setOnMouseClicked(_ -> palco.setMaximized(!palco.isMaximized()));

        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10));

        //#################################################################################
        // Barra superior (draggable)
        BorderPane barra = getBorderPane(palco, botoesMac);

        //#################################################################################
        // 🎟️ Secção principal — Carrossel de Eventos
        Label titulo = new Label("🎟️ Eventos Disponíveis");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");

        // Scroll horizontal
        ScrollPane scroll = new ScrollPane();
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setPannable(true);
        scroll.setStyle("-fx-background: transparent; -fx-background-color: transparent;");

        HBox hbox = new HBox(25);
        hbox.setPadding(new Insets(20));
        hbox.setAlignment(Pos.CENTER_LEFT);

        // Carrel events da BD
        for (Event ev : EventDB.getAllEvents()) {
            VBox card = criarCardEvento(ev);
            hbox.getChildren().add(card);
        }

        scroll.setContent(hbox);

        VBox centro = new VBox(20, titulo, scroll);
        centro.setAlignment(Pos.TOP_CENTER);
        centro.setPadding(new Insets(30));

        //#################################################################################
        // Janela principal
        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(centro);
        raiz.setStyle("-fx-background-color: white; -fx-background-radius: 10; "
                + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0.3, 0, 4);");

        //#################################################################################
        // Mostrar cena (janela maior)
        Scene cena = new Scene(raiz, 1000, 600);
        palco.setScene(cena);
        palco.show();
    }

    private BorderPane getBorderPane(Stage palco, HBox botoesMac) {
        BorderPane barra = new BorderPane();
        Button btnLogin = new Button("🔐 Login");
        btnLogin.setStyle("""
    -fx-background-color: linear-gradient(to bottom, #007aff, #0051a8);
    -fx-text-fill: white;
    -fx-font-weight: bold;
    -fx-background-radius: 8;
    -fx-cursor: hand;
    -fx-padding: 6 14 6 14;
""");

// Efeito hover
        btnLogin.setOnMouseEntered(_ -> btnLogin.setStyle("""
    -fx-background-color: linear-gradient(to bottom, #339cff, #007aff);
    -fx-text-fill: white;
    -fx-font-weight: bold;
    -fx-background-radius: 8;
    -fx-cursor: hand;
    -fx-padding: 6 14 6 14;
"""));
        btnLogin.setOnMouseExited(_ -> btnLogin.setStyle("""
    -fx-background-color: linear-gradient(to bottom, #007aff, #0051a8);
    -fx-text-fill: white;
    -fx-font-weight: bold;
    -fx-background-radius: 8;
    -fx-cursor: hand;
    -fx-padding: 6 14 6 14;
"""));

// Ação do botão → abre a janela de login
        btnLogin.setOnAction(_ -> new Login().mostrarLogin());

// Colocar botão à direita
        HBox rightBox = new HBox(btnLogin);
        rightBox.setAlignment(Pos.CENTER_RIGHT);
        rightBox.setPadding(new Insets(6, 10, 6, 0));

// Adiciona ao topo
        barra.setLeft(botoesMac);
        barra.setRight(rightBox);

        barra.setStyle("-fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf); "
                + "-fx-border-color: #b0b0b0; -fx-border-width: 0 0 1 0;");

        barra.setOnMousePressed(e -> {
            xOffset = e.getSceneX();
            yOffset = e.getSceneY();
        });
        barra.setOnMouseDragged(e -> {
            palco.setX(e.getScreenX() - xOffset);
            palco.setY(e.getScreenY() - yOffset);
        });
        return barra;
    }

    //#################################################################################
    // Cria o "card" de cada evento
    private VBox criarCardEvento(Event ev) {
        VBox card = new VBox(10);
        card.setPrefSize(250, 320);
        card.setPadding(new Insets(15));
        card.setAlignment(Pos.TOP_CENTER);
        card.setStyle("""
        -fx-background-color: #ffffff;
        -fx-background-radius: 15;
        -fx-border-radius: 15;
        -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.15), 12, 0, 0, 6);
        -fx-cursor: hand;
    """);

        // Imagem do evento (ou placeholder)
        ImageView img;
        try {
            img = new ImageView(new Image(ev.getImage(), 220, 130, false, true));
        } catch (Exception ex) {
            img = new ImageView(new Image("https://via.placeholder.com/220x130.png?text=Evento",
                    220, 130, false, true));
        }
        img.setStyle("-fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 5, 0, 0, 2);");

        // Nome do evento
        Label lblNome = new Label(ev.getName());
        lblNome.setStyle("-fx-font-weight: bold; -fx-font-size: 16px; -fx-text-fill: #333;");
        lblNome.setWrapText(true);
        lblNome.setAlignment(Pos.CENTER);

        // Data formatada
        Label lblData = new Label("📅 " + ev.getStartdate().toLocalDateTime().toLocalDate());
        lblData.setStyle("-fx-text-fill: #666; -fx-font-size: 13px;");

        // Local
        Label lblLocal = new Label("📍 " + ev.getLocal());
        lblLocal.setStyle("-fx-text-fill: #777; -fx-font-size: 13px;");

        // Estado colorido
        Label lblEstado = new Label(ev.getState().getName());
        lblEstado.setStyle(defineCorEstado(ev.getState().getName()));
        lblEstado.setPadding(new Insets(4, 10, 4, 10));
        lblEstado.setAlignment(Pos.CENTER);
        lblEstado.setMaxWidth(Double.MAX_VALUE);
        lblEstado.setBorder(new Border(new BorderStroke(Color.LIGHTGRAY,
                BorderStrokeStyle.SOLID, new CornerRadii(5), BorderWidths.DEFAULT)));

        // Organizar tudo
        VBox.setMargin(img, new Insets(0, 0, 5, 0));
        VBox.setMargin(lblNome, new Insets(5, 0, 0, 0));

        card.getChildren().addAll(img, lblNome, lblData, lblLocal, lblEstado);

        // Efeito hover
        card.setOnMouseEntered(_ -> card.setStyle("""
        -fx-background-color: #f9f9f9;
        -fx-background-radius: 15;
        -fx-border-radius: 15;
        -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 15, 0, 0, 6);
        -fx-cursor: hand;
    """));
        card.setOnMouseExited(_ -> card.setStyle("""
        -fx-background-color: #ffffff;
        -fx-background-radius: 15;
        -fx-border-radius: 15;
        -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.15), 12, 0, 0, 6);
        -fx-cursor: hand;
    """));

        // Clique → mostrar detalhes do evento
        card.setOnMouseClicked(_ -> {
            Alert detalhes = new Alert(Alert.AlertType.INFORMATION);
            detalhes.setTitle("Detalhes do Evento");
            detalhes.setHeaderText(ev.getName());
            detalhes.setContentText(
                    "📍 Local: " + ev.getLocal() + "\n" +
                            "🕒 Início: " + ev.getStartdate() + "\n" +
                            "🕒 Fim: " + ev.getFinaldate() + "\n\n" +
                            "ℹ️ " + ev.getDescription() + "\n\n" +
                            "Estado: " + ev.getState()
            );
            detalhes.showAndWait();
        });

        return card;
    }
    
    private String defineCorEstado(String state) {
        if (state == null) return "-fx-background-color: #ddd; -fx-text-fill: black; -fx-font-size: 12px;";
        return switch (state.toLowerCase()) {
            case "ativo" -> "-fx-background-color: #e8f5e9; -fx-text-fill: #2e7d32; -fx-font-size: 12px;";
            case "planeado" -> "-fx-background-color: #fff8e1; -fx-text-fill: #f9a825; -fx-font-size: 12px;";
            case "cancelado" -> "-fx-background-color: #ffebee; -fx-text-fill: #c62828; -fx-font-size: 12px;";
            case "concluido" -> "-fx-background-color: #e3f2fd; -fx-text-fill: #1565c0; -fx-font-size: 12px;";
            default -> "-fx-background-color: #eeeeee; -fx-text-fill: #333; -fx-font-size: 12px;";
        };
    }


}



