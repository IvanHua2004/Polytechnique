import java.util.*;

public final class Interview {
    static class ElementInfo implements Comparable<ElementInfo> {
        int value;
        int listIndex;
        int elementIndex;

        public ElementInfo(int value, int listIndex, int elementIndex) {
            this.value = value;
            this.listIndex = listIndex;
            this.elementIndex = elementIndex;
        }

        @Override
        public int compareTo(ElementInfo other) {
            return Integer.compare(this.value, other.value);
        }
    }

    static public List<Integer> merge(List<List<Integer>> lists) {
        if (lists == null || lists.isEmpty()) {
            return Collections.emptyList();
        }

        PriorityQueue<ElementInfo> minHeap = new PriorityQueue<>();

        for (int i = 0; i < lists.size(); i++) {
            List<Integer> currentList = lists.get(i);
            if (currentList != null && !currentList.isEmpty()) {
                minHeap.add(new ElementInfo(currentList.getFirst(), i, 0));
            }
        }

        List<Integer> result = new ArrayList<>();

        while (!minHeap.isEmpty()) {
            ElementInfo smallest = minHeap.poll();
            result.add(smallest.value);

            List<Integer> currentList = lists.get(smallest.listIndex);

            if (smallest.elementIndex + 1 < currentList.size()) {
                minHeap.add(new ElementInfo(
                        currentList.get(smallest.elementIndex + 1),
                        smallest.listIndex,
                        smallest.elementIndex + 1
                ));
            }
        }

        return result;
    }
}