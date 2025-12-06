package ltc.events.Modules.connection;

import ltc.events.Modules.db;
import ltc.events.classes.Category;
import ltc.events.classes.Resources;
import ltc.events.classes.SessionResource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SessionResourceDB {

    private static void ensureTable(Connection conn) throws SQLException {
        try (Statement st = conn.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS session_resource (
                    session_id INTEGER NOT NULL,
                    resources_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    PRIMARY KEY (session_id, resources_id),
                    FOREIGN KEY (session_id) REFERENCES session(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
                    FOREIGN KEY (resources_id) REFERENCES resources(resources_id) ON UPDATE CASCADE ON DELETE CASCADE
                )
            """);
        }
    }

    private static Resources mapResource(ResultSet rs) throws SQLException {
        Category cat = null;
        if (rs.getObject("category_id") != null) {
            cat = Category.of(
                    rs.getInt("category_id"),
                    rs.getString("category_name")
            );
        }

        return new Resources(
                rs.getInt("resources_id"),
                rs.getString("name"),
                rs.getInt("total_quantity"),
                rs.getString("unitary_cost"),
                cat
        );
    }

    public static List<SessionResource> listBySession(int sessionId) {
        List<SessionResource> lista = new ArrayList<>();

        String sql = """
            SELECT sr.session_id,
                   sr.resources_id,
                   sr.quantity,
                   r.name,
                   r.quantity AS total_quantity,
                   r.unitary_cost,
                   r.category_id,
                   c.name AS category_name
            FROM session_resource sr
            JOIN resources r ON r.resources_id = sr.resources_id
            LEFT JOIN category c ON c.category_id = r.category_id
            WHERE sr.session_id = ?
            ORDER BY r.name
        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            ensureTable(conn);
            stmt.setInt(1, sessionId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                lista.add(new SessionResource(
                        sessionId,
                        mapResource(rs),
                        rs.getInt("quantity")
                ));
            }

        } catch (SQLException e) {
            System.out.println("Erro ao carregar recursos da sessao: " + e.getMessage());
        }

        return lista;
    }

    public static void replaceAssignments(int sessionId, Map<Integer, Integer> allocations) throws SQLException {
        try (Connection conn = db.connect()) {
            ensureTable(conn);

            try (PreparedStatement del = conn.prepareStatement("DELETE FROM session_resource WHERE session_id = ?")) {
                del.setInt(1, sessionId);
                del.executeUpdate();
            }

            if (allocations == null || allocations.isEmpty()) {
                return;
            }

            try (PreparedStatement ins = conn.prepareStatement("""
                    INSERT INTO session_resource (session_id, resources_id, quantity)
                    VALUES (?, ?, ?)
                """)) {
                for (var entry : allocations.entrySet()) {
                    Integer qty = entry.getValue();
                    if (qty == null || qty <= 0) continue;

                    ins.setInt(1, sessionId);
                    ins.setInt(2, entry.getKey());
                    ins.setInt(3, qty);
                    ins.addBatch();
                }
                ins.executeBatch();
            }
        }
    }

    private static int allocatedQuantity(Connection conn, int resourceId, Integer ignoreSessionId) throws SQLException {
        String sql = "SELECT SUM(quantity) FROM session_resource WHERE resources_id = ?"
                + (ignoreSessionId != null ? " AND session_id != ?" : "");

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, resourceId);
            if (ignoreSessionId != null) {
                stmt.setInt(2, ignoreSessionId);
            }
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    private static int resourceTotal(Connection conn, int resourceId) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("SELECT quantity FROM resources WHERE resources_id = ?")) {
            stmt.setInt(1, resourceId);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt("quantity") : 0;
        }
    }

    public static int availableQuantity(int resourceId, Integer sessionContextId) {
        try (Connection conn = db.connect()) {
            ensureTable(conn);
            int total = resourceTotal(conn, resourceId);
            int used = allocatedQuantity(conn, resourceId, sessionContextId);
            int available = total - used;
            return Math.max(0, available);
        } catch (SQLException e) {
            System.out.println("Erro ao calcular disponibilidade de recurso: " + e.getMessage());
            return 0;
        }
    }

    public static Map<Integer, Integer> mapBySession(int sessionId) {
        Map<Integer, Integer> mapa = new HashMap<>();
        String sql = "SELECT resources_id, quantity FROM session_resource WHERE session_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            ensureTable(conn);
            stmt.setInt(1, sessionId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                mapa.put(rs.getInt("resources_id"), rs.getInt("quantity"));
            }
        } catch (SQLException e) {
            System.out.println("Erro ao carregar mapa de recursos por sessao: " + e.getMessage());
        }

        return mapa;
    }
}
