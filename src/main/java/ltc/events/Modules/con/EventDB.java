package ltc.events.Modules.con;
import ltc.events.Modules.db;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.classes.Event;

import java.sql.*;

public class EventDB {

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
            s.name AS state_name
        FROM event e
        INNER JOIN state s ON e.state_id = s.state_id
        ORDER BY e.initial_date;

        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                events.add(new Event(
                        rs.getInt("event_id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getString("local"),
                        rs.getTimestamp("initial_date"),
                        rs.getTimestamp("finish_date"),
                        rs.getString("image"),
                        rs.getString("state_name")
                ));
            }

        } catch (SQLException e) {
            System.out.println("❌ Erro ao obter eventos: " + e.getMessage());
        }

        return events;
    }
}
