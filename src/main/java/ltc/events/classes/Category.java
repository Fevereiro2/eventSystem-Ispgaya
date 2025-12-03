package ltc.events.classes;

public class Category {
    private final int id;
    public final String name;

    private Category(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public static Category of(int id, String name) {
        return new Category(id, name);
    }
    public int getId() { return id; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return name;
    }
}
