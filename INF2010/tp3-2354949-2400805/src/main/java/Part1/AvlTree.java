package Part1;

import java.util.function.Function;

public class AvlTree<T extends Comparable<T>> extends BinarySearchTree<T> {

    @Override
    public void add(T value) {
        this.root = processNode(this.root, node -> addInternal(value, node), () -> new BinaryNode<>(value));
    }

    @Override
    public void remove(T value) {
        this.root = processNode(this.root, node -> removeInternal(value, node), () -> null);
    }

    private BinaryNode<T> addInternal(T value, BinaryNode<T> currentNode) {
        int cmp = value.compareTo(currentNode.value);
        if (cmp < 0) {
            currentNode.left = processNode(currentNode.left, node -> addInternal(value, node), () -> new BinaryNode<>(value));
        } else if (cmp > 0) {
            currentNode.right = processNode(currentNode.right, node -> addInternal(value, node), () -> new BinaryNode<>(value));
        } else {
            throw new RuntimeException("Valeur est dupliquée.");
        }

        return rebalance(currentNode);
    }

    private BinaryNode<T> removeInternal(T value, BinaryNode<T> currentNode) {
        int cmp = value.compareTo(currentNode.value);
        if (cmp < 0) {
            currentNode.left = processNode(currentNode.left, node -> removeInternal(value, node), () -> null);
        } else if (cmp > 0) {
            currentNode.right = processNode(currentNode.right, node -> removeInternal(value, node), () -> null);
        } else {
            // Node to delete found
            if (currentNode.left == null) return currentNode.right;
            if (currentNode.right == null) return currentNode.left;

            BinaryNode<T> min = findMin(currentNode.right);
            currentNode.value = min.value;
            currentNode.right = removeInternal(min.value, currentNode.right);
        }

        return rebalance(currentNode);
    }

    private BinaryNode<T> processNode(BinaryNode<T> node,
                                      Function<BinaryNode<T>, BinaryNode<T>> nonNullHandler,
                                      java.util.function.Supplier<BinaryNode<T>> nullHandler) {
        return (node == null) ? nullHandler.get() : nonNullHandler.apply(node);
    }

    private BinaryNode<T> rebalance(BinaryNode<T> node) {
        updateHeight(node);
        return balance(node);
    }

    protected BinaryNode<T> balance(BinaryNode<T> currentNode) {
        int balance = balanceFactor(currentNode);

        if (balance < -1) {
            if (balanceFactor(currentNode.left) > 0) {
                currentNode.left = rotateLeft(currentNode.left);
            }
            return rotateRight(currentNode);
        } else if (balance > 1) {
            if (balanceFactor(currentNode.right) < 0) {
                currentNode.right = rotateRight(currentNode.right);
            }
            return rotateLeft(currentNode);
        }

        return currentNode;
    }

    protected BinaryNode<T> rotateRight(BinaryNode<T> currentNode) {
        BinaryNode<T> newRoot = currentNode.left;
        currentNode.left = newRoot.right;
        newRoot.right = currentNode;

        updateHeight(currentNode);
        updateHeight(newRoot);

        return newRoot;
    }

    protected BinaryNode<T> rotateLeft(BinaryNode<T> currentNode) {
        BinaryNode<T> newRoot = currentNode.right;
        currentNode.right = newRoot.left;
        newRoot.left = currentNode;

        updateHeight(currentNode);
        updateHeight(newRoot);

        return newRoot;
    }

    private int balanceFactor(BinaryNode<T> node) {
        return getHeight(node.right) - getHeight(node.left);
    }

    private int getHeight(BinaryNode<T> node) {
        return node == null ? 0 : node.height;
    }

    private void updateHeight(BinaryNode<T> node) {
        node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
    }
}
