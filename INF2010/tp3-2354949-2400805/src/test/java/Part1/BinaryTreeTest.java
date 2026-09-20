package Part1;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BinaryTreeTest {
    private BinaryTree<Integer> bt;

    /**
     *  Produces the following tree
     *               3
     *             /   \
     *           1      5
     *          / \    / \
     *         0   2  4   6
     */

    @BeforeEach
    public void setup() {
        BinaryNode<Integer> root = new BinaryNode<>(3);
        root.left = new BinaryNode<>(1);
        root.right = new BinaryNode<>(5);
        root.left.left = new BinaryNode<>(0);
        root.left.right = new BinaryNode<>(2);
        root.right.left = new BinaryNode<>(4);
        root.right.right = new BinaryNode<>(6);
        bt = new BinaryTree<>();
        bt.root = root;
    }

    @Test
    public void printPostOrder() {
        String expected = "0 2 1 4 6 5 3";
        ByteArrayOutputStream outContent = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outContent));
        bt.printPostOrder();
        assertEquals(expected, outContent.toString().trim());
    }

    @Test
    public void printPreOrder() {
        String expected = "3 1 0 2 5 4 6";
        ByteArrayOutputStream outContent = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outContent));
        bt.printPreOrder();
        assertEquals(expected, outContent.toString().trim());
    }

    @Test
    public void printInOrder() {
        String expected = "0 1 2 3 4 5 6";
        ByteArrayOutputStream outContent = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outContent));
        bt.printInOrder();
        assertEquals(expected, outContent.toString().trim());
    }
}
