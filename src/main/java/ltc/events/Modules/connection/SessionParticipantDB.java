package ltc.events.Modules.connection;

import ltc.events.Modules.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class SessionParticipantDB {

    public static int countBySession(int sessionId) {
        String sql = "SELECT COUNT(*) FROM session_participant WHERE session_id = ?";
        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, sessionId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.out.println("Erro ao contar participantes da sessao: " + e.getMessage());
        }
        return 0;
    }

    public static boolean isParticipantInSession(int sessionId, String participantId) {
        String sql = "SELECT 1 FROM session_participant WHERE session_id = ? AND participant_id = ?";
        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, sessionId);
            stmt.setInt(2, Integer.parseInt(participantId));
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.out.println("Erro ao verificar participante na sessao: " + e.getMessage());
            return false;
        }
    }

    public static void addParticipant(int sessionId, String participantId) throws SQLException {
        if (isParticipantInSession(sessionId, participantId)) {
            throw new SQLException("Ja inscrito nesta sessao.");
        }
        if (countBySession(sessionId) >= 20) {
            throw new SQLException("Sessao cheia (limite 20).");
        }

        String sql = "INSERT INTO session_participant (session_id, participant_id) VALUES (?, ?)";
        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, sessionId);
            stmt.setInt(2, Integer.parseInt(participantId));
            stmt.executeUpdate();
        }
    }

    public static int countDistinctParticipantsByEvent(int eventId) {
        String sql = """
            SELECT COUNT(DISTINCT sp.participant_id)
            FROM session_participant sp
            JOIN session_event se ON se.session_id = sp.session_id
            WHERE se.event_id = ?
        """;
        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, eventId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.out.println("Erro ao contar participantes do evento: " + e.getMessage());
        }
        return 0;
    }
}
