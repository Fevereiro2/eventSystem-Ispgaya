package ltc.events.Modules.visual; // Declara que a classe Register pertence a este pacote.

// ImportaÃ§Ãµes JavaFX 'standard' para UI
import javafx.geometry.Insets;      // Para definir espaÃ§amentos internos (padding).
import javafx.geometry.Pos;         // Para definir o alinhamento de componentes.
import javafx.scene.Scene;          // O contentor do conteÃºdo grÃ¡fico.
import javafx.scene.control.*;      // Componentes de controlo (Label, TextField, Button, etc.).
import javafx.scene.layout.BorderPane; // Layout raiz.
import javafx.scene.layout.HBox;    // Layout horizontal.
import javafx.scene.layout.VBox;    // Layout vertical.
import javafx.stage.Modality;       // Para definir o comportamento modal.
import javafx.stage.Stage;          // A janela.
import javafx.stage.StageStyle;     // O estilo da janela (sem decoraÃ§Ã£o).
// ImportaÃ§Ãµes de utilitÃ¡rios e classes de dados
import ltc.events.Modules.connection.ParticipantDB; // ServiÃ§o de base de dados para registo de participantes.
import ltc.events.classes.Participant; // Classe de modelo do Participante.
import ltc.events.classes.Types; // Classe de modelo para tipos de utilizador.
import ltc.events.classes.hashs.PasswordUtil; // UtilitÃ¡rio para hashing de passwords.

import java.time.LocalDate;
// ImportaÃ§Ã£o implÃ­cita do StyleUtil (se estiver no mesmo pacote, senÃ£o deve ser explÃ­cita).

public class Register { // InÃ­cio da classe Register.

    public void mostrarRegister() { // MÃ©todo principal para exibir a janela de registo.

        // ðŸ”¸ 1. ConfiguraÃ§Ã£o do Stage
        Stage stage = new Stage(); // Cria uma janela.
        stage.initStyle(StageStyle.UNDECORATED); // Remove a decoraÃ§Ã£o padrÃ£o (barra de tÃ­tulo do sistema).
        stage.initModality(Modality.APPLICATION_MODAL); // Bloqueia a interaÃ§Ã£o com outras janelas da aplicaÃ§Ã£o.

        /*
           ðŸš¨ LINHAS REMOVIDAS (CriaÃ§Ã£o da NavbarUtil e da barra)
           Esta lÃ³gica foi transferida para StyleUtil.createRootLayout.
        NavbarUtil navbar  = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);
        */

        // ðŸ”¹ 2. Componentes do FormulÃ¡rio
        Label titulo = new Label("ðŸ“ Criar Conta"); // TÃ­tulo do formulÃ¡rio.
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #333;"); // EstilizaÃ§Ã£o do tÃ­tulo.

        Label lblNome = new Label("Nome:"); // Label Nome.
        TextField txtNome = new TextField(); // Campo de texto Nome.
        txtNome.setPromptText("ex: Pedro Fevereiro"); // Placeholder.

        Label lblPhone = new Label("Telefone:"); // Label Telefone.
        TextField txtPhone = new TextField(); // Campo de texto Telefone.
        txtPhone.setPromptText("ex: 912 345 678"); // Placeholder.

        Label lblEmail = new Label("Email:"); // Label Email.
        TextField txtEmail = new TextField(); // Campo de texto EndereÃ§o eletrÃ³nico.
        txtEmail.setPromptText("ex: pedro@email.com"); // Placeholder.

        Label lblPass = new Label("Password:"); // Label Password.
        PasswordField txtPass = new PasswordField(); // Campo de password.
        txtPass.setPromptText("â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"); // Placeholder.

        Label lblGenero = new Label("GÃ©nero:");
        ComboBox<String> cmbGenero = new ComboBox<>();
        cmbGenero.getItems().addAll("Masculino", "Feminino");
        cmbGenero.setPromptText("Selecionar gÃ©nero");

        Label lblNif = new Label("NIF:");
        TextField txtNif = new TextField();
        txtNif.setPromptText("ex: 123456789");

        Label lblBirth = new Label("Data de Nascimento:");
        DatePicker dpBirth = new DatePicker();
        dpBirth.setPromptText("Selecionar data");

        // ðŸŸ¢ BotÃ£o Registar (Azul) - Usando StyleUtil
        Button btnRegistar = StyleUtil.gradientButton(
                "Criar Conta",
                "#007aff", // Cor inicial do gradiente (Azul primÃ¡rio)
                "#0051a8", // Cor final do gradiente (Azul-escuro)
                _ -> { // InÃ­cio da lÃ³gica de clique

                    String nome = txtNome.getText();
                    String phone = txtPhone.getText();
                    String email = txtEmail.getText();
                    String pass = txtPass.getText();
                    String genero = cmbGenero.getValue();
                    String nif = txtNif.getText();
                    LocalDate birthdate = dpBirth.getValue();


                    // ---------- VALIDAÃ‡Ã•ES (Guard Clauses) ----------
                    if (nome.isEmpty() || phone.isEmpty() || email.isEmpty() || pass.isEmpty()) {
                        CustomAlert.Warning( "Por favor preencha todos os campos!"); // Alerta de campos vazios.
                        return; // Sai se falhar.
                    }

                    if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) { // ValidaÃ§Ã£o do formato do endereÃ§o eletrÃ³nico (REGEX fraca).
                        CustomAlert.Error("Email invÃ¡lido!"); // Alerta d'Erro.
                        return; // Sai se falhar.
                    }

                    if (!phone.matches("\\d{9}")) { // ValidaÃ§Ã£o do formato do telefone (9 dÃ­gitos).
                        CustomAlert.Warning("O telefone deve ter 9 dÃ­gitos!"); // Alerta.
                        return; // Sai se falhar.
                    }
                    if (genero == null) {
                        CustomAlert.Warning("Selecione um gÃ©nero.");
                        return;
                    }
                    if (!nif.matches("\\d{9}")) {
                        CustomAlert.Warning("O NIF deve ter 9 dÃ­gitos!");
                        return;
                    }

                    if (birthdate == null) {
                        CustomAlert.Warning("Selecione uma data de nascimento.");
                        return;
                    }

                    // ---------- Processamento ----------
                    String hashed = PasswordUtil.hashPassword(pass); // Encripta a senha.

                    // Tipo de utilizador padrÃ£o: PARTICIPANTE (â€˜IDâ€™=2)
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
                        // Falha no registo (ex: endereÃ§o eletrÃ³nico jÃ¡ existe)
                        CustomAlert.Error("Erro ao criar conta: "+ex.getMessage()); // Alerta mensagem.
                    }
                } // Fim da lÃ³gica de clique.
        );

        // ðŸ”´ BotÃ£o Cancelar (Vermelho/Cinza) - Usando StyleUtil
        Button btnCancelar = StyleUtil.gradientButton(
                "Cancelar",
                "#ff5f57", // Cor inicial do gradiente (Vermelho para aÃ§Ã£o de paragem)
                "#c62828", // Cor final do gradiente (Vermelho-escuro)
                _ -> stage.close() // Define a aÃ§Ã£o para fechar a janela.
        );

        // ðŸ”¹ 3. OrganizaÃ§Ã£o do Layout
                HBox botoes = new HBox(10, btnCancelar, btnRegistar); // Container horizontal para botões com 10px de espaçamento.
        botoes.setAlignment(Pos.CENTER); // Centraliza os botões.

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


        formmostrarregisto.setAlignment(Pos.TOP_CENTER); // Centraliza o formulário verticalmente.
        formmostrarregisto.setPadding(new Insets(24)); // Adiciona 20px de espaçamento interno.
        formmostrarregisto.setPrefWidth(480);

        // Utiliza o novo método estático para criar, estilizar e colocar a barra de título
        ScrollPane scroll = new ScrollPane(formmostrarregisto);
        scroll.setFitToWidth(true);
        scroll.setPadding(new Insets(10));
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        BorderPane raiz = StyleUtil.createRootLayout(stage, scroll);

        // Exibição
        Scene scene = new Scene(raiz, 520, 720); // Cria a Scene com o tamanho.
        stage.setScene(scene); // Define a Scene no Stage.
        stage.centerOnScreen(); // Centraliza a janela no ecrÃ£.
        stage.show(); // Exibe a janela.
    }
}

