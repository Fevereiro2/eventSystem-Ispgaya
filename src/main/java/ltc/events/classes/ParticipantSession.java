package ltc.events.classes;

public class ParticipantSession {
    private final Participant participant;
    private final Session session;

    public ParticipantSession(Participant participant, Session session) {
        this.participant = participant;
        this.session = session;
    }
    public Participant getParticipant() { return participant; }
    public Session getSession() { return session; }

    /*
    @Override
    public String toString() {
        return participant.getName() + " (" + session.getName() + ")";
    }*/
}
