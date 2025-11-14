package ltc.events.classes;

public class Sessionevent {
    private final Session session;
    private final Event event;

    public Sessionevent(Session session, Event event) {
        this.session = session;
        this.event = event;
    }
    public Session getSession() { return session; }
    public Event getEvent() { return event; }
}
