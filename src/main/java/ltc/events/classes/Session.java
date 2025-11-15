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

    // Construtor original
    public Session(int sessionId, String name, String description, String local,
                   State state, String image, Timestamp initialDate, Timestamp finishDate) {

        this.session_id = sessionId;
        this.name = name;
        this.description = description;
        this.local = local;
        this.state = state;
        this.image = image;
        this.initialDate = initialDate;
        this.finishDate = finishDate;
    }

    // 🔥 NOVO CONSTRUTOR — recebe diretamente o ResultSet
    public Session(ResultSet rs) throws SQLException {
        this(
                rs.getInt("session_id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getString("local"),

                new State(
                        rs.getInt("state_id"),
                        rs.getString("state_name")
                ),

                rs.getString("image"),
                rs.getTimestamp("initial_date"),
                rs.getTimestamp("finish_date")
        );
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
}
