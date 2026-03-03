package ltc.events.classes;

public class Resourceevent {
    private final Resources resource;
    private final Event event;

    public Resourceevent(Resources resource, Event event) {
        this.resource = resource;
        this.event = event;
    }
    public Resources getResource() { return resource; }
    public Event getEvent() { return event; }
}
