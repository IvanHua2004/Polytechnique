package Part1;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class BinarySearchTreeTest {

    private BinarySearchTree<Integer> bst;

    /**
     *  Produces the following tree
     *               3
     *             /   \
     *           1      5
     *          / \    / \
     *         0   2  4   6
     */

    @BeforeEach
    public void setUp() {
        bst = new BinarySearchTree<>();
        bst.add(3);
        bst.add(1);
        bst.add(5);
        bst.add(0);
        bst.add(2);
        bst.add(4);
        bst.add(6);
    }

    @Test
    public void findMin() {
        assertEquals(0, (int) bst.findMin(bst.root).getValue());
        assertEquals(0, (int) bst.findMin(bst.root.left).getValue());
        assertEquals(2, (int) bst.findMin(bst.root.left.right).getValue());
        assertEquals(4, (int) bst.findMin(bst.root.right.left).getValue());
        assertNull(bst.findMin(null));
    }

    @Test
    public void findMax() {
        assertEquals(6, (int) bst.findMax(bst.root).getValue());
        assertEquals(2, (int) bst.findMax(bst.root.left).getValue());
        assertEquals(0, (int) bst.findMax(bst.root.left.left).getValue());
        assertEquals(6, (int) bst.findMax(bst.root.right).getValue());
        assertNull(bst.findMax(null));
    }

    @Test
    public void addAndContains() {
        assertTrue(bst.contains(3));
        assertTrue(bst.contains(1));
        assertTrue(bst.contains(5));
        assertTrue(bst.contains(0));
        assertTrue(bst.contains(2));
        assertTrue(bst.contains(4));
        assertTrue(bst.contains(6));
        assertFalse(bst.contains(-1));
        assertFalse(bst.contains(7));
    }

    @Test
    public void remove() {
        // Remove a node that doesn't exist
        bst.remove(1234);
        assertNotNull(bst.root);

        assertTrue(bst.contains(0));
        assertTrue(bst.contains(2));
        assertTrue(bst.contains(4));
        assertTrue(bst.contains(6));

        // Remove a node with no children
        bst.remove(0);
        assertFalse(bst.contains(0));

        // Remove a node with one child
        bst.remove(1);
        assertFalse(bst.contains(1));

        // Remove a node with two children
        bst.remove(5);
        assertFalse(bst.contains(5));

        // Remove the root node
        bst.remove(3);
        assertFalse(bst.contains(3));
    }

}
