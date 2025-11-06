package ltc.events.classes;

import javafx.collections.ObservableList;

import java.sql.Timestamp;

public class Event {
    private int event_id;
    private String name;
    private String description;
    private String local;
    private Timestamp startdate;
    private Timestamp finaldate;
    private String state;
    private String image;

    public Event(int event_id, String name, String description, String local,
                 Timestamp startdate, Timestamp finaldate, String image, String state) {
        this.event_id = event_id;
        this.name = name;
        this.description = description;
        this.local = local;
        this.startdate = startdate;
        this.finaldate = finaldate;
        this.image = image;
        this.state = state;
    }

    public static ObservableList<Event> getAllEvents() {
        return null;
    }

    public int getId() { return event_id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLocal() { return local; }
    public Timestamp getStartdate() { return startdate; }
    public Timestamp getFinaldate() { return finaldate; }
    public String getState() { return state; }
    public String getImage() { return image; }

    @Override
    public String toString() {
        return name + " (" + local + ")";
    }
}
