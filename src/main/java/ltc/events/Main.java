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
        db.connect(); //conexão a base de dados
        Window janela = new Window();   // Declarar  a janela vindo do javaFX
        janela.mostrar(palco);  // Chamar o metodo mostrar em Modules/Window.java
    }

    public static void main(String[] args) {
        launch(args);
    }
}
