package ltc.events.classes;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Participant {
    private final String id;
    private String name;
    private String email;
    private String phone;
    private Types type;

    public Participant(ResultSet rs) throws SQLException {
        this.id = rs.getString("participant_id");
        this.name = rs.getString("name");
        this.email = rs.getString("email");
        this.phone = rs.getString("phone");

        this.type = new Types(
                rs.getInt("types_id"),
                rs.getString("types_name")
        );
    }

    // Construtor simples para criar um utilizador em memoria (ex.: sessao admin direta).
    public Participant(String id, String name, String email, String phone, Types type) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.type = type;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public Types getType() { return type; }

    // Setters para AccountScreens atualizar:
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }

    @Override
    public String toString() {
        return name;
    }
}
