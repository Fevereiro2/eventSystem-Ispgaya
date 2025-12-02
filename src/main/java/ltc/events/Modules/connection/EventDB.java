
package ltc.events.Modules.connection;
import ltc.events.Modules.db;


import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.classes.Event;
import ltc.events.classes.Session;
import ltc.events.classes.State;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EventDB {

    // Método 1: CREATE (Registar um novo evento)
    // Retorna o objeto Event criado
    public static Event register(
            String name,
            String description,
            String local,
            Timestamp initialDate,
            Timestamp finishDate,
            String image,
            int stateId) throws SQLException {

        String insertSql = """
            INSERT INTO event (name, description, local, initial_date, finish_date, image, state_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING event_id;
            """;

        // Query para buscar o evento completo após a inserção (usa a mesma da getAllEvents)
        String fetchSql = """
            SELECT
                e.event_id,
                e.name,
                e.description,
                e.local,
                e.initial_date,
                e.finish_date,
                e.image,
                s.name AS state_name,
                s.state_id
            FROM event e
            INNER JOIN state s ON e.state_id = s.state_id
            WHERE e.event_id = ?
        """;

        Connection conn = db.connect();
        int newId = -1;

        // Inserir e obter ID (SQLite usa RETURNING, que foi visto a funcionar no ParticipantDB)
        try (PreparedStatement insert = conn.prepareStatement(insertSql)) {
            insert.setString(1, name);
            insert.setString(2, description);
            insert.setString(3, local);
            insert.setTimestamp(4, initialDate);
            insert.setTimestamp(5, finishDate);
            insert.setString(6, image);
            insert.setInt(7, stateId);

            ResultSet rs = insert.executeQuery();
            if (!rs.next()) throw new SQLException("Erro ao criar evento.");

            newId = rs.getInt("event_id");
        }

        // Buscar o evento completo para o retornar
        try (PreparedStatement fetch = conn.prepareStatement(fetchSql)) {
            fetch.setInt(1, newId);
            ResultSet rs = fetch.executeQuery();

            if (!rs.next()) throw new SQLException("Erro ao carregar evento criado.");

            return new Event(rs);
        } finally {
            if (conn != null) conn.close();
        }
    }


    // Método 2: READ (Obter todos os eventos) - Já existia
    public static ObservableList<Event> getAllEvents() {
        ObservableList<Event> events = FXCollections.observableArrayList();

        String query = """
        SELECT
            e.event_id,
            e.name,
            e.description,
            e.local,
            e.initial_date,
            e.finish_date,
            e.image,
            s.name AS state_name,
            s.state_id
        FROM event e
        INNER JOIN state s ON e.state_id = s.state_id
        ORDER BY e.initial_date;
        """; // Código original

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                events.add(new Event(rs));
            }

        } catch (SQLException e) {
            System.out.println("❌ Erro ao obter eventos: " + e.getMessage());
        }

        return events;
    }


    // Método 3: UPDATE (Atualizar um evento existente)
    public static void update(
            String id,
            String name,
            String description,
            String local,
            Timestamp initialDate,
            Timestamp finishDate,
            String image,
            int stateId) throws SQLException {

        String sql = """
            UPDATE event
            SET name = ?, description = ?, local = ?, initial_date = ?, finish_date = ?, image = ?, state_id = ?
            WHERE event_id = ?
        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, description);
            stmt.setString(3, local);
            stmt.setTimestamp(4, initialDate);
            stmt.setTimestamp(5, finishDate);
            stmt.setString(6, image);
            stmt.setInt(7, stateId);
            stmt.setInt(8, Integer.parseInt(id)); // Parse do ID

            stmt.executeUpdate();
        }
    }

    public static void updateState(String id, int stateId) throws SQLException {
        String sql = "UPDATE event SET state_id = ? WHERE event_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, stateId);
            stmt.setInt(2, Integer.parseInt(id));
            stmt.executeUpdate();
        }
    }

    // Método 4: DELETE (Remover um evento)
    public static void delete(String id) throws SQLException {
        String sql = "DELETE FROM event WHERE event_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id)); // Parse do ID
            stmt.executeUpdate();
        }
    }
}
