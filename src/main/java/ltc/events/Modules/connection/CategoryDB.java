package ltc.events.Modules.connection;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Category;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CategoryDB {

    public static ObservableList<Category> listAll() {
        ObservableList<Category> lista = FXCollections.observableArrayList();
        String sql = "SELECT category_id, name FROM category ORDER BY name";

        try (Connection conn = db.connect()) {

            ensureDefaults(conn);

            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

                while (rs.next()) {
                    lista.add(Category.of(
                            rs.getInt("category_id"),
                            rs.getString("name")
                    ));
                }
            }

        } catch (SQLException e) {
            System.out.println("Erro ao carregar categorias: " + e.getMessage());
        }

        return lista;
    }

    public static Category getById(int id) {
        String sql = "SELECT category_id, name FROM category WHERE category_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Category.of(
                        rs.getInt("category_id"),
                        rs.getString("name")
                );
            }
        } catch (SQLException e) {
            System.out.println("Erro ao obter categoria: " + e.getMessage());
        }

        return null;
    }

    private static void ensureDefaults(Connection conn) {
        String countSql = "SELECT COUNT(*) FROM category";
        String insertSql = "INSERT OR IGNORE INTO category (name) VALUES (?)";
        String[] defaults = new String[]{
                "Projetor",
                "Computador",
                "Hub/Router",
                "Sistema de Som",
                "Microfone",
                "Cabos/Adaptadores",
                "Mobiliario"
        };

        try (PreparedStatement count = conn.prepareStatement(countSql);
             ResultSet rs = count.executeQuery()) {
            if (rs.next() && rs.getInt(1) == 0) {
                try (PreparedStatement insert = conn.prepareStatement(insertSql)) {
                    for (String name : defaults) {
                        insert.setString(1, name);
                        insert.addBatch();
                    }
                    insert.executeBatch();
                }
            }
        } catch (SQLException e) {
            System.out.println("Erro ao garantir categorias por defeito: " + e.getMessage());
        }
    }
}
