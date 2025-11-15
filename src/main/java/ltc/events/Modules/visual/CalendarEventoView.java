package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import ltc.events.classes.Event;
import ltc.events.classes.Session;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class CalendarEventoView {

    private final Event evento;
    private final List<Session> sessoes;

    public CalendarEventoView(Event evento, List<Session> sessoes) {
        this.evento = evento;
        this.sessoes = sessoes;
    }

    public void mostrar() {

        Stage stage = new Stage();
        stage.setTitle("Calendário — " + evento.getName());

        // ================================
        // GRID DO CALENDÁRIO
        // ================================
        GridPane grade = new GridPane();
        grade.setGridLinesVisible(true);
        grade.setPadding(new Insets(20));
        grade.setStyle("-fx-background-color: white;");

        // Altura de cada hora
        for (int h = 0; h < 24; h++) {
            RowConstraints r = new RowConstraints(50);
            grade.getRowConstraints().add(r);
        }

        // Dias entre o evento
        LocalDate inicio = evento.getStartdate().toLocalDateTime().toLocalDate();
        LocalDate fim = evento.getFinaldate().toLocalDateTime().toLocalDate();

        int diasTotais = (int) (fim.toEpochDay() - inicio.toEpochDay()) + 1;

        for (int d = 0; d < diasTotais; d++) {
            ColumnConstraints c = new ColumnConstraints(160);
            grade.getColumnConstraints().add(c);
        }

        // Cabeçalho dos dias
        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER);
        header.setPadding(new Insets(10));

        for (int i = 0; i < diasTotais; i++) {

            LocalDate dia = inicio.plusDays(i);

            Label lbl = new Label(dia.toString());
            lbl.setStyle("""
                -fx-font-weight: bold;
                -fx-font-size: 15px;
                -fx-text-fill: #333;
            """);

            VBox box = new VBox(lbl);
            box.setAlignment(Pos.CENTER);
            box.setPrefWidth(160);

            grade.add(box, i, 0);  // colocar no topo
        }

        // ================================
        // ADICIONAR SESSÕES AO CALENDÁRIO
        //================================
        for (Session s : sessoes) {

            LocalDate diaSessao = s.getStartdate().toLocalDateTime().toLocalDate();
            LocalTime horaInicio = s.getStartdate().toLocalDateTime().toLocalTime();
            LocalTime horaFim = s.getFinaldate().toLocalDateTime().toLocalTime();

            int coluna = (int) (diaSessao.toEpochDay() - inicio.toEpochDay());
            int linhaInicio = horaInicio.getHour();
            int duracaoHoras = Math.max(1, horaFim.getHour() - horaInicio.getHour());

            VBox bloco = new VBox(
                    new Label(s.getName()),
                    new Label(s.getDescription())
            );

            bloco.setPadding(new Insets(6));
            bloco.setSpacing(3);
            bloco.setStyle("""
                -fx-background-color: #42a5f5;
                -fx-background-radius: 8;
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 10, 0, 0, 3);
            """);

            GridPane.setRowIndex(bloco, linhaInicio + 1); // +1 por causa do cabeçalho
            GridPane.setColumnIndex(bloco, coluna);
            GridPane.setRowSpan(bloco, duracaoHoras);

            grade.getChildren().add(bloco);
        }

        // ================================
        // MOSTRAR TUDO
        // ================================
        Scene cena = new Scene(grade, 1000, 600);
        stage.setScene(cena);
        stage.show();
    }
}
