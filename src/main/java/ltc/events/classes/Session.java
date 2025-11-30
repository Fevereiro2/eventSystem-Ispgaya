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

        // 1. Ler as datas como STRING para evitar o erro de parsing do driver SQLite
        String startDateString = rs.getString("initial_date");
        String finalDateString = rs.getString("finish_date");

        Timestamp startTimestamp = null;
        if (startDateString != null && !startDateString.isEmpty()) {
            try {
                // Tenta converter a string completa (funciona se a hora estiver presente)
                startTimestamp = Timestamp.valueOf(startDateString);
            } catch (IllegalArgumentException e) {
                // FALLBACK: Se falhar, é porque a hora está em falta (dados antigos).
                // Adicionamos " 00:00:00" para que a conversão funcione.
                // Não adicionamos System.err.println para manter a consola limpa.
                startTimestamp = Timestamp.valueOf(startDateString + " 00:00:00");
            }
        }

        Timestamp finalTimestamp = null;
        if (finalDateString != null && !finalDateString.isEmpty()) {
            try {
                finalTimestamp = Timestamp.valueOf(finalDateString);
            } catch (IllegalArgumentException e) {
                // FALLBACK
                finalTimestamp = Timestamp.valueOf(finalDateString + " 00:00:00");
            }
        }

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
                startTimestamp, // Usamos o valor convertido/fallback
                finalTimestamp // Usamos o valor convertido/fallback
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