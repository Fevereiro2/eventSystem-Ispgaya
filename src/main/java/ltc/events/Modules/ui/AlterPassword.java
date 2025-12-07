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

        Label info = new Label("Gestao de password desativada nesta versao.");
        Button btnFechar = StyleUtil.primaryButton("Fechar", _ -> stage.close());

        VBox box = new VBox(10, info, btnFechar);
        box.setPadding(new Insets(20));

        stage.setScene(new Scene(box, 300, 250));
        stage.showAndWait();
    }
}

