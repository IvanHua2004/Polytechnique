package Part2;

import org.hamcrest.Matcher;

import static org.hamcrest.Matchers.*;

import java.util.Collection;
import java.util.List;

public class ListMatcher {
    static public <T> Matcher<Collection<T>> isListOf(T... items) {
        return allOf(
                (Matcher<? super Collection<T>>) containsInAnyOrder(items),
                hasSize(items.length)
        );
    }

    static public <T> Matcher<Collection<T>> isListOf(List<T> items) {
        return isListOf((T[]) items.toArray());
    }
}
