package ltc.events.Modules.admin;

import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.sql.Timestamp;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import ltc.events.Modules.connection.EventDB;
import ltc.events.Modules.connection.ParticipantDB;
import ltc.events.Modules.connection.TypesDB;
import ltc.events.Modules.connection.CategoryDB;
import ltc.events.Modules.connection.ResourcesDB;
import ltc.events.Modules.connection.SessionDB;
import ltc.events.Modules.connection.SessionParticipantDB;
import ltc.events.Modules.connection.SessionResourceDB;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.connection.StateDB;
import ltc.events.classes.Participant;
import ltc.events.classes.Event;
import ltc.events.classes.Types;
import ltc.events.classes.State;
import ltc.events.classes.Category;
import ltc.events.classes.Resources;
import ltc.events.classes.Session;

import static ltc.events.Modules.ui.AlterPassword.abrirJanelaAlterarPassword;


public class AdminScreens {

    private VBox centro;


    public AdminScreens(VBox centro ) {
        this.centro = centro;

    }

    public void mostrarParticipantes() {
        centro.getChildren().clear();
        centro.getChildren().clear();

        // -------------------------------
        // TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂTULO + FILTRO
        // -------------------------------
        javafx.scene.control.Label titulo = new javafx.scene.control.Label("Gestão de Participantes");
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
        javafx.scene.control.Label contador = new Label();
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
        // BOTÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES
        // -------------------------------
        Button btnEditar = StyleUtil.secondaryButton("Editar", _ -> {
            Participant sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um participante para editar.");
                return;
            }
            editarParticipante(sel);
        });

        Button btnRemover = StyleUtil.dangerButton("Remover", _ -> {
            Participant sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um participante para remover.");
                return;
            }
            eliminarParticipante(sel);
            aplicarFiltro(tabela, filtro.getValue());
            atualizarContador(contador, tabela.getItems());
        });

        Button btnRefresh = StyleUtil.secondaryButton("Atualizar", _ -> {
            tabela.setItems(ParticipantDB.listAll());
            aplicarFiltro(tabela, filtro.getValue());
            atualizarContador(contador, tabela.getItems());
        });

        Button btnCriar = StyleUtil.primaryButton("Criar Utilizador", _ -> {
            CustomAlert.Info("Criar utilizador ainda nao implementado.");
        });
        Button btnPass = StyleUtil.primaryButton("Alterar Password", _ -> {
            Participant sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um participante para alterar a password.");
                return;
            }
            //abrirJanelaAlterarPassword(sel);
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

        public void mostrarSessoes() {
        centro.getChildren().clear();

        Label titulo = new Label("Sessoes por Evento");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        TableView<Event> tabelaEventos = new TableView<>();
        TableColumn<Event, String> colNomeEv = new TableColumn<>("Evento");
        colNomeEv.setCellValueFactory(new PropertyValueFactory<>("name"));
        TableColumn<Event, String> colInicioEv = new TableColumn<>("Inicio");
        colInicioEv.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getStartdate() != null ? c.getValue().getStartdate().toString() : ""
        ));
        TableColumn<Event, String> colFimEv = new TableColumn<>("Fim");
        colFimEv.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getFinaldate() != null ? c.getValue().getFinaldate().toString() : ""
        ));
        TableColumn<Event, String> colEstadoEv = new TableColumn<>("Estado");
        colEstadoEv.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getState() != null ? c.getValue().getState().getName() : ""
        ));
        tabelaEventos.getColumns().addAll(colNomeEv, colInicioEv, colFimEv, colEstadoEv);
        tabelaEventos.setItems(EventDB.getAllEvents());
        tabelaEventos.setPrefHeight(200);

        TableView<Session> tabelaSessoes = new TableView<>();
        TableColumn<Session, String> colNomeSes = new TableColumn<>("Sessao");
        colNomeSes.setCellValueFactory(new PropertyValueFactory<>("name"));
        colNomeSes.setPrefWidth(160);
        TableColumn<Session, String> colInicioSes = new TableColumn<>("Inicio");
        colInicioSes.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getStartdate() != null ? c.getValue().getStartdate().toString() : ""
        ));
        TableColumn<Session, String> colFimSes = new TableColumn<>("Fim");
        colFimSes.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getFinaldate() != null ? c.getValue().getFinaldate().toString() : ""
        ));
        TableColumn<Session, String> colLocalSes = new TableColumn<>("Local");
        colLocalSes.setCellValueFactory(new PropertyValueFactory<>("local"));
        TableColumn<Session, String> colEstadoSes = new TableColumn<>("Estado");
        colEstadoSes.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getState() != null ? c.getValue().getState().getName() : ""
        ));
        TableColumn<Session, String> colModeradorSes = new TableColumn<>("Moderador");
        colModeradorSes.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getModerator() != null ? c.getValue().getModerator().getName() : ""
        ));
        TableColumn<Session, String> colRecursosSes = new TableColumn<>("Recursos");
        colRecursosSes.setCellValueFactory(c -> new SimpleStringProperty(
                SessionResourceDB.listBySession(c.getValue().getId()).stream()
                        .map(sr -> sr.getResource().getNameresources() + " x" + sr.getQuantity())
                        .collect(Collectors.joining(", "))
        ));
        tabelaSessoes.getColumns().addAll(colNomeSes, colInicioSes, colFimSes, colLocalSes, colEstadoSes, colModeradorSes, colRecursosSes);
        tabelaSessoes.setPrefHeight(200);

        Button btnVer = StyleUtil.secondaryButton("Ver sessoes", _ -> {
            Event sel = tabelaEventos.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            carregarSessoes(tabelaSessoes, sel);
        });

        Button btnNova = StyleUtil.primaryButton("Nova sessao", _ -> {
            Event sel = tabelaEventos.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            abrirFormSessao(sel, null, tabelaSessoes);
        });

        Button btnEditarSes = StyleUtil.secondaryButton("Editar sessao", _ -> {
            Event evSel = tabelaEventos.getSelectionModel().getSelectedItem();
            Session ses = tabelaSessoes.getSelectionModel().getSelectedItem();
            if (evSel == null || ses == null) {
                CustomAlert.Warning("Selecione o evento e a sessao.");
                return;
            }
            abrirFormSessao(evSel, ses, tabelaSessoes);
        });

        Button btnGerar = StyleUtil.primaryButton("Gerar sessoes (manha/tarde)", _ -> {
            Event sel = tabelaEventos.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            criarSessoesPadrao(sel, tabelaSessoes);
        });

        Button btnRemover = StyleUtil.dangerButton("Remover sessao", _ -> {
            Session ses = tabelaSessoes.getSelectionModel().getSelectedItem();
            if (ses == null) {
                CustomAlert.Warning("Selecione uma sessao.");
                return;
            }
            if (!CustomAlert.Confirm("Confirmar", "Apagar " + ses.getName() + "?")) return;
            try {
                SessionDB.delete(ses.getId());
                Event evSel = tabelaEventos.getSelectionModel().getSelectedItem();
                if (evSel != null) {
                    carregarSessoes(tabelaSessoes, evSel);
                }
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao remover: " + ex.getMessage());
            }
        });

        HBox botoes = new HBox(10, btnVer, btnGerar, btnNova, btnEditarSes, btnRemover);
        botoes.setAlignment(Pos.CENTER_LEFT);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        VBox layout = new VBox(12, titulo, tabelaEventos, tabelaSessoes, botoes);
        

        layout.setAlignment(Pos.TOP_LEFT);
        layout.setPadding(new Insets(20));

        centro.getChildren().add(layout);
    }
    public void mostrarEventos() {
        centro.getChildren().clear();

        Label titulo = new Label("Gestao de Eventos");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        TableView<Event> tabela = new TableView<>();

        TableColumn<Event, String> colNome = new TableColumn<>("Nome");
        colNome.setCellValueFactory(new PropertyValueFactory<>("name"));
        colNome.setPrefWidth(200);

        TableColumn<Event, String> colEstado = new TableColumn<>("Estado");
        colEstado.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getState().getName()));
        colEstado.setPrefWidth(120);

        TableColumn<Event, String> colInicio = new TableColumn<>("Inicio");
        colInicio.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getStartdate() != null ? c.getValue().getStartdate().toString() : ""));
        colInicio.setPrefWidth(150);

        TableColumn<Event, String> colFim = new TableColumn<>("Fim");
        colFim.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getFinaldate() != null ? c.getValue().getFinaldate().toString() : ""));
        colFim.setPrefWidth(150);

        tabela.getColumns().addAll(colNome, colEstado, colInicio, colFim);
        tabela.setItems(EventDB.getAllEvents());

        Button btnCriar = StyleUtil.primaryButton("Criar", _ -> abrirFormEvento(null, tabela));

        Button btnEditar = StyleUtil.secondaryButton("Editar", _ -> {
            Event sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            abrirFormEvento(sel, tabela);
        });

        Button btnRemover = StyleUtil.dangerButton("Remover", _ -> {
            Event sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            if (!CustomAlert.Confirm("Confirmar", "Eliminar " + sel.getName() + "?")) return;
            try {
                EventDB.delete(String.valueOf(sel.getId()));
                tabela.setItems(EventDB.getAllEvents());
                CustomAlert.Success("Evento removido.");
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao remover: " + ex.getMessage());
            }
        });

        Button btnAtualizar = StyleUtil.secondaryButton("Atualizar", _ -> tabela.setItems(EventDB.getAllEvents()));

        HBox botoes = new HBox(10, btnCriar, btnEditar, btnRemover, btnAtualizar);
        botoes.setAlignment(Pos.CENTER_LEFT);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        VBox layout = new VBox(15, titulo, tabela, botoes);
        
        layout.setPadding(new Insets(20));
        layout.setAlignment(Pos.TOP_LEFT);

        centro.getChildren().add(layout);
    }

    private void abrirFormEvento(Event existente, TableView<Event> tabela) {
        Stage stage = new Stage();
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.setTitle(existente == null ? "Criar Evento" : "Editar Evento");

        TextField txtNome = new TextField();
        TextArea txtDesc = new TextArea();
        txtDesc.setPrefRowCount(3);
        TextField txtLocal = new TextField();
        DatePicker dpInicio = new DatePicker();
        DatePicker dpFim = new DatePicker();

        ObservableList<State> estados = StateDB.listAll().filtered(s ->
                s.getName() == null || !s.getName().equalsIgnoreCase("em aprovacao")
        );
        ComboBox<State> cmbEstado = new ComboBox<>(estados);
        cmbEstado.getSelectionModel().selectFirst();

        if (existente != null) {
            txtNome.setText(existente.getName());
            txtDesc.setText(existente.getDescription());
            txtLocal.setText(existente.getLocal());
            if (existente.getStartdate() != null) dpInicio.setValue(existente.getStartdate().toLocalDateTime().toLocalDate());
            if (existente.getFinaldate() != null) dpFim.setValue(existente.getFinaldate().toLocalDateTime().toLocalDate());
            if (existente.getState() != null) {
                cmbEstado.getItems().stream()
                        .filter(s -> s.getId() == existente.getState().getId())
                        .findFirst()
                        .ifPresent(cmbEstado.getSelectionModel()::select);
            }
        }

        Button btnSalvar = StyleUtil.primaryButton("Salvar", _ -> {
            try {
                if (txtNome.getText().isBlank() || txtLocal.getText().isBlank() || dpInicio.getValue() == null || dpFim.getValue() == null) {
                    throw new IllegalArgumentException("Preencha nome, local e datas.");
                }
                if (!dpInicio.getValue().isAfter(LocalDate.now())) {
                    throw new IllegalArgumentException("Data inicio deve ser posterior ao dia de hoje.");
                }
                if (!dpFim.getValue().isAfter(dpInicio.getValue())) {
                    throw new IllegalArgumentException("Data fim tem de ser posterior Çÿ data de inicio.");
                }
                State estadoSel = cmbEstado.getValue();
                int stateId = estadoSel != null ? estadoSel.getId() : 1;

                if (existente == null) {
                    EventDB.register(
                            txtNome.getText(),
                            txtDesc.getText(),
                            txtLocal.getText(),
                            Timestamp.valueOf(dpInicio.getValue().atStartOfDay()),
                            Timestamp.valueOf(dpFim.getValue().atStartOfDay()),
                            null,
                            stateId
                    );
                } else {
                    EventDB.update(
                            String.valueOf(existente.getId()),
                            txtNome.getText(),
                            txtDesc.getText(),
                            txtLocal.getText(),
                            Timestamp.valueOf(dpInicio.getValue().atStartOfDay()),
                            Timestamp.valueOf(dpFim.getValue().atStartOfDay()),
                            null,
                            stateId
                    );
                }

                tabela.setItems(EventDB.getAllEvents());
                CustomAlert.Success("Guardado com sucesso.");
                stage.close();
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao guardar: " + ex.getMessage());
            }
        });

        VBox layout = new VBox(10,
                new Label("Nome:"), txtNome,
                new Label("Descricao:"), txtDesc,
                new Label("Local:"), txtLocal,
                new Label("Inicio:"), dpInicio,
                new Label("Fim:"), dpFim,
                new Label("Estado:"), cmbEstado,
                btnSalvar
        );
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 400, 500));
        stage.showAndWait();
    }

    public void mostrarRecursos() {
        centro.getChildren().clear();

        Label titulo = new Label("Gestao de Recursos");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        TableView<Resources> tabela = new TableView<>();

        TableColumn<Resources, String> colNome = new TableColumn<>("Nome");
        colNome.setCellValueFactory(new PropertyValueFactory<>("nameresources"));
        colNome.setPrefWidth(200);

        TableColumn<Resources, String> colQtd = new TableColumn<>("Quantidade");
        colQtd.setCellValueFactory(c -> new SimpleStringProperty(String.valueOf(c.getValue().getQuantity())));
        colQtd.setPrefWidth(120);

        TableColumn<Resources, String> colCusto = new TableColumn<>("Custo Unitario");
        colCusto.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getUnitarycost()));
        colCusto.setPrefWidth(150);

        TableColumn<Resources, String> colCat = new TableColumn<>("Categoria");
        colCat.setCellValueFactory(c -> new SimpleStringProperty(
                c.getValue().getCategoryid() != null ? c.getValue().getCategoryid().getName() : ""
        ));
        colCat.setPrefWidth(150);
        TableColumn<Resources, String> colDisp = new TableColumn<>("Disponivel");
        colDisp.setCellValueFactory(c -> new SimpleStringProperty(
                String.valueOf(SessionResourceDB.availableQuantity(c.getValue().getId_resources(), null))
        ));
        colDisp.setPrefWidth(120);

        tabela.getColumns().addAll(colNome, colQtd, colCusto, colCat, colDisp);
        tabela.setItems(ResourcesDB.listAll());

        Button btnCriar = StyleUtil.primaryButton("Criar", _ -> abrirFormRecurso(null, tabela));

        Button btnEditar = StyleUtil.secondaryButton("Editar", _ -> {
            Resources sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um recurso.");
                return;
            }
            abrirFormRecurso(sel, tabela);
        });

        Button btnRemover = StyleUtil.dangerButton("Remover", _ -> {
            Resources sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um recurso.");
                return;
            }

            if (!CustomAlert.Confirm("Confirmar", "Apagar " + sel.getNameresources() + "?")) {
                return;
            }

            try {
                ResourcesDB.delete(sel.getId_resources());
                tabela.setItems(ResourcesDB.listAll());
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao remover: " + ex.getMessage());
            }
        });

        Button btnAtualizar = StyleUtil.secondaryButton("Atualizar", _ -> tabela.setItems(ResourcesDB.listAll()));

        HBox botoes = new HBox(10, btnCriar, btnEditar, btnRemover, btnAtualizar);
        botoes.setAlignment(Pos.CENTER_LEFT);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        VBox layout = new VBox(15, titulo, tabela, botoes);
        

        layout.setAlignment(Pos.TOP_CENTER);
        layout.setPadding(new Insets(20));

        centro.getChildren().add(layout);
    }

    private void abrirFormRecurso(Resources existente, TableView<Resources> tabela) {
        Stage stage = new Stage();
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.setTitle(existente == null ? "Criar Recurso" : "Editar Recurso");

        TextField txtNome = new TextField(existente != null ? existente.getNameresources() : "");
        Spinner<Integer> spQuantidade = new Spinner<>(0, 1_000_000, existente != null ? existente.getQuantity() : 0);
        TextField txtCusto = new TextField(existente != null ? existente.getUnitarycost() : "");
        ComboBox<Category> cmbCategoria = new ComboBox<>(CategoryDB.listAll());
        cmbCategoria.setPromptText("Categoria");

        if (existente != null && existente.getCategoryid() != null) {
            cmbCategoria.getItems().stream()
                    .filter(c -> c.getId() == existente.getCategoryid().getId())
                    .findFirst()
                    .ifPresent(cmbCategoria.getSelectionModel()::select);
        }

        Button btnSalvar = StyleUtil.primaryButton("Guardar", _ -> {
            String nome = txtNome.getText().trim();
            String custo = txtCusto.getText().trim();
            Integer quantidade = spQuantidade.getValue();
            Category categoria = cmbCategoria.getSelectionModel().getSelectedItem();

            if (nome.isEmpty()) {
                CustomAlert.Warning("Nome obrigatorio.");
                return;
            }

            try {
                if (existente == null) {
                    ResourcesDB.register(nome, quantidade != null ? quantidade : 0, custo, categoria);
                } else {
                    ResourcesDB.update(existente.getId_resources(), nome, quantidade != null ? quantidade : 0, custo, categoria);
                }
                tabela.setItems(ResourcesDB.listAll());
                CustomAlert.Success("Guardado com sucesso.");
                stage.close();
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao guardar: " + ex.getMessage());
            }
        });

        VBox layout = new VBox(10,
                new Label("Nome:"), txtNome,
                new Label("Quantidade:"), spQuantidade,
                new Label("Custo unitario:"), txtCusto,
                new Label("Categoria:"), cmbCategoria,
                btnSalvar
        );
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 400, 420));
        stage.showAndWait();
    }

    private void abrirFormSessao(Event ev, Session existente, TableView<Session> tabelaSessoes) {
        Stage stage = new Stage();
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.setTitle(existente == null ? "Criar Sessao" : "Editar Sessao");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        TextField txtNome = new TextField(existente != null ? existente.getName() : "");
        TextArea txtDesc = new TextArea(existente != null ? existente.getDescription() : "");
        txtDesc.setPrefRowCount(3);
        TextField txtLocal = new TextField(existente != null ? existente.getLocal() : ev.getLocal());

        LocalDate dataBase = null;
        if (existente != null && existente.getStartdate() != null) {
            dataBase = existente.getStartdate().toLocalDateTime().toLocalDate();
        } else if (ev.getStartdate() != null) {
            dataBase = ev.getStartdate().toLocalDateTime().toLocalDate();
        }
        DatePicker dpDia = new DatePicker(dataBase);

        String horaIni = "09:00";
        String horaFim = "10:30";
        if (existente != null && existente.getStartdate() != null) {
            horaIni = existente.getStartdate().toLocalDateTime().toLocalTime().format(formatter);
        }
        if (existente != null && existente.getFinaldate() != null) {
            horaFim = existente.getFinaldate().toLocalDateTime().toLocalTime().format(formatter);
        }
        TextField txtHoraIni = new TextField(horaIni);
        TextField txtHoraFim = new TextField(horaFim);

        ComboBox<String> cmbEstado = new ComboBox<>();
        cmbEstado.getItems().addAll("Planeado", "Em Progresso", "Concluido", "Cancelado");
        if (existente != null && existente.getState() != null) {
            cmbEstado.getSelectionModel().select(existente.getState().getName());
        } else {
            cmbEstado.getSelectionModel().selectFirst();
        }

        ObservableList<Participant> moderadores = ParticipantDB.listAll().filtered(p ->
                p.getType() != null && p.getType().getName() != null &&
                        p.getType().getName().toLowerCase().contains("moder")
        );
        ComboBox<Participant> cmbModerador = new ComboBox<>(moderadores);
        if (existente != null && existente.getModerator() != null) {
            moderadores.stream()
                    .filter(m -> m.getId().equals(existente.getModerator().getId()))
                    .findFirst()
                    .ifPresent(cmbModerador.getSelectionModel()::select);
        }

        ObservableList<Resources> recursos = ResourcesDB.listAll();
        ComboBox<Resources> cmbRecurso = new ComboBox<>(recursos);
        cmbRecurso.setPromptText("Escolha um recurso");
        Spinner<Integer> spQtd = new Spinner<>(1, 1000, 1);

        Map<Integer, Integer> recursosSelecionados = new HashMap<>();
        if (existente != null) {
            recursosSelecionados.putAll(SessionResourceDB.mapBySession(existente.getId()));
        }

        VBox listaRecursos = new VBox(6);
        Runnable renderRecursos = () -> {
            listaRecursos.getChildren().clear();
            if (recursosSelecionados.isEmpty()) {
                listaRecursos.getChildren().add(new Label("Nenhum recurso associado."));
                return;
            }
            for (Map.Entry<Integer, Integer> entry : recursosSelecionados.entrySet()) {
                Resources res = recursos.stream()
                        .filter(r -> r.getId_resources() == entry.getKey())
                        .findFirst()
                        .orElse(ResourcesDB.getById(entry.getKey()));
                if (res == null) continue;

                Label lbl = new Label(res.getNameresources() + " x" + entry.getValue());
                Button btnRem = StyleUtil.dangerButton("Remover", __ -> {
                    recursosSelecionados.remove(entry.getKey());
                    renderRecursos.run();
                });
                HBox linha = new HBox(8, lbl, btnRem);
                linha.setAlignment(Pos.CENTER_LEFT);
                listaRecursos.getChildren().add(linha);
            }
        };
        renderRecursos.run();

        Button btnAddRecurso = StyleUtil.secondaryButton("Adicionar recurso", __ -> {
            Resources sel = cmbRecurso.getValue();
            if (sel == null) {
                CustomAlert.Warning("Selecione um recurso.");
                return;
            }
            Integer qtd = spQtd.getValue();
            if (qtd == null || qtd <= 0) {
                CustomAlert.Warning("Quantidade invalida.");
                return;
            }
            int atual = recursosSelecionados.getOrDefault(sel.getId_resources(), 0);
            int disponivel = SessionResourceDB.availableQuantity(sel.getId_resources(), existente != null ? existente.getId() : null) + atual;
            if (qtd > disponivel) {
                CustomAlert.Warning("Apenas " + disponivel + " disponivel(s) considerando outras sessoes.");
                return;
            }
            recursosSelecionados.put(sel.getId_resources(), qtd);
            renderRecursos.run();
        });

        Button btnGuardar = StyleUtil.primaryButton("Guardar", _ -> {
            try {
                if (txtNome.getText().isBlank() || dpDia.getValue() == null ||
                        txtHoraIni.getText().isBlank() || txtHoraFim.getText().isBlank()) {
                    throw new IllegalArgumentException("Preencha nome, dia e horas.");
                }
                LocalTime horaInicio = LocalTime.parse(txtHoraIni.getText());
                LocalTime horaFim = LocalTime.parse(txtHoraFim.getText());
                if (!horaFim.isAfter(horaInicio)) {
                    throw new IllegalArgumentException("Hora fim deve ser depois da hora inicio.");
                }
                Timestamp inicio = Timestamp.valueOf(dpDia.getValue().atTime(horaInicio));
                Timestamp fim = Timestamp.valueOf(dpDia.getValue().atTime(horaFim));

                String estado = cmbEstado.getValue() != null ? cmbEstado.getValue() : "Planeado";
                Integer moderadorId = cmbModerador.getValue() != null
                        ? Integer.parseInt(cmbModerador.getValue().getId())
                        : null;

                // Impede que o mesmo moderador tenha sessoes sobrepostas
                if (moderadorId != null) {
                    List<Session> existentes = SessionDB.getSessionsByEvent(ev.getId());
                    for (Session outra : existentes) {
                        if (existente != null && outra.getId() == existente.getId()) continue;
                        if (outra.getModerator() != null && outra.getModerator().getId().equals(String.valueOf(moderadorId))) {
                            Timestamp oIni = outra.getStartdate();
                            Timestamp oFim = outra.getFinaldate();
                            if (oIni != null && oFim != null) {
                                boolean overlap = !(fim.before(oIni) || inicio.after(oFim));
                                if (overlap) {
                                    throw new IllegalArgumentException("Moderador ja associado a outra sessao neste horario.");
                                }
                            }
                        }
                    }
                }

                int sessionId;
                if (existente == null) {
                    Session nova = SessionDB.createForEvent(
                            ev.getId(),
                            txtNome.getText(),
                            txtDesc.getText(),
                            txtLocal.getText(),
                            inicio,
                            fim,
                            estado,
                            null,
                            moderadorId
                    );
                    sessionId = nova.getId();
                } else {
                    SessionDB.update(
                            existente.getId(),
                            txtNome.getText(),
                            txtDesc.getText(),
                            txtLocal.getText(),
                            inicio,
                            fim,
                            estado,
                            null,
                            moderadorId
                    );
                    sessionId = existente.getId();
                }

                SessionResourceDB.replaceAssignments(sessionId, recursosSelecionados);
                carregarSessoes(tabelaSessoes, ev);
                CustomAlert.Success("Sessao guardada.");
                stage.close();

            } catch (Exception ex) {
                CustomAlert.Error("Erro ao guardar: " + ex.getMessage());
            }
        });

        VBox recursosBox = new VBox(6,
                new Label("Recursos para esta sessao:"),
                new HBox(8, cmbRecurso, spQtd, btnAddRecurso),
                listaRecursos
        );

        VBox layout = new VBox(10,
                new Label("Nome:"), txtNome,
                new Label("Descricao:"), txtDesc,
                new Label("Local:"), txtLocal,
                new Label("Dia:"), dpDia,
                new Label("Hora inicio (HH:mm):"), txtHoraIni,
                new Label("Hora fim (HH:mm):"), txtHoraFim,
                new Label("Estado:"), cmbEstado,
                new Label("Moderador:"), cmbModerador,
                recursosBox,
                btnGuardar
        );
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 420, 650));
        stage.showAndWait();
    }

    private void carregarSessoes(TableView<Session> tabela, Event ev) {
        tabela.setItems(FXCollections.observableArrayList(SessionDB.getSessionsByEvent(ev.getId())));
    }

    private void criarSessoesPadrao(Event ev, TableView<Session> tabela) {
        if (ev.getStartdate() == null) {
            CustomAlert.Warning("O evento nao tem data de inicio definida.");
            return;
        }

        LocalDate dia = ev.getStartdate().toLocalDateTime().toLocalDate();
        LocalDateTime manha = dia.atTime(9, 0);
        LocalDateTime tarde = dia.atTime(14, 0);

        var existentes = SessionDB.getSessionsByEvent(ev.getId());
        boolean temManha = existentes.stream().anyMatch(s -> s.getName().equalsIgnoreCase("Sessao Manha"));
        boolean temTarde = existentes.stream().anyMatch(s -> s.getName().equalsIgnoreCase("Sessao Tarde"));

        try {
            if (!temManha) {
                SessionDB.createForEvent(
                        ev.getId(),
                        "Sessao Manha",
                        "Bloco da manha (1h30)",
                        ev.getLocal(),
                        Timestamp.valueOf(manha),
                        Timestamp.valueOf(manha.plusMinutes(90)),
                        "Planeado",
                        null,
                        null
                );
            }

            if (!temTarde) {
                SessionDB.createForEvent(
                        ev.getId(),
                        "Sessao Tarde",
                        "Bloco da tarde (1h30)",
                        ev.getLocal(),
                        Timestamp.valueOf(tarde),
                        Timestamp.valueOf(tarde.plusMinutes(90)),
                        "Planeado",
                        null,
                        null
                );
            }

            carregarSessoes(tabela, ev);
            CustomAlert.Success("Sessoes geradas.");

        } catch (Exception ex) {
            CustomAlert.Error("Erro ao criar sessoes: " + ex.getMessage());
        }
    }

    private void atualizarContador(Label label, ObservableList<Participant> lista) {
        long total = lista.size();
        long admins = lista.stream().filter(p ->
                p.getType().getName().equalsIgnoreCase("Admin")
        ).count();

        long moderadores = lista.stream().filter(p ->
                p.getType().getName().equalsIgnoreCase("Moderador")
        ).count();

        long participantes = lista.stream().filter(p ->
                p.getType().getName().equalsIgnoreCase("Participante")
        ).count();

        label.setText(
                "Total: " + total +
                        " | Admins: " + admins +
                        " | Moderadores: " + moderadores +
                        " | Participantes: " + participantes
        );
    }

    private void aplicarFiltro(TableView<Participant> tabela, String filtro) {
        ObservableList<Participant> todos = ParticipantDB.listAll(); // jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ tens isto
        switch (filtro) {
            case "Admins" ->
                    tabela.setItems(
                            todos.filtered(p -> p.getType().getName().equalsIgnoreCase("Admin"))
                    );
            case "Moderadores" ->
                    tabela.setItems(
                            todos.filtered(p -> p.getType().getName().equalsIgnoreCase("Moderadores"))
                    );
            case "Participantes" ->
                    tabela.setItems(
                            todos.filtered(p -> p.getType().getName().equalsIgnoreCase("Participante"))
                    );
            default ->
                    tabela.setItems(todos);
        }
    }


    private void eliminarParticipante(Participant p) {
        if (p == null) {
            CustomAlert.Warning("Selecione um participante.");
            return;
        }

        if (!CustomAlert.Confirm("Confirmar", "Deseja mesmo apagar " + p.getName() + "?")) {
            return;
        }

        try {
            ParticipantDB.delete(p.getId());
            //admin.mostrarParticipantesAdmin(); // refresh
        } catch (Exception ex) {
            CustomAlert.Error("Erro ao apagar: " + ex.getMessage());
        }
    }

    private void editarParticipante(Participant p) {
        if (p == null) {
            CustomAlert.Warning("Selecione um participante.");
            return;
        }

        Stage popup = new Stage();
        popup.initModality(Modality.APPLICATION_MODAL);
        popup.setTitle("Editar Participante");

        TextField txtNome = new TextField(p.getName());
        TextField txtEmail = new TextField(p.getEmail());
        TextField txtPhone = new TextField(p.getPhone());

        ComboBox<Types> comboTipo = new ComboBox<>();
        comboTipo.getItems().addAll(TypesDB.listAll()); // Criamos jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ a seguir
        comboTipo.getSelectionModel().select(p.getType());

        Button btnSalvar = StyleUtil.primaryButton("Salvar", _ -> {
            try {
                ParticipantDB.update(p.getId(), txtNome.getText(), txtEmail.getText(),
                        txtPhone.getText(), comboTipo.getValue());

                popup.close();
                //mostrarParticipantesAdmin(); // refresh

            } catch (Exception ex) {
                CustomAlert.Error("Erro ao atualizar: " + ex.getMessage());
            }
        });

        VBox box = new VBox(10, txtNome, txtEmail, txtPhone, comboTipo, btnSalvar);
        box.setPadding(new Insets(20));

        popup.setScene(new Scene(box, 300, 300));
        popup.showAndWait();
    }
}






