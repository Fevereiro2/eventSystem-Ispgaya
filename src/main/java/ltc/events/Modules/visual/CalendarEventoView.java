package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import ltc.events.classes.Event;
import ltc.events.classes.Session;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CalendarEventoView {

    private final Event evento;
    private final List<Session> sessoes;
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public CalendarEventoView(Event evento, List<Session> sessoes) {
        this.evento = evento;
        this.sessoes = sessoes;
    }

    public void mostrar() {
        Stage stage = new Stage();
        stage.setTitle("Calendário de Sessões - " + evento.getName());

        VBox root = new VBox(16);
        root.setPadding(new Insets(20));
        root.setStyle("-fx-background-color: #f7f9fc;");

        Label titulo = new Label("Sessões de " + evento.getName());
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1f2937;");
        root.getChildren().add(titulo);

        if (sessoes == null || sessoes.isEmpty()) {
            Label vazio = new Label("Nenhuma sessão criada para este evento.");
            vazio.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 14px;");
            root.getChildren().add(vazio);
        } else {
            Map<LocalDate, List<Session>> porDia = agruparPorDiaOrdenado(sessoes);
            porDia.forEach((dia, lista) -> root.getChildren().add(criarDiaBox(dia, lista)));
        }

        Scene cena = new Scene(root, 700, 600);
        stage.setScene(cena);
        stage.show();
    }

    private Map<LocalDate, List<Session>> agruparPorDiaOrdenado(List<Session> lista) {
        return lista.stream()
                .filter(s -> s.getStartdate() != null)
                .sorted(Comparator.comparing(Session::getStartdate))
                .collect(Collectors.groupingBy(
                        s -> s.getStartdate().toLocalDateTime().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
    }

    private VBox criarDiaBox(LocalDate dia, List<Session> lista) {
        VBox diaBox = new VBox(10);
        diaBox.setPadding(new Insets(12));
        diaBox.setStyle("""
            -fx-background-color: white;
            -fx-background-radius: 12;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 12, 0, 0, 4);
        """);

        Label lblDia = new Label(dia.toString());
        lblDia.setStyle("-fx-font-weight: bold; -fx-text-fill: #111827; -fx-font-size: 15px;");
        diaBox.getChildren().add(lblDia);

        for (Session s : lista) {
            diaBox.getChildren().add(criarSessaoRow(s));
        }

        return diaBox;
    }

    private HBox criarSessaoRow(Session s) {
        HBox linha = new HBox(12);
        linha.setAlignment(Pos.CENTER_LEFT);
        linha.setPadding(new Insets(8, 10, 8, 10));
        linha.setStyle("""
            -fx-background-color: #eef2ff;
            -fx-background-radius: 8;
        """);

        LocalTime ini = safeTime(s.getStartdate());
        LocalTime fim = safeTime(s.getFinaldate());

        Label lblHora = new Label(
                (ini != null ? ini.format(HORA) : "--") + " - " + (fim != null ? fim.format(HORA) : "--")
        );
        lblHora.setStyle("-fx-font-weight: bold; -fx-text-fill: #4f46e5;");
        lblHora.setMinWidth(120);

        Label lblNome = new Label(s.getName());
        lblNome.setStyle("-fx-font-weight: bold; -fx-text-fill: #111827;");

        Label lblLocal = new Label(s.getLocal() != null ? s.getLocal() : "");
        lblLocal.setStyle("-fx-text-fill: #6b7280;");

        Label lblEstado = new Label(s.getState() != null ? s.getState().getName() : "");
        lblEstado.setStyle("-fx-text-fill: #2563eb; -fx-font-weight: bold;");

        VBox info = new VBox(4, lblNome, lblLocal);
        HBox.setHgrow(info, Priority.ALWAYS);

        linha.getChildren().addAll(lblHora, info, lblEstado);
        return linha;
    }

    private LocalTime safeTime(Timestamp ts) {
        if (ts == null) return null;
        return ts.toLocalDateTime().toLocalTime();
    }
}
