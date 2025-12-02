package ltc.events.Modules.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.layout.HBox;
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.classes.hashs.SessionEntry;
import ltc.events.Modules.ui.AlterPassword;
import ltc.events.Modules.visual.CustomAlert;

public class Settings {

    private final VBox centro;

    public Settings(VBox centro) {
        this.centro = centro;
    }

    public void mostrarDefinicoesConta() {
        centro.getChildren().clear();

        var user = SessionEntry.getUser();
        if (user == null) {
            CustomAlert.Error("Nenhum utilizador autenticado.");
            return;
        }

        int userId;
        try {
            userId = Integer.parseInt(user.getId());
        } catch (NumberFormatException ex) {
            CustomAlert.Error("Utilizador invalido na sessao atual.");
            return;
        }

        Button btnVoltar = StyleUtil.secondaryButton("Voltar", _ -> centro.getChildren().clear());

        Label titulo = new Label("Definicoes da Conta");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");
        HBox cabecalho = new HBox(10, btnVoltar, titulo);
        cabecalho.setAlignment(Pos.CENTER_LEFT);

        Button btnAlterarPass = StyleUtil.primaryButton(
                "Alterar Password",
                _ -> AlterPassword.abrirJanelaAlterarPassword(userId)
        );

        Button btnAlterarEmail = StyleUtil.primaryButton(
                "Alterar Email",
                _ -> CustomAlert.Info("Funcionalidade de alterar email ainda nao implementada.")
        );

        VBox box = new VBox(15, cabecalho, btnAlterarPass, btnAlterarEmail);
        box.setPadding(new Insets(20));
        box.setAlignment(Pos.TOP_LEFT);

        centro.getChildren().add(box);
    }
}
