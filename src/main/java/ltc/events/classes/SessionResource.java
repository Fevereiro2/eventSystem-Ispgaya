package ltc.events.classes;

/**
 * Represents how many units of a given resource are reserved for a session.
 */
public class SessionResource {

    private final int sessionId;
    private final Resources resource;
    private final int quantity;

    public SessionResource(int sessionId, Resources resource, int quantity) {
        this.sessionId = sessionId;
        this.resource = resource;
        this.quantity = quantity;
    }

    public int getSessionId() { return sessionId; }
    public Resources getResource() { return resource; }
    public int getQuantity() { return quantity; }
}
