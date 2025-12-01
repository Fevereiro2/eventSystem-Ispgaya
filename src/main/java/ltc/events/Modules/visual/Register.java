package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import ltc.events.Modules.NavbarUtil;
import ltc.events.Modules.connection.ParticipantDB;
import ltc.events.classes.Participant;
import ltc.events.classes.Types;
import ltc.events.classes.hashs.PasswordUtil;

public class Register {
        public void mostrarRegister() {

        Stage stage = new Stage();
        stage.initStyle(StageStyle.UNDECORATED);
        stage.initModality(Modality.APPLICATION_MODAL);

        NavbarUtil navbar  = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);

        // ======================================================
        /* 🔹 Botões macOS
        Circle btnFechar = new Circle(6, Color.web("#FF5F57"));
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));
        Circle btnMax = new Circle(6, Color.web("#28C940"));

        btnFechar.setOnMouseClicked(e -> stage.close());
        btnMin.setOnMouseClicked(e -> stage.setIconified(true));
        btnMax.setOnMouseClicked(e -> stage.setMaximized(!stage.isMaximized()));

        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10));

        BorderPane barra = new BorderPane(botoesMac, null, null, null, null);
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
         */

        // ======================================================
        // 🔹 Formulário
        Label titulo = new Label("📝 Criar Conta");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #333;");

        Label lblNome = new Label("Nome:");
        TextField txtNome = new TextField();
        txtNome.setPromptText("ex: Pedro Fevereiro");

        Label lblPhone = new Label("Telefone:");
        TextField txtPhone = new TextField();
        txtPhone.setPromptText("ex: 912 345 678");

        Label lblEmail = new Label("Email:");
        TextField txtEmail = new TextField();
        txtEmail.setPromptText("ex: pedro@email.com");

        Label lblPass = new Label("Password:");
        PasswordField txtPass = new PasswordField();
        txtPass.setPromptText("••••••••");

        Button btnRegistar = new Button("Criar Conta");
        btnRegistar.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #007aff, #0051a8);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 10 18;
        """);

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setOnAction(_ -> stage.close());

        // ======================================================
        // 🔹 Lógica do Registo
        btnRegistar.setOnAction(_ -> {

            String nome = txtNome.getText();
            String phone = txtPhone.getText();
            String email = txtEmail.getText();
            String pass = txtPass.getText();

            // ---------- VALIDAÇÕES ----------
            if (nome.isEmpty() || phone.isEmpty() || email.isEmpty() || pass.isEmpty()) {
                new Alert(Alert.AlertType.WARNING,
                        "Por favor preencha todos os campos!"
                ).showAndWait();
                return;
            }

            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                new Alert(Alert.AlertType.WARNING,
                        "Email inválido!"
                ).showAndWait();
                return;
            }

            if (!phone.matches("\\d{9}")) {
                new Alert(Alert.AlertType.WARNING,
                        "O telefone deve ter 9 dígitos!"
                ).showAndWait();
                return;
            }


            String hashed = PasswordUtil.hashPassword(pass);

// User type default → PARTICIPANTE
            Types type = new Types(2, "Participant");

            try {
                Participant p = ParticipantDB.register(nome, email, phone, hashed, type);

                new Alert(Alert.AlertType.INFORMATION,
                        "Conta criada com sucesso para: " + p.getName()
                ).showAndWait();

                stage.close();

            } catch (Exception ex) {
                new Alert(Alert.AlertType.ERROR,
                        "Erro ao criar conta: " + ex.getMessage()
                ).showAndWait();
            }
        });

        HBox botoes = new HBox(10, btnCancelar, btnRegistar);
        botoes.setAlignment(Pos.CENTER);

        VBox form = new VBox(12,
                titulo,
                lblNome, txtNome,
                lblPhone, txtPhone,
                lblEmail, txtEmail,
                lblPass, txtPass,
                botoes
        );

        form.setAlignment(Pos.CENTER);
        form.setPadding(new Insets(20));

        // ======================================================
        // Layout final
        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(form);
        raiz.setStyle("""
            -fx-background-color: white;
            -fx-background-radius: 10;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 15, 0.3, 0, 4);
        """);

        Scene scene = new Scene(raiz, 400, 480);
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.show();
    }
}
