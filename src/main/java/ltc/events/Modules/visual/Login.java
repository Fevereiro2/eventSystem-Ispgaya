package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.StageStyle;

public class Login {
    private double xOffset = 0;
    private double yOffset = 0;

    public void mostrarLogin() {
        // 🔸 Criar novo Stage de login
        Stage stage = new Stage();
        stage.initStyle(StageStyle.UNDECORATED);
        stage.initModality(Modality.APPLICATION_MODAL);

        // ======================================================
        // 🔹 Botões estilo macOS
        Circle btnFechar = new Circle(6, Color.web("#FF5F57"));
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));
        Circle btnMax = new Circle(6, Color.web("#28C940"));

        btnFechar.setOnMouseClicked(_ -> stage.close());
        btnMin.setOnMouseClicked(_ -> stage.setIconified(true));
        btnMax.setOnMouseClicked(_ -> stage.setMaximized(!stage.isMaximized()));

        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10));

        // 🔹 Barra superior (com drag)
        BorderPane barra = new BorderPane();
        barra.setLeft(botoesMac);
        barra.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf);
            -fx-border-color: #b0b0b0;
            -fx-border-width: 0 0 1 0;
        """);

        barra.setOnMousePressed(e -> {
            xOffset = e.getSceneX();
            yOffset = e.getSceneY();
        });
        barra.setOnMouseDragged(e -> {
            stage.setX(e.getScreenX() - xOffset);
            stage.setY(e.getScreenY() - yOffset);
        });
        // ======================================================

        // 🔹 Conteúdo do formulário
        Label titulo = new Label("🔐 Iniciar Sessão");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #333;");

        Label lblUser = new Label("Utilizador:");
        TextField txtUser = new TextField();
        txtUser.setPromptText("ex: admin@ltc.pt");

        Label lblPass = new Label("Palavra-passe:");
        PasswordField txtPass = new PasswordField();
        txtPass.setPromptText("••••••••");

        Button btnEntrar = new Button("Entrar");
        btnEntrar.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #34c759, #2ca02c);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 8 18 8 18;
        """);

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setOnAction(e -> stage.close());

        // 🔹 Validação simples
        btnEntrar.setOnAction(e -> {
            String user = txtUser.getText();
            String pass = txtPass.getText();

            if (user.isEmpty() || pass.isEmpty()) {
                new Alert(Alert.AlertType.WARNING, "Preencha todos os campos!").showAndWait();
                return;
            }

            if (user.equals("admin@ltc.pt") && pass.equals("1234")) {
                new Alert(Alert.AlertType.INFORMATION, "Bem-vindo, " + user + "!").showAndWait();
                stage.close();
            } else {
                new Alert(Alert.AlertType.ERROR, "Credenciais inválidas.").showAndWait();
            }
        });

        HBox botoes = new HBox(10, btnCancelar, btnEntrar);
        botoes.setAlignment(Pos.CENTER);

        VBox conteudo = new VBox(15, titulo, lblUser, txtUser, lblPass, txtPass, botoes);
        conteudo.setAlignment(Pos.CENTER);
        conteudo.setPadding(new Insets(20));

        // ======================================================
        // 🔹 Layout principal com a barra superior
        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(conteudo);
        raiz.setStyle("""
            -fx-background-color: white;
            -fx-background-radius: 10;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 15, 0.3, 0, 4);
        """);

        Scene scene = new Scene(raiz, 380, 300);
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.show();
    }
}
