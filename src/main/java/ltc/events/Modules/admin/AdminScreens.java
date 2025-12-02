package ltc.events.Modules.admin;

import javafx.beans.property.SimpleStringProperty;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import ltc.events.Modules.connection.ParticipantDB;
import ltc.events.classes.Participant;

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

    public void mostrarSessoes() {
        centro.getChildren().clear();
        // ... código da interface de sessões
    }

    public void mostrarEventos() {
        centro.getChildren().clear();
        // ... código da interface de eventos
    }

    public void mostrarRecursos() {
        centro.getChildren().clear();
        // ... código da interface de recursos
    }
}
