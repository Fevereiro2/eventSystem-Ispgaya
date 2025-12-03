package ltc.events.classes;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class Session {

    private final int session_id;
    private final String name;
    private final String description;
    private final String local;
    private final State state;
    private final String image;
    private final Timestamp initialDate;
    private final Timestamp finishDate;

    public Session(int sessionId,
                   String name,
                   String description,
                   String local,
                   State state,
                   String image,
                   Timestamp initialDate,
                   Timestamp finishDate) {

        this.session_id = sessionId;
        this.name = name;
        this.description = description;
        this.local = local;
        this.state = state;
        this.image = image;
        this.initialDate = initialDate;
        this.finishDate = finishDate;
    }

    // Construtor a partir de ResultSet (robusto para datas como texto em SQLite)
    public Session(ResultSet rs) throws SQLException {
        String startDateString = rs.getString("initial_date");
        String finalDateString = rs.getString("finish_date");

        this.session_id = rs.getInt("session_id");
        this.name = rs.getString("name");
        this.description = rs.getString("description");
        this.local = rs.getString("local");
        this.state = new State(
                rs.getInt("state_id"),
                rs.getString("state_name")
        );
        this.image = rs.getString("image");
        this.initialDate = parseTimestampSafe(startDateString);
        this.finishDate = parseTimestampSafe(finalDateString);
    }

    public int getId() { return session_id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLocal() { return local; }
    public State getState() { return state; }
    public String getImage() { return image; }
    public Timestamp getStartdate() { return initialDate; }
    public Timestamp getFinaldate() { return finishDate; }

    @Override
    public String toString() {
        return name + " (" + local + ")";
    }

    private Timestamp parseTimestampSafe(String value) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        try {
            return Timestamp.valueOf(trimmed);
        } catch (IllegalArgumentException e) {
            try {
                return Timestamp.valueOf(trimmed + " 00:00:00");
            } catch (Exception ignored) {
                return null;
            }
        }
    }
}
