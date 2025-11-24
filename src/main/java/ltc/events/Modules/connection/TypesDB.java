package ltc.events.Modules.con;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.Types;

import java.sql.*;

public class TypesDB {

    /**
     * Lista todos os tipos de utilizador (Admin, Moderador, Participante…)
     */
    public static ObservableList<Types> listAll() {
        ObservableList<Types> lista = FXCollections.observableArrayList();

        String sql = "SELECT * FROM types ORDER BY types_id";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                lista.add(new Types(rs));

            }

        } catch (SQLException e) {
            System.out.println("❌ Erro ao carregar tipos: " + e.getMessage());
        }

        return lista;
    }

    /**
     * Obtém um tipo pelo ID
     */
    public static Types getById(int id) {

        String sql = "SELECT types_id, name FROM types WHERE types_id = ?";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Types(
                        rs.getInt("types_id"),
                        rs.getString("name")
                );
            }

        } catch (Exception e) {
            System.out.println("Erro ao obter tipo por ID: " + e.getMessage());
        }

        return null; // caso não exista
    }

    public static ObservableList<Types> getAll() {
        ObservableList<Types> lista = FXCollections.observableArrayList();
        String sql = "SELECT types_id, name FROM types";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                lista.add(new Types(
                        rs.getInt("types_id"),
                        rs.getString("name")
                ));
            }

        } catch (Exception e) {
            System.out.println("Erro ao carregar tipos: " + e.getMessage());
        }

        return lista;
    }

}
