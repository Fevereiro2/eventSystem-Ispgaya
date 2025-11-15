package ltc.events.classes;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Types {
    private final int id;
    private final String name;

    // Construtor normal
    public Types(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // 🔥 Construtor automático vindo da BD
    public Types(ResultSet rs) throws SQLException {
        this(
                rs.getInt("types_id"),
                rs.getString("name")
        );
    }

    public int getId() { return id; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return name;
    }
}
