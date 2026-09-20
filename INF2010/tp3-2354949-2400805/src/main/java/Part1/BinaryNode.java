package Part1;

public class BinaryNode<T extends Comparable<T>> {

    public BinaryNode<T> left = null;    // Pointer to the node on the left which should contain a value below this.value
    public BinaryNode<T> right = null;   // Pointer to the node on the right which should contain a value above this.value

    public int height = 0;

    public T value = null;

    /**
     * Constructs a new BinaryNode with the specified value
     * @param value The value to be stored in the node
     */
    public BinaryNode(T value) {
        this.value = value;
    }

    /**
     * Constructs a new BinaryNode with the specified value and height
     * @param value The value to be stored in the node
     * @param height The height of the node in the tree
     */
    public BinaryNode(T value, int height) {
        this(value);
        this.height = height;
    }

    /**
     * Gets the value of the node as an Integer
     * @return The value of the node as an Integer
     */
    public Integer getValue(){
        return (Integer) this.value;
    }
}