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

        // 1. LER AS DATAS COMO STRING (para evitar o erro de parsing)
        String startDateString = rs.getString("initial_date");
        String finalDateString = rs.getString("finish_date");

        // Verificação de segurança (caso as strings estejam vazias ou nulas)
        Timestamp startTimestamp = null;
        if (startDateString != null && !startDateString.isEmpty()) {
            // 2. CONVERTER A STRING PARA TIMESTAMP
            // O SQLite tipicamente devolve o formato "YYYY-MM-DD HH:MM:SS.S" que Timestamp.valueOf() suporta.
            try {
                startTimestamp = Timestamp.valueOf(startDateString);
            } catch (IllegalArgumentException e) {
                // Se a string não for válida (ex: apenas a data sem a hora), pode ser necessário formatar:
                //System.err.println("Erro de formato de data no SQLite. A tentar adicionar a hora padrão.");
                startTimestamp = Timestamp.valueOf(startDateString + " 00:00:00");
            }
        }

        Timestamp finalTimestamp = null;
        if (finalDateString != null && !finalDateString.isEmpty()) {
            try {
                finalTimestamp = Timestamp.valueOf(finalDateString);
            } catch (IllegalArgumentException e) {
                //System.err.println("Erro de formato de data no SQLite. A tentar adicionar a hora padrão.");
                finalTimestamp = Timestamp.valueOf(finalDateString + " 00:00:00");
            }
        }

        this(
                rs.getInt("event_id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getString("local"),
                startTimestamp, // Usar o valor convertido
                finalTimestamp, // Usar o valor convertido
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