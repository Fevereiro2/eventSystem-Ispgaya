package ltc.events.classes;

public class Types {
    private final int id;
    private final String name;

    public Types(int id, String name) {
        this.id = id;
        this.name = name;
    }
    public int getId() { return id; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return name;
    }
}


