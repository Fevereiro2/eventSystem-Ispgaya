package ltc.events.Modules.connection;

import ltc.events.Modules.db;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.classes.Participant;
import ltc.events.classes.Types;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ParticipantDB {

    public static Participant register(
            String name,
            String email,
            String phone,
            Types type
    ) throws SQLException {

        String checkSql = "SELECT participant_id FROM participant WHERE email = ?";
        String insertSql = """
            INSERT INTO participant (name, email, phone, types_id)
            VALUES (?, ?, ?, ?)
            RETURNING participant_id;
            """;

        Connection conn = db.connect();

        // Verifica email duplicado
        try (PreparedStatement check = conn.prepareStatement(checkSql)) {
            check.setString(1, email);
            ResultSet rs = check.executeQuery();
            if (rs.next()) {
                throw new SQLException("Ja existe uma conta com este email.");
            }
        }

        int newId;

        // Inserir e obter ID
        try (PreparedStatement insert = conn.prepareStatement(insertSql)) {
            insert.setString(1, name);
            insert.setString(2, email);
            insert.setString(3, phone);
            insert.setInt(4, type.getId());

            ResultSet rs = insert.executeQuery();
            if (!rs.next()) throw new SQLException("Erro ao criar participante.");

            newId = rs.getInt("participant_id");
        }

        // Buscar o participante completo
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

    public static void updatePassword(int participantId, String newPassword) {
        // passwords removidas nesta versao
    }

    public static void updateProfile(int participantId,
                                     String name,
                                     String email,
                                     String phone) throws SQLException {
        String sql = """
            UPDATE participant
            SET name = ?, email = ?, phone = ?, types_id = types_id
            WHERE participant_id = ?
        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, phone);
            stmt.setInt(4, participantId);

            stmt.executeUpdate();
        }
    }
}
