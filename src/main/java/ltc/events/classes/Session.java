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
    private final Participant moderator;

    public Session(int sessionId,
                   String name,
                   String description,
                   String local,
                   State state,
                   String image,
                   Timestamp initialDate,
                   Timestamp finishDate,
                   Participant moderator) {

        this.session_id = sessionId;
        this.name = name;
        this.description = description;
        this.local = local;
        this.state = state;
        this.image = image;
        this.initialDate = initialDate;
        this.finishDate = finishDate;
        this.moderator = moderator;
    }

    // Construtor a partir de ResultSet (robusto para datas como texto em SQLite)
    public Session(ResultSet rs) throws SQLException {
        String startDateString = rs.getString("initial_date");
        String finalDateString = rs.getString("finish_date");
        Participant mod = parseModerator(rs);

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
        this.moderator = mod;
    }

    public int getId() { return session_id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLocal() { return local; }
    public State getState() { return state; }
    public String getImage() { return image; }
    public Timestamp getStartdate() { return initialDate; }
    public Timestamp getFinaldate() { return finishDate; }
    public Participant getModerator() { return moderator; }

    @Override
    public String toString() {
        return name + " (" + local + ")";
    }

    private Timestamp parseTimestampSafe(String value) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        String normalized = normalizeIso(trimmed);
        try {
            return Timestamp.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            try {
                return Timestamp.valueOf(normalized + " 00:00:00");
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    private String normalizeIso(String raw) {
        String s = raw.replace('T', ' ').replace('Z', ' ').trim();
        // Se vier sem segundos (ex: yyyy-MM-dd HH:mm) acrescenta :00
        if (s.matches("^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}$")) {
            s = s + ":00";
        }
        return s;
    }

    private Participant parseModerator(ResultSet rs) {
        try {
            Object modObj = rs.getObject("moderator_id");
            if (modObj == null) return null;

            String modId = String.valueOf(rs.getInt("moderator_id"));
            String modName = rs.getString("moderator_name");
            String modEmail = rs.getString("moderator_email");
            String modPhone = rs.getString("moderator_phone");

            Types modType = null;
            Object modTypeObj = rs.getObject("moderator_type_id");
            if (modTypeObj != null) {
                modType = new Types(
                        rs.getInt("moderator_type_id"),
                        rs.getString("moderator_type_name")
                );
            } else {
                modType = new Types(1, "Moderador");
            }

            return new Participant(modId, modName, modEmail, modPhone, modType);

        } catch (Exception ignored) {
            return null;
        }
    }
}
