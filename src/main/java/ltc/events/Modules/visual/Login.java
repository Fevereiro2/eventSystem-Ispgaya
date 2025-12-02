package ltc.events.Modules.visual; // Declara o pacote onde esta classe reside.

// Importações JavaFX para UI e Eventos
import javafx.geometry.Insets;      // Para definir margens e espaçamentos internos (padding).
import javafx.geometry.Pos;         // Para definir o alinhamento de componentes.
import javafx.scene.Scene;          // O contentor do conteúdo gráfico.
import javafx.scene.control.*;      // Todos os componentes de controlo (Label, Button, TextField, etc.).
import javafx.scene.layout.*;       // Classes de layout (HBox, VBox, BorderPane).
import javafx.stage.Modality;       // Para definir o comportamento modal da janela.
import javafx.stage.Stage;          // Representa a janela.
import javafx.stage.StageStyle;     // Para definir o estilo da janela (sem borda).
import ltc.events.Modules.NavbarUtil; // Importa a sua classe utilitária para a barra de título personalizada.
import ltc.events.Modules.Window;   // Importa a classe da Janela principal para permitir a sua atualização.
import ltc.events.classes.Participant; // Importa a classe do objeto utilizador (participante).
import ltc.events.classes.hashs.AuthService; // Importa o serviço de autenticação para ‘login’.
import ltc.events.classes.hashs.SessionEntry; // Importa o serviço de sessão para registar o ‘login’.

// Suprime avisos do IDE: 'Convert2Record' (sugestão de refatorarão) e 'BooleanMethodIsAlwaysInverted' (falso positivo).
@SuppressWarnings({"Convert2Record", "BooleanMethodIsAlwaysInverted"})
public class Login { // Início da classe ‘Login’, responsável pela UI e lógica de autenticação.
    private final Window window; // Referência à janela principal (Window), necessária para o refresh.

    public Login(Window window) { // Construtor: recebe a referência à janela principal.
        this.window = window; // Armazena a referência.
    }

    public void mostrarLogin() { // Método principal para exibir a janela de login.
        // 🔸 1. Configuração do Stage
        Stage stage = new Stage(); // Cria uma janela.
        stage.initStyle(StageStyle.UNDECORATED); // Remove a barra de título e as bordas padrão do sistema.
        stage.initModality(Modality.APPLICATION_MODAL); // Bloqueia a interação com outras janelas da aplicação.

        NavbarUtil navbar = new NavbarUtil(); // Cria a instância da navbar utilitária.
        BorderPane barra = navbar.createNavbar(stage); // Cria a barra de título personalizada (com arrasto e botões de fechar).

        // 🔹 2. Componentes de Entrada
        Label titulo = new Label("🔐 Iniciar Sessão"); // Cria o título.
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #333;"); // Estiliza o título.

        Label lblUser = new Label("Utilizador:"); // Label para o campo de utilizador.
        TextField txtUser = new TextField(); // Campo de texto para o utilizador (endereço eletrónico).
        txtUser.setPromptText("ex: admin@ltc.pt"); // Placeholder.

        Label lblPass = new Label("Palavra-passe:"); // Label para o campo de password.
        PasswordField txtPass = new PasswordField(); // Campo de senha (esconde o texto).
        txtPass.setPromptText("••••••••"); // Placeholder.

        // 🔥 Hyperlink para Recuperar Palavra-passe
        Hyperlink linkRecuperar = new Hyperlink("Esqueci a palavra-passe"); // Link.
        linkRecuperar.setStyle("-fx-font-size: 10px;"); // Estilo de fonte pequeno.
        linkRecuperar.setOnAction(_ -> mostrarRecuperarPassword(stage)); // Define a ação para abrir a janela de recuperação.

        // 🟢 Botão Entrar (Verde) - Usando método extraído (StyleUtil)
        // O método 'StyleUtil.createStyledButton' centraliza a estilização CSS.
        Button btnEntrar = StyleUtil.createStyledButton(
                "Entrar",
                "#34c759", // Cor inicial do gradiente (Verde)
                "#2ca02c", // Cor final do gradiente (Verde-escuro)
                _ -> { // Início da lógica de clique do botão Entrar
                    String user = txtUser.getText(); // Obtém o texto do utilizador.
                    String pass = txtPass.getText(); // Obtém o texto da senha.

                    // 1. Guarda: Verificar campos vazios (Sai se houver campos vazios)
                    if (user.isEmpty() || pass.isEmpty()) {
                        CustomAlert.Warning( "Preencha todos os campos!"); // Exibe alerta personalizado.
                        return; // Termina a execução do bloco de código.
                    }

                    // 2. Guarda: Validação do formato do endereço eletrónico (Sai se for inválido)
                    if (!isValidEmail(user)) {
                        CustomAlert.Error( "O email inserido não é válido.\n\nExemplo: nome@dominio.com");
                        return; // Termina a execução do bloco de código.
                    }

                    // 3. Autenticação (Só é executado se as validações acima passarem)
                    Participant logged = AuthService.login(user, pass); // Tenta autenticar o utilizador.

                    if (logged != null) {
                        // Sucesso
                        SessionEntry.login(logged); // Regista o utilizador na sessão.
                        CustomAlert.Success( "Bem-vindo, " + logged.getName() + "!"); // Mensagem de boas-vindas.

                        stage.close(); // Fecha a janela de login.
                        window.refresh(); // Atualiza a janela principal para mostrar o estado de logado.
                    } else {
                        // Falha
                        CustomAlert.Error( "Credenciais inválidas."); // Mensagem de erro.
                    }
                }
        );

        // 🔴 Botão Cancelar (Vermelho) - Usando método extraído (StyleUtil)
        Button btnCancelar = StyleUtil.createStyledButton(
                "Cancelar",
                "#ff5f57", // Cor inicial do gradiente (Vermelho)
                "#c62828", // Cor final do gradiente (Vermelho-escuro)
                _ -> stage.close() // Define a ação para fechar a janela.
        );

        // 🔹 3. Organização do Layout
        HBox botoes = new HBox(10, btnCancelar, btnEntrar); // Coloca os botões num HBox com 10px de espaçamento.
        botoes.setAlignment(Pos.CENTER); // Centraliza os botões.

        HBox linkBox = new HBox(linkRecuperar); // Coloca o hyperlink num HBox.
        linkBox.setAlignment(Pos.CENTER_RIGHT); // Alinha o hyperlink à direita.

        VBox formmostrarlogin = new VBox(15, titulo, lblUser, txtUser, lblPass, txtPass, linkBox, botoes); // VBox com 15px de espaçamento.
        formmostrarlogin.setAlignment(Pos.CENTER); // Centraliza o conteúdo.
        formmostrarlogin.setPadding(new Insets(20)); // Adiciona 20px de padding interno.

        // 🔹 4. Layout Raiz (BorderPane)
        BorderPane raiz = StyleUtil.createRootLayout(stage, formmostrarlogin);
        // 🔹 5. Exibir
        Scene scene = new Scene(raiz, 380, 320); // Cria a Scene com o tamanho.
        stage.setScene(scene); // Associa a Scene ao Stage.
        stage.centerOnScreen(); // Centraliza a janela no ecrã.
        stage.show(); // Exibe a janela.
    }

    // Método para exibir a janela de recuperação de palavra-passe
    private void mostrarRecuperarPassword(Stage parentStage) {
        Stage stage = new Stage(); // Cria uma janela (Stage) para a recuperação.
        stage.initStyle(StageStyle.UNDECORATED); // Remove a decoração da janela (barra de título padrão).
        stage.initModality(Modality.WINDOW_MODAL); // Define que a janela é modal à sua proprietária, bloqueando apenas essa janela.
        stage.initOwner(parentStage); // Define a janela de ‘login’ como proprietária (janela pai).

        NavbarUtil navbar = new NavbarUtil(); // Cria uma instância da sua classe NavbarUtil.
        BorderPane barra = navbar.createNavbar(stage); // Cria a barra de título personalizada (com arrasto e fechar).

        // Conteúdo
        Label titulo = new Label("🔑 Recuperar Palavra-passe"); // Título da janela de recuperação.
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #333;"); // Estilização do título.

        Label lblEmail = new Label("Email de Registo:"); // Label para o campo de endereço eletrónico.
        TextField txtEmail = new TextField(); // Campo de texto para inserção do endereço eletrónico.
        txtEmail.setPromptText("Insira o seu email"); // Placeholder.

        // 🟡 Botão Recuperar (Amarelo/Laranja) - Usando StyleUtil
        Button btnRecuperar = StyleUtil.createStyledButton( // Cria o botão usando o utilitário StyleUtil.
                "Recuperar",
                "#ffc107", // Cor inicial do gradiente (Amarelo)
                "#ff9800", // Cor final do gradiente (Laranja)
                _ -> { // Define a ação do botão.
                    String email = txtEmail.getText(); // Obtém o texto do campo de endereço eletrónico.
                    if (email.isEmpty() || !isValidEmail(email)) { // Validação: verifica se está vazio ou se o formato é inválido.
                        CustomAlert.Warning( "Por favor, insira um email válido."); // Exibe alerta personalizado em caso de erro.
                        return; // Sai do método se a validação falhar (Guard Clause).
                    }

                    // Simulação da lógica de backend
                    CustomAlert.Info( "Processo de Recuperação Iniciado:\n\n" +
                                    "Devido à ausência de serviço de email, contacte o administrador " +
                                    "para redefinir a palavra-passe do email:\n" + email // Exibe a mensagem de sucesso/instrução personalizada.
                    );

                    stage.close(); // Fecha a janela após a simulação.
                }
        );

        // ⚫ Botão Cancelar (Cinza) - Usando StyleUtil
        Button btnCancelar = StyleUtil.createStyledButton( // Cria o botão Cancelar.
                "Cancelar",
                "#a0a0a0", // Cor inicial do gradiente (Cinza)
                "#707070", // Cor final do gradiente (Cinza escuro)
                _ -> stage.close() // Ação: fecha a janela.
        );

        HBox botoes = new HBox(10, btnCancelar, btnRecuperar); // Layout horizontal para os botões, com 10px de espaçamento.
        botoes.setAlignment(Pos.CENTER); // Centraliza os botões dentro do HBox.

        VBox formrecuperarpassword = new VBox(15, titulo, lblEmail, txtEmail, botoes); // Layout vertical para todo o conteúdo, com 15px de espaçamento.
        formrecuperarpassword.setAlignment(Pos.CENTER); // Centraliza verticalmente o conteúdo.
        formrecuperarpassword.setPadding(new Insets(20)); // Adiciona 20px de espaçamento interno (padding) ao VBox.

        BorderPane raiz = StyleUtil.createRootLayout(stage, formrecuperarpassword);

        Scene scene = new Scene(raiz, 400, 250); // Cria a Scene com o layout raiz e define o tamanho da janela (400x250).
        stage.setScene(scene); // Associa a Scene ao Stage.
        stage.centerOnScreen(); // Centraliza a janela no ecrã.
        stage.show(); // Exibe a janela de recuperação de palavra-passe.
    }

    // Suprime o aviso do IDE (falso positivo).
    @SuppressWarnings("BooleanMethodIsAlwaysInverted")
    private boolean isValidEmail(String email) { // Método privado para verificar o formato do email.
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"); // Retorna true se corresponder ao padrão Regex.
    }
}