package ltc.events.Modules;

import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.geometry.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

public class Window {
    private double xOffset = 0; //use to drag the window linked above (setOnMousePressed && setOnMouseDragged)
    private double yOffset = 0; //use to drag the window linked above (setOnMousePressed && setOnMouseDragged)

    public void mostrar(Stage palco) {
        palco.initStyle(StageStyle.UNDECORATED); //remove navbar and tittle bar default

        //#################################################################################
        // Buttons
        Circle btnFechar = new Circle(6, Color.web("#FF5F57")); //Close button
        Circle btnMin = new Circle(6, Color.web("#FFBD2E")); //Minimize button
        Circle btnMax = new Circle(6, Color.web("#28C940")); //Maximize button

        btnFechar.setOnMouseClicked(e -> palco.close()); //when click on the close button, close the stage
        btnMin.setOnMouseClicked(e -> palco.setIconified(true)); //when click on the minimizer button, minimize the stage
        btnMax.setOnMouseClicked(e -> palco.setMaximized(!palco.isMaximized())); //when click on the maximizer button, maximize/minimize the stage
        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10));
        //#################################################################################

        //#################################################################################
        // Upper bar
        BorderPane barra = new BorderPane();
        barra.setLeft(botoesMac);
        barra.setStyle("-fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf); "
                + "-fx-border-color: #b0b0b0; -fx-border-width: 0 0 1 0;");

        barra.setOnMousePressed(e -> { //Options to drag the window
            xOffset = e.getSceneX();
            yOffset = e.getSceneY();
        });
        barra.setOnMouseDragged(e -> { // Options to drag the window
            palco.setX(e.getScreenX() - xOffset);
            palco.setY(e.getScreenY() - yOffset);
        });
        //#################################################################################

        //#################################################################################
        // Content/Center

        //⚠️⚠️⚠️⚠️⚠️ Alterar isto
        Label conteudo = new Label("🍎 Janela estilo macOS\nBem-vindo, João!");
        conteudo.setStyle("-fx-font-size: 16px;");
        VBox centro = new VBox(conteudo);
        centro.setAlignment(Pos.CENTER);
        centro.setPrefHeight(200);
        //#################################################################################

        //#################################################################################
        // Main window
        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(centro);
        raiz.setStyle("-fx-background-color: white; -fx-background-radius: 10; "
                + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0.3, 0, 4);");
        //#################################################################################


        //#################################################################################
        // Show window/Scene
        Scene cena = new Scene(raiz, 400, 250);
        palco.setScene(cena);
        palco.show();
        //#################################################################################
    }
}
