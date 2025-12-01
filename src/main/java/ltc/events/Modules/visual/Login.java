package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import ltc.events.Modules.NavbarUtil;
import ltc.events.Modules.Window;
import ltc.events.classes.Participant;
import ltc.events.classes.hashs.AuthService;
import ltc.events.classes.hashs.SessionEntry;

@SuppressWarnings("Convert2Record")
public class Login {
    private final Window window;

    public Login(Window window) {
        this.window = window;
    }
    public void mostrarLogin() {
        // 🔸 Criar novo Stage de login
        Stage stage = new Stage();
        stage.initStyle(StageStyle.UNDECORATED);
        stage.initModality(Modality.APPLICATION_MODAL);

        NavbarUtil navbar = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);

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
        btnCancelar.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #ff5f57, #c62828);
            -fx-text-fill: white;
            -fx-font-weight: bold;
            -fx-background-radius: 6;
            -fx-cursor: hand;
            -fx-padding: 8 18 8 18;
        """);
        btnCancelar.setOnAction(_ -> stage.close());


        // 🔹 Validação simples
        btnEntrar.setOnAction(_ -> {
            String user = txtUser.getText();
            String pass = txtPass.getText();

            if (user.isEmpty() || pass.isEmpty()) {
                new Alert(Alert.AlertType.WARNING,
                        "Preencha todos os campos!"
                ).showAndWait();
                return;
            }

            // Validação do email com regex
            if (!isValidEmail(user)) {
                new Alert(Alert.AlertType.ERROR,
                        "O email inserido não é válido.\n\nExemplo: nome@dominio.com"
                ).showAndWait();
                return;
            }

            Participant logged = AuthService.login(user, pass);

            if (logged != null) {

                SessionEntry.login(logged);

                new Alert(Alert.AlertType.INFORMATION,
                        "Bem-vindo, " + logged.getName() + "!"
                ).showAndWait();

                // Fechar apenas a janela de login
                stage.close();

                // Atualizar a janela principal
                window.refresh();

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
    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

}
