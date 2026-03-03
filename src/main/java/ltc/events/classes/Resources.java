package ltc.events.classes;

public class Resources {
    private final int id_resources;
    private final String nameresources;
    private final int quantity;
    private final String unitarycost; //atençao em passar de sting para int
    private final Category categoryid;

    public Resources(int id_resources, String nameresources, int quantity, String unitarycost, Category categoryid) {
        this.id_resources = id_resources;
        this.nameresources = nameresources;
        this.quantity = quantity;
        this.unitarycost = unitarycost;
        this.categoryid = categoryid;
    }

    public int getId_resources() { return id_resources; }
    public String getNameresources() { return nameresources; }
    public int getQuantity() {return quantity;}
    public String getUnitarycost() {return unitarycost;}
    public Category getCategoryid() {return categoryid;}
}
