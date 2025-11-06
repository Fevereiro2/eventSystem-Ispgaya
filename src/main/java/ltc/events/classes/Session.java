package ltc.events.classes;

import java.sql.Timestamp;

public class Session {
    private final int session_id;
    private final String name;
    private final String description;
    private final String local;
    private final String state;
    private final String image;
    private final Timestamp initialDate;
    private final Timestamp finishDate;

    public Session(int sessionId, String name, String description, String local, String state, String image, Timestamp initialDate, Timestamp finishDate) {
        this.session_id = sessionId;
        this.name = name;
        this.description = description;
        this.local = local;
        this.state = state;
        this.image = image;
        this.initialDate = initialDate;
        this.finishDate = finishDate;
    }



    public int getId() { return session_id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLocal() { return local; }
    public String getState() { return state; }
    public String getImage() { return image; }
    public Timestamp getStartdate() { return initialDate; }
    public Timestamp getFinaldate() { return finishDate; }

    @Override
    public String toString() {
        return name + " (" + local + ")";
    }
}
