package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import ltc.events.Modules.NavbarUtil;

public class CustomAlert {

    public enum Type {
        SUCCESS,
        WARNING,
        ERROR,
        INFO
    }

    public static void Error(String mensagem) {
        show(Type.ERROR, "Erro", mensagem);
    }

    public static void Warning(String mensagem) {
        show(Type.WARNING, "Atençao", mensagem);
    }

    public static void Success(String mensagem) {
        show(Type.SUCCESS, "Sucesso", mensagem);
    }

    public static void Info(String mensagem) {
        show(Type.INFO, "Informacao", mensagem);
    }

    public static boolean Confirm(String titulo, String mensagem) {
        return showConfirm(titulo, mensagem);
    }

    private static void show(Type tipo, String titulo, String mensagem) {
        String colorStart;
        String colorEnd;
        String tituloColor;

        switch (tipo) {
            case SUCCESS -> {
                colorStart = "#34c759";
                colorEnd = "#2ca02c";
                tituloColor = "#2e7d32";
            }
            case WARNING -> {
                colorStart = "#ffc107";
                colorEnd = "#ff9800";
                tituloColor = "#f9a825";
            }
            case ERROR -> {
                colorStart = "#ff5f57";
                colorEnd = "#c62828";
                tituloColor = "#c62828";
            }
            case INFO -> {
                colorStart = "#2196F3";
                colorEnd = "#1565C0";
                tituloColor = "#1565C0";
            }
            default -> throw new IllegalStateException("Tipo de alerta desconhecido");
        }

        Stage stage = new Stage();
        stage.initStyle(StageStyle.UNDECORATED);
        stage.initModality(Modality.APPLICATION_MODAL);

        NavbarUtil navbar = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);

        Label lblTitulo = new Label(titulo);
        lblTitulo.setStyle(String.format("-fx-font-size: 16px; -fx-font-weight: bold; -fx-padding: 0 0 10 0; -fx-text-fill: %s;", tituloColor));

        Label lblMensagem = new Label(mensagem);
        lblMensagem.setStyle("-fx-font-size: 13px; -fx-text-fill: #555;");
        lblMensagem.setWrapText(true);
        lblMensagem.setMaxWidth(320);

        Button btnOK = StyleUtil.createStyledButton("OK", colorStart, colorEnd, _ -> stage.close());

        HBox botoes = new HBox(btnOK);
        botoes.setAlignment(Pos.CENTER_RIGHT);

        VBox conteudo = new VBox(15, lblTitulo, lblMensagem, botoes);
        conteudo.setAlignment(Pos.TOP_LEFT);
        conteudo.setPadding(new Insets(20));

        BorderPane raiz = StyleUtil.createRootLayout(stage, conteudo);

        Scene scene = new Scene(raiz, 360, 210);
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.showAndWait();
    }

    private static boolean showConfirm(String titulo, String mensagem) {
        final boolean[] resultado = {false};

        Stage stage = new Stage();
        stage.initStyle(StageStyle.UNDECORATED);
        stage.initModality(Modality.APPLICATION_MODAL);

        NavbarUtil navbar = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);

        Label lblTitulo = new Label(titulo);
        lblTitulo.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-padding: 0 0 10 0; -fx-text-fill: #1565C0;");

        Label lblMensagem = new Label(mensagem);
        lblMensagem.setStyle("-fx-font-size: 13px; -fx-text-fill: #555;");
        lblMensagem.setWrapText(true);
        lblMensagem.setMaxWidth(320);

        Button btnSim = StyleUtil.createStyledButton("Sim", "#2EC4B6", "#1A9E8C", _ -> {
            resultado[0] = true;
            stage.close();
        });
        Button btnCancelar = StyleUtil.secondaryButton("Cancelar", _ -> stage.close());

        HBox botoes = new HBox(10, btnCancelar, btnSim);
        botoes.setAlignment(Pos.CENTER_RIGHT);

        VBox conteudo = new VBox(15, lblTitulo, lblMensagem, botoes);
        conteudo.setAlignment(Pos.TOP_LEFT);
        conteudo.setPadding(new Insets(20));

        BorderPane raiz = StyleUtil.createRootLayout(stage, conteudo);

        Scene scene = new Scene(raiz, 360, 210);
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.showAndWait();

        return resultado[0];
    }
}
