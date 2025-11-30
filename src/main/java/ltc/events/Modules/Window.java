package ltc.events.Modules; // Declara o pacote onde esta classe reside

import javafx.beans.property.SimpleStringProperty; // Importa uma classe para criar propriedades observáveis de ‘String’, útil para ligar dados a componentes da UI (ex: TableView)
import javafx.collections.FXCollections; // Importa utilitários para criar coleções observáveis (listas a notificar a UI sobre mudanças)
import javafx.collections.ObservableList; // Importa a ‘interface’ para listas que permitem que os componentes da UI sejam notificados quando a lista é alterada
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
import javafx.scene.paint.Color; // Importa a classe Color, usada para definir cores
import javafx.scene.shape.Circle; // Importa a classe Circle, usada para desenhar um círculo (forma geométrica)
import ltc.events.Modules.connection.EventDB; // Importa a classe de acesso ao banco de dados para a tabela Eventos
import ltc.events.Modules.connection.ParticipantDB;// Importa a classe de acesso ao banco de dados para a tabela Participantes
import ltc.events.Modules.connection.SessionDB;// Importa a classe de acesso ao banco de dados para a tabela Sessões
import ltc.events.Modules.connection.TypesDB;// Importa a classe de acesso ao banco de dados para a tabela Tipos de Participantes
import ltc.events.Modules.visual.CalendarEventoView; // Importa a classe de visualização específica para o calendário de eventos
import ltc.events.Modules.visual.Login; // Importa a classe que define a interface e lógica da tela de Login
import ltc.events.Modules.visual.Register; // Importa a classe que define a interface e lógica da tela de Registo
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
import java.time.temporal.ChronoUnit;
import java.util.List;

public class Window {
    private VBox centro; // conteúdo principal (eventos ou admin menu)

    private double xOffset = 0; //declarar as
    private double yOffset = 0;

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

        // Botões macOS
        Circle btnFechar = new Circle(6, Color.web("#FF5F57"));
        Circle btnMin = new Circle(6, Color.web("#FFBD2E"));
        Circle btnMax = new Circle(6, Color.web("#28C940"));

        btnFechar.setOnMouseClicked(_ -> palcoRef.close());
        btnMin.setOnMouseClicked(_ -> palcoRef.setIconified(true));
        btnMax.setOnMouseClicked(_ -> palcoRef.setMaximized(!palcoRef.isMaximized()));

        HBox botoesMac = new HBox(8, btnFechar, btnMin, btnMax);
        botoesMac.setAlignment(Pos.CENTER_LEFT);
        botoesMac.setPadding(new Insets(6, 0, 6, 10));

        // Barra superior
        BorderPane barra = getBorderPane(palcoRef, botoesMac);

        // Título
        Label titulo = new Label("🎟️ Eventos Disponíveis");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");

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


        for (Event ev : EventDB.getAllEvents()) {
            tiles.getChildren().add(criarCardEvento(ev));
        }
        scroll.setContent(tiles);


        scroll.setContent(tiles);



        centro = new VBox(20, titulo, scroll);
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
    private BorderPane getBorderPane(Stage palco, HBox botoesMac) {

        BorderPane barra = new BorderPane();

        // ================= LOGADO ==================
        if (SessionEntry.isLogged()) {

            var user = SessionEntry.getUser();

            Label lblUser = new Label("👤 " + user.getName() + " (" + user.getType().getName() + ")");
            lblUser.setStyle("-fx-font-weight: bold; -fx-font-size: 13px;");

            Button btnLogout = new Button("Sair");
            btnLogout.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);
            btnLogout.setOnAction(_ -> {
                SessionEntry.logout();
                refresh();
            });

            HBox rightBox = new HBox(10, lblUser, btnLogout);
            rightBox.setAlignment(Pos.CENTER_RIGHT);
            rightBox.setPadding(new Insets(6, 10, 6, 0));

            // Admin / Moderador
            if (Permissions.isAdmin() || Permissions.isModerador()) {
                Button btnAdmin = new Button("Painel Admin");
                btnAdmin.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);
                rightBox.getChildren().add(btnAdmin);

                btnAdmin.setOnAction(_ -> this.mostrarPainelAdmin());
            }

            barra.setRight(rightBox);

        } else {

            // ================= DESLOGADO ==================
            Button btnLogin = new Button("🔐 Login");
            btnLogin.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);
            Button btnRegister = new Button("📝 Register");

            btnRegister.setStyle("""
                -fx-background-color: linear-gradient(to bottom, #2EC4B6, #1A9E8C);
                -fx-text-fill: white;
                -fx-font-weight: bold;
                -fx-background-radius: 8;
                -fx-padding: 6 14;
                -fx-cursor: hand;
                -fx-alignment: center;
                -fx-text-alignment: center;
            """);

            btnLogin.setOnAction(_ -> new Login(this).mostrarLogin());
            btnRegister.setOnAction(_ -> new Register().mostrarRegister());

            HBox rightBox = new HBox(10, btnLogin, btnRegister);
            rightBox.setAlignment(Pos.CENTER_RIGHT);
            rightBox.setPadding(new Insets(6, 10, 6, 0));

            barra.setRight(rightBox);
        }

        // Botões de janela à esquerda
        barra.setLeft(botoesMac);

        barra.setStyle("-fx-background-color: linear-gradient(to bottom, #e0e0e0, #cfcfcf); "
                + "-fx-border-color: #b0b0b0; -fx-border-width: 0 0 1 0;");

        barra.setOnMousePressed(e -> {
            xOffset = e.getSceneX();
            yOffset = e.getSceneY();
        });
        barra.setOnMouseDragged(e -> {
            palco.setX(e.getScreenX() - xOffset);
            palco.setY(e.getScreenY() - yOffset);
        });

        return barra;
    }
    public void mostrarPainelAdmin() {

        // Limpar centro
        centro.getChildren().clear();

        Label titulo = new Label("⚙️ Painel de Administração");
        titulo.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");

        // Botões do menu
        Button btnParticipantes = new Button("👤 Participantes");
        Button btnSessoes = new Button("🗓️ Sessões");
        Button btnEventos = new Button("🎟️ Eventos");
        Button btnRecursos = new Button("📦 Recursos");

        estilizarBotaoAdmin(btnParticipantes);
        estilizarBotaoAdmin(btnSessoes);
        estilizarBotaoAdmin(btnEventos);
        estilizarBotaoAdmin(btnRecursos);

        btnParticipantes.setOnAction(_ -> mostrarParticipantesAdmin());
        btnEventos.setOnAction(_ -> mostrarEventosAdmin());

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

        Button btnCriar = new Button("➕ Criar Evento");
        Button btnEditar = new Button("✏️ Editar");
        Button btnRemover = new Button("🗑️ Remover");
        Button btnAtualizar = new Button("🔄 Atualizar");

        // Container para os botões de ação (semelhante ao painel de participantes)
        HBox botoesAcao = new HBox(10, btnCriar, btnEditar, btnRemover, btnAtualizar);
        botoesAcao.setPadding(new Insets(10, 0, 10, 0));


        // 3. TABELA DE EVENTOS
        TableView<Event> tabelaEventos = new TableView<>();

        // Coluna Nome
        TableColumn<Event, String> colNome = new TableColumn<>("Nome");
        colNome.setCellValueFactory(new PropertyValueFactory<>("name"));
        colNome.setPrefWidth(250);

        // Coluna Local
        TableColumn<Event, String> colLocal = new TableColumn<>("Local");
        colLocal.setCellValueFactory(new PropertyValueFactory<>("local"));
        colLocal.setPrefWidth(150);

        // Coluna Data de Início (Timestamp)
        TableColumn<Event, Timestamp> colInicio = new TableColumn<>("Início");
        colInicio.setCellValueFactory(new PropertyValueFactory<>("startdate"));
        colInicio.setPrefWidth(180);

        // Coluna Data de Fim (Timestamp)
        TableColumn<Event, Timestamp> colFim = new TableColumn<>("Fim");
        colFim.setCellValueFactory(new PropertyValueFactory<>("finaldate"));
        colFim.setPrefWidth(180);

        // Coluna Estado (Obtido da classe State dentro de Event)
        TableColumn<Event, String> colEstado = new TableColumn<>("Estado");
        colEstado.setCellValueFactory(cellData ->
                new SimpleStringProperty(cellData.getValue().getState().getName())
        );
        colEstado.setPrefWidth(100);

        tabelaEventos.getColumns().addAll(colNome, colLocal, colInicio, colFim, colEstado);


        // 4. CARREGAR DADOS
        try {
            ObservableList<Event> listaEventos = FXCollections.observableArrayList(
                    EventDB.getAllEvents() // Assumindo que esta função está no seu EventDB
            );
            tabelaEventos.setItems(listaEventos);
        } catch (Exception ex) {
            System.err.println("Erro ao carregar eventos: " + ex.getMessage());
            // Mostrar um erro amigável ao utilizador, se necessário
        }

        // 5. AJUSTAR TAMANHOS E LAYOUT
        tabelaEventos.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        VBox content = new VBox(20, titulo, botoesAcao, tabelaEventos);
        content.setPadding(new Insets(20));
        content.setAlignment(Pos.TOP_LEFT);

        // Ajustar o tamanho da VBox para ocupar o espaço necessário
        content.prefWidthProperty().bind(centro.widthProperty());

        centro.getChildren().add(content);
    }

    private void aplicarFiltro(TableView<Participant> tabela, String filtro) {
        ObservableList<Participant> todos = ParticipantDB.listAll(); // já tens isto
        switch (filtro) {
            case "Admins" ->
                tabela.setItems(
                        todos.filtered(p -> p.getType().getName().equalsIgnoreCase("Admin"))
                );
            case "Participantes" ->
                tabela.setItems(
                        todos.filtered(p -> p.getType().getName().equalsIgnoreCase("Participante"))
                );
            default ->
                tabela.setItems(todos);
        }
    }

    private void atualizarContador(Label label, ObservableList<Participant> lista) {
        long total = lista.size();
        long admins = lista.stream().filter(p -> p.getType().getName().equalsIgnoreCase("Admin")).count();
        long participantes = lista.stream().filter(p -> p.getType().getName().equalsIgnoreCase("Participante")).count();
        long moderadores = lista.stream().filter(p -> p.getType().getName().equalsIgnoreCase("Moderador")).count();

        label.setText("Total: " + total + " | Admins: " + admins + " | Participantes: " + participantes + " | Moderadores: " + moderadores);
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

        Button btnCriar = new Button("Criar");
        btnCriar.setOnAction(_ -> {
            try {
                String hashed = PasswordUtil.hashPassword(txtPass.getText());
                ParticipantDB.register(
                        txtNome.getText(),
                        txtEmail.getText(),
                        txtPhone.getText(),
                        hashed,
                        cmbTipo.getValue()
                );
                new Alert(Alert.AlertType.INFORMATION, "Utilizador criado com sucesso!").showAndWait();
                stage.close();
            } catch (Exception ex) {
                new Alert(Alert.AlertType.ERROR, "Erro: " + ex.getMessage()).showAndWait();
            }
        });

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

        Button btnSalvar = new Button("Guardar");
        btnSalvar.setOnAction(_ -> {
            try (Connection conn = db.connect()) {
                PreparedStatement stmt = conn.prepareStatement(
                        "UPDATE participant SET password = ? WHERE participant_id = ?"
                );
                stmt.setString(1, PasswordUtil.hashPassword(txtPass.getText()));
                stmt.setInt(2, Integer.parseInt(user.getId()));
                stmt.executeUpdate();

                new Alert(Alert.AlertType.INFORMATION, "Password atualizada!").showAndWait();
                stage.close();
            } catch (Exception ex) {
                new Alert(Alert.AlertType.ERROR, "Erro: " + ex.getMessage()).showAndWait();
            }
        });

        VBox layout = new VBox(10, lblPass, txtPass, btnSalvar);
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 250, 150));
        stage.showAndWait();
    }



    public void mostrarParticipantesAdmin() {

        centro.getChildren().clear();

        // -------------------------------
        // TÍTULO + FILTRO
        // -------------------------------
        Label titulo = new Label("👤 Gestão de Participantes");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        ComboBox<String> filtro = new ComboBox<>();
        filtro.getItems().addAll("Todos", "Admins", "Participantes", "Moderadores");
        filtro.getSelectionModel().select("Todos");

        HBox topo = new HBox(20, titulo, filtro);
        topo.setAlignment(Pos.CENTER_LEFT);
        topo.setPadding(new Insets(10));

        // -------------------------------
        // TABELA
        // -------------------------------
        TableView<Participant> tabela = new TableView<>();

        TableColumn<Participant, String> colNome = new TableColumn<>("Nome");
        colNome.setCellValueFactory(new PropertyValueFactory<>("name"));

        TableColumn<Participant, String> colEmail = new TableColumn<>("Email");
        colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));

        TableColumn<Participant, String> colPhone = new TableColumn<>("Telefone");
        colPhone.setCellValueFactory(new PropertyValueFactory<>("phone"));

        TableColumn<Participant, String> colTipo = new TableColumn<>("Tipo");
        colTipo.setCellValueFactory(cell ->
                new SimpleStringProperty(cell.getValue().getType().getName())
        );

        tabela.getColumns().addAll(colNome, colEmail, colPhone, colTipo);

        // Lista original
        ObservableList<Participant> todos = ParticipantDB.listAll();
        tabela.setItems(todos);

        // -------------------------------
        // CONTADOR
        // -------------------------------
        Label contador = new Label();
        contador.setStyle("-fx-font-weight: bold; -fx-font-size: 14px;");
        atualizarContador(contador, todos);

        // -------------------------------
        // FILTRO
        // -------------------------------
        filtro.setOnAction(_ -> {
            aplicarFiltro(tabela, filtro.getValue());
            atualizarContador(contador, tabela.getItems());
        });

        // -------------------------------
        // BOTÕES
        // -------------------------------
        Button btnEditar = new Button("✏ Editar");
        Button btnRemover = new Button("🗑 Remover");
        Button btnRefresh = new Button("🔄 Atualizar");

        btnEditar.setOnAction(_ -> {
            Participant sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                new Alert(Alert.AlertType.WARNING, "Selecione um participante para editar.").showAndWait();
                return;
            }
            editarParticipante(sel);
        });

        btnRemover.setOnAction(_ -> {
            Participant sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                new Alert(Alert.AlertType.WARNING, "Selecione um participante para remover.").showAndWait();
                return;
            }
            eliminarParticipante(sel);
            aplicarFiltro(tabela, filtro.getValue());
            atualizarContador(contador, tabela.getItems());
        });

        btnRefresh.setOnAction(_ -> {
            tabela.setItems(ParticipantDB.listAll());
            aplicarFiltro(tabela, filtro.getValue());
            atualizarContador(contador, tabela.getItems());
        });

        Button btnCriar = new Button("➕ Criar Utilizador");
        Button btnPass = new Button("🔑 Alterar Password");

// Ações
        btnCriar.setOnAction(_ -> abrirJanelaCriarUtilizador());

        btnPass.setOnAction(_ -> {
            Participant sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                new Alert(Alert.AlertType.WARNING, "Selecione um participante para alterar a password.").showAndWait();
                return;
            }
            abrirJanelaAlterarPassword(sel);
        });

        HBox botoes = new HBox(10, btnCriar, btnEditar, btnRemover, btnRefresh, btnPass);
        botoes.setAlignment(Pos.CENTER_LEFT);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        botoes.setAlignment(Pos.CENTER_LEFT);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        // -------------------------------
        // LAYOUT FINAL
        // -------------------------------
        VBox layout = new VBox(15, topo, tabela, contador, botoes);
        layout.setAlignment(Pos.TOP_CENTER);
        layout.setPadding(new Insets(20));

        centro.getChildren().add(layout);
    }





    private void editarParticipante(Participant p) {
        if (p == null) {
            new Alert(Alert.AlertType.WARNING, "Selecione um participante.").show();
            return;
        }

        Stage popup = new Stage();
        popup.initModality(Modality.APPLICATION_MODAL);
        popup.setTitle("Editar Participante");

        TextField txtNome = new TextField(p.getName());
        TextField txtEmail = new TextField(p.getEmail());
        TextField txtPhone = new TextField(p.getPhone());

        ComboBox<Types> comboTipo = new ComboBox<>();
        comboTipo.getItems().addAll(TypesDB.listAll()); // Criamos já a seguir
        comboTipo.getSelectionModel().select(p.getType());

        Button btnSalvar = new Button("Salvar");
        btnSalvar.setOnAction(_ -> {
            try {
                ParticipantDB.update(p.getId(), txtNome.getText(), txtEmail.getText(),
                        txtPhone.getText(), comboTipo.getValue());

                popup.close();
                mostrarParticipantesAdmin(); // refresh

            } catch (Exception ex) {
                new Alert(Alert.AlertType.ERROR, "Erro ao atualizar: " + ex.getMessage()).show();
            }
        });

        VBox box = new VBox(10, txtNome, txtEmail, txtPhone, comboTipo, btnSalvar);
        box.setPadding(new Insets(20));

        popup.setScene(new Scene(box, 300, 300));
        popup.showAndWait();
    }
    private void eliminarParticipante(Participant p) {
        if (p == null) {
            new Alert(Alert.AlertType.WARNING, "Selecione um participante.").show();
            return;
        }

        if (new Alert(Alert.AlertType.CONFIRMATION,
                "Deseja mesmo apagar " + p.getName() + "?",
                ButtonType.YES, ButtonType.NO).showAndWait().get() != ButtonType.YES) {
            return;
        }

        try {
            ParticipantDB.delete(p.getId());
            mostrarParticipantesAdmin(); // refresh
        } catch (Exception ex) {
            new Alert(Alert.AlertType.ERROR, "Erro ao apagar: " + ex.getMessage()).show();
        }
    }




    private void estilizarBotaoAdmin(Button btn) {
        btn.setPrefWidth(200);
        btn.setStyle("""
        -fx-background-color: #007aff;
        -fx-text-fill: white;
        -fx-font-size: 14px;
        -fx-font-weight: bold;
        -fx-padding: 10;
        -fx-background-radius: 6;
    """);
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
