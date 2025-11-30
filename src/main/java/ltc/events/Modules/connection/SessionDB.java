package ltc.events.Modules.connection;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Session;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SessionDB {

    /**
     * Devolve todas as sessões associadas a um evento.
     */
    public static List<Session> getSessionsByEvent(int eventId) {
        ObservableList<Session> sessions = FXCollections.observableArrayList();
        String sql = """
            SELECT
                s.session_id,
                s.name,
                s.description,
                s.local,
                st.name AS state_name,
                s.image,
                s.initial_date,
                s.finish_date
            FROM session s
            INNER JOIN session_event se ON se.session_id = s.session_id
            INNER JOIN event e ON e.event_id = se.event_id
            INNER JOIN state st ON st.state_id = s.state
            WHERE e.event_id = ?
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
            System.out.println("❌ Erro ao obter sessões do evento: " + e.getMessage());
        }

        return sessions;
    }
}
