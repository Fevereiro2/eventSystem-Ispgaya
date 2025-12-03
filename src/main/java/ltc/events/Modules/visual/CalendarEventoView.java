package ltc.events.Modules.visual;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.Modules.connection.SessionParticipantDB;
import ltc.events.Modules.Permissions;
import ltc.events.classes.Event;
import ltc.events.classes.Participant;
import ltc.events.classes.Session;
import ltc.events.classes.hashs.SessionEntry;

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
    private final int participantesEvento;

    public CalendarEventoView(Event evento, List<Session> sessoes) {
        this.evento = evento;
        this.sessoes = sessoes;
        this.participantesEvento = SessionParticipantDB.countDistinctParticipantsByEvent(evento.getId());
    }

    public void mostrar() {
        Stage stage = new Stage();
        stage.setTitle("Calendario de Sessões - " + evento.getName());

        VBox root = new VBox(16);
        root.setPadding(new Insets(20));
        root.setStyle("-fx-background-color: #f7f9fc;");

        Label titulo = new Label("Sessões de " + evento.getName());
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1f2937;");
        root.getChildren().add(titulo);

        Label resumo = new Label("Inscritos neste evento: " + participantesEvento + "   | Limite por sessÃ£o: 20");
        resumo.setStyle("-fx-text-fill: #374151; -fx-font-size: 13px;");
        root.getChildren().add(resumo);

        if (sessoes == null || sessoes.isEmpty()) {
            Label vazio = new Label("Nenhuma sessÃ£o criada para este evento.");
            vazio.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 14px;");
            root.getChildren().add(vazio);
        } else {
            Map<LocalDate, List<Session>> porDia = agruparPorDiaOrdenado(sessoes);
            porDia.forEach((dia, lista) -> root.getChildren().add(criarDiaBox(dia, lista)));
        }

        Scene cena = new Scene(root, 750, 620);
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

    private VBox criarSessaoRow(Session s) {
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

        final int inscritos = SessionParticipantDB.countBySession(s.getId());
        Label lblCount = new Label(inscritos + "/20");
        lblCount.setStyle("-fx-text-fill: #111827; -fx-font-weight: bold;");

        boolean logged = SessionEntry.isLogged();
        boolean adminUser = Permissions.isAdmin() || Permissions.isModerador();
        boolean alreadyIn = logged && !adminUser && SessionParticipantDB.isParticipantInSession(s.getId(), SessionEntry.getUser().getId());
        boolean cheio = inscritos >= 20;

        final Button btn = StyleUtil.primaryButton("Inscrever", null);
        btn.setMinWidth(110);

        if (adminUser) {
            btn.setText("Admin");
            btn.setDisable(true);
        } else if (!logged) {
            btn.setText("Login p/ entrar");
            btn.setDisable(true);
        } else if (alreadyIn) {
            btn.setText("Inscrito");
            btn.setDisable(true);
        } else if (cheio) {
            btn.setText("Cheio");
            btn.setDisable(true);
        } else {
            btn.setOnAction(_ -> {
                try {
                    if (adminUser) {
                        CustomAlert.Info("Modo admin direto nao inscreve em sessoes.");
                        return;
                    }
                    SessionParticipantDB.addParticipant(s.getId(), SessionEntry.getUser().getId());
                    btn.setText("Inscrito");
                    btn.setDisable(true);
                    lblCount.setText((inscritos + 1) + "/20");
                    CustomAlert.Success("Inscrito na sessao.");
                } catch (Exception ex) {
                    CustomAlert.Error(ex.getMessage());
                }
            });
        }

        VBox info = new VBox(4, lblNome, lblLocal);
        HBox.setHgrow(info, Priority.ALWAYS);

        VBox inscritosBox = new VBox(4);
        inscritosBox.setPadding(new Insets(6, 0, 0, 0));
        inscritosBox.setVisible(false);
        inscritosBox.setManaged(false);

        Button btnLista = StyleUtil.secondaryButton("Ver inscritos", null);
        btnLista.setOnAction(_ -> {
            if (inscritosBox.isVisible()) {
                inscritosBox.setVisible(false);
                inscritosBox.setManaged(false);
                btnLista.setText("Ver inscritos");
                return;
            }
            inscritosBox.getChildren().clear();
            var lista = SessionParticipantDB.listParticipants(s.getId());
            if (lista.isEmpty()) {
                inscritosBox.getChildren().add(new Label("Nenhum inscrito."));
            } else {
                for (Participant p : lista) {
                    Label nome = new Label(p.getName());
                    nome.setStyle("-fx-font-weight: bold; -fx-text-fill: #111827;");

                    Label email = new Label(p.getEmail() != null ? p.getEmail() : "");
                    email.setStyle("-fx-text-fill: #374151;");

                    Label tipo = new Label(p.getType() != null ? p.getType().getName() : "");
                    tipo.setStyle("-fx-text-fill: #2563eb; -fx-font-weight: bold;");

                    // Avatar simples com iniciais em vez de imagem real (mais leve e seguro)
                    String initials = p.getName() != null && !p.getName().isBlank()
                            ? p.getName().trim().substring(0, 1).toUpperCase()
                            : "?";
                    Label avatar = new Label(initials);
                    avatar.setStyle("""
                        -fx-background-color: #e5e7eb;
                        -fx-text-fill: #111827;
                        -fx-font-weight: bold;
                        -fx-alignment: center;
                        -fx-min-width: 28px;
                        -fx-min-height: 28px;
                        -fx-max-width: 28px;
                        -fx-max-height: 28px;
                        -fx-background-radius: 50%;
                        -fx-padding: 4;
                    """);

                    VBox dados = new VBox(2, nome, email, tipo);
                    HBox linhaP = new HBox(10, avatar, dados);
                    linhaP.setAlignment(Pos.CENTER_LEFT);
                    linhaP.setPadding(new Insets(4, 0, 4, 0));
                    inscritosBox.getChildren().add(linhaP);
                }
            }
            inscritosBox.setVisible(true);
            inscritosBox.setManaged(true);
            btnLista.setText("Esconder");
        });

        VBox colunaBtns = new VBox(6, btn, btnLista);

        linha.getChildren().addAll(lblHora, info, lblCount, colunaBtns);

        VBox bloco = new VBox(4, linha, inscritosBox);

        return bloco;
    }

    private LocalTime safeTime(Timestamp ts) {
        if (ts == null) return null;
        return ts.toLocalDateTime().toLocalTime();
    }
}
