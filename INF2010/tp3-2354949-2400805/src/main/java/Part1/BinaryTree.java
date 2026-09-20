package Part1;

public class BinaryTree<T extends Comparable<T>> {
    protected BinaryNode<T> root = null;

    /**
     * Prints the values of the binary tree in post-order traversal
     */
    public void printPostOrder() {
        printPostOrder(root);
    }

    /**
     * Recursively prints the values of the binary tree in post-order traversal
     * @param node the node to start the traversal from
     */
    private void printPostOrder(BinaryNode<T> node) {
        if (node == null) return;
        printPostOrder(node.left);
        printPostOrder(node.right);
        System.out.print(node.value + " ");
    }

    /**
     * Prints the values of the binary tree in pre-order traversal
     */
    public void printPreOrder() {
        printPreOrder(root);
    }

    /**
     * Recursively prints the values of the binary tree in pre-order traversal
     * @param node the node to start the traversal from
     */
    private void printPreOrder(BinaryNode<T> node) {
        if (node == null) return;
        System.out.print(node.value + " ");
        printPreOrder(node.left);
        printPreOrder(node.right);
    }

    /**
     * Prints the values of the binary tree in in-order traversal
     */
    public void printInOrder() {
        printInOrder(root);
    }

    /**
     * Recursively prints the values of the binary tree in in-order traversal
     * @param node the node to start the traversal from
     */
    private void printInOrder(BinaryNode<T> node) {
        if (node == null) return;
        printInOrder(node.left);
        System.out.print(node.value + " ");
        printInOrder(node.right);
    }
}
