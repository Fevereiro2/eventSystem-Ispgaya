package ltc.events.classes;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;

public class Participant {
    private final String id;
    private String name;
    private String email;
    private String phone;
    private Types type;
    private String password;
    private String gender;
    private String taxNumber;
    private Date birthdate;
    private String photo;

    public Participant(ResultSet rs) throws SQLException {
        this.id = rs.getString("participant_id");
        this.name = rs.getString("name");
        this.email = rs.getString("email");
        this.phone = rs.getString("phone");
        this.password = rs.getString("password");
        this.gender = rs.getString("gender");
        this.taxNumber = rs.getString("tax_number");
        this.birthdate = rs.getDate("birthdate");
        this.photo = rs.getString("photo");

        this.type = new Types(
                rs.getInt("types_id"),
                rs.getString("types_name")
        );
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getGender() { return gender; }
    public String getTaxNumber() { return taxNumber; }
    public Date getBirthdate() { return birthdate; }
    public String getPhoto() { return photo; }
    public Types getType() { return type; }

    // Setters para AccountScreens atualizar:
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setGender(String gender) { this.gender = gender; }
    public void setTaxNumber(String tax) { this.taxNumber = tax; }
    public void setBirthdate(Date birthdate) { this.birthdate = birthdate; }
    public void setPhoto(String photo) { this.photo = photo; }

    @Override
    public String toString() {
        return name;
    }
}
