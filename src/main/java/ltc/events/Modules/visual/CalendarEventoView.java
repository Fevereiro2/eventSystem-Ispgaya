package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.RowConstraints;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import ltc.events.classes.Event;
import ltc.events.classes.Session;

import java.sql.Timestamp;
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
        stage.setTitle("Calendario - " + evento.getName());

        GridPane grade = new GridPane();
        grade.setGridLinesVisible(true);
        grade.setPadding(new Insets(20));
        grade.setStyle("-fx-background-color: white;");

        // Altura de cada hora
        for (int h = 0; h < 24; h++) {
            RowConstraints r = new RowConstraints(50);
            grade.getRowConstraints().add(r);
        }

        LocalDate inicio = dataSegura(evento.getStartdate());
        LocalDate fim = dataSegura(evento.getFinaldate());
        if (fim.isBefore(inicio)) {
            fim = inicio;
        }

        int diasTotais = (int) (fim.toEpochDay() - inicio.toEpochDay()) + 1;

        for (int d = 0; d < diasTotais; d++) {
            ColumnConstraints c = new ColumnConstraints(160);
            grade.getColumnConstraints().add(c);
        }

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

        // Adicionar sessões
        for (Session s : sessoes) {

            Timestamp tsInicio = s.getStartdate();
            Timestamp tsFim = s.getFinaldate();
            if (tsInicio == null || tsFim == null) continue;

            LocalDate diaSessao = tsInicio.toLocalDateTime().toLocalDate();
            LocalTime horaInicio = tsInicio.toLocalDateTime().toLocalTime();
            LocalTime horaFim = tsFim.toLocalDateTime().toLocalTime();

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

        Scene cena = new Scene(grade, 1000, 600);
        stage.setScene(cena);
        stage.show();
    }

    private LocalDate dataSegura(Timestamp ts) {
        if (ts == null) return LocalDate.now();
        return ts.toLocalDateTime().toLocalDate();
    }
}
