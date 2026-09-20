import java.util.*;

public class Heap {

    private static int parent(int childIndex) {
        return (childIndex - 1) / 2;
    }

    private static int left(int parentIndex) {
        return 2 * parentIndex + 1;
    }

    private static int right(int parentIndex) {
        return 2 * parentIndex + 2;
    }

    private static <T> void swap(ArrayList<T> heap, int firstIndex, int secondIndex) {
        T temp = heap.get(firstIndex);
        heap.set(firstIndex, heap.get(secondIndex));
        heap.set(secondIndex, temp);
    }

    private static <T> void percolateUp(ArrayList<T> heap, int childIndex, Comparator<? super T> comparator) {
        if (childIndex == 0) return;
        int parentIndex = parent(childIndex);
        if (comparator.compare(heap.get(childIndex), heap.get(parentIndex)) < 0) {
            swap(heap, childIndex, parentIndex);
            percolateUp(heap, parentIndex, comparator);
        }
    }

    private static <T extends Comparable<? super T>> void percolateUp(ArrayList<T> heap, int childIndex) {
        percolateUp(heap, childIndex, Comparator.naturalOrder());
    }

    private static <T> void percolateDown(ArrayList<T> heap, int parentIndex, int end, Comparator<? super T> comparator) {
        int leftIndex = left(parentIndex);
        int rightIndex = right(parentIndex);
        int smallest = parentIndex;

        if (leftIndex < end && comparator.compare(heap.get(leftIndex), heap.get(smallest)) < 0) {
            smallest = leftIndex;
        }

        if (rightIndex < end && comparator.compare(heap.get(rightIndex), heap.get(smallest)) < 0) {
            smallest = rightIndex;
        }

        if (smallest != parentIndex) {
            swap(heap, parentIndex, smallest);
            percolateDown(heap, smallest, end, comparator);
        }
    }

    private static <T extends Comparable<? super T>> void percolateDown(ArrayList<T> heap) {
        percolateDown(heap, 0, heap.size(), Comparator.naturalOrder());
    }

    private static <T extends Comparable<? super T>> void percolateDown(ArrayList<T> heap, int parentIndex, int end) {
        percolateDown(heap, parentIndex, end, Comparator.naturalOrder());
    }

    private static <T> void percolateDown(ArrayList<T> heap, Comparator<? super T> comparator) {
        percolateDown(heap, 0, heap.size(), comparator);
    }

    public static <T> void heapify(ArrayList<T> list, Comparator<? super T> comparator) {
        for (int i = parent(list.size() - 1); i >= 0; i--) {
            percolateDown(list, i, list.size(), comparator);
        }
    }

    public static <T extends Comparable<? super T>> void heapify(ArrayList<T> list) {
        for (int i = parent(list.size() - 1); i >= 0; i--) {
            percolateDown(list, i, list.size());
        }
    }

    public static <T> void push(ArrayList<T> heap, T element, Comparator<? super T> comparator) {
        heap.add(element);
        percolateUp(heap, heap.size() - 1, comparator);
    }

    public static <T extends Comparable<? super T>> void push(ArrayList<T> heap, T element) {
        heap.add(element);
        percolateUp(heap, heap.size() - 1);
    }

    public static <T> T pop(ArrayList<T> heap, Comparator<? super T> comparator) {
        if (heap.isEmpty()) return null;
        T min = heap.getFirst();
        T last = heap.removeLast();
        if (!heap.isEmpty()) {
            heap.set(0, last);
            percolateDown(heap, comparator);
        }
        return min;
    }

    public static <T extends Comparable<? super T>> void pop(ArrayList<T> heap) {
        if (heap.isEmpty()) return;
        T last = heap.removeLast();
        if (!heap.isEmpty()) {
            heap.set(0, last);
            percolateDown(heap);
        }
    }

    public static <T> void sort(ArrayList<T> list, Comparator<? super T> comparator) {
        heapify(list, comparator);
        for (int i = list.size() - 1; i > 0; i--) {
            swap(list, 0, i);
            percolateDown(list, 0, i, comparator);
        }
        Collections.reverse(list);
    }

    public static <T extends Comparable<? super T>> void sort(ArrayList<T> list) {
        sort(list, Comparator.naturalOrder());
    }
}
