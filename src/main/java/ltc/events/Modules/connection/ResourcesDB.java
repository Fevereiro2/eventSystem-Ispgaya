package ltc.events.Modules.connection;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Category;
import ltc.events.classes.Resources;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

public class ResourcesDB {

    public static ObservableList<Resources> listAll() {
        ObservableList<Resources> lista = FXCollections.observableArrayList();

        String sql = """
            SELECT r.resources_id,
                   r.name,
                   r.quantity,
                   r.unitary_cost,
                   r.category_id,
                   c.name AS category_name
            FROM resources r
            LEFT JOIN category c ON r.category_id = c.category_id
            ORDER BY r.name
        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Category cat = null;
                if (rs.getObject("category_id") != null) {
                    cat = Category.of(
                            rs.getInt("category_id"),
                            rs.getString("category_name")
                    );
                }

                lista.add(new Resources(
                        rs.getInt("resources_id"),
                        rs.getString("name"),
                        rs.getInt("quantity"),
                        rs.getString("unitary_cost"),
                        cat
                ));
            }
        } catch (SQLException e) {
            System.out.println("Erro ao carregar recursos: " + e.getMessage());
        }

        return lista;
    }

    public static Resources register(String name, int quantity, String unitaryCost, Category category) throws SQLException {
        String insertSql = """
            INSERT INTO resources (name, quantity, unitary_cost, category_id)
            VALUES (?, ?, ?, ?)
            RETURNING resources_id
        """;

        String fetchSql = """
            SELECT r.resources_id,
                   r.name,
                   r.quantity,
                   r.unitary_cost,
                   r.category_id,
                   c.name AS category_name
            FROM resources r
            LEFT JOIN category c ON r.category_id = c.category_id
            WHERE r.resources_id = ?
        """;

        Connection conn = db.connect();
        int newId;

        try (PreparedStatement insert = conn.prepareStatement(insertSql)) {
            insert.setString(1, name);
            insert.setInt(2, quantity);
            insert.setString(3, unitaryCost);

            if (category != null) {
                insert.setInt(4, category.getId());
            } else {
                insert.setNull(4, Types.INTEGER);
            }

            ResultSet rs = insert.executeQuery();
            if (!rs.next()) throw new SQLException("Erro ao criar recurso.");
            newId = rs.getInt("resources_id");
        }

        try (PreparedStatement fetch = conn.prepareStatement(fetchSql)) {
            fetch.setInt(1, newId);
            ResultSet rs = fetch.executeQuery();

            if (!rs.next()) throw new SQLException("Erro ao carregar recurso criado.");

            Category cat = null;
            if (rs.getObject("category_id") != null) {
                cat = Category.of(rs.getInt("category_id"), rs.getString("category_name"));
            }

            return new Resources(
                    rs.getInt("resources_id"),
                    rs.getString("name"),
                    rs.getInt("quantity"),
                    rs.getString("unitary_cost"),
                    cat
            );
        } finally {
            conn.close();
        }
    }

    public static void update(int id, String name, int quantity, String unitaryCost, Category category) throws SQLException {
        String sql = """
            UPDATE resources
            SET name = ?, quantity = ?, unitary_cost = ?, category_id = ?
            WHERE resources_id = ?
        """;

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setInt(2, quantity);
            stmt.setString(3, unitaryCost);

            if (category != null) {
                stmt.setInt(4, category.getId());
            } else {
                stmt.setNull(4, Types.INTEGER);
            }

            stmt.setInt(5, id);
            stmt.executeUpdate();
        }
    }

    public static void delete(int id) throws SQLException {
        String sql = "DELETE FROM resources WHERE resources_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }
}
