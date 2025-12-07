package ltc.events.Modules; // Declara o pacote onde esta classe reside
import javafx.beans.property.SimpleStringProperty; // Importa uma classe para criar propriedades observveis de String, til para ligar dados a componentes da UI (ex: TableView)
import javafx.collections.FXCollections; // Importa utilitrios para criar colees observveis (listas a notificar a UI sobre mudanas)
import javafx.collections.ObservableList; // Importa a interface para listas que permitem que os componentes da UI sejam notificados quando a lista  alterada
import javafx.scene.Cursor;
import javafx.scene.control.cell.PropertyValueFactory; // Importa uma classe usada em TableView para ligar as colunas aos campos (propriedades) dos objetos
import javafx.stage.Modality; // Importa enumerao que define o comportamento de modalidade de uma janela (ex: bloquear a janela principal)
import javafx.stage.Stage; // Importa a classe principal Stage, que representa uma janela no JavaFX
import javafx.stage.StageStyle; // Importa enumerao que define a decorao e estilo da janela (ex: sem borda, utilitrio)
import javafx.scene.Scene; // Importa a classe Scene, que  o contentor para todo o contedo da interface grfica (o que est dentro da Stage)
import javafx.scene.control.*; // Importa todos os componentes de controlo da UI (botes, caixas de texto, tabelas, etc.)
import javafx.scene.layout.*; // Importa todas as classes de layout (HBox, VBox, BorderPane, StackPane, etc.) para organizar os componentes
import javafx.geometry.*; // Importa utilitrios para definir alinhamentos, preenchimentos (padding) e margens (insets)
import ltc.events.Modules.admin.AdminScreens;
import ltc.events.Modules.connection.*;
import ltc.events.Modules.visual.CalendarEventoView; // Importa a classe de visualizao especfica para o calendrio de eventos
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.classes.*;
import ltc.events.classes.hashs.SessionEntry;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
public class Window{
    private VBox centro; // contedo principal (eventos ou admin menu)
    //  Armazena a referncia do Stage para conseguir recarregar a UI
    private Stage palcoRef;


    // ============================================================
    //  Funo principal  chama setup e guarda o Stage
    // ============================================================
    public void mostrar(Stage palco) {
        this.palcoRef = palco; //  guarda referncia
        palco.initStyle(StageStyle.UNDECORATED);
        criarUI();
    }
    // ============================================================
    //  Recarrega a UI aps login/logout
    // ============================================================
    public void refresh() {
        criarUI();
    }
    // ============================================================
    //  Aqui fica toda a criao da UI
    // ============================================================
    private void criarUI() {
        garantirSessaoAdmin();
        NavbarUtil navbarUtil = new NavbarUtil();
        BorderPane barra = navbarUtil.createNavbar(palcoRef);
        HBox rightBox = criarRightBoxSessao();
        barra.setRight(rightBox);
        LocalDate hoje = LocalDate.now();
        ObservableList<Event> eventos = EventDB.getAllEvents();
        Map<String, Integer> estadosMap = carregarMapaEstados();
        eventos = atualizarEstadosAutomaticos(eventos, hoje, estadosMap);
        // Eventos atuais (data >= hoje)
        List<Event> eventosAtuais = eventos.stream()
                .filter(ev -> ev.getState() == null || (
                        !"em aprovacao".equalsIgnoreCase(ev.getState().getName())
                                && !"cancelado".equalsIgnoreCase(ev.getState().getName())
                ))
                .filter(ev -> dataEventoOuHoje(ev).compareTo(hoje) >= 0)
                .toList();
        // Eventos antigos (data < hoje)
        List<Event> eventosAntigos = eventos.stream()
                .filter(ev -> ev.getState() == null || (
                        !"em aprovacao".equalsIgnoreCase(ev.getState().getName())
                                && !"cancelado".equalsIgnoreCase(ev.getState().getName())
                ))
                .filter(ev -> dataEventoOuHoje(ev).compareTo(hoje) < 0)
                .toList();
        // Ttulo
        Label titulo = new Label("Eventos disponiveis");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");
        Button btnAntigos = StyleUtil.secondaryButton(
                "Eventos Antigos",
                _ -> {
                    Stage janela = new Stage();
                    janela.initModality(Modality.APPLICATION_MODAL);
                    janela.setTitle("Eventos Antigos");
                    VBox root = new VBox(15);
                    root.setPadding(new Insets(20));
                    // ===========================
                    // SELECT ANO
                    // ===========================
                    ComboBox<Integer> anoBox = new ComboBox<>();
                    int anoAtual = LocalDate.now().getYear();
                    for (int a = 2000; a <= anoAtual; a++)
                        anoBox.getItems().add(a);
                    anoBox.setValue(anoAtual);
                    // ===========================
                    // SELECT MES (YearMonth)
                    // ===========================
                    ComboBox<YearMonth> mesBox = new ComboBox<>();
                    for (int m = 1; m <= 12; m++)
                        mesBox.getItems().add(YearMonth.of(anoAtual, m));
                    mesBox.setValue(YearMonth.now());
                    HBox filtros = new HBox(10,
                            new Label("Ano:"), anoBox,
                            new Label("Mes:"), mesBox
                    );
                    filtros.setAlignment(Pos.CENTER_LEFT);
                    // ===========================
                    // REA DO CALENDRIO
                    // ===========================
                    ScrollPane scroll = new ScrollPane();
                    scroll.setFitToWidth(true);
                    GridPane calendario = new GridPane();
                    scroll.setContent(calendario);
                    // ===========================
                    // FUNO PARA DESENHAR O CALENDRIO
                    // ===========================
                    Runnable atualizarCalendario = () -> {
                        YearMonth mes = mesBox.getValue();
                        if (mes == null) {
                            return;
                        }
                        calendario.getChildren().clear();
                        calendario.setHgap(10);
                        calendario.setVgap(10);
                        // Cabealho dias da semana
                        String[] dias = {"Seg", "Ter", "Qua", "Qui", "Sex", "Sb", "Dom"};
                        for (int i = 0; i < dias.length; i++) {
                            Label lbl = new Label(dias[i]);
                            lbl.setStyle("-fx-font-weight: bold; -fx-font-size: 14px;");
                            calendario.add(lbl, i, 0);
                        }
                        LocalDate primeiroDia = mes.atDay(1);
                        int offset = primeiroDia.getDayOfWeek().getValue();  // 1=Seg, 7=Dom
                        int col = offset - 1;
                        int row = 1;
                        for (int dia = 1; dia <= mes.lengthOfMonth(); dia++) {
                            LocalDate diaAtual = mes.atDay(dia);
                            // ---- EVENTOS DESTE DIA ----
                            List<Event> eventosDoDia = eventosAntigos.stream()
                                    .filter(ev -> ev.getStartdate().toLocalDateTime().toLocalDate().equals(diaAtual))
                                    .toList();
                            // ---- Celula DO Calendario ----
                            VBox celula = new VBox(5);
                            celula.setPadding(new Insets(10));
                            celula.setPrefSize(140, 110);
                            celula.setStyle("""
                                 -fx-background-color: #f8f8f8;
                                 -fx-border-color: #ccc;
                                 -fx-background-radius: 8;
                                 -fx-border-radius: 8;
                             """);
                            // Cursor de clickable
                            celula.setCursor(Cursor.HAND);
                            // Numero do dia
                            Label lblDia = new Label(String.valueOf(dia));
                            lblDia.setStyle("-fx-font-weight: bold; -fx-font-size: 16px;");
                            celula.getChildren().add(lblDia);
                            // Mostrar eventos dentro da celula
                            for (Event ev : eventosDoDia) {
                                Label lblEvento = new Label("Evento: " + ev.getName());
                                lblEvento.setStyle("-fx-font-size: 12px; -fx-text-fill: #1976d2;");
                                celula.getChildren().add(lblEvento);
                            }
                            // ---- EVENTO DE CLICK ----
                            celula.setOnMouseClicked(_ -> {
                                if (eventosDoDia.isEmpty()) return; // nada para mostrar
                                Stage detalhes = new Stage();
                                detalhes.initModality(Modality.APPLICATION_MODAL);
                                detalhes.setTitle("Eventos em " + diaAtual);
                                VBox conteudo = new VBox(20);
                                conteudo.setPadding(new Insets(20));
                                conteudo.setAlignment(Pos.TOP_CENTER);
                                // Reutiliza o teu mtodo criarCardEvento()
                                for (Event ev : eventosDoDia) {
                                    conteudo.getChildren().add(criarCardEvento(ev));
                                }
                                ScrollPane scrollPopup = new ScrollPane(conteudo);
                                scrollPopup.setFitToWidth(true);
                                Scene cena = new Scene(scrollPopup, 600, 500);
                                detalhes.setScene(cena);
                                detalhes.show();
                            });
                            // ---- ADICIONAR AO GRID ----
                            calendario.add(celula, col, row);
                            col++;
                            if (col > 6) {
                                col = 0;
                                row++;
                            }
                        }
                    };
                    // Atualizar quando muda ANO
                    anoBox.setOnAction(_ -> {
                        mesBox.getItems().clear();
                        for (int m = 1; m <= 12; m++)
                            mesBox.getItems().add(YearMonth.of(anoBox.getValue(), m));
                        mesBox.setValue(YearMonth.of(anoBox.getValue(), 1));
                        atualizarCalendario.run();
                    });
                    // Atualizar quando muda MS
                    mesBox.setOnAction(_ -> atualizarCalendario.run());
                    atualizarCalendario.run(); // primeira vez
                    root.getChildren().addAll(filtros, scroll);
                    janela.setScene(new Scene(root, 900, 650));
                    janela.show();
                }
        );
        Button btnParticipantCriarEvento = StyleUtil.secondaryButton(
                "Criar Evento",
                _ -> abrirJanelaCriarEventoParticipante());

        // Scroll
        ScrollPane scroll = new ScrollPane();
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setPannable(true);
        scroll.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        TilePane tiles = new TilePane();
        tiles.setPadding(new Insets(20));
        tiles.setHgap(20);
        tiles.setVgap(20);
        tiles.setPrefColumns(4); // 4 colunas estilo Windows 8
        tiles.setTileAlignment(Pos.TOP_LEFT);
        tiles.setPrefTileWidth(200);
        tiles.setPrefTileHeight(200);
        HBox colunaBotoes = new HBox(15);
        colunaBotoes.setAlignment(Pos.CENTER_LEFT);
        colunaBotoes.getChildren().addAll(btnAntigos, btnParticipantCriarEvento);
        colunaBotoes.setPadding(new Insets(5, 0, 5, 5)); // opcional
        // Mostrar apenas os atuais no ecr
        for (Event ev : eventosAtuais) {
            tiles.getChildren().add(criarCardEvento(ev));
        }
        scroll.setContent(tiles);
        centro = new VBox(20, titulo, colunaBotoes, scroll);
        centro.setAlignment(Pos.TOP_CENTER);
        centro.setPadding(new Insets(30));
        BorderPane raiz = new BorderPane();
        raiz.setTop(barra);
        raiz.setCenter(centro);
        raiz.setStyle("-fx-background-color: white; -fx-background-radius: 10;"
                + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0.3, 0, 4);");
        Scene cena = new Scene(raiz, 1000, 600);
        palcoRef.setScene(cena);
        palcoRef.show();
    }
    // ============================================================
    //  Barra superior  Login/Register ou User Info + Logout
    // ============================================================
// ============================================================
//  Lgica de Login/Register ou User Info + Logout
// ============================================================
    private HBox criarRightBoxSessao() {
        garantirSessaoAdmin();
        HBox rightBox = new HBox(10);
        rightBox.setAlignment(Pos.CENTER_RIGHT);
        rightBox.setPadding(new Insets(6, 10, 6, 0));
        var user = SessionEntry.getUser();
        Label lblUser = new Label("Admin direto: " + user.getName() + " (" + user.getType().getName() + ")");
        lblUser.setStyle("-fx-font-weight: bold; -fx-font-size: 13px;");
        Button btnAdmin = StyleUtil.primaryButton("Painel Admin", _ -> this.mostrarPainelAdmin());
        rightBox.getChildren().addAll(lblUser, btnAdmin);
        return rightBox;
    }

    // Garante que a sessao tem sempre um admin direto (sem login/registo).
    private void garantirSessaoAdmin() {
        if (!SessionEntry.isLogged()) {
            SessionEntry.login(criarAdminLocal());
        }
    }
    private Participant criarAdminLocal() {
        Types adminType = new Types(1, "admin");
        Participant admin = new Participant("1", "Admin Local", "admin@local", "000000000", adminType);
        return admin;
    }
    public void mostrarPainelAdmin() {
        // Limpar centro
        centro.getChildren().clear();
        Label titulo = new Label("Painel de Administracao");
        titulo.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");
        Button btnVoltarHome = StyleUtil.secondaryButton("Voltar a pagina inicial", _ -> refresh());
        HBox cabecalho = new HBox(10, btnVoltarHome, titulo);
        cabecalho.setAlignment(Pos.CENTER_LEFT);
        // Botes do menu
        AdminScreens admin = new AdminScreens(centro);
        Button btnParticipantes = StyleUtil.adminButton(
                "Participantes",
                _ -> admin.mostrarParticipantes()
        );
        Button btnSessoes = StyleUtil.adminButton(
                "Sesses",
                _ -> admin.mostrarSessoes()
        );
        Button btnEventos = StyleUtil.adminButton(
                "Eventos",
                _ -> admin.mostrarEventos()
        );
        Button btnRecursos = StyleUtil.adminButton(
                "Recursos",
                _ -> admin.mostrarRecursos()
        );
        Button btnRelEventos = StyleUtil.adminButton(
                "Relatorio de Eventos",
                _ -> admin.mostrarRelatorioEventos()
        );
        Button btnRelParticipantes = StyleUtil.adminButton(
                "Relatorio de Participantes",
                _ -> admin.mostrarRelatorioParticipantes()
        );
        Button btnRelRecursos = StyleUtil.adminButton(
                "Relatorio de Recursos",
                _ -> admin.mostrarRelatorioRecursos()
        );
        Button btnRelSessoes = StyleUtil.adminButton(
                "Relatorio de Sessoes",
                _ -> admin.mostrarRelatorioSessoes()
        );
        VBox menu = new VBox(15,
                btnParticipantes, btnSessoes, btnEventos, btnRecursos,
                btnRelEventos, btnRelParticipantes, btnRelRecursos, btnRelSessoes
        );
        menu.setAlignment(Pos.TOP_LEFT);
        menu.setPadding(new Insets(20));
        VBox layout = new VBox(20, cabecalho, menu);
        layout.setAlignment(Pos.TOP_LEFT);
        layout.setPadding(new Insets(10));
        // Substituir tudo no centro
        centro.getChildren().add(layout);
    }

    private void abrirJanelaCriarEventoParticipante() {
        if (!SessionEntry.isLogged()) {
            CustomAlert.Warning("Inicie sessao para propor um evento.");
            return;
        }
        Stage stage = new Stage();
        stage.initStyle(StageStyle.UTILITY);
        stage.setTitle("Propor Evento");
        TextField txtNome = new TextField();
        TextArea txtDescricao = new TextArea();
        txtDescricao.setPromptText("Descricao");
        txtDescricao.setPrefRowCount(3);
        TextField txtLocal = new TextField();
        DatePicker dpInicio = new DatePicker();
        DatePicker dpFim = new DatePicker();
        Button btnSubmeter = StyleUtil.primaryButton("Submeter", _ -> {
            try {
                if (txtNome.getText().isBlank() || txtLocal.getText().isBlank() || dpInicio.getValue() == null || dpFim.getValue() == null) {
                    throw new IllegalArgumentException("Preencha nome, local e datas.");
                }
                var dataInicio = dpInicio.getValue();
                var dataFim = dpFim.getValue();
                if (!dataInicio.isAfter(LocalDate.now())) {
                    throw new IllegalArgumentException("Data de inicio deve ser depois do dia de hoje para submeter.");
                }
                if (!dataFim.isAfter(dataInicio)) {
                    throw new IllegalArgumentException("Data de fim deve ser posterior a data de inicio.");
                }
                Timestamp inicio = Timestamp.valueOf(dataInicio.atStartOfDay());
                Timestamp fim = Timestamp.valueOf(dataFim.atStartOfDay());
                // state_id=1 (Planeado) usado como padrao
                EventDB.register(
                        txtNome.getText(),
                        txtDescricao.getText(),
                        txtLocal.getText(),
                        inicio,
                        fim,
                        1
                );
                CustomAlert.Success("Evento criado com sucesso.");
                stage.close();
                refresh();
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao submeter: " + ex.getMessage());
            }
        });
        VBox layout = new VBox(10,
                new Label("Nome:"), txtNome,
                new Label("Descricao:"), txtDescricao,
                new Label("Local:"), txtLocal,
                new Label("Inicio:"), dpInicio,
                new Label("Fim:"), dpFim,
                btnSubmeter
        );
        layout.setPadding(new Insets(20));
        stage.setScene(new Scene(layout, 360, 420));
        stage.showAndWait();
    }

    private VBox criarCardEvento(Event ev) {
// 
        // 1) Calcular proximidade do evento (por dias)
        // 
        LocalDate hoje = LocalDate.now();
        LocalDate dataInicio = dataEventoOuHoje(ev);
        long dias = ChronoUnit.DAYS.between(hoje, dataInicio);

        double[] size = calcularTamanho(dias);
        double width = size[0];
        double height = size[1];
        // 
        // 2) Configurao base do card
        // 
        VBox card = new VBox(10);
        card.setPrefSize(width, height);
        card.setPadding(new Insets(15));
        card.setAlignment(Pos.TOP_CENTER);
        card.setStyle("""
        -fx-background-color: #ffffff;
        -fx-background-radius: 15;
        -fx-border-radius: 15;
        -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.15), 12, 0, 0, 6);
        -fx-cursor: hand;
    """);
        // 
        // 3) Imagem
        // 

        // 
        // 4) Labels
        // 
        Label lblNome = new Label(ev.getName());
        lblNome.setStyle("-fx-font-weight: bold; -fx-font-size: 16px; -fx-text-fill: #333;");
        lblNome.setWrapText(true);
        Label lblData = new Label("Data: " + dataEventoOuHoje(ev));
        lblData.setStyle("-fx-text-fill: #666; -fx-font-size: 13px;");
        Label lblLocal = new Label("Local: " + ev.getLocal());
        lblLocal.setStyle("-fx-text-fill: #777; -fx-font-size: 13px;");
        Label lblEstado = new Label(ev.getState().getName());
        lblEstado.setStyle(defineCorEstado(ev.getState().getName()));
        // 
        // 5) Montar o card
        // 
        card.getChildren().addAll(lblNome, lblData, lblLocal, lblEstado);
        // 
        // 6) Click  detalhes
        // 
        card.setOnMouseClicked(_ -> {
            List<Session> sessoes = SessionDB.getSessionsByEvent(ev.getId());
            new CalendarEventoView(ev, sessoes).mostrar();
        });
        return card;
    }
    private Map<String, Integer> carregarMapaEstados() {
        Map<String, Integer> mapa = new HashMap<>();
        for (State s : StateDB.listAll()) {
            if (s.getName() != null) {
                mapa.put(s.getName().toLowerCase(), s.getId());
            }
        }
        return mapa;
    }
    private ObservableList<Event> atualizarEstadosAutomaticos(ObservableList<Event> eventos, LocalDate hoje, Map<String, Integer> estadosMap) {
        for (Event ev : eventos) {
            try {
                String estadoNome = ev.getState() != null && ev.getState().getName() != null
                        ? ev.getState().getName().toLowerCase()
                        : "";
                LocalDate inicio = ev.getStartdate() != null ? ev.getStartdate().toLocalDateTime().toLocalDate() : null;
                LocalDate fim = ev.getFinaldate() != null ? ev.getFinaldate().toLocalDateTime().toLocalDate() : null;
                if ("em aprovacao".equals(estadoNome)) {
                    Integer planeado = estadosMap.get("planeado");
                    if (planeado != null) {
                        EventDB.updateState(String.valueOf(ev.getId()), planeado);
                    }
                    continue;
                }
                if (fim != null && fim.isBefore(hoje) && !"concluido".equals(estadoNome) && !"cancelado".equals(estadoNome)) {
                    Integer concluido = estadosMap.get("concluido");
                    if (concluido != null) {
                        EventDB.updateState(String.valueOf(ev.getId()), concluido);
                    }
                    continue;
                }
                if (inicio != null && !inicio.isAfter(hoje) && !"em progresso".equals(estadoNome) && !"cancelado".equals(estadoNome)) {
                    Integer progresso = estadosMap.get("em progresso");
                    if (progresso != null) {
                        EventDB.updateState(String.valueOf(ev.getId()), progresso);
                    }
                }
            } catch (Exception ignored) {
                // em caso de erro de parsing, seguimos sem interromper a UI
            }
        }
        return EventDB.getAllEvents();
    }
    private double[] calcularTamanho(long dias) {
        if (dias <= 0) return new double[]{300, 360};
        if (dias <= 2) return new double[]{250, 330};
        return new double[]{210, 300};
    }
    private LocalDate dataEventoOuHoje(Event ev) {
        if (ev.getStartdate() != null) {
            return ev.getStartdate().toLocalDateTime().toLocalDate();
        }
        return LocalDate.now();
    }

    private String defineCorEstado(String state) {
        if (state == null) return "-fx-background-color: #ddd; -fx-font-size: 12px;";
        return switch (state.toLowerCase()) {
            case "ativo" -> "-fx-background-color: #e8f5e9; -fx-text-fill: #2e7d32;";
            case "planeado" -> "-fx-background-color: #fff8e1; -fx-text-fill: #f9a825;";
            case "cancelado" -> "-fx-background-color: #ffebee; -fx-text-fill: #c62828;";
            case "concluido" -> "-fx-background-color: #e3f2fd; -fx-text-fill: #1565c0;";
            default -> "-fx-background-color: #eeeeee; -fx-text-fill: #333;";
        };
    }
}







