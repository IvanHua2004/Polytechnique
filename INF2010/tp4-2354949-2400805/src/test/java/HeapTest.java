import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

class HeapTest {
    @Test
    void startAtZeroIndex() throws Exception {
        ArrayList<Integer> heap = new ArrayList<>();

        int value = 1;
        Heap.push(heap, value);

        assertEquals(value, heap.get(0));
    }

    @Test
    void canContainDuplicates() {
        ArrayList<Integer> heap = new ArrayList<>();

        Heap.push(heap, 1);
        Heap.push(heap, 1);

        assertEquals(2, heap.size());

        heap = new ArrayList<>(List.of(1, 1));
        Heap.heapify(heap);

        assertEquals(2, heap.size());
    }

    @Test
    void popAscending() throws Exception {
        ArrayList<Integer> heap = IntStream.range(0, 7)
                .boxed()
                .collect(Collectors.toCollection(ArrayList::new));

        ArrayList<Integer> expected = new ArrayList<>(heap);

        pop(expected, heap, true);
    }

    @Test
    void popDescending() throws Exception {
        ArrayList<Integer> heap = IntStream.range(0, 7)
                .boxed()
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.reverse(heap);

        ArrayList<Integer> expected = new ArrayList<>(heap);

        pop(expected, heap, false);
    }

    @Test
    void pushAscending() throws Exception {
        List<Integer> inputs = IntStream.range(0, 7)
                .boxed()
                .collect(Collectors.toList());

        push(inputs, true);
    }

    @Test
    void pushDescending() throws Exception {
        List<Integer> inputs = IntStream.range(0, 7)
                .boxed()
                .collect(Collectors.toList());
        Collections.reverse(inputs);

        push(inputs, false);
    }

    @Test
    void heapifyAscending() throws Exception {
        List<Integer> inputs = IntStream.range(0, 7)
                .boxed()
                .collect(Collectors.toList());
        Collections.reverse(inputs);

        heapify(inputs, true);
    }

    @Test
    void heapifyDescending() throws Exception {
        List<Integer> inputs = IntStream.range(0, 7)
                .boxed()
                .collect(Collectors.toList());

        heapify(inputs, false);
    }

    @Test
    void heapSortAscending() throws Exception {
        ArrayList<Integer> data = new ArrayList<>(List.of(
                0, 2, 1, 3, 5, 6, 4
        ));

        ArrayList<Integer> expected = new ArrayList<>(data);
        Collections.sort(expected);

        heapSort(expected, data, true);
    }

    @Test
    void heapSortDescending() throws Exception {
        ArrayList<Integer> data = new ArrayList<>(List.of(
                6, 4, 5, 3, 1, 0, 2
        ));

        ArrayList<Integer> expected = new ArrayList<>(data);
        Collections.sort(expected, Collections.reverseOrder());

        heapSort(expected, data, false);
    }

    @Test
    void testPopComplexityWithBarometer() throws Exception {
        int increaseRate = 100;
        int maxSize = 10000;

        ArrayList<Double> Xs = new ArrayList<>();
        ArrayList<Double> Ys = new ArrayList<>();

        Random rnd = new Random();

        for (int listSize = increaseRate; listSize < maxSize; listSize += increaseRate) {
            ArrayList<MockValue> mockValues = rnd.ints(listSize, -listSize, listSize)
                    .boxed()
                    .sorted()
                    .map(MockValue::new)
                    .collect(Collectors.toCollection(ArrayList::new));

            ArrayList<MockValue> heap = new ArrayList<>(mockValues);

            for (int i = 0; i < listSize; ++i) {
                Heap.pop(heap);
            }

            // Count the barometer operation for complexity.
            int totalBarometer = 0;
            for (MockValue value : mockValues)
                totalBarometer += value.getBarometerCounter();

            Xs.add((double) listSize);
            Ys.add((double) totalBarometer);
        }

        // O(n log n) tends to O(n) when n is large, therefore we can use a linear test (R2)
        // Trend should be linear between input size and barometer => R2 ~= 1 => O(n)
        LinearRegression regression = new LinearRegression(Xs.toArray(new Double[0]), Ys.toArray(new Double[0]));
        assertEquals(1.0, regression.R2(), 0.01);
    }

    @Test
    void testPushComplexityWithBarometer() throws Exception {
        int increaseRate = 100;
        int maxSize = 10000;

        ArrayList<Double> Xs = new ArrayList<>();
        ArrayList<Double> Ys = new ArrayList<>();

        Random rnd = new Random();

        for (int listSize = increaseRate; listSize < maxSize; listSize += increaseRate) {
            List<MockValue> mockValues = rnd.ints(listSize, -listSize, listSize)
                    .boxed()
                    .sorted(Comparator.reverseOrder())
                    .map(MockValue::new)
                    .collect(Collectors.toList());

            ArrayList<MockValue> heap = new ArrayList<>();

            for (MockValue mock : mockValues) {
                Heap.push(heap, mock);
            }

            assertEquals(Collections.min(mockValues).getValue(), heap.get(0).getValue());

            // Count the barometer operation for complexity.
            int totalBarometer = 0;
            for (MockValue value : heap)
                totalBarometer += value.getBarometerCounter();

            Xs.add((double) listSize);
            Ys.add((double) totalBarometer);
        }

        // O(n log n) tends to O(n) when n is large, therefore we can use a linear test (R2)
        // Trend should be linear between input size and barometer => R2 ~= 1 => O(n)
        LinearRegression regression = new LinearRegression(Xs.toArray(new Double[0]), Ys.toArray(new Double[0]));
        assertEquals(1.0, regression.R2(), 0.01);
    }

    @Test
    void testHeapifyComplexityWithBarometer() {
        int increaseRate = 100;
        int maxSize = 10000;

        ArrayList<Double> Xs = new ArrayList<>();
        ArrayList<Double> Ys = new ArrayList<>();

        Random rnd = new Random();

        for (int listSize = increaseRate; listSize < maxSize; listSize += increaseRate) {
            List<MockValue> mockValues = rnd.ints(listSize, -listSize, listSize)
                    .boxed()
                    .map(MockValue::new)
                    .collect(Collectors.toList());

            ArrayList<MockValue> heap = new ArrayList<>(mockValues);
            Heap.heapify(heap);

            assertEquals(Collections.min(mockValues).getValue(), heap.get(0).getValue());

            int totalBarometer = 0;
            for (MockValue value : heap)
                totalBarometer += value.getBarometerCounter();

            Xs.add((double) listSize);
            Ys.add((double) totalBarometer);
        }

        // Trend should be linear between input size and barometer => R2 ~= 1 => O(n).
        LinearRegression regression = new LinearRegression(Xs.toArray(new Double[0]), Ys.toArray(new Double[0]));
        assertEquals(1.0, regression.R2(), 0.01);
    }

    void pop(ArrayList<Integer> expected, ArrayList<Integer> heap, boolean isMinHeap) throws Exception {
        int initialSize = expected.size();
        for (int i = 0; i < initialSize; ++i) {
            assertEquals(expected.get(i), Heap.pop(heap, comparator(isMinHeap)));

            if (i < initialSize - 1) {
                assertEquals(expected.get(i + 1), heap.get(0));
                assertEquals(initialSize - i - 1, heap.size());
            } else {
                assertTrue(heap.isEmpty());
            }
        }
    }

    void push(List<Integer> inputs, boolean isMinHeap) throws Exception {
        ArrayList<Integer> heap = new ArrayList<>();

        for (Integer input : inputs) {
            Heap.push(heap, input, comparator(isMinHeap));
        }

        assertEquals(inputs.size(), heap.size());
        validateInnerData(heap, isMinHeap);
    }

    void heapify(Collection<Integer> inputs, boolean isMinHeap) throws Exception {
        ArrayList<Integer> heap = new ArrayList<>(inputs);
        Heap.heapify(heap, comparator(isMinHeap));

        assertEquals(inputs.size(), heap.size());
        validateInnerData(heap, isMinHeap);
    }

    void heapSort(ArrayList<Integer> expected, ArrayList<Integer> data, boolean asc) throws Exception {
        Heap.sort(data, comparator(asc));
        assertIterableEquals(expected, data);
    }

    void validateInnerData(ArrayList<Integer> innerData, boolean isMinHeap) {
        if (innerData.size() != 7)
            throw new UnsupportedOperationException("validateinnerData only supports size of 7");

        // First level
        assertTrue(compare(innerData.get(0), innerData.get(1), isMinHeap));
        assertTrue(compare(innerData.get(0), innerData.get(2), isMinHeap));

        // Second level
        assertTrue(compare(innerData.get(1), innerData.get(3), isMinHeap));
        assertTrue(compare(innerData.get(1), innerData.get(4), isMinHeap));

        assertTrue(compare(innerData.get(2), innerData.get(5), isMinHeap));
        assertTrue(compare(innerData.get(2), innerData.get(6), isMinHeap));

    }

    boolean compare(Integer parent, Integer child, boolean isMinHeap) {
        return isMinHeap ? parent <= child : parent >= child;
    }

    static <T extends Comparable<? super T>> Comparator<T> comparator(boolean isMinHeap) {
        return isMinHeap ? Comparator.naturalOrder() : Comparator.reverseOrder();
    }
}

class MockValue implements Comparable<MockValue> {
    private int barometerCounter = 0;
    private final Integer value;

    public MockValue(Integer value) {
        this.value = value;
    }

    public int getBarometerCounter() {
        return barometerCounter;
    }

    public Integer getValue() {
        return value;
    }

    @Override
    public int compareTo(MockValue o) {
        ++barometerCounter;
        return value.compareTo(o.value);
    }
}