package Part1;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class AvlTreeTest {

    private AvlTree<Integer> avl;

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
        avl = new AvlTree<Integer>();
        avl.add(3);
        avl.add(1);
        avl.add(5);
        avl.add(0);
        avl.add(2);
        avl.add(4);
        avl.add(6);
    }

    public static String getInOrderOutput(AvlTree avl) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
        avl.printInOrder();
        return output.toString().trim();
    }

    @Test
    public void testAdd() {
        String expectedOutput = "0 1 2 3 4 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.add(7);
        expectedOutput = "0 1 2 3 4 5 6 7";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.add(8);
        expectedOutput = "0 1 2 3 4 5 6 7 8";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.add(-1);
        expectedOutput = "-1 0 1 2 3 4 5 6 7 8";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        assertThrows(RuntimeException.class, () -> {
            avl.add(0); // this value already exists in the tree
        });
    }

    @Test
    public void testRemove() {
        String expectedOutput = "0 1 2 3 4 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.remove(0);
        expectedOutput = "1 2 3 4 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.remove(5);
        expectedOutput = "1 2 3 4 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.remove(3);
        expectedOutput = "1 2 4 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.remove(7); // this value doesn't exist in the tree
        expectedOutput = "1 2 4 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));
    }

    @Test
    public void testBalance() {
        String expectedOutput = "0 1 2 3 4 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.remove(0);
        avl.remove(2);
        avl.remove(4);
        expectedOutput = "1 3 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        // re-balance the tree
        avl.add(2);
        expectedOutput = "1 2 3 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));

        avl.add(4);
        expectedOutput = "1 2 3 4 5 6";
        assertEquals(expectedOutput, getInOrderOutput(avl));
    }
}
