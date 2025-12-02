package ltc.events.Modules.ui;
import javafx.stage.*;
import javafx.scene.*;
import javafx.scene.layout.*;
import javafx.scene.control.*;
import javafx.geometry.*;
import ltc.events.Modules.connection.ParticipantDB;


public class AlterPassword {
    public static void abrirJanelaAlterarPassword(int userId) {
        Stage stage = new Stage();
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.setTitle("Alterar Password");

        PasswordField passAtual = new PasswordField();
        passAtual.setPromptText("Password atual");

        PasswordField passNova = new PasswordField();
        passNova.setPromptText("Nova password");

        PasswordField passConfirm = new PasswordField();
        passConfirm.setPromptText("Confirmar nova password");

        Button btnAlterar = new Button("Alterar");
        btnAlterar.setOnAction(_ -> {
            try {
                if (!passNova.getText().equals(passConfirm.getText())) {
                    throw new Exception("As passwords não coincidem!");
                }

                ParticipantDB.updatePassword(userId, passNova.getText());

                new Alert(Alert.AlertType.INFORMATION, "Password alterada!").showAndWait();
                stage.close();

            } catch (Exception ex) {
                new Alert(Alert.AlertType.ERROR, ex.getMessage()).showAndWait();
            }
        });

        VBox box = new VBox(10, passAtual, passNova, passConfirm, btnAlterar);
        box.setPadding(new Insets(20));

        stage.setScene(new Scene(box, 300, 250));
        stage.showAndWait();
    }
}
