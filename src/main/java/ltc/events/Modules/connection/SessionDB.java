package ltc.events.Modules.connection;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Participant;
import ltc.events.classes.Session;
import ltc.events.classes.Types;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Statement;
import java.util.List;

public class SessionDB {

    private static boolean ensureModeratorColumn(Connection conn) {
        try (PreparedStatement info = conn.prepareStatement("PRAGMA table_info(session)");
             ResultSet rs = info.executeQuery()) {
            boolean exists = false;
            while (rs.next()) {
                if ("moderator_id".equalsIgnoreCase(rs.getString("name"))) {
                    exists = true;
                    break;
                }
            }
            if (exists) return true;

            try (PreparedStatement alter = conn.prepareStatement("ALTER TABLE session ADD COLUMN moderator_id INTEGER")) {
                alter.executeUpdate();
                return true;
            } catch (SQLException ignored) {
                return false; // nao conseguimos adicionar, prosseguimos sem moderador
            }
        } catch (SQLException e) {
            System.out.println("Erro ao garantir coluna de moderador: " + e.getMessage());
            return false;
        }
    }

    /**
     * Devolve todas as sessoes associadas a um evento.
     */
    public static List<Session> getSessionsByEvent(int eventId) {
        ObservableList<Session> sessions = FXCollections.observableArrayList();
        String selectBase = """
            SELECT
                s.session_id,
                s.name,
                s.description,
                s.local,
                s.state AS state_id,
                s.state AS state_name,
                s.initial_date,
                s.finish_date
        """;
        String selectMod = """
                ,s.moderator_id,
                m.name AS moderator_name,
                m.email AS moderator_email,
                m.phone AS moderator_phone,
                m.types_id AS moderator_type_id,
                t.name AS moderator_type_name
        """;
        String fromBase = """
            FROM session s
            INNER JOIN session_event se ON se.session_id = s.session_id
        """;
        String joinMod = """
            LEFT JOIN participant m ON m.participant_id = s.moderator_id
            LEFT JOIN types t ON t.types_id = m.types_id
        """;
        String tail = """
            WHERE se.event_id = ?
            ORDER BY s.initial_date;
        """;

        try (Connection conn = db.connect()) {
            boolean hasMod = ensureModeratorColumn(conn);
            String sql = selectBase + (hasMod ? selectMod : "") + fromBase + (hasMod ? joinMod : "") + tail;
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, eventId);
                ResultSet rs = stmt.executeQuery();

                while (rs.next()) {
                    sessions.add(new Session(rs));
                }
            }
        } catch (SQLException e) {
            System.out.println("Erro ao obter sessoes do evento: " + e.getMessage());
        }

        return sessions;
    }

    /**
     * Cria uma sessao e liga ao evento.
     */
    public static Session createForEvent(int eventId,
                                         String name,
                                         String description,
                                         String local,
                                         Timestamp start,
                                         Timestamp finish,
                                         String state,
                                         Integer moderatorId) throws SQLException {
        String insertRelation = "INSERT INTO session_event (session_id, event_id) VALUES (?, ?)";
        Connection conn = db.connect();
        int newId;
        try {
            boolean hasMod = ensureModeratorColumn(conn);
            String insertSession = hasMod
                    ? "INSERT INTO session (name, description, local, initial_date, finish_date, state, moderator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                    : "INSERT INTO session (name, description, local, initial_date, finish_date, state) VALUES (?, ?, ?, ?, ?, ?, ?)";

            try (PreparedStatement ins = conn.prepareStatement(insertSession, Statement.RETURN_GENERATED_KEYS)) {
                ins.setString(1, name);
                ins.setString(2, description);
                ins.setString(3, local);
                ins.setString(4, start != null ? start.toLocalDateTime().toString() : null);
                ins.setString(5, finish != null ? finish.toLocalDateTime().toString() : null);
                ins.setString(6, state);
                if (hasMod) {
                    if (moderatorId != null) {
                        ins.setInt(8, moderatorId);
                    } else {
                        ins.setNull(8, java.sql.Types.INTEGER);
                    }
                }
                ins.executeUpdate();
                try (ResultSet rs = ins.getGeneratedKeys()) {
                    if (rs.next()) {
                        newId = rs.getInt(1);
                    } else {
                        try (PreparedStatement lastId = conn.prepareStatement("SELECT last_insert_rowid()")) {
                            try (ResultSet rsId = lastId.executeQuery()) {
                                if (!rsId.next()) throw new SQLException("Falha ao obter ID da sessao criada.");
                                newId = rsId.getInt(1);
                            }
                        }
                    }
                }
            }

            try (PreparedStatement link = conn.prepareStatement(insertRelation)) {
                link.setInt(1, newId);
                link.setInt(2, eventId);
                link.executeUpdate();
            }

            String fetch = """
                SELECT
                    s.session_id,
                    s.name,
                    s.description,
                    s.local,
                    s.state AS state_id,
                    s.state AS state_name,
                    s.initial_date,
                    s.finish_date
            """ + (hasMod ? """
                    ,s.moderator_id,
                    m.name AS moderator_name,
                    m.email AS moderator_email,
                    m.phone AS moderator_phone,
                    m.types_id AS moderator_type_id,
                    t.name AS moderator_type_name
            """ : "") + """
                FROM session s
            """ + (hasMod ? """
                LEFT JOIN participant m ON m.participant_id = s.moderator_id
                LEFT JOIN types t ON t.types_id = m.types_id
            """ : "") + """
                WHERE s.session_id = ?
            """;

            try (PreparedStatement f = conn.prepareStatement(fetch)) {
                f.setInt(1, newId);
                ResultSet rs = f.executeQuery();
                if (!rs.next()) throw new SQLException("Falha ao carregar sessao criada.");
                Session s = new Session(rs);
                ltc.events.Modules.util.LoggingUtil.log("SESSAO CRIADA: " + s.getName() + " (event " + eventId + ")");
                return s;
            }
        } finally {
            conn.close();
        }
    }

    public static Session getById(int sessionId) {
        String base = """
            SELECT
                s.session_id,
                s.name,
                s.description,
                s.local,
                s.state AS state_id,
                s.state AS state_name,
                s.initial_date,
                s.finish_date
        """;
        String mod = """
                ,s.moderator_id,
                m.name AS moderator_name,
                m.email AS moderator_email,
                m.phone AS moderator_phone,
                m.types_id AS moderator_type_id,
                t.name AS moderator_type_name
        """;
        String from = " FROM session s ";
        String join = """
            LEFT JOIN participant m ON m.participant_id = s.moderator_id
            LEFT JOIN types t ON t.types_id = m.types_id
        """;
        String tail = " WHERE s.session_id = ? ";

        try (Connection conn = db.connect()) {
            boolean hasMod = ensureModeratorColumn(conn);
            String sql = base + (hasMod ? mod : "") + from + (hasMod ? join : "") + tail;
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, sessionId);
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    return new Session(rs);
                }
            }
        } catch (SQLException e) {
            System.out.println("Erro ao obter sessao: " + e.getMessage());
        }
        return null;
    }

    public static void update(int sessionId,
                              String name,
                              String description,
                              String local,
                              Timestamp start,
                              Timestamp finish,
                              String state,
                              Integer moderatorId) throws SQLException {
        try (Connection conn = db.connect()) {
            boolean hasMod = ensureModeratorColumn(conn);
            String sql = hasMod
                    ? """
                        UPDATE session
                        SET name = ?, description = ?, local = ?, initial_date = ?, finish_date = ?, state = ?, moderator_id = ?
                        WHERE session_id = ?
                    """
                    : """
                        UPDATE session
                        SET name = ?, description = ?, local = ?, initial_date = ?, finish_date = ?, state = ?                        WHERE session_id = ?
                    """;

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, name);
                stmt.setString(2, description);
                stmt.setString(3, local);
                stmt.setString(4, start != null ? start.toLocalDateTime().toString() : null);
                stmt.setString(5, finish != null ? finish.toLocalDateTime().toString() : null);
                stmt.setString(6, state);
                if (hasMod) {
                    if (moderatorId != null) {
                        stmt.setInt(8, moderatorId);
                    } else {
                        stmt.setNull(8, java.sql.Types.INTEGER);
                    }
                    stmt.setInt(9, sessionId);
                } else {
                    stmt.setInt(8, sessionId);
                }
                stmt.executeUpdate();
            }
        }
    }

    public static void delete(int sessionId) throws SQLException {
        String delRel = "DELETE FROM session_event WHERE session_id = ?";
        String delRes = "DELETE FROM session_resource WHERE session_id = ?";
        String delSession = "DELETE FROM session WHERE session_id = ?";
        try (Connection conn = db.connect()) {
            try (PreparedStatement r = conn.prepareStatement(delRes)) {
                r.setInt(1, sessionId);
                r.executeUpdate();
            } catch (SQLException ignored) {
                // tabela pode nÇœo existir em bases antigas
            }
            try (PreparedStatement r = conn.prepareStatement(delRel)) {
                r.setInt(1, sessionId);
                r.executeUpdate();
            }
            try (PreparedStatement s = conn.prepareStatement(delSession)) {
                s.setInt(1, sessionId);
                s.executeUpdate();
            }
        }
    }
}
