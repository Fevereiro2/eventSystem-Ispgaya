package ltc.events.classes;

import java.sql.ResultSet;
import java.sql.SQLException;



public class Participant {
    private final String id;
    private final String name;
    private final String email;
    private final String phone;
    private final Types type;



    public Participant(String id, String name, String email, String phone, Types typesid) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.type = typesid;
    }

    public Participant(ResultSet rs) throws SQLException {
        this(
                rs.getString("participant_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("phone"),
                new Types(
                        rs.getInt("types_id"),
                        rs.getString("types_name")
                )
        );
    }




    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public Types getType() { return type; }
    @Override
    public String toString() {
        return name;
    }
}
