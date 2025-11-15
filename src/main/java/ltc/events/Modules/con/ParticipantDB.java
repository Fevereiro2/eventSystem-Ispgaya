package ltc.events.Modules.con;

import ltc.events.Modules.db;
import ltc.events.classes.Participant;
import ltc.events.classes.Types;

import java.sql.*;

public class ParticipantDB {

    public static Participant register(String name, String email, String phone, String password, Types type)
            throws SQLException {

        String checkSql = "SELECT participant_id FROM participant WHERE email = ?";
        String insertSql = """
            INSERT INTO participant (name, email, phone, password, types_id)
            VALUES (?, ?, ?, ?, ?)
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
            insert.setInt(5, type.getId());

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

}
