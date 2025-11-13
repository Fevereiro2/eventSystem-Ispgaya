package ltc.events.classes;

public class category {
    private final int id;
    public final String name;

    private category(int id, String name) {
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
