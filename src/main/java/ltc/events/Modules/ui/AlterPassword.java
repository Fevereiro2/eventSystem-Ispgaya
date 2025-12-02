package ltc.events.Modules.ui;
import javafx.stage.*;
import javafx.scene.*;
import javafx.scene.layout.*;
import javafx.scene.control.*;
import javafx.geometry.*;
import ltc.events.Modules.connection.ParticipantDB;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.Modules.visual.StyleUtil;


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

        Button btnAlterar = ltc.events.Modules.visual.StyleUtil.primaryButton("Alterar", null);
        btnAlterar.setOnAction(_ -> {
            try {
                if (!passNova.getText().equals(passConfirm.getText())) {
                    throw new Exception("As passwords não coincidem!");
                }

                ParticipantDB.updatePassword(userId, passNova.getText());

                CustomAlert.Success("Password alterada!");
                stage.close();

            } catch (Exception ex) {
                CustomAlert.Error(ex.getMessage());
            }
        });

        VBox box = new VBox(10, passAtual, passNova, passConfirm, btnAlterar);
        box.setPadding(new Insets(20));

        stage.setScene(new Scene(box, 300, 250));
        stage.showAndWait();
    }
}
