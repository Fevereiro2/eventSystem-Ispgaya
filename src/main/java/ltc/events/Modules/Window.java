package ltc.events.Modules; // Declara o pacote onde esta classe reside

import javafx.beans.property.SimpleStringProperty; // Importa uma classe para criar propriedades observÃƒÆ’Ã‚Â¡veis de ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“StringÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢, ÃƒÆ’Ã‚Âºtil para ligar dados a componentes da UI (ex: TableView)
import javafx.collections.FXCollections; // Importa utilitÃƒÆ’Ã‚Â¡rios para criar coleÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes observÃƒÆ’Ã‚Â¡veis (listas a notificar a UI sobre mudanÃƒÆ’Ã‚Â§as)
import javafx.collections.ObservableList; // Importa a ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“interfaceÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ para listas que permitem que os componentes da UI sejam notificados quando a lista ÃƒÆ’Ã‚Â© alterada
import javafx.scene.Cursor;
import javafx.scene.control.cell.PropertyValueFactory; // Importa uma classe usada em TableView para ligar as colunas aos campos (propriedades) dos objetos
import javafx.stage.Modality; // Importa enumeraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o que define o comportamento de modalidade de uma janela (ex: bloquear a janela principal)
import javafx.stage.Stage; // Importa a classe principal Stage, que representa uma janela no JavaFX
import javafx.stage.StageStyle; // Importa enumeraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o que define a decoraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o e estilo da janela (ex: sem borda, utilitÃƒÆ’Ã‚Â¡rio)
import javafx.scene.Scene; // Importa a classe Scene, que ÃƒÆ’Ã‚Â© o contentor para todo o conteÃƒÆ’Ã‚Âºdo da interface grÃƒÆ’Ã‚Â¡fica (o que estÃƒÆ’Ã‚Â¡ dentro da Stage)
import javafx.scene.control.*; // Importa todos os componentes de controlo da UI (botÃƒÆ’Ã‚Âµes, caixas de texto, tabelas, etc.)
import javafx.scene.image.Image; // Importa a classe Image, usada para carregar imagens
import javafx.scene.image.ImageView; // Importa o componente para exibir uma imagem na UI
import javafx.scene.layout.*; // Importa todas as classes de layout (HBox, VBox, BorderPane, StackPane, etc.) para organizar os componentes
import javafx.geometry.*; // Importa utilitÃƒÆ’Ã‚Â¡rios para definir alinhamentos, preenchimentos (padding) e margens (insets)
import ltc.events.Modules.admin.AdminScreens;
import ltc.events.Modules.connection.EventDB; // Importa a classe de acesso ao banco de dados para a tabela Eventos
import ltc.events.Modules.connection.ParticipantDB;// Importa a classe de acesso ao banco de dados para a tabela Participantes
import ltc.events.Modules.connection.SessionDB;// Importa a classe de acesso ao banco de dados para a tabela SessÃƒÆ’Ã‚Âµes
import ltc.events.Modules.connection.TypesDB;// Importa a classe de acesso ao banco de dados para a tabela Tipos de Participantes
import ltc.events.Modules.visual.CalendarEventoView; // Importa a classe de visualizaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o especÃƒÆ’Ã‚Â­fica para o calendÃƒÆ’Ã‚Â¡rio de eventos
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.classes.Event; // Importa a classe modelo (POJO) que representa um Evento
import ltc.events.classes.Participant; // Importa a classe modelo (POJO) que representa um Participante
import ltc.events.classes.Session; // Importa a classe modelo (POJO) que representa uma SessÃƒÆ’Ã‚Â£o
import ltc.events.classes.Types; // Importa a classe modelo (POJO) que representa os Tipos de Participantes
import ltc.events.classes.hashs.PasswordUtil; // Importa a classe utilitÃƒÆ’Ã‚Â¡ria para operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes com hashes de password
import ltc.events.classes.hashs.SessionEntry;
import ltc.events.Modules.util.LoggingUtil; // Importa a classe que armazena informaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes da sessÃƒÆ’Ã‚Â£o ativa do utilizador logado (ex: ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“IDÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ e Tipo)

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class Window{

    private VBox centro; // conteÃƒÆ’Ã‚Âºdo principal (eventos ou admin menu)
    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Armazena a referÃƒÆ’Ã‚Âªncia do Stage para conseguir recarregar a UI
    private Stage palcoRef;





    // ============================================================
    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o principal ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â chama setup e guarda o Stage
    // ============================================================
    public void mostrar(Stage palco) {
        this.palcoRef = palco; // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ guarda referÃƒÆ’Ã‚Âªncia
        palco.initStyle(StageStyle.UNDECORATED);
        criarUI();
    }
    // ============================================================
    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Recarrega a UI apÃƒÆ’Ã‚Â³s login/logout
    // ============================================================
    public void refresh() {
        criarUI();
    }
    // ============================================================
    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Aqui fica toda a criaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o da UI
    // ============================================================
    private void criarUI() {
        garantirSessaoAdmin();
        NavbarUtil navbarUtil = new NavbarUtil();
        BorderPane barra = navbarUtil.createNavbar(palcoRef);
        HBox rightBox = criarRightBoxSessao();
        barra.setRight(rightBox);
        LocalDate hoje = LocalDate.now();

        ObservableList<Event> eventos = EventDB.getAllEvents();

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

        // TÃƒÆ’Ã‚Â­tulo
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
                            new Label("MÃƒÆ’Ã‚Âªs:"), mesBox
                    );
                    filtros.setAlignment(Pos.CENTER_LEFT);

                    // ===========================
                    // ÃƒÆ’Ã‚ÂREA DO CALENDÃƒÆ’Ã‚ÂRIO
                    // ===========================
                    ScrollPane scroll = new ScrollPane();
                    scroll.setFitToWidth(true);

                    GridPane calendario = new GridPane();
                    scroll.setContent(calendario);

                    // ===========================
                    // FUNÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã†â€™O PARA DESENHAR O CALENDÃƒÆ’Ã‚ÂRIO
                    // ===========================
                    Runnable atualizarCalendario = () -> {

                        YearMonth mes = mesBox.getValue();
                        if (mes == null) {
                            return;
                        }

                        calendario.getChildren().clear();
                        calendario.setHgap(10);
                        calendario.setVgap(10);

                        // CabeÃƒÆ’Ã‚Â§alho dias da semana
                        String[] dias = {"Seg", "Ter", "Qua", "Qui", "Sex", "SÃƒÆ’Ã‚Â¡b", "Dom"};
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

                            // ---- CÃƒÆ’Ã¢â‚¬Â°LULA DO CALENDÃƒÆ’Ã‚ÂRIO ----
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

                            // NÃƒÆ’Ã‚Âºmero do dia
                            Label lblDia = new Label(String.valueOf(dia));
                            lblDia.setStyle("-fx-font-weight: bold; -fx-font-size: 16px;");
                            celula.getChildren().add(lblDia);

                            // Mostrar eventos dentro da cÃƒÆ’Ã‚Â©lula
                            for (Event ev : eventosDoDia) {
                                Label lblEvento = new Label("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ " + ev.getName());
                                lblEvento.setStyle("-fx-font-size: 12px; -fx-text-fill: #1976d2;");
                                celula.getChildren().add(lblEvento);
                            }

                            // ---- EVENTO DE CLICK ----
                            celula.setOnMouseClicked(e -> {

                                if (eventosDoDia.isEmpty()) return; // nada para mostrar

                                Stage detalhes = new Stage();
                                detalhes.initModality(Modality.APPLICATION_MODAL);
                                detalhes.setTitle("Eventos em " + diaAtual);

                                VBox conteudo = new VBox(20);
                                conteudo.setPadding(new Insets(20));
                                conteudo.setAlignment(Pos.TOP_CENTER);

                                // Reutiliza o teu mÃƒÆ’Ã‚Â©todo criarCardEvento()
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
                    anoBox.setOnAction(_2 -> {
                        mesBox.getItems().clear();
                        for (int m = 1; m <= 12; m++)
                            mesBox.getItems().add(YearMonth.of(anoBox.getValue(), m));

                        mesBox.setValue(YearMonth.of(anoBox.getValue(), 1));
                        atualizarCalendario.run();
                    });

                    // Atualizar quando muda MÃƒÆ’Ã…Â S
                    mesBox.setOnAction(_2 -> atualizarCalendario.run());

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

        // Mostrar apenas os atuais no ecrÃƒÆ’Ã‚Â£
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
    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Barra superior ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Login/Register ou User Info + Logout
    // ============================================================
// ============================================================
// ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ LÃƒÆ’Ã‚Â³gica de Login/Register ou User Info + Logout
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
    private BorderPane getBorderPane(Stage palco, HBox botoesMac) {

        BorderPane barra = new BorderPane();
        garantirSessaoAdmin();

        var user = SessionEntry.getUser();

        Label lblUser = new Label("Admin direto: " + user.getName() + " (" + user.getType().getName() + ")");
        lblUser.setStyle("-fx-font-weight: bold; -fx-font-size: 13px;");

        Button btnAdmin = StyleUtil.primaryButton("Painel Admin", _ -> this.mostrarPainelAdmin());

        HBox rightBox = new HBox(10, lblUser, btnAdmin);
        rightBox.setAlignment(Pos.CENTER_RIGHT);
        rightBox.setPadding(new Insets(6, 10, 6, 0));

        barra.setRight(rightBox);

        // Botoes de janela a esquerda
        barra.setLeft(botoesMac);

        barra.setStyle("-fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf); "
                + "-fx-border-color: #b0b0b0; -fx-border-width: 0 0 1 0;");

        return barra;
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
        admin.setGender("N/A");
        admin.setTaxNumber("000000000");
        return admin;
    }
    public void mostrarPainelAdmin() {

        // Limpar centro
        centro.getChildren().clear();
        Label titulo = new Label("Painel de AdministraÃƒÂ§ÃƒÂ£o");
        titulo.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");

        // BotÃƒÆ’Ã‚Âµes do menu

        AdminScreens admin = new AdminScreens(centro);
        Button btnParticipantes = StyleUtil.adminButton(
                "Participantes",
                _ -> admin.mostrarParticipantes()
        );

        Button btnSessoes = StyleUtil.adminButton(
                "SessÃƒÆ’Ã‚Âµes",
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
        VBox feed = new VBox(8);
        feed.setPadding(new Insets(10));
        feed.setStyle("-fx-background-color: white;");

        Runnable carregarFeed = () -> {
            feed.getChildren().clear();
            String raw = LoggingUtil.readLogs();
            String[] linhas = raw.split("\\R");
            if (linhas.length == 0 || (linhas.length == 1 && linhas[0].isBlank())) {
                feed.getChildren().add(new Label("Sem logs ainda."));
                return;
            }
            for (String linha : linhas) {
                if (linha.isBlank()) continue;
                Label lbl = new Label(linha);
                lbl.setStyle("-fx-font-family: 'Consolas'; -fx-font-size: 12px; -fx-text-fill: #111827;");

                HBox item = new HBox(lbl);
                item.setAlignment(Pos.CENTER_LEFT);
                item.setPadding(new Insets(8));
                item.setStyle("""
                    -fx-background-color: #f3f4f6;
                    -fx-background-radius: 8;
                """);
                feed.getChildren().add(item);
            }
        };
        carregarFeed.run();

        ScrollPane scrollLogs = new ScrollPane(feed);
        scrollLogs.setFitToWidth(true);
        scrollLogs.setPrefViewportHeight(260);
        scrollLogs.setStyle("-fx-background-color: transparent;");

        Button btnRefresh = StyleUtil.secondaryButton("Atualizar Logs", _ -> carregarFeed.run());
        Button btnLimpar = StyleUtil.dangerButton("Limpar Logs", _ -> {
            try {
                java.nio.file.Files.deleteIfExists(java.nio.file.Path.of("logs_app.txt"));
                carregarFeed.run();
            } catch (Exception e) {
                CustomAlert.Error("Erro ao limpar logs: " + e.getMessage());
            }
        });
        HBox barraLogs = new HBox(10, btnRefresh, btnLimpar);
        barraLogs.setAlignment(Pos.CENTER_LEFT);

        VBox painelLogs = new VBox(8,
                new Label("Logs em tempo real"),
                barraLogs,
                scrollLogs
        );
        painelLogs.setPadding(new Insets(10, 20, 20, 20));
        painelLogs.setStyle("""
            -fx-background-color: linear-gradient(to bottom, #f8fafc, #eef2ff);
            -fx-background-radius: 12;
            -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 10, 0, 0, 4);
        """);

        VBox menu = new VBox(15, btnParticipantes, btnSessoes, btnEventos, btnRecursos);
        menu.setAlignment(Pos.TOP_LEFT);
        menu.setPadding(new Insets(20));

        VBox layout = new VBox(20, titulo, menu, painelLogs);
        layout.setAlignment(Pos.TOP_LEFT);
        layout.setPadding(new Insets(10));

        // Substituir tudo no centro
        centro.getChildren().add(layout);
    }

    private void mostrarEventosAdmin() {
        // 1. LIMPAR O CENTRO
        centro.getChildren().clear();

        // 2. TÃƒÆ’Ã‚ÂTULO E BOTÃƒÆ’Ã¢â‚¬Â¢ES DE AÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã†â€™O
        Label titulo = new Label("GestÃƒÂ£oo de Eventos");
        titulo.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");

        TableView<Event> tabelaEventos = new TableView<>();

        Button btnCriar = StyleUtil.primaryButton(
                "Adicionar",
                _ -> abrirJanelaCriarEvento(tabelaEventos) // ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‹â€  sÃƒÆ’Ã‚Â³ chama outro mÃƒÆ’Ã‚Â©todo
        );

        Button btnEditar = StyleUtil.secondaryButton("Editar", _ -> CustomAlert.Info("Funcionalidade de editar evento ainda nao implementada."));
        Button btnRemover = StyleUtil.dangerButton("Remover", _ -> CustomAlert.Info("Funcionalidade de remover evento ainda nao implementada."));
        Button btnAtualizar = StyleUtil.secondaryButton("Atualizar", _ -> {
            tabelaEventos.setItems(FXCollections.observableArrayList(EventDB.getAllEvents()));
        });

        HBox botoesAcao = new HBox(10, btnCriar, btnEditar, btnRemover, btnAtualizar);
        botoesAcao.setPadding(new Insets(10, 0, 10, 0));

        // 3. TABELA DE EVENTOS

        TableColumn<Event, String> colNome = new TableColumn<>("Nome");
        colNome.setCellValueFactory(new PropertyValueFactory<>("name"));
        colNome.setPrefWidth(250);

        TableColumn<Event, String> colLocal = new TableColumn<>("Local");
        colLocal.setCellValueFactory(new PropertyValueFactory<>("local"));
        colLocal.setPrefWidth(150);

        TableColumn<Event, Timestamp> colInicio = new TableColumn<>("InÃƒÆ’Ã‚Â­cio");
        colInicio.setCellValueFactory(new PropertyValueFactory<>("startdate"));
        colInicio.setPrefWidth(180);

        TableColumn<Event, Timestamp> colFim = new TableColumn<>("Fim");
        colFim.setCellValueFactory(new PropertyValueFactory<>("finaldate"));
        colFim.setPrefWidth(180);

        TableColumn<Event, String> colEstado = new TableColumn<>("Estado");
        colEstado.setCellValueFactory(cd ->
                new SimpleStringProperty(cd.getValue().getState().getName())
        );
        colEstado.setPrefWidth(100);

        tabelaEventos.getColumns().addAll(colNome, colLocal, colInicio, colFim, colEstado);

        try {
            ObservableList<Event> listaEventos =
                    FXCollections.observableArrayList(EventDB.getAllEvents());
            tabelaEventos.setItems(listaEventos);
        } catch (Exception ex) {
            System.err.println("Erro ao carregar eventos: " + ex.getMessage());
        }

        tabelaEventos.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        VBox content = new VBox(20, titulo, botoesAcao, tabelaEventos);
        content.setPadding(new Insets(20));
        content.setAlignment(Pos.TOP_LEFT);
        content.prefWidthProperty().bind(centro.widthProperty());

        centro.getChildren().add(content);
    }

    private void abrirJanelaCriarEvento(TableView<Event> tabelaEventos) {
        Stage stage = new Stage();
        stage.initStyle(StageStyle.UTILITY);
        stage.setTitle("Criar Evento");

        TextField txtNome = new TextField();
        TextField txtLocal = new TextField();
        DatePicker dpInicio = new DatePicker();
        DatePicker dpFim = new DatePicker();

        Button btnGuardar = StyleUtil.primaryButton("Guardar", _ -> {
            try {
                // ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¡ adapta isto ao teu EventDB
                /*EventDB.createEvent(
                        txtNome.getText(),
                        txtLocal.getText(),
                        Timestamp.valueOf(dpInicio.getValue().atStartOfDay()),
                        Timestamp.valueOf(dpFim.getValue().atStartOfDay())
                );*/

                tabelaEventos.setItems(
                        FXCollections.observableArrayList(EventDB.getAllEvents())
                );

                CustomAlert.Success("Evento criado com sucesso!");
                stage.close();
            } catch (Exception ex) {
                CustomAlert.Error("Erro: " + ex.getMessage());
            }
        });

        VBox layout = new VBox(10,
                new Label("Nome:"), txtNome,
                new Label("Local:"), txtLocal,
                new Label("InÃƒÆ’Ã‚Â­cio:"), dpInicio,
                new Label("Fim:"), dpFim,
                btnGuardar
        );
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 350, 350));
        stage.showAndWait();
    }



    private void abrirJanelaCriarEventoParticipante() {
        if (!SessionEntry.isLogged()) {
            CustomAlert.Warning("Inicie sessao para propor um evento.");
            return;
        }

        Stage stage = new Stage();
        stage.initStyle(StageStyle.UTILITY);
        stage.setTitle("Propor Evento (aguarda aprovacao)");

        TextField txtNome = new TextField();
        TextArea txtDescricao = new TextArea();
        txtDescricao.setPromptText("Descricao");
        txtDescricao.setPrefRowCount(3);

        TextField txtLocal = new TextField();
        DatePicker dpInicio = new DatePicker();
        DatePicker dpFim = new DatePicker();
        TextField txtImagem = new TextField();
        txtImagem.setPromptText("URL da imagem (opcional)");

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
                if (dataFim.isBefore(dataInicio)) {
                    throw new IllegalArgumentException("Data de fim nao pode ser anterior ÃƒÆ’Ã‚Â  de inicio.");
                }

                Timestamp inicio = Timestamp.valueOf(dataInicio.atStartOfDay());
                Timestamp fim = Timestamp.valueOf(dataFim.atStartOfDay());

                // state_id=4 (Em Aprovacao) usado como pendente/aguarda aprovacao
                EventDB.register(
                        txtNome.getText(),
                        txtDescricao.getText(),
                        txtLocal.getText(),
                        inicio,
                        fim,
                        txtImagem.getText(),
                        4
                );

                CustomAlert.Success("Evento enviado para aprovacao do admin.");
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
                new Label("Imagem:"), txtImagem,
                btnSubmeter
        );
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 360, 480));
        stage.showAndWait();
    }
    private void abrirJanelaCriarUtilizador() {
        Stage stage = new Stage();
        stage.initStyle(StageStyle.UTILITY);
        stage.setTitle("Criar Novo Utilizador");

        Label lblNome = new Label("Nome:");
        TextField txtNome = new TextField();

        Label lblEmail = new Label("Email:");
        TextField txtEmail = new TextField();

        Label lblPhone = new Label("Telefone:");
        TextField txtPhone = new TextField();

        Label lblPass = new Label("Password:");
        PasswordField txtPass = new PasswordField();

        Label lblTipo = new Label("Tipo:");
        ComboBox<Types> cmbTipo = new ComboBox<>(TypesDB.getAll());
        cmbTipo.getSelectionModel().selectFirst();

        Button btnCriar = StyleUtil.primaryButton("Criar", _ -> { /* TODO: implementar criacao de utilizador */ });


        VBox layout = new VBox(10, lblNome, txtNome, lblEmail, txtEmail, lblPhone, txtPhone, lblPass, txtPass, lblTipo, cmbTipo, btnCriar);
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 300, 450));
        stage.showAndWait();
    }

    private void abrirJanelaAlterarPassword(Participant user) {
        Stage stage = new Stage();
        stage.initStyle(StageStyle.UTILITY);
        stage.setTitle("Alterar Password");

        Label lblPass = new Label("Nova Password:");
        PasswordField txtPass = new PasswordField();

        Button btnSalvar = StyleUtil.primaryButton("Guardar", _ -> {});
        btnSalvar.setOnAction(_ -> {
            try (Connection conn = db.connect()) {
                PreparedStatement stmt = conn.prepareStatement(
                        "UPDATE participant SET password = ? WHERE participant_id = ?"
                );
                stmt.setString(1, PasswordUtil.hashPassword(txtPass.getText()));
                stmt.setInt(2, Integer.parseInt(user.getId()));
                stmt.executeUpdate();

                CustomAlert.Success("Password atualizada!");
                stage.close();
            } catch (Exception ex) {
                CustomAlert.Error("Erro: " + ex.getMessage());
            }
        });

        VBox layout = new VBox(10, lblPass, txtPass, btnSalvar);
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 250, 150));
        stage.showAndWait();
    }
    // ============================================================
    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ CriaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o dos cards de eventos
    // ============================================================
    private VBox criarCardEvento(Event ev) {
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // 1) Calcular proximidade do evento (por dias)
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        LocalDate hoje = LocalDate.now();
        LocalDate dataInicio = dataEventoOuHoje(ev);

        long dias = ChronoUnit.DAYS.between(hoje, dataInicio);



        double[] size = calcularTamanho(dias);
        double width = size[0];
        double height = size[1];
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // 2) ConfiguraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o base do card
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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

        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // 3) Imagem
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        ImageView img;
        try {
            img = new ImageView(new Image(ev.getImage(), 220, 130, false, true));
        } catch (Exception ex) {
            img = new ImageView(new Image(
                    "https://via.placeholder.com/220x130.png?text=Evento",
                    220, 130, false, true
            ));
        }

        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // 4) Labels
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        Label lblNome = new Label(ev.getName());
        lblNome.setStyle("-fx-font-weight: bold; -fx-font-size: 16px; -fx-text-fill: #333;");
        lblNome.setWrapText(true);

        Label lblData = new Label("Data: " + dataEventoOuHoje(ev));
        lblData.setStyle("-fx-text-fill: #666; -fx-font-size: 13px;");

        Label lblLocal = new Label("Local: " + ev.getLocal());
        lblLocal.setStyle("-fx-text-fill: #777; -fx-font-size: 13px;");

        Label lblEstado = new Label(ev.getState().getName());
        lblEstado.setStyle(defineCorEstado(ev.getState().getName()));

        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // 5) Montar o card
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        card.getChildren().addAll(img, lblNome, lblData, lblLocal, lblEstado);

        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // 6) Click ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ detalhes
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        card.setOnMouseClicked(_ -> {
            List<Session> sessoes = SessionDB.getSessionsByEvent(ev.getId());
            new CalendarEventoView(ev, sessoes).mostrar();
        });

        return card;

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









