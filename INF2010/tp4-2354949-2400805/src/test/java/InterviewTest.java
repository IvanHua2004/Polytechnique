import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

class InterviewTest {

    @Test
    void testMergeWithEmptyListOfLists() {
        List<List<Integer>> lists = new ArrayList<>();
        List<Integer> expected = Collections.emptyList();
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    @SuppressWarnings("ConstantConditions")
    void testMergeWithNullListOfLists() {
        List<List<Integer>> lists = null;
        List<Integer> expected = Collections.emptyList();
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeWithSingleEmptyList() {
        List<List<Integer>> lists = new ArrayList<>();
        lists.add(Collections.emptyList());
        List<Integer> expected = Collections.emptyList();
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeWithListsContainingNull() {
        List<List<Integer>> lists = new ArrayList<>();
        lists.add(Arrays.asList(1, 3, 5));
        lists.add(null);
        lists.add(Arrays.asList(2, 4, 6));

        List<Integer> expected = Arrays.asList(1, 2, 3, 4, 5, 6);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }


    @Test
    void testMergeWithSingleNonEmptyList() {
        List<List<Integer>> lists = new ArrayList<>();
        lists.add(Arrays.asList(1, 2, 3, 4, 5));
        List<Integer> expected = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeTwoSortedLists() {
        List<List<Integer>> lists = Arrays.asList(
                Arrays.asList(1, 3, 5, 7),
                Arrays.asList(2, 4, 6, 8)
        );
        List<Integer> expected = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeMultipleSortedLists() {
        List<List<Integer>> lists = Arrays.asList(
                Arrays.asList(1, 5, 9),
                Arrays.asList(2, 6, 10),
                Arrays.asList(3, 7, 11),
                Arrays.asList(4, 8, 12)
        );
        List<Integer> expected = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeListsWithDifferentSizes() {
        List<List<Integer>> lists = Arrays.asList(
                Arrays.asList(1, 10),
                Arrays.asList(2, 3, 4),
                Arrays.asList(5, 6, 7, 8, 9)
        );
        List<Integer> expected = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeListsWithDuplicateElements() {
        List<List<Integer>> lists = Arrays.asList(
                Arrays.asList(1, 1, 2, 3),
                Arrays.asList(2, 3, 3, 4),
                Arrays.asList(0, 5, 5)
        );
        List<Integer> expected = Arrays.asList(0, 1, 1, 2, 2, 3, 3, 3, 4, 5, 5);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeListsWithNegativeNumbers() {
        List<List<Integer>> lists = Arrays.asList(
                Arrays.asList(-5, -3, 0),
                Arrays.asList(-10, -7, -2),
                Arrays.asList(-1, 1, 5)
        );
        List<Integer> expected = Arrays.asList(-10, -7, -5, -3, -2, -1, 0, 1, 5);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeListsWhereSomeAreEmpty() {
        List<List<Integer>> lists = Arrays.asList(
                Arrays.asList(1, 5),
                Collections.emptyList(),
                Arrays.asList(2, 6),
                Collections.emptyList(),
                Arrays.asList(3, 7)
        );
        List<Integer> expected = Arrays.asList(1, 2, 3, 5, 6, 7);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeListsWithSingleElementLists() {
        List<List<Integer>> lists = Arrays.asList(
                Collections.singletonList(5),
                Collections.singletonList(2),
                Collections.singletonList(8),
                Collections.singletonList(1)
        );
        List<Integer> expected = Arrays.asList(1, 2, 5, 8);
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }

    @Test
    void testMergeLargeNumberOfSmallLists() {
        List<List<Integer>> lists = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            lists.add(Arrays.asList(i * 2, i * 2 + 1));
        }
        List<Integer> expected = new ArrayList<>();
        for (int i = 0; i < 200; i++) {
            expected.add(i);
        }
        List<Integer> actual = Interview.merge(lists);
        assertThat(actual, is(expected));
    }
}