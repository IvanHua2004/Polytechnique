package Part1;

public class BinarySearchTree<T extends Comparable<T>> extends BinaryTree<T> implements Tree<T> {
    /**
     * Adds a new node with the specified data to the tree
     * @param data The data to be stored in the new node
     */
    @Override
    public void add(T data) {
        this.root = add(data, root);
    }

    /**
     * Adds a new node with the specified value to the specified subtree.
     * Tree does not contain duplicates and must throw a RuntimeException: "Value is duplicated"
     * @param value The value to be stored in the new node
     * @param currentNode The root of the subtree to add the new node to
     * @return The root of the modified subtree
     */
    protected BinaryNode<T> add(T value, BinaryNode<T> currentNode) {
        if (currentNode == null) {
            return new BinaryNode<>(value);
        }
        int cmp = value.compareTo(currentNode.value);
        if (cmp < 0) {
            currentNode.left = add(value, currentNode.left);
        } else if (cmp > 0) {
            currentNode.right = add(value, currentNode.right);
        } else {
            throw new RuntimeException("Value is duplicated");
        }
        return currentNode;
    }

    /**
     * Determines if the tree contains a node with the specified value
     * @param value The value to search for in the tree
     * @return True if the tree contains a node with the specified value, false otherwise
     */
    @Override
    public boolean contains(T value) {
        return contains(value, root);
    }

    /**
     * Determines if the specified subtree contains a node with the specified value
     * @param value The value to search for in the subtree
     * @param currentNode The root of the subtree to search
     * @return True if the subtree contains a node with the specified value, false otherwise
     */
    private boolean contains(T value, BinaryNode<T> currentNode) {
        if (currentNode == null) return false;
        int cmp = value.compareTo(currentNode.value);
        if (cmp < 0) {
            return contains(value, currentNode.left);
        } else if (cmp > 0) {
            return contains(value, currentNode.right);
        } else {
            return true;
        }
    }

    /**
     * Removes a node with the specified value from the tree
     * @param value The value of the node to be removed
     */
    @Override
    public void remove(T value) {
        this.root = remove(value, root);
    }

    /**
     * Removes a node with the specified value from the specified subtree
     * @param value The value of the node to be removed
     * @param currentNode The root of the subtree to remove the node from
     * @return The root of the modified subtree
     */
    protected BinaryNode<T> remove(T value, BinaryNode<T> currentNode) {
        if (currentNode == null) return null;

        int cmp = value.compareTo(currentNode.value);
        if (cmp < 0) {
            currentNode.left = remove(value, currentNode.left);
        } else if (cmp > 0) {
            currentNode.right = remove(value, currentNode.right);
        } else {
            // Node to delete found
            if (currentNode.left == null) return currentNode.right;
            if (currentNode.right == null) return currentNode.left;

            // Two children: replace with the smallest value from right subtree
            BinaryNode<T> minNode = findMin(currentNode.right);
            currentNode.value = minNode.value;
            currentNode.right = remove(minNode.value, currentNode.right);
        }
        return currentNode;
    }

    /**
     * Finds the node containing the minimum value in the subtree rooted at the given node
     * @param currentNode the root of the subtree to search for the minimum value
     * @return the node containing the minimum value in the subtree rooted at the given node, or null if the subtree is empty
     */
    protected BinaryNode<T> findMin(BinaryNode<T> currentNode) {
        if (currentNode == null) return null;
        while (currentNode.left != null) {
            currentNode = currentNode.left;
        }
        return currentNode;
    }

    /**
     * Finds the node containing the maximum value in the subtree rooted at the given node
     * @param currentNode the root of the subtree to search for the maximum value
     * @return the node containing the maximum value in the subtree rooted at the given node, or null if the subtree is empty
     */
    protected BinaryNode<T> findMax(BinaryNode<T> currentNode) {
        if (currentNode == null) return null;
        while (currentNode.right != null) {
            currentNode = currentNode.right;
        }
        return currentNode;
    }
}
