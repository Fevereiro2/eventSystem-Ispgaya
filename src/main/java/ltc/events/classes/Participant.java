package ltc.events.classes;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;



public class Participant {
    private final String id;
    private final String name;
    private final String email;
    private final String phone;
    private final Types type;
    private final String password;
    private final boolean gender;
    private final String nif;
    private final Date birthdate;
    private final String photo;



    public Participant(String id, String name, String email, String phone, Types typesid, String password, boolean gender, String nif, Date birthdate, String photo) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.type = typesid;
        this.password = password;
        this.gender = gender;
        this.nif = nif;
        this.birthdate = birthdate;
        this.photo = photo;
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
                ),
                rs.getString("password"),
                rs.getBoolean("gender"),
                rs.getString("nif"),
                rs.getDate("birthdate"),
                rs.getString("photo")
        );
    }




    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public Types getType() { return type; }
    public String getPassword() { return password; }
    public boolean isGender() { return gender; }
    public String getNif() { return nif; }
    public Date getBirthdate() { return birthdate; }
    public String getPhoto() { return photo; }
    @Override
    public String toString() {
        return name;
    }
}
