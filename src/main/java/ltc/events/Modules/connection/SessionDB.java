package ltc.events.Modules.connection;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Session;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

public class SessionDB {

    /**
     * Devolve todas as sessoes associadas a um evento.
     */
    public static List<Session> getSessionsByEvent(int eventId) {
        ObservableList<Session> sessions = FXCollections.observableArrayList();
        String sql = """
            SELECT
                s.session_id,
                s.name,
                s.description,
                s.local,
                s.state AS state_id,
                s.state AS state_name,
                s.image,
                s.initial_date,
                s.finish_date
            FROM session s
            INNER JOIN session_event se ON se.session_id = s.session_id
            WHERE se.event_id = ?
            ORDER BY s.initial_date;
        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, eventId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                sessions.add(new Session(rs));
            }

        } catch (SQLException e) {
            System.out.println("Erro ao obter sessoes do evento: " + e.getMessage());
        }

        return sessions;
    }

    /**
     * Cria uma sessao e liga ao evento.
     */
    public static Session createForEvent(int eventId,
                                         String name,
                                         String description,
                                         String local,
                                         Timestamp start,
                                         Timestamp finish,
                                         String state,
                                         String image) throws SQLException {
        String insertSession = """
            INSERT INTO session (name, description, local, initial_date, finish_date, state, image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING session_id
        """;
        String insertRelation = "INSERT INTO session_event (session_id, event_id) VALUES (?, ?)";
        String fetch = """
            SELECT
                s.session_id,
                s.name,
                s.description,
                s.local,
                s.state AS state_id,
                s.state AS state_name,
                s.image,
                s.initial_date,
                s.finish_date
            FROM session s
            WHERE s.session_id = ?
        """;

        Connection conn = db.connect();
        int newId;
        try (PreparedStatement ins = conn.prepareStatement(insertSession)) {
            ins.setString(1, name);
            ins.setString(2, description);
            ins.setString(3, local);
            ins.setString(4, start != null ? start.toLocalDateTime().toString() : null);
            ins.setString(5, finish != null ? finish.toLocalDateTime().toString() : null);
            ins.setString(6, state);
            ins.setString(7, image);
            ResultSet rs = ins.executeQuery();
            if (!rs.next()) throw new SQLException("Falha ao criar sessao.");
            newId = rs.getInt("session_id");
        }

        try (PreparedStatement link = conn.prepareStatement(insertRelation)) {
            link.setInt(1, newId);
            link.setInt(2, eventId);
            link.executeUpdate();
        }

        try (PreparedStatement f = conn.prepareStatement(fetch)) {
            f.setInt(1, newId);
            ResultSet rs = f.executeQuery();
            if (!rs.next()) throw new SQLException("Falha ao carregar sessao criada.");
            Session s = new Session(rs);
            ltc.events.Modules.util.LoggingUtil.log("SESSAO CRIADA: " + s.getName() + " (event " + eventId + ")");
            return s;
        } finally {
            conn.close();
        }
    }

    public static void delete(int sessionId) throws SQLException {
        String delRel = "DELETE FROM session_event WHERE session_id = ?";
        String delSession = "DELETE FROM session WHERE session_id = ?";
        try (Connection conn = db.connect()) {
            try (PreparedStatement r = conn.prepareStatement(delRel)) {
                r.setInt(1, sessionId);
                r.executeUpdate();
            }
            try (PreparedStatement s = conn.prepareStatement(delSession)) {
                s.setInt(1, sessionId);
                s.executeUpdate();
            }
        }
    }
}
