package classes;

import java.security.Timestamp;

public class events {
    public int id;
    public String name;
    public String description;
    public String local;
    public Timestamp startdate;
    public Timestamp finaldate;
    public String[] state = {"Planeado", "Em Progresso", "Concluido", "Cancelado"};
    public String image;
}
