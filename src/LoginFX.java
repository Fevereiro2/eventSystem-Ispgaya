import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import javafx.stage.Stage;

public class LoginFX extends Application {

    @Override
    public void start(Stage stage) {
        stage.setTitle("Login - JavaFX");

        GridPane grid = new GridPane();
        grid.setPadding(new Insets(20));
        grid.setHgap(10);
        grid.setVgap(20);

        Label userLabel = new Label("Utilizador:");
        TextField userField = new TextField();

        Label passLabel = new Label("Password:");
        PasswordField passField = new PasswordField();

        Button loginButton = new Button("Entrar");
        loginButton.setOnAction(e -> {
            String user = userField.getText();
            String pass = passField.getText();
            Alert alert = new Alert(Alert.AlertType.INFORMATION, "Login de " + user + " com password: " + pass);
            alert.showAndWait();
        });

        grid.add(userLabel, 0, 0);
        grid.add(userField, 1, 0);
        grid.add(passLabel, 0, 1);
        grid.add(passField, 1, 1);
        grid.add(loginButton, 1, 2);

        Scene scene = new Scene(grid, 300, 180);
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
