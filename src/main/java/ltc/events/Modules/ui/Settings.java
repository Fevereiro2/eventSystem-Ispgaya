package ltc.events.Modules.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.classes.hashs.SessionEntry;
import ltc.events.Modules.ui.AlterPassword;

public class Settings {

    private final VBox centro;

    public Settings(VBox centro) {
        this.centro = centro;
    }

    public void mostrarDefinicoesConta() {
        centro.getChildren().clear();

        var user = SessionEntry.getUser();
        if (user == null) {
            new Alert(Alert.AlertType.ERROR, "Nenhum utilizador autenticado.").showAndWait();
            return;
        }

        int userId;
        try {
            userId = Integer.parseInt(user.getId());
        } catch (NumberFormatException ex) {
            new Alert(Alert.AlertType.ERROR, "Utilizador invalido na sessao atual.").showAndWait();
            return;
        }

        Label titulo = new Label("Definicoes da Conta");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");

        Button btnAlterarPass = StyleUtil.primaryButton(
                "Alterar Password",
                _ -> AlterPassword.abrirJanelaAlterarPassword(userId)
        );

        Button btnAlterarEmail = StyleUtil.primaryButton(
                "Alterar Email",
                _ -> new Alert(Alert.AlertType.INFORMATION, "Funcionalidade de alterar email ainda nao implementada.").showAndWait()
        );

        VBox box = new VBox(15, titulo, btnAlterarPass, btnAlterarEmail);
        box.setPadding(new Insets(20));
        box.setAlignment(Pos.TOP_LEFT);

        centro.getChildren().add(box);
    }
}
