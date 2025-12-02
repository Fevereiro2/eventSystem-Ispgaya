package ltc.events.classes;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class Event {
    private final int event_id;
    private final String name;
    private final String description;
    private final String local;
    private final Timestamp startdate;
    private final Timestamp finaldate;
    private final Participant participantid;
    private final State state;
    private final String image;

    public Event(int event_id, String name, String description, String local,
                 Timestamp startdate, Timestamp finaldate, String image, State state, Participant participantid) {
        this.event_id = event_id;
        this.name = name;
        this.description = description;
        this.local = local;
        this.startdate = startdate;
        this.finaldate = finaldate;
        this.image = image;
        this.participantid = participantid;
        this.state = state;
    }

    public Event(ResultSet rs) throws SQLException {
        Timestamp startTimestamp = parseTimestamp(rs.getString("initial_date"));
        Timestamp finalTimestamp = parseTimestamp(rs.getString("finish_date"));

        this(
                rs.getInt("event_id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getString("local"),
                startTimestamp,
                finalTimestamp,
                rs.getString("image"),
                new State(
                        0,
                        rs.getString("state_name")
                ),
                null
        );
    }

    public int getId() { return event_id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLocal() { return local; }
    public Timestamp getStartdate() { return startdate; }
    public Timestamp getFinaldate() { return finaldate; }
    public State getState() { return state; }
    public Participant getParticipantid() { return participantid; }
    public String getImage() { return image; }

    private static Timestamp parseTimestamp(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Timestamp.valueOf(value);
        } catch (IllegalArgumentException ex) {
            try {
                LocalDate d = LocalDate.parse(value);
                return Timestamp.valueOf(d.atStartOfDay());
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }

    @Override
    public String toString() {
        return name + " (" + local + ")";
    }
}
