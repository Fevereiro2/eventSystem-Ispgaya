package ltc.events.classes;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

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
        this(
                rs.getInt("event_id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getString("local"),
                rs.getTimestamp("initial_date"),
                rs.getTimestamp("finish_date"),
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

    @Override
    public String toString() {
        return name + " (" + local + ")";
    }
}
