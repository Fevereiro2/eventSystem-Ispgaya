package ltc.events.Modules.connection;

import javafx.scene.control.Alert;
import ltc.events.Modules.db;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Participant;
import ltc.events.classes.Types;
import ltc.events.classes.hashs.PasswordUtil;

import java.sql.*;
import java.time.LocalDate;

public class ParticipantDB {

    public static Participant register(
            String name,
            String email,
            String phone,
            String password,
            String gender,
            String nif,
            LocalDate birthdate,
            Types type
    ) throws SQLException {

        String checkSql = "SELECT participant_id FROM participant WHERE email = ?";
        String insertSql = """
            INSERT INTO participant (name, email, phone, password, gender, tax_number, birthdate, types_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING participant_id;
            """;

        Connection conn = db.connect();

        // Verifica email
        try (PreparedStatement check = conn.prepareStatement(checkSql)) {
            check.setString(1, email);
            ResultSet rs = check.executeQuery();
            if (rs.next()) {
                throw new SQLException("Já existe uma conta com este email.");
            }
        }

        int newId;

        // Inserir e obter ID
        try (PreparedStatement insert = conn.prepareStatement(insertSql)) {
            insert.setString(1, name);
            insert.setString(2, email);
            insert.setString(3, phone);
            insert.setString(4, password);
            insert.setString(5, gender);
            insert.setString(6, nif);
            insert.setDate(7, java.sql.Date.valueOf(birthdate));
            insert.setInt(8, type.getId());

            ResultSet rs = insert.executeQuery();
            if (!rs.next()) throw new SQLException("Erro ao criar participante.");

            newId = rs.getInt("participant_id");
        }

        // AGORA buscar tudo corretamente
        String fetchSql = """
            SELECT p.*, t.name AS types_name
            FROM participant p
            JOIN types t ON p.types_id = t.types_id
            WHERE p.participant_id = ?
    """;

        try (PreparedStatement fetch = conn.prepareStatement(fetchSql)) {
            fetch.setInt(1, newId);
            ResultSet rs = fetch.executeQuery();

            if (!rs.next()) throw new SQLException("Erro ao carregar participante.");

            return new Participant(rs);
        }
    }
    public static ObservableList<Participant> listAll() {
        ObservableList<Participant> lista = FXCollections.observableArrayList();

        String sql = """
        SELECT p.*, t.name AS types_name
        FROM participant p
        JOIN types t ON p.types_id = t.types_id
        ORDER BY p.name
    """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                lista.add(new Participant(rs));
            }

        } catch (SQLException e) {
            System.out.println("Erro ao carregar participantes: " + e.getMessage());
        }

        return lista;
    }

    public static void update(String id, String name, String email, String phone, Types type) throws SQLException {
        String sql = """
        UPDATE participant
        SET name = ?, email = ?, phone = ?, types_id = ?
        WHERE participant_id = ?
    """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, phone);
            stmt.setInt(4, type.getId());
            stmt.setInt(5, Integer.parseInt(id));

            stmt.executeUpdate();
        }
    }
    public static void delete(String id) throws SQLException {
        String sql = "DELETE FROM participant WHERE participant_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id));
            stmt.executeUpdate();
        }
    }

    public static void count() throws SQLException {
        String sql = "SELECT COUNT(*) FROM participant";
        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                System.out.println("Total de participantes: " + rs.getInt(1));
            }
        }
    }

    public static void updatePassword(int participantId, String newPassword) throws SQLException {
        String sql = "UPDATE participant SET password = ? WHERE participant_id = ?";

        try (Connection connection = db.connect();
             PreparedStatement stmt = connection.prepareStatement(sql)) {

            stmt.setString(1, PasswordUtil.hashPassword(newPassword)); // hash seguro
            stmt.setInt(2, participantId);

            stmt.executeUpdate();
        }
    }

    public static void updateProfile(int participantId,
                                     String name,
                                     String email,
                                     String phone,
                                     String gender,
                                     String address,
                                     String taxNumber,
                                     LocalDate birthdate,
                                     String photoUrl) throws SQLException {
        String sql = """
            UPDATE participant
            SET name = ?, email = ?, phone = ?, gender = ?, address = ?, tax_number = ?, birthdate = ?, photo = ?, types_id = types_id
            WHERE participant_id = ?
            """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, phone);
            stmt.setString(4, gender);
            stmt.setString(5, address);
            stmt.setString(6, taxNumber);
            if (birthdate != null) {
                stmt.setDate(7, java.sql.Date.valueOf(birthdate));
            } else {
                stmt.setNull(7, java.sql.Types.DATE);
            }
            stmt.setString(8, photoUrl);
            stmt.setInt(9, participantId);

            stmt.executeUpdate();
        }
    }
}
