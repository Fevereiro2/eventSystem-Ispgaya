package ltc.events.Modules; // Declara o pacote onde esta classe reside

import javafx.beans.property.SimpleStringProperty; // Importa uma classe para criar propriedades observáveis de ‘String’, útil para ligar dados a componentes da UI (ex: TableView)
import javafx.collections.FXCollections; // Importa utilitários para criar coleções observáveis (listas a notificar a UI sobre mudanças)
import javafx.collections.ObservableList; // Importa a ‘interface’ para listas que permitem que os componentes da UI sejam notificados quando a lista é alterada
import javafx.scene.Cursor;
import javafx.scene.control.cell.PropertyValueFactory; // Importa uma classe usada em TableView para ligar as colunas aos campos (propriedades) dos objetos
import javafx.stage.Modality; // Importa enumeração que define o comportamento de modalidade de uma janela (ex: bloquear a janela principal)
import javafx.stage.Stage; // Importa a classe principal Stage, que representa uma janela no JavaFX
import javafx.stage.StageStyle; // Importa enumeração que define a decoração e estilo da janela (ex: sem borda, utilitário)
import javafx.scene.Scene; // Importa a classe Scene, que é o contentor para todo o conteúdo da interface gráfica (o que está dentro da Stage)
import javafx.scene.control.*; // Importa todos os componentes de controlo da UI (botões, caixas de texto, tabelas, etc.)
import javafx.scene.image.Image; // Importa a classe Image, usada para carregar imagens
import javafx.scene.image.ImageView; // Importa o componente para exibir uma imagem na UI
import javafx.scene.layout.*; // Importa todas as classes de layout (HBox, VBox, BorderPane, StackPane, etc.) para organizar os componentes
import javafx.geometry.*; // Importa utilitários para definir alinhamentos, preenchimentos (padding) e margens (insets)
import ltc.events.Modules.admin.AdminScreens;
import ltc.events.Modules.connection.EventDB; // Importa a classe de acesso ao banco de dados para a tabela Eventos
import ltc.events.Modules.connection.ParticipantDB;// Importa a classe de acesso ao banco de dados para a tabela Participantes
import ltc.events.Modules.connection.SessionDB;// Importa a classe de acesso ao banco de dados para a tabela Sessões
import ltc.events.Modules.connection.TypesDB;// Importa a classe de acesso ao banco de dados para a tabela Tipos de Participantes
import ltc.events.Modules.visual.CalendarEventoView; // Importa a classe de visualização específica para o calendário de eventos
import ltc.events.Modules.visual.Login; // Importa a classe que define a interface e lógica da tela de Login
import ltc.events.Modules.visual.Register; // Importa a classe que define a interface e lógica da tela de Registo
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.Modules.account.AccountScreens;
import ltc.events.classes.Event; // Importa a classe modelo (POJO) que representa um Evento
import ltc.events.classes.Participant; // Importa a classe modelo (POJO) que representa um Participante
import ltc.events.classes.Session; // Importa a classe modelo (POJO) que representa uma Sessão
import ltc.events.classes.Types; // Importa a classe modelo (POJO) que representa os Tipos de Participantes
import ltc.events.classes.hashs.PasswordUtil; // Importa a classe utilitária para operações com hashes de password
import ltc.events.classes.hashs.SessionEntry; // Importa a classe que armazena informações da sessão ativa do utilizador logado (ex: ‘ID’ e Tipo)

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class Window{

    private VBox centro; // conteúdo principal (eventos ou admin menu)
    // 🔥 Armazena a referência do Stage para conseguir recarregar a UI
    private Stage palcoRef;





    // ============================================================
    // 🔥 Função principal — chama setup e guarda o Stage
    // ============================================================
    public void mostrar(Stage palco) {
        this.palcoRef = palco; // 🔥 guarda referência
        palco.initStyle(StageStyle.UNDECORATED);
        criarUI();
    }
    // ============================================================
    // 🔥 Recarrega a UI após login/logout
    // ============================================================
    public void refresh() {
        criarUI();
    }
    // ============================================================
    // 🔥 Aqui fica toda a criação da UI
    // ============================================================
    private void criarUI() {
        NavbarUtil navbarUtil = new NavbarUtil();
        BorderPane barra = navbarUtil.createNavbar(palcoRef);
        HBox rightBox = criarRightBoxSessao();
        barra.setRight(rightBox);
        LocalDate hoje = LocalDate.now();

        ObservableList<Event> eventos = EventDB.getAllEvents();
        List<Event> eventosComData = eventos.stream()
                .filter(ev -> ev.getStartdate() != null)
                .toList();

        // Eventos atuais (data >= hoje)
        List<Event> eventosAtuais = eventosComData.stream()
                .filter(ev -> ev.getStartdate().toLocalDateTime().toLocalDate().compareTo(hoje) >= 0)
                .toList();

        // Eventos antigos (data < hoje)
        List<Event> eventosAntigos = eventosComData.stream()
                .filter(ev -> ev.getStartdate().toLocalDateTime().toLocalDate().compareTo(hoje) < 0)
                .toList();

        // Título
        Label titulo = new Label("🎟️ Eventos Disponíveis");
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
                            new Label("Mês:"), mesBox
                    );
                    filtros.setAlignment(Pos.CENTER_LEFT);

                    // ===========================
                    // ÁREA DO CALENDÁRIO
                    // ===========================
                    ScrollPane scroll = new ScrollPane();
                    scroll.setFitToWidth(true);

                    GridPane calendario = new GridPane();
                    scroll.setContent(calendario);

                    // ===========================
                    // FUNÇÃO PARA DESENHAR O CALENDÁRIO
                    // ===========================
                    Runnable atualizarCalendario = () -> {

                        YearMonth mes = mesBox.getValue();
                        if (mes == null) {
                            return;
                        }

                        calendario.getChildren().clear();
                        calendario.setHgap(10);
                        calendario.setVgap(10);

                        // Cabeçalho dias da semana
                        String[] dias = {"Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"};
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

                            // ---- CÉLULA DO CALENDÁRIO ----
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

                            // Número do dia
                            Label lblDia = new Label(String.valueOf(dia));
                            lblDia.setStyle("-fx-font-weight: bold; -fx-font-size: 16px;");
                            celula.getChildren().add(lblDia);

                            // Mostrar eventos dentro da célula
                            for (Event ev : eventosDoDia) {
                                Label lblEvento = new Label("• " + ev.getName());
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

                                // Reutiliza o teu método criarCardEvento()
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

                    // Atualizar quando muda MÊS
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

        Button btndefenicoes = null;
        if (SessionEntry.isLogged()) {
            btndefenicoes = StyleUtil.secondaryButton(
                    "Definicoes",
                    _ -> new AccountScreens(centro, this::refresh).mostrarDefinicoesConta()
            );
        }



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
        if (btndefenicoes != null) {
            colunaBotoes.getChildren().addAll(btnAntigos, btnParticipantCriarEvento, btndefenicoes);
        } else {
            colunaBotoes.getChildren().addAll(btnAntigos, btnParticipantCriarEvento);
        }
        colunaBotoes.setPadding(new Insets(5, 0, 5, 5)); // opcional

        // Mostrar apenas os atuais no ecrã
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
    // 🔥 Barra superior — Login/Register ou User Info + Logout
    // ============================================================
// ============================================================
// 🔥 Lógica de Login/Register ou User Info + Logout
// ============================================================
    private HBox criarRightBoxSessao() {

        HBox rightBox = new HBox(10);
        rightBox.setAlignment(Pos.CENTER_RIGHT);
        rightBox.setPadding(new Insets(6, 10, 6, 0));

        // ================= LOGADO ==================
        if (SessionEntry.isLogged()) {

            var user = SessionEntry.getUser();

            Label lblUser = new Label("👤 " + user.getName() + " (" + user.getType().getName() + ")");
            lblUser.setStyle("-fx-font-weight: bold; -fx-font-size: 13px;");

        Button btnLogout = StyleUtil.secondaryButton("Sair", _ -> {
            SessionEntry.logout();
            refresh();
        });

            rightBox.getChildren().addAll(lblUser, btnLogout);

            // Admin / Moderador
            if (Permissions.isAdmin() || Permissions.isModerador()) {
                Button btnAdmin = StyleUtil.primaryButton("Painel Admin", _ -> this.mostrarPainelAdmin());
                rightBox.getChildren().add(btnAdmin);
            }

        } else {

            // ================= DESLOGADO ==================
            Button btnLogin = StyleUtil.primaryButton("🔐 Login", _ -> new Login(this).mostrarLogin());
            Button btnRegister = StyleUtil.primaryButton("📝 Register", _ -> new Register().mostrarRegister()); // Corrigir chamada

            rightBox.getChildren().addAll(btnLogin, btnRegister);
        }

        return rightBox;
    }

    private BorderPane getBorderPane(Stage palco, HBox botoesMac) {

        BorderPane barra = new BorderPane();

        // ================= LOGADO ==================
        if (SessionEntry.isLogged()) {

            var user = SessionEntry.getUser();

            Label lblUser = new Label("👤 " + user.getName() + " (" + user.getType().getName() + ")");
            lblUser.setStyle("-fx-font-weight: bold; -fx-font-size: 13px;");

        Button btnLogout = StyleUtil.secondaryButton("Sair", _ -> {
            SessionEntry.logout();
            refresh();
        });

            HBox rightBox = new HBox(10, lblUser, btnLogout);
            rightBox.setAlignment(Pos.CENTER_RIGHT);
            rightBox.setPadding(new Insets(6, 10, 6, 0));

            // Admin / Moderador
            if (Permissions.isAdmin() || Permissions.isModerador()) {
                Button btnAdmin = StyleUtil.primaryButton("Painel Admin", _ -> this.mostrarPainelAdmin());
                rightBox.getChildren().add(btnAdmin);
            }

            barra.setRight(rightBox);

        } else {

            // ================= DESLOGADO ==================
            Button btnLogin = StyleUtil.primaryButton("🔐 Login", _ -> new Login(this).mostrarLogin());
            Button btnRegister = StyleUtil.primaryButton("📝 Register", _ -> new Register().mostrarRegister());

            HBox rightBox = new HBox(10, btnLogin, btnRegister);
            rightBox.setAlignment(Pos.CENTER_RIGHT);
            rightBox.setPadding(new Insets(6, 10, 6, 0));

            barra.setRight(rightBox);
        }

        // Botões de janela à esquerda
        barra.setLeft(botoesMac);

        barra.setStyle("-fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf); "
                + "-fx-border-color: #b0b0b0; -fx-border-width: 0 0 1 0;");


        return barra;
    }





    public void mostrarPainelAdmin() {

        // Limpar centro
        centro.getChildren().clear();
        Label titulo = new Label("⚙️ Painel de Administração");
        titulo.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");

        // Botões do menu

        AdminScreens admin = new AdminScreens(centro);
        Button btnParticipantes = StyleUtil.adminButton(
                "Participantes",
                _ -> admin.mostrarParticipantes()
        );

        Button btnSessoes = StyleUtil.adminButton(
                "Sessões",
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
        VBox menu = new VBox(15, btnParticipantes, btnSessoes, btnEventos, btnRecursos);
        menu.setAlignment(Pos.TOP_LEFT);
        menu.setPadding(new Insets(20));

        // Substituir tudo no centro
        centro.getChildren().addAll(titulo, menu);
    }

    private void mostrarEventosAdmin() {
        // 1. LIMPAR O CENTRO
        centro.getChildren().clear();

        // 2. TÍTULO E BOTÕES DE AÇÃO
        Label titulo = new Label("🎟️ Gestão de Eventos");
        titulo.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");

        TableView<Event> tabelaEventos = new TableView<>();

        Button btnCriar = StyleUtil.primaryButton(
                "Adicionar",
                _ -> abrirJanelaCriarEvento(tabelaEventos) // 👈 só chama outro método
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

        TableColumn<Event, Timestamp> colInicio = new TableColumn<>("Início");
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
                // 👇 adapta isto ao teu EventDB
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
                new Label("Início:"), dpInicio,
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
                if (dataFim.isBefore(dataInicio)) {
                    throw new IllegalArgumentException("Data de fim nao pode ser anterior à de inicio.");
                }

                Timestamp inicio = Timestamp.valueOf(dataInicio.atStartOfDay());
                Timestamp fim = Timestamp.valueOf(dataFim.atStartOfDay());

                // state_id=1 (Planeado) usado como pendente/aguarda aprovacao
                EventDB.register(
                        txtNome.getText(),
                        txtDescricao.getText(),
                        txtLocal.getText(),
                        inicio,
                        fim,
                        txtImagem.getText(),
                        1
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
    // 🔥 Criação dos cards de eventos
    // ============================================================
    private VBox criarCardEvento(Event ev) {
// ─────────────────────────────────────────────
        // 1) Calcular proximidade do evento (por dias)
        // ─────────────────────────────────────────────
        LocalDate hoje = LocalDate.now();
        LocalDate dataInicio = ev.getStartdate()
                .toLocalDateTime()
                .toLocalDate();

        long dias = ChronoUnit.DAYS.between(hoje, dataInicio);



        double[] size = calcularTamanho(dias);
        double width = size[0];
        double height = size[1];
        // ─────────────────────────────────────────────
        // 2) Configuração base do card
        // ─────────────────────────────────────────────
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

        // ─────────────────────────────────────────────
        // 3) Imagem
        // ─────────────────────────────────────────────
        ImageView img;
        try {
            img = new ImageView(new Image(ev.getImage(), 220, 130, false, true));
        } catch (Exception ex) {
            img = new ImageView(new Image(
                    "https://via.placeholder.com/220x130.png?text=Evento",
                    220, 130, false, true
            ));
        }

        // ─────────────────────────────────────────────
        // 4) Labels
        // ─────────────────────────────────────────────
        Label lblNome = new Label(ev.getName());
        lblNome.setStyle("-fx-font-weight: bold; -fx-font-size: 16px; -fx-text-fill: #333;");
        lblNome.setWrapText(true);

        Label lblData = new Label("📅 " + ev.getStartdate().toLocalDateTime().toLocalDate());
        lblData.setStyle("-fx-text-fill: #666; -fx-font-size: 13px;");

        Label lblLocal = new Label("📍 " + ev.getLocal());
        lblLocal.setStyle("-fx-text-fill: #777; -fx-font-size: 13px;");

        Label lblEstado = new Label(ev.getState().getName());
        lblEstado.setStyle(defineCorEstado(ev.getState().getName()));

        // ─────────────────────────────────────────────
        // 5) Montar o card
        // ─────────────────────────────────────────────
        card.getChildren().addAll(img, lblNome, lblData, lblLocal, lblEstado);

        // ─────────────────────────────────────────────
        // 6) Click → detalhes
        // ─────────────────────────────────────────────
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





