package ltc.events.Modules.visual; // Declara que a classe Register pertence a este pacote.

// ImportaÃƒÂ§ÃƒÂµes JavaFX 'standard' para UI
import javafx.geometry.Insets;      // Para definir espaÃƒÂ§amentos internos (padding).
import javafx.geometry.Pos;         // Para definir o alinhamento de componentes.
import javafx.scene.Scene;          // O contentor do conteÃƒÂºdo grÃƒÂ¡fico.
import javafx.scene.control.*;      // Componentes de controlo (Label, TextField, Button, etc.).
import javafx.scene.layout.BorderPane; // Layout raiz.
import javafx.scene.layout.HBox;    // Layout horizontal.
import javafx.scene.layout.VBox;    // Layout vertical.
import javafx.stage.Modality;       // Para definir o comportamento modal.
import javafx.stage.Stage;          // A janela.
import javafx.stage.StageStyle;     // O estilo da janela (sem decoraÃƒÂ§ÃƒÂ£o).
// ImportaÃƒÂ§ÃƒÂµes de utilitÃƒÂ¡rios e classes de dados
import ltc.events.Modules.connection.ParticipantDB; // ServiÃƒÂ§o de base de dados para registo de participantes.
import ltc.events.classes.Participant; // Classe de modelo do Participante.
import ltc.events.classes.Types; // Classe de modelo para tipos de utilizador.
import ltc.events.classes.hashs.PasswordUtil; // UtilitÃƒÂ¡rio para hashing de passwords.

import java.time.LocalDate;
import java.time.Period;
import ltc.events.Modules.util.NifUtil;
// ImportaÃƒÂ§ÃƒÂ£o implÃƒÂ­cita do StyleUtil (se estiver no mesmo pacote, senÃƒÂ£o deve ser explÃƒÂ­cita).

public class Register { // InÃƒÂ­cio da classe Register.

    public void mostrarRegister() { // MÃƒÂ©todo principal para exibir a janela de registo.

        // Ã°Å¸â€Â¸ 1. ConfiguraÃƒÂ§ÃƒÂ£o do Stage
        Stage stage = new Stage(); // Cria uma janela.
        stage.initStyle(StageStyle.UNDECORATED); // Remove a decoraÃƒÂ§ÃƒÂ£o padrÃƒÂ£o (barra de tÃƒÂ­tulo do sistema).
        stage.initModality(Modality.APPLICATION_MODAL); // Bloqueia a interaÃƒÂ§ÃƒÂ£o com outras janelas da aplicaÃƒÂ§ÃƒÂ£o.

        /*
           Ã°Å¸Å¡Â¨ LINHAS REMOVIDAS (CriaÃƒÂ§ÃƒÂ£o da NavbarUtil e da barra)
           Esta lÃƒÂ³gica foi transferida para StyleUtil.createRootLayout.
        NavbarUtil navbar  = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);
        */

        // Ã°Å¸â€Â¹ 2. Componentes do FormulÃƒÂ¡rio
        Label titulo = new Label("Ã°Å¸â€œÂ Criar Conta"); // TÃƒÂ­tulo do formulÃƒÂ¡rio.
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #333;"); // EstilizaÃƒÂ§ÃƒÂ£o do tÃƒÂ­tulo.

        Label lblNome = new Label("Nome:"); // Label Nome.
        TextField txtNome = new TextField(); // Campo de texto Nome.
        txtNome.setPromptText("ex: Pedro Fevereiro"); // Placeholder.

        Label lblPhone = new Label("Telefone:"); // Label Telefone.
        TextField txtPhone = new TextField(); // Campo de texto Telefone.
        txtPhone.setPromptText("ex: 912 345 678"); // Placeholder.

        Label lblEmail = new Label("Email:"); // Label Email.
        TextField txtEmail = new TextField(); // Campo de texto EndereÃƒÂ§o eletrÃƒÂ³nico.
        txtEmail.setPromptText("ex: pedro@email.com"); // Placeholder.

        Label lblPass = new Label("Password:"); // Label Password.
        PasswordField txtPass = new PasswordField(); // Campo de password.
        txtPass.setPromptText("Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"); // Placeholder.

        Label lblGenero = new Label("GÃƒÂ©nero:");
        ComboBox<String> cmbGenero = new ComboBox<>();
        cmbGenero.getItems().addAll("Masculino", "Feminino");
        cmbGenero.setPromptText("Selecionar gÃƒÂ©nero");

        Label lblNif = new Label("NIF:");
        TextField txtNif = new TextField();
        txtNif.setPromptText("ex: 123456789");

        Label lblBirth = new Label("Data de Nascimento:");
        DatePicker dpBirth = new DatePicker();
        dpBirth.setPromptText("Selecionar data");

        // Ã°Å¸Å¸Â¢ BotÃƒÂ£o Registar (Azul) - Usando StyleUtil
        Button btnRegistar = StyleUtil.gradientButton(
                "Criar Conta",
                "#007aff", // Cor inicial do gradiente (Azul primÃƒÂ¡rio)
                "#0051a8", // Cor final do gradiente (Azul-escuro)
                _ -> { // InÃƒÂ­cio da lÃƒÂ³gica de clique

                    String nome = txtNome.getText();
                    String phone = txtPhone.getText();
                    String email = txtEmail.getText();
                    String pass = txtPass.getText();
                    String genero = cmbGenero.getValue();
                    String nif = txtNif.getText();
                    LocalDate birthdate = dpBirth.getValue();


                    // ---------- VALIDAÃƒâ€¡Ãƒâ€¢ES (Guard Clauses) ----------
                    if (nome.isEmpty() || phone.isEmpty() || email.isEmpty() || pass.isEmpty()) {
                        CustomAlert.Warning( "Por favor preencha todos os campos!"); // Alerta de campos vazios.
                        return; // Sai se falhar.
                    }

                    if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) { // ValidaÃƒÂ§ÃƒÂ£o do formato do endereÃƒÂ§o eletrÃƒÂ³nico (REGEX fraca).
                        CustomAlert.Error("Email invÃƒÂ¡lido!"); // Alerta d'Erro.
                        return; // Sai se falhar.
                    }

                    if (!phone.matches("\\d{9}")) { // ValidaÃƒÂ§ÃƒÂ£o do formato do telefone (9 dÃƒÂ­gitos).
                        CustomAlert.Warning("O telefone deve ter 9 dÃƒÂ­gitos!"); // Alerta.
                        return; // Sai se falhar.
                    }
                    if (genero == null) {
                        CustomAlert.Warning("Selecione um gÃƒÂ©nero.");
                        return;
                    }
                    if (!nif.matches("\\d{9}")) {
                        CustomAlert.Warning("O NIF deve ter 9 dÃƒÂ­gitos!");
                        return;
                    }

                                        if (birthdate == null) {
                        CustomAlert.Warning("Selecione uma data de nascimento.");
                        return;
                    }
                    if (Period.between(birthdate, LocalDate.now()).getYears() < 16) {
                        CustomAlert.Warning("Apenas maiores de 16 anos.");
                        return;
                    }

                    // ---------- Processamento ----------
                    String hashed = PasswordUtil.hashPassword(pass); // Encripta a senha.

                    // Tipo de utilizador padrÃƒÂ£o: PARTICIPANTE (Ã¢â‚¬ËœIDÃ¢â‚¬â„¢=2)
                    Types type = new Types(2, "Participant");

                    try {
                        // Tenta registar o participante na base de dados
                        Participant p = ParticipantDB.register(
                                nome,
                                email,
                                phone,
                                hashed,
                                genero,
                                nif,
                                birthdate,
                                type
                        );

                        // Sucesso
                        CustomAlert.Success("Conta criada com sucesso para: " + p.getName()); // Alerta de Sucesso.
                        stage.close(); // Fecha a janela de registo.

                    } catch (Exception ex) {
                        // Falha no registo (ex: endereÃƒÂ§o eletrÃƒÂ³nico jÃƒÂ¡ existe)
                        CustomAlert.Error("Erro ao criar conta: "+ex.getMessage()); // Alerta mensagem.
                    }
                } // Fim da lÃƒÂ³gica de clique.
        );

        // Ã°Å¸â€Â´ BotÃƒÂ£o Cancelar (Vermelho/Cinza) - Usando StyleUtil
        Button btnCancelar = StyleUtil.gradientButton(
                "Cancelar",
                "#ff5f57", // Cor inicial do gradiente (Vermelho para aÃƒÂ§ÃƒÂ£o de paragem)
                "#c62828", // Cor final do gradiente (Vermelho-escuro)
                _ -> stage.close() // Define a aÃƒÂ§ÃƒÂ£o para fechar a janela.
        );

        // Ã°Å¸â€Â¹ 3. OrganizaÃƒÂ§ÃƒÂ£o do Layout
                HBox botoes = new HBox(10, btnCancelar, btnRegistar); // Container horizontal para botÃµes com 10px de espaÃ§amento.
        botoes.setAlignment(Pos.CENTER); // Centraliza os botÃµes.

        VBox formmostrarregisto = new VBox(14,
                titulo,
                lblNome, txtNome,
                lblPhone, txtPhone,
                lblEmail, txtEmail,
                lblPass, txtPass,
                lblGenero, cmbGenero,   // ADICIONADO
                lblNif, txtNif,         // ADICIONADO
                lblBirth, dpBirth,      // ADICIONADO
                botoes
        );


        formmostrarregisto.setAlignment(Pos.TOP_CENTER); // Centraliza o formulÃ¡rio verticalmente.
        formmostrarregisto.setPadding(new Insets(24)); // Adiciona 20px de espaÃ§amento interno.
        formmostrarregisto.setPrefWidth(480);

        // Utiliza o novo mÃ©todo estÃ¡tico para criar, estilizar e colocar a barra de tÃ­tulo
        ScrollPane scroll = new ScrollPane(formmostrarregisto);
        scroll.setFitToWidth(true);
        scroll.setPadding(new Insets(10));
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        BorderPane raiz = StyleUtil.createRootLayout(stage, scroll);

        // ExibiÃ§Ã£o
        Scene scene = new Scene(raiz, 520, 720); // Cria a Scene com o tamanho.
        stage.setScene(scene); // Define a Scene no Stage.
        stage.centerOnScreen(); // Centraliza a janela no ecrÃƒÂ£.
        stage.show(); // Exibe a janela.
    }
}



