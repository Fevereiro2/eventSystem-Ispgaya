package ltc.events;

import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import ltc.events.Modules.Window;
import ltc.events.Modules.db;

public class Main extends Application {



    @Override
    public void start(Stage palco) {
        db.connect();

        Window janela = new Window();   // instanciamos a outra classe
        janela.mostrar(palco);

        palco.setOnCloseRequest(e -> db.close());

    }

    public static void main(String[] args) {
        launch(args);
    }
}
