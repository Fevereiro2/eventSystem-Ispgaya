package ltc.events.classes;

public class State {
    private final int id;
    private final String name;

    public State(int id, String name) {
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
