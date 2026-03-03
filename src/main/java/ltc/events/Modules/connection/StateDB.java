package ltc.events.Modules.connection;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import ltc.events.Modules.db;
import ltc.events.classes.State;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class StateDB {

    public static ObservableList<State> listAll() {
        ObservableList<State> lista = FXCollections.observableArrayList();
        String sql = "SELECT state_id, name FROM state ORDER BY state_id";

        try (Connection conn = db.connect();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                lista.add(new State(
                        rs.getInt("state_id"),
                        rs.getString("name")
                ));
            }

        } catch (Exception e) {
            System.out.println("Erro ao carregar estados: " + e.getMessage());
        }

        return lista;
    }
}
