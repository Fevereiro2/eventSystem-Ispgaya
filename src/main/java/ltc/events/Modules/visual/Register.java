package ltc.events.Modules.visual; // Declara que a classe Register pertence a este pacote.

// Importações JavaFX 'standard' para UI
import javafx.geometry.Insets;      // Para definir espaçamentos internos (padding).
import javafx.geometry.Pos;         // Para definir o alinhamento de componentes.
import javafx.scene.Scene;          // O contentor do conteúdo gráfico.
import javafx.scene.control.*;      // Componentes de controlo (Label, TextField, Button, etc.).
import javafx.scene.layout.BorderPane; // Layout raiz.
import javafx.scene.layout.HBox;    // Layout horizontal.
import javafx.scene.layout.VBox;    // Layout vertical.
import javafx.stage.Modality;       // Para definir o comportamento modal.
import javafx.stage.Stage;          // A janela.
import javafx.stage.StageStyle;     // O estilo da janela (sem decoração).
// Importações de utilitários e classes de dados
import ltc.events.Modules.connection.ParticipantDB; // Serviço de base de dados para registo de participantes.
import ltc.events.classes.Participant; // Classe de modelo do Participante.
import ltc.events.classes.Types; // Classe de modelo para tipos de utilizador.
import ltc.events.classes.hashs.PasswordUtil; // Utilitário para hashing de passwords.

import java.time.LocalDate;
// Importação implícita do StyleUtil (se estiver no mesmo pacote, senão deve ser explícita).

public class Register { // Início da classe Register.

    public void mostrarRegister() { // Método principal para exibir a janela de registo.

        // 🔸 1. Configuração do Stage
        Stage stage = new Stage(); // Cria uma janela.
        stage.initStyle(StageStyle.UNDECORATED); // Remove a decoração padrão (barra de título do sistema).
        stage.initModality(Modality.APPLICATION_MODAL); // Bloqueia a interação com outras janelas da aplicação.

        /*
           🚨 LINHAS REMOVIDAS (Criação da NavbarUtil e da barra)
           Esta lógica foi transferida para StyleUtil.createRootLayout.
        NavbarUtil navbar  = new NavbarUtil();
        BorderPane barra = navbar.createNavbar(stage);
        */

        // 🔹 2. Componentes do Formulário
        Label titulo = new Label("📝 Criar Conta"); // Título do formulário.
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #333;"); // Estilização do título.

        Label lblNome = new Label("Nome:"); // Label Nome.
        TextField txtNome = new TextField(); // Campo de texto Nome.
        txtNome.setPromptText("ex: Pedro Fevereiro"); // Placeholder.

        Label lblPhone = new Label("Telefone:"); // Label Telefone.
        TextField txtPhone = new TextField(); // Campo de texto Telefone.
        txtPhone.setPromptText("ex: 912 345 678"); // Placeholder.

        Label lblEmail = new Label("Email:"); // Label Email.
        TextField txtEmail = new TextField(); // Campo de texto Endereço eletrónico.
        txtEmail.setPromptText("ex: pedro@email.com"); // Placeholder.

        Label lblPass = new Label("Password:"); // Label Password.
        PasswordField txtPass = new PasswordField(); // Campo de password.
        txtPass.setPromptText("••••••••"); // Placeholder.

        Label lblGenero = new Label("Género:");
        ComboBox<String> cmbGenero = new ComboBox<>();
        cmbGenero.getItems().addAll("Masculino", "Feminino");
        cmbGenero.setPromptText("Selecionar género");

        Label lblNif = new Label("NIF:");
        TextField txtNif = new TextField();
        txtNif.setPromptText("ex: 123456789");

        Label lblBirth = new Label("Data de Nascimento:");
        DatePicker dpBirth = new DatePicker();
        dpBirth.setPromptText("Selecionar data");

        // 🟢 Botão Registar (Azul) - Usando StyleUtil
        Button btnRegistar = StyleUtil.createStyledButton(
                "Criar Conta",
                "#007aff", // Cor inicial do gradiente (Azul primário)
                "#0051a8", // Cor final do gradiente (Azul-escuro)
                _ -> { // Início da lógica de clique

                    String nome = txtNome.getText();
                    String phone = txtPhone.getText();
                    String email = txtEmail.getText();
                    String pass = txtPass.getText();
                    String genero = cmbGenero.getValue();
                    String nif = txtNif.getText();
                    LocalDate birthdate = dpBirth.getValue();


                    // ---------- VALIDAÇÕES (Guard Clauses) ----------
                    if (nome.isEmpty() || phone.isEmpty() || email.isEmpty() || pass.isEmpty()) {
                        CustomAlert.Warning( "Por favor preencha todos os campos!"); // Alerta de campos vazios.
                        return; // Sai se falhar.
                    }

                    if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) { // Validação do formato do endereço eletrónico (REGEX fraca).
                        CustomAlert.Error("Email inválido!"); // Alerta d'Erro.
                        return; // Sai se falhar.
                    }

                    if (!phone.matches("\\d{9}")) { // Validação do formato do telefone (9 dígitos).
                        CustomAlert.Warning("O telefone deve ter 9 dígitos!"); // Alerta.
                        return; // Sai se falhar.
                    }
                    if (genero == null) {
                        CustomAlert.Warning("Selecione um género.");
                        return;
                    }
                    if (!nif.matches("\\d{9}")) {
                        CustomAlert.Warning("O NIF deve ter 9 dígitos!");
                        return;
                    }

                    if (birthdate == null) {
                        CustomAlert.Warning("Selecione uma data de nascimento.");
                        return;
                    }

                    // ---------- Processamento ----------
                    String hashed = PasswordUtil.hashPassword(pass); // Encripta a senha.

                    // Tipo de utilizador padrão: PARTICIPANTE (‘ID’=2)
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
                        // Falha no registo (ex: endereço eletrónico já existe)
                        CustomAlert.Error("Erro ao criar conta: "+ex.getMessage()); // Alerta mensagem.
                    }
                } // Fim da lógica de clique.
        );

        // 🔴 Botão Cancelar (Vermelho/Cinza) - Usando StyleUtil
        Button btnCancelar = StyleUtil.createStyledButton(
                "Cancelar",
                "#ff5f57", // Cor inicial do gradiente (Vermelho para ação de paragem)
                "#c62828", // Cor final do gradiente (Vermelho-escuro)
                _ -> stage.close() // Define a ação para fechar a janela.
        );

        // 🔹 3. Organização do Layout
        HBox botoes = new HBox(10, btnCancelar, btnRegistar); // Container horizontal para botões com 10px de espaçamento.
        botoes.setAlignment(Pos.CENTER); // Centraliza os botões.

        VBox formmostrarregisto = new VBox(12,
                titulo,
                lblNome, txtNome,
                lblPhone, txtPhone,
                lblEmail, txtEmail,
                lblPass, txtPass,
                lblGenero, cmbGenero,   // ← ADICIONADO
                lblNif, txtNif,         // ← ADICIONADO
                lblBirth, dpBirth,      // ← ADICIONADO
                botoes
        );


        formmostrarregisto.setAlignment(Pos.CENTER); // Centraliza o formulário verticalmente.
        formmostrarregisto.setPadding(new Insets(20)); // Adiciona 20px de espaçamento interno.

        // ✅ Utiliza o novo método estático para criar, estilizar e colocar a barra de título
        BorderPane raiz = StyleUtil.createRootLayout(stage, formmostrarregisto);

        // 🔹 4. Exibição
        Scene scene = new Scene(raiz, 400, 480); // Cria a Scene com o tamanho.
        stage.setScene(scene); // Define a Scene no Stage.
        stage.centerOnScreen(); // Centraliza a janela no ecrã.
        stage.show(); // Exibe a janela.
    }
}