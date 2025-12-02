package ltc.events.Modules.visual; // Declara que a classe CustomAlert pertence a este pacote.

// -------------------------------------------------------------------------
// Importações JavaFX ‘standard’ para a construção da ‘interface’ gráfica (UI)
// -------------------------------------------------------------------------
import javafx.geometry.Insets;// Importa a classe para definir espaçamentos internos (padding/margens).
import javafx.geometry.Pos;// Importa a classe para definir o alinhamento de componentes dentro de layouts.
import javafx.scene.Scene;// Importa a Scene, o contentor principal para todos os nós gráficos.
import javafx.scene.control.Button;// Importa o componente Button (botão).
import javafx.scene.control.Label;// Importa o componente Label (texto estático).
import javafx.scene.layout.BorderPane;// Importa o BorderPane, layout que organiza em 5 regiões (Topo, Centro, etc.).
import javafx.scene.layout.HBox;// Importa o HBox, layout que organiza componentes horizontalmente.
import javafx.scene.layout.VBox;// Importa o VBox, layout que organiza componentes verticalmente.
import javafx.stage.Modality;// Importa a Modality para definir o comportamento de bloqueio da janela.
import javafx.stage.Stage;// Importa a classe Stage, que representa a janela.
import javafx.stage.StageStyle;// Importa o StageStyle para remover a decoração padrão da janela.

// -------------------------------------------------------------------------
// Importações de utilitários personalizados (Classes do seu projeto)
// -------------------------------------------------------------------------
import ltc.events.Modules.NavbarUtil; // Importa a sua NavbarUtil para a barra de título personalizada.


public class CustomAlert { // Início da classe utilitária CustomAlert (não instanciáveis, só métodos estáticos).

    /**
    * Enumeração que define os tipos de alerta disponíveis, associados a cores e lógica.
    */
    public enum Type {
        SUCCESS,// Tipo para sucesso (Verde).
        WARNING,// Tipo para aviso/atenção (Laranja).
        ERROR,// Tipo para erro/falha (Vermelho).
        INFO // Tipo para informação geral (Azul).
    }

    // ─────────────────────────────────────────────
    // MÉTODOS ESTÁTICOS DE CONVENIÊNCIA (Factory Methods)
    // São a interface pública simplificada para chamar o alerta.
    // ─────────────────────────────────────────────

    /**
    * Exibe um alerta d'ERRO com o título "Erro".
    * @param mensagem A mensagem de erro a ser exibida.
    */
    public static void Error(String mensagem) {
        show(Type.ERROR, "Erro", mensagem); // Chama o método principal, passando o tipo, título e mensagem.
    }

    /**
    * Exibe um alerta de AVISO com o título "Atenção".
    * @param mensagem A mensagem de aviso a ser exibida.
    */
    public static void Warning(String mensagem) {
        show(Type.WARNING, "Atenção", mensagem); // Chama o método principal, passando o tipo, título e mensagem.
    }

    /**
    * Exibe um alerta de SUCESSO com o título "Sucesso".
     * @param mensagem A mensagem de sucesso a ser exibida.
     */
    public static void Success(String mensagem) {
        show(Type.SUCCESS, "Sucesso", mensagem); // Chama o método principal, passando o tipo, título e mensagem.
    }

  /**
   * Exibe um alerta de INFORMAÇÃO com o título "Informação".
   * @param mensagem A mensagem informativa a ser exibida.
   */
          public static void Info(String mensagem) {
    show(Type.INFO, "Informação", mensagem); // Chama o método principal, passando o tipo, título e mensagem.
  }
 
          // ─────────────────────────────────────────────
          // MÉTODO PRINCIPAL DE EXIBIÇÃO (Privado)
          // Toda a lógica de UI reside aqui.
          // ─────────────────────────────────────────────

          /**
   * Exibe o alerta com ‘design’ personalizado, ajustando o estilo pelo tipo.
   * É privado para garantir que apenas os métodos de conveniência o chamam.
   */
          private static void show(Type tipo, String titulo, String mensagem) {

    // Variáveis para definir o estilo dinamicamente (cores CSS)
    String colorStart;// Cor inicial do gradiente do botão OK.
    String colorEnd; // Cor final do gradiente do botão OK.
    String tituloColor;// Cor do texto do título do alerta.

    // 1. Definição dos Estilos baseada no Tipo (SUCCESS, WARNING, etc.)
    switch (tipo) {
      case SUCCESS:
        colorStart = "#34c759"; colorEnd = "#2ca02c"; // Verde para o botão.
        tituloColor = "#2e7d32";// Verde-escuro para o título.
        break;
      case WARNING:
        colorStart = "#ffc107"; colorEnd = "#ff9800"; // Laranja para o botão.
        tituloColor = "#f9a825";// Amarelo/Laranja escuro para o título.
        break;
      case ERROR:
        colorStart = "#ff5f57"; colorEnd = "#c62828"; // Vermelho para o botão.
        tituloColor = "#c62828";// Vermelho-escuro para o título.
        break;
      case INFO:
      default: // Usado para INFO e como fallback.
        colorStart = "#2196F3"; colorEnd = "#1565C0"; // Azul para o botão.
        tituloColor = "#1565C0"; // Azul-escuro para o título.
        break;
    }

    // 2. Configurar o Stage (Janela)
    Stage stage = new Stage();// Cria a janela do alerta.
    stage.initStyle(StageStyle.UNDECORATED);// Remove a decoração padrão do sistema (bordas).
    stage.initModality(Modality.APPLICATION_MODAL);// Bloqueia toda a aplicação enquanto o alerta estiver aberto.

    // Usar a sua NavbarUtil para a barra de título arrastáveis
    NavbarUtil navbar = new NavbarUtil();// Instancia o utilitário.
    BorderPane barra = navbar.createNavbar(stage);// Cria a barra de título personalizada e associa-a ao Stage.

    // 3. Criação e Estilização do Conteúdo Principal
    Label lblTitulo = new Label(titulo);// Cria o Label para o título.
        // Aplica o estilo, incluindo a cor dinâmica do título.
    lblTitulo.setStyle(String.format("-fx-font-size: 16px; -fx-font-weight: bold; -fx-padding: 0 0 10 0; -fx-text-fill: %s;", tituloColor));

    Label lblMensagem = new Label(mensagem);// Cria o Label para a mensagem.
    lblMensagem.setStyle("-fx-font-size: 13px; -fx-text-fill: #555;");// Estiliza a mensagem (cor cinza).
    lblMensagem.setWrapText(true);// Permite que o texto quebre linhas se não couber.
    lblMensagem.setMaxWidth(300);// Limita a largura do texto para evitar que a janela fique muito larga.

    // Cria o botão OK usando o StyleUtil com as cores dinâmicas definidas no switch
    Button btnOK = StyleUtil.createStyledButton(
                      "OK",     // Texto do botão.
                      colorStart,  // Cor inicial do gradiente.
                      colorEnd,   // Cor final do gradiente.
                      _ -> stage.close()// Ação: fecha a janela.
                    );

    HBox botoes = new HBox(btnOK);// Container para os botões.
    botoes.setAlignment(Pos.CENTER_RIGHT);// Alinha o botão OK à direita dentro do container.

    VBox formcustomalert = new VBox(15, lblTitulo, lblMensagem, botoes);// Container vertical para todos os elementos de conteúdo.
    formcustomalert.setAlignment(Pos.TOP_LEFT);// Alinha o conteúdo ao topo-esquerda.
    formcustomalert.setPadding(new Insets(20));// Aplica 20px de espaçamento interno.

    // 4. Layout Raiz e Estilo de Janela
    BorderPane raiz = StyleUtil.createRootLayout(stage, formcustomalert);

    // 5. Exibir a Janela
    Scene scene = new Scene(raiz, 350, 200);// Cria a Scene com o layout raiz e define o tamanho da janela (350x200).
    stage.setScene(scene);// Define a Scene.
    stage.centerOnScreen();// Centraliza a janela no ecrã do utilizador.
    stage.showAndWait();// Exibe a janela e BLOQUEIA a execução do código de chamada até ser fechada.
  } // Fim do método show.
} // Fim da classe CustomAlert.