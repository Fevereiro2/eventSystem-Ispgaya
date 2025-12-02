package ltc.events.Modules.admin;

import javafx.beans.property.SimpleStringProperty;
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
import java.sql.Timestamp;
import ltc.events.Modules.connection.EventDB;
import ltc.events.Modules.connection.ParticipantDB;
import ltc.events.Modules.connection.TypesDB;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.connection.StateDB;
import ltc.events.classes.Participant;
import ltc.events.classes.Event;
import ltc.events.classes.Types;
import ltc.events.classes.State;

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
        // TÍTULO + FILTRO
        // -------------------------------
        javafx.scene.control.Label titulo = new javafx.scene.control.Label("👤 Gestão de Participantes");
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
        // BOTÕES
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
        // ... código da interface de sessões
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

        Button btnAprovar = StyleUtil.primaryButton("Aprovar", _ -> {
            Event sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            if (sel.getState() != null && !"em aprovacao".equalsIgnoreCase(sel.getState().getName())) {
                CustomAlert.Warning("Apenas eventos em aprovacao podem ser aprovados.");
                return;
            }
            try {
                EventDB.updateState(String.valueOf(sel.getId()), 2);
                tabela.setItems(EventDB.getAllEvents());
                CustomAlert.Success("Evento aprovado.");
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao aprovar: " + ex.getMessage());
            }
        });

        Button btnRecusar = StyleUtil.dangerButton("Recusar", _ -> {
            Event sel = tabela.getSelectionModel().getSelectedItem();
            if (sel == null) {
                CustomAlert.Warning("Selecione um evento.");
                return;
            }
            if (sel.getState() != null && !"em aprovacao".equalsIgnoreCase(sel.getState().getName())) {
                CustomAlert.Warning("Apenas eventos em aprovacao podem ser recusados.");
                return;
            }
            try {
                EventDB.delete(String.valueOf(sel.getId()));
                tabela.setItems(EventDB.getAllEvents());
                CustomAlert.Success("Evento removido.");
            } catch (Exception ex) {
                CustomAlert.Error("Erro ao remover: " + ex.getMessage());
            }
        });

        Button btnAtualizar = StyleUtil.secondaryButton("Atualizar", _ -> tabela.setItems(EventDB.getAllEvents()));

        HBox botoes = new HBox(10, btnCriar, btnEditar, btnAprovar, btnRecusar, btnAtualizar);
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
        TextField txtImagem = new TextField();

        ComboBox<State> cmbEstado = new ComboBox<>(StateDB.listAll());
        cmbEstado.getSelectionModel().selectFirst();

        if (existente != null) {
            txtNome.setText(existente.getName());
            txtDesc.setText(existente.getDescription());
            txtLocal.setText(existente.getLocal());
            if (existente.getStartdate() != null) dpInicio.setValue(existente.getStartdate().toLocalDateTime().toLocalDate());
            if (existente.getFinaldate() != null) dpFim.setValue(existente.getFinaldate().toLocalDateTime().toLocalDate());
            txtImagem.setText(existente.getImage());
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
                if (dpFim.getValue().isBefore(dpInicio.getValue())) {
                    throw new IllegalArgumentException("Data fim antes da data inicio.");
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
                            txtImagem.getText(),
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
                            txtImagem.getText(),
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
                new Label("Imagem:"), txtImagem,
                new Label("Estado:"), cmbEstado,
                btnSalvar
        );
        layout.setPadding(new Insets(20));

        stage.setScene(new Scene(layout, 400, 500));
        stage.showAndWait();
    }
    public void mostrarRecursos() {
        centro.getChildren().clear();
        // ... código da interface de recursos
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
        ObservableList<Participant> todos = ParticipantDB.listAll(); // já tens isto
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
        comboTipo.getItems().addAll(TypesDB.listAll()); // Criamos já a seguir
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

