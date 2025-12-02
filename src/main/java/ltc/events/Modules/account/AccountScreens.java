package ltc.events.Modules.account;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.shape.Circle;
import javafx.scene.layout.HBox;
import ltc.events.Modules.connection.ParticipantDB;
import ltc.events.Modules.visual.StyleUtil;
import ltc.events.Modules.visual.CustomAlert;
import ltc.events.classes.Participant;
import ltc.events.classes.hashs.SessionEntry;



public class AccountScreens {

    private final VBox centro;
    private final Runnable onBack;

    public AccountScreens(VBox centro) {
        this(centro, null);
    }

    public AccountScreens(VBox centro, Runnable onBack) {
        this.centro = centro;
        this.onBack = onBack;
    }

    public void mostrarDefinicoesConta() {
        centro.getChildren().clear();

        Participant user = SessionEntry.getUser();
        if (user == null) {
            CustomAlert.Error("Nenhum utilizador autenticado.");
            return;
        }

        // =========================
        // TÍTULO
        // =========================
        Label titulo = new Label("🔧 Definições da Conta");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold;");
        Button btnVoltar = StyleUtil.secondaryButton("Voltar", _ -> {
            if (onBack != null) {
                onBack.run();
            } else {
                centro.getChildren().clear();
            }
        });
        HBox header = new HBox(10, btnVoltar, titulo);
        header.setAlignment(Pos.CENTER_LEFT);

        // =========================
        // AVATAR
        // =========================
        // Aqui podes mais tarde buscar user.getAvatarUrl()
        String avatarUrl = "https://via.placeholder.com/150"; // default, troca depois para user.getAvatar()

        ImageView avatarView = new ImageView();
        try {
            avatarView.setImage(new Image(avatarUrl, 120, 120, true, true));
        } catch (Exception e) {
            avatarView.setImage(new Image("https://via.placeholder.com/150", 120, 120, true, true));
        }
        avatarView.setFitWidth(120);
        avatarView.setFitHeight(120);

        Circle clip = new Circle(60, 60, 60);
        avatarView.setClip(clip);

        final String[] avatarHolder = { avatarUrl };

        Button btnUpload = StyleUtil.primaryButton("Upload Novo", _ -> {
            TextInputDialog dialog = new TextInputDialog(avatarHolder[0]);
            dialog.setTitle("Alterar Avatar");
            dialog.setHeaderText("Colar URL da nova imagem");
            dialog.setContentText("URL:");

            dialog.showAndWait().ifPresent(url -> {
                try {
                    avatarView.setImage(new Image(url, 120, 120, true, true));
                    avatarHolder[0] = url;
                } catch (Exception ex) {
                    CustomAlert.Error("URL invalido.");
                }
            });
        });

        Button btnDeleteAvatar = StyleUtil.dangerButton("Remover Avatar", _ -> {
            avatarHolder[0] = null;
            avatarView.setImage(new Image("https://via.placeholder.com/150", 120, 120, true, true));
        });

        VBox avatarBox = new VBox(10, avatarView, new HBox(10, btnUpload, btnDeleteAvatar));
        avatarBox.setAlignment(Pos.TOP_CENTER);

        // =========================
        // FORMULÁRIO
        // =========================

        TextField txtNome = new TextField(user.getName());
        txtNome.setPromptText("Nome");

        TextField txtEmail = new TextField(user.getEmail());
        txtEmail.setPromptText("Email");
        txtEmail.setEditable(false);

        TextField txtPhone = new TextField(user.getPhone());
        txtPhone.setPromptText("Telemivel");

        ComboBox<String> cmbGender = new ComboBox<>();
        cmbGender.getItems().addAll("Masculino", "Feminino", "Outro");
        cmbGender.setPromptText("Genero");

        TextField txtTaxNumber = new TextField();
        txtTaxNumber.setPromptText("NIF");
        txtTaxNumber.setText(user.getTaxNumber());
        txtTaxNumber.setEditable(false);

        DatePicker dpBirthdate = new DatePicker();
        dpBirthdate.setPromptText("Data de nascimento");
        if (user.getBirthdate() != null) {
            dpBirthdate.setValue(user.getBirthdate().toLocalDate());
        }
        dpBirthdate.setDisable(true);

        TextArea txtAddress = new TextArea();
        txtAddress.setPromptText("Morada");
        txtAddress.setPrefRowCount(3);

        // Grid com 2 colunas
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(15);
        grid.add(new Label("Nome *"), 0, 0);
        grid.add(txtNome, 0, 1);

        grid.add(new Label("Email *"), 1, 0);
        grid.add(txtEmail, 1, 1);

        grid.add(new Label("Telemóvel *"), 0, 2);
        grid.add(txtPhone, 0, 3);

        grid.add(new Label("Género"), 1, 2);
        grid.add(cmbGender, 1, 3);

        grid.add(new Label("NIF"), 0, 4);
        grid.add(txtTaxNumber, 0, 5);

        grid.add(new Label("Data de Nascimento"), 1, 4);
        grid.add(dpBirthdate, 1, 5);

        grid.add(new Label("Morada"), 0, 6);
        GridPane.setColumnSpan(txtAddress, 2);
        grid.add(txtAddress, 0, 7);

        // =========================
        // BOTÃO GUARDAR
        // =========================
        Button btnGuardar = StyleUtil.primaryButton("Guardar Alterações", _ -> {
            try {
                int id = Integer.parseInt(user.getId());

                ParticipantDB.updateProfile(
                        id,
                        txtNome.getText(),
                        txtEmail.getText(),
                        txtPhone.getText(),
                        cmbGender.getValue(),
                        txtAddress.getText(),
                        txtTaxNumber.getText(),
                        dpBirthdate.getValue(),
                        avatarHolder[0]
                );

                // Atualizar o objeto em memória (mínimo: nome/email/phone)
                user.setName(txtNome.getText());
                user.setEmail(txtEmail.getText());
                user.setPhone(txtPhone.getText());
                // se adicionares getters/setters para gender, address, etc, atualiza aqui também

                CustomAlert.Success("Alteracoes guardadas com sucesso!");

            } catch (Exception ex) {
                CustomAlert.Error("Erro ao guardar: " + ex.getMessage());
            }
        });

        HBox footer = new HBox(btnGuardar);
        footer.setAlignment(Pos.CENTER_RIGHT);
        footer.setPadding(new Insets(10, 0, 0, 0));

        // =========================
        // LAYOUT FINAL
        // =========================
        VBox formBox = new VBox(20, grid, footer);

        HBox topo = new HBox(40, avatarBox, formBox);
        topo.setAlignment(Pos.TOP_LEFT);

        VBox root = new VBox(20, header, topo);
        root.setPadding(new Insets(20));

        centro.getChildren().add(root);
    }
}





