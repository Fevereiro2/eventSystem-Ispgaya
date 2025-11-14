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
import ltc.events.Modules.visual.Register;
import ltc.events.classes.Event;
import ltc.events.classes.hashs.SessionEntry;

public class Window {

    private double xOffset = 0;
    private double yOffset = 0;

    // 🔥 Armazena a referência do Stage para conseguir recarregar a UI
    private Stage palcoRef;

    // ============================================================
    // 🔥 Função principal — chama setup e guarda o Stage
    // ============================================================
    public void mostrar(Stage palco) {
        this.palcoRef = palco; // 🔥 guarda referência
        palco.initStyle(StageStyle.UNDECORATED);
        criarUI();
    }

    // ============================================================
    // 🔥 Recarrega a UI após login/logout
    // ============================================================
    public void refresh() {
        criarUI();
    }

    // ============================================================
    // 🔥 Aqui fica toda a criação da UI
    // ============================================================
    private void criarUI() {

        // Botões macOS
        Circle btnFechar = new Circle(6, Color.web("#FF5F57"));
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));
        Circle btnMax = new Circle(6, Color.web("#28C940"));

        btnFechar.setOnMouseClicked(_ -> palcoRef.close());
        btnMin.setOnMouseClicked(_ -> palcoRef.setIconified(true));
        btnMax.setOnMouseClicked(_ -> palcoRef.setMaximized(!palcoRef.isMaximized()));

        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10));

        // Barra superior
        BorderPane barra = getBorderPane(palcoRef, botoesMac);

        // Título
        Label titulo = new Label("🎟️ Eventos Disponíveis");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");

        // Scroll
        ScrollPane scroll = new ScrollPane();
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setPannable(true);
        scroll.setStyle("-fx-background: transparent; -fx-background-color: transparent;");

        HBox hbox = new HBox(25);
        hbox.setPadding(new Insets(20));
        hbox.setAlignment(Pos.CENTER_LEFT);

        // Carregar eventos da BD
        hbox.getChildren().clear();
        for (Event ev : EventDB.getAllEvents()) {
            hbox.getChildren().add(criarCardEvento(ev));
        }

        scroll.setContent(hbox);

        VBox centro = new VBox(20, titulo, scroll);
        centro.setAlignment(Pos.TOP_CENTER);
        centro.setPadding(new Insets(30));

        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(centro);
        raiz.setStyle("-fx-background-color: white; -fx-background-radius: 10;"
                + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0.3, 0, 4);");

        Scene cena = new Scene(raiz, 1000, 600);
        palcoRef.setScene(cena);
        palcoRef.show();
    }

    // ============================================================
    // 🔥 Barra superior — Login/Register ou User Info + Logout
    // ============================================================
    private BorderPane getBorderPane(Stage palco, HBox botoesMac) {

        BorderPane barra = new BorderPane();

        // ================= LOGADO ==================
        if (SessionEntry.isLogged()) {

            var user = SessionEntry.getUser();

            Label lblUser = new Label("👤 " + user.getName() + " (" + user.getType().getName() + ")");
            lblUser.setStyle("-fx-font-weight: bold; -fx-font-size: 13px;");

            Button btnLogout = new Button("Sair");
            btnLogout.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);
            btnLogout.setOnAction(e -> {
                SessionEntry.logout();
                refresh();
            });

            HBox rightBox = new HBox(10, lblUser, btnLogout);
            rightBox.setAlignment(Pos.CENTER_RIGHT);
            rightBox.setPadding(new Insets(6, 10, 6, 0));

            // Admin / Moderador
            if (Permissions.isAdmin() || Permissions.isModerador()) {
                Button btnAdmin = new Button("Painel Admin");
                btnAdmin.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);
                rightBox.getChildren().add(btnAdmin);

                btnAdmin.setOnAction(e -> {
                    new Alert(Alert.AlertType.INFORMATION,
                            "Painel reservado a moderadores.").showAndWait();
                });
            }

            barra.setRight(rightBox);

        } else {

            // ================= DESLOGADO ==================
            Button btnLogin = new Button("🔐 Login");
            btnLogin.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);
            Button btnRegister = new Button("📝 Register");

            btnRegister.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);

            btnLogin.setOnAction(_ -> new Login(this).mostrarLogin());
            btnRegister.setOnAction(_ -> new Register().mostrarRegister());

            HBox rightBox = new HBox(10, btnLogin, btnRegister);
            rightBox.setAlignment(Pos.CENTER_RIGHT);
            rightBox.setPadding(new Insets(6, 10, 6, 0));

            barra.setRight(rightBox);
        }

        // Botões de janela à esquerda
        barra.setLeft(botoesMac);

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

    // ============================================================
    // 🔥 Criação dos cards de eventos
    // ============================================================
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

        ImageView img;
        try {
            img = new ImageView(new Image(ev.getImage(), 220, 130, false, true));
        } catch (Exception ex) {
            img = new ImageView(new Image("https://via.placeholder.com/220x130.png?text=Evento",
                    220, 130, false, true));
        }

        Label lblNome = new Label(ev.getName());
        lblNome.setStyle("-fx-font-weight: bold; -fx-font-size: 16px; -fx-text-fill: #333;");
        lblNome.setWrapText(true);

        Label lblData = new Label("📅 " + ev.getStartdate().toLocalDateTime().toLocalDate());
        Label lblLocal = new Label("📍 " + ev.getLocal());

        Label lblEstado = new Label(ev.getState().getName());
        lblEstado.setStyle(defineCorEstado(ev.getState().getName()));

        card.getChildren().addAll(img, lblNome, lblData, lblLocal, lblEstado);

        card.setOnMouseClicked(_ -> {
            Alert detalhes = new Alert(Alert.AlertType.INFORMATION);
            detalhes.setTitle("Detalhes do Evento");
            detalhes.setHeaderText(ev.getName());
            detalhes.setContentText(
                    "📍 Local: " + ev.getLocal() + "\n" +
                            "🕒 Início: " + ev.getStartdate() + "\n" +
                            "🕒 Fim: " + ev.getFinaldate() + "\n\n" +
                            "ℹ️ " + ev.getDescription()
            );
            detalhes.showAndWait();
        });

        return card;
    }

    private String defineCorEstado(String state) {
        if (state == null) return "-fx-background-color: #ddd; -fx-font-size: 12px;";

        return switch (state.toLowerCase()) {
            case "ativo" -> "-fx-background-color: #e8f5e9; -fx-text-fill: #2e7d32;";
            case "planeado" -> "-fx-background-color: #fff8e1; -fx-text-fill: #f9a825;";
            case "cancelado" -> "-fx-background-color: #ffebee; -fx-text-fill: #c62828;";
            case "concluido" -> "-fx-background-color: #e3f2fd; -fx-text-fill: #1565c0;";
            default -> "-fx-background-color: #eeeeee; -fx-text-fill: #333;";
        };
    }
}
