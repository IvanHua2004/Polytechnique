package Part1;

public interface Tree<T extends Comparable<T>> {

    void add(T data);

    boolean contains(T data);

    void remove(T data);
}
