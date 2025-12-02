package ltc.events.Modules.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import ltc.events.Modules.ui.ModalFactory;
import ltc.events.Modules.session.UserSession;
import ltc.events.Modules.styles.StyleUtil;

public class Settings {

    private final VBox centro;

    public AccountScreens(VBox centro) {
        this.centro = centro;
    }

    public Settings(VBox centro) {
        this.centro = centro;
    }

    public void mostrarDefinicoesConta() {
        centro.getChildren().clear();

        Label titulo = new Label("🔧 Definições da Conta");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");

        Button btnAlterarPass = StyleUtil.primaryButton(
                "Alterar Password",
                _ -> ModalFactory.abrirJanelaAlterarPassword(UserSession.getUserId())
        );

        Button btnAlterarEmail = StyleUtil.primaryButton(
                "Alterar Email",
                _ -> ModalFactory.abrirJanelaAlterarEmail(UserSession.getUserId())
        );

        VBox box = new VBox(15, titulo, btnAlterarPass, btnAlterarEmail);
        box.setPadding(new Insets(20));
        box.setAlignment(Pos.TOP_LEFT);

        centro.getChildren().add(box);
    }
}

