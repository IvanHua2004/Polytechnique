package Part2;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

import static Part2.ListMatcher.*;

public class SolutionTest {
    @Nested
    class NoWildcard {
        @Test
        public void testEmpty() {
            assertThat(new Solution(List.of()).autocomplete(""), is(empty()));
        }

        @Test
        public void testEmptyWithPrefix() {
            assertThat(new Solution(List.of()).autocomplete("bla"), is(empty()));
        }

        @Test
        public void testExactResult() {
            assertThat(new Solution(List.of("cat", "dog", "bird")).autocomplete("cat"), isListOf("cat"));
        }

        @Test
        public void testMultipleResults() {
            assertThat(new Solution(List.of("cat", "dog", "cow")).autocomplete("c"), isListOf("cat", "cow"));
        }

        @Test
        public void testNoMatch() {
            assertThat(new Solution(List.of("cat", "dog", "bird")).autocomplete("fish"), is(empty()));
        }

        @Test
        public void testNoMatchPrefix() {
            assertThat(new Solution(List.of("cat", "dog", "bird")).autocomplete("f"), is(empty()));
        }

        @Test
        public void testPrefixMatch() {
            assertThat(new Solution(List.of("car", "card", "care", "dog")).autocomplete("car"), isListOf("car", "card", "care"));
        }

        @Test
        public void testLongerQueryThanWords() {
            assertThat(new Solution(List.of("cat", "dog")).autocomplete("caterpillar"), is(empty()));
        }

        @Test
        public void testEmptyPrefix() {
            assertThat(new Solution(List.of("cat", "dog")).autocomplete(""), isListOf("cat", "dog"));
        }

        @Test
        public void testMultipleQueries() {
            Solution solution = new Solution(List.of("cat", "dog", "bird"));
            assertThat(solution.autocomplete("cat"), isListOf("cat"));
            assertThat(solution.autocomplete("dog"), isListOf("dog"));
            assertThat(solution.autocomplete("bird"), isListOf("bird"));
            assertThat(solution.autocomplete(""), isListOf("cat", "dog", "bird"));
        }

        @Test
        public void testDuplicatesInDictionary() {
            assertThat(new Solution(List.of("cat", "cat")).autocomplete(""), isListOf("cat"));
        }
    }

    @Nested
    class WithWildcard {
        @Test
        public void testLastLetter() {
            assertThat(new Solution(List.of("car", "cat", "cage", "dog")).autocomplete("ca."), isListOf("car", "cat", "cage"));
        }

        @Test
        public void testWildcardAtEnd() {
            assertThat(new Solution(List.of("bat", "bath", "batman")).autocomplete("bat."), isListOf("bath", "batman"));
        }

        @Test
        public void testFirstLetter() {
            assertThat(new Solution(List.of("cat", "rat", "bat", "hater", "unrelated")).autocomplete(".at"), isListOf("cat", "rat", "bat", "hater"));
        }

        @Test
        public void testMiddleLetter() {
            assertThat(new Solution(List.of("cat", "cot", "cut", "dog")).autocomplete("c.t"), isListOf("cat", "cot", "cut"));
        }

        @Test
        public void testMultipleWildcards() {
            assertThat(new Solution(List.of("cat", "hater", "but", "dog")).autocomplete("..t"), isListOf("cat", "hater", "but"));
        }

        @Test
        public void testOnlyWildcards() {
            assertThat(
                    new Solution(List.of("cats", "dogs", "birds", "pneumonoultramicroscopicsilicovolcanoconiosis")).autocomplete("....."),
                    isListOf("birds", "pneumonoultramicroscopicsilicovolcanoconiosis")
            );
        }

        @Test
        public void testWildcardNoMatch() {
            assertThat(new Solution(List.of("cat", "dog")).autocomplete("d.g"), isListOf("dog"));
            assertThat(new Solution(List.of("cat", "dog")).autocomplete("d.."), isListOf("dog"));
            assertThat(new Solution(List.of("cat", "dog")).autocomplete("z.."), is(empty()));
        }

        @Test
        public void testSingleWildcard() {
            assertThat(new Solution(List.of("cat", "dog")).autocomplete("."), isListOf("cat", "dog"));
        }
    }

    @Nested
    class Many {
        private static final List<String> alphabet = IntStream.range('a', 'z' + 1).mapToObj(ord -> Character.toString((char) ord)).toList();

        private static List<String> cartesianProduct(List<String> a, List<String> b) {
            return a.stream().flatMap(prefix -> b.stream().map(suffix -> prefix + suffix)).toList();
        }

        private static List<String> power(List<String> letters, int n) {
            assert n >= 1;

            List<String> result = new ArrayList<>(letters);
            for (int i = 1; i < n; i++) {
                result = cartesianProduct(result, letters);
            }

            return result;
        }

        @Test
        public void testLargeDictionaryNoWildcard() {
            List<String> dict = power(alphabet, 5); // "aaaaa", "aaaab", ...
            assertThat(new Solution(dict).autocomplete("aaaa"), isListOf(cartesianProduct(List.of("aaaa"), alphabet)));
        }

        @Test
        public void testLargeDictionaryWithWildcard() {
            List<String> dict = power(alphabet, 5); // "aaaaa", "aaaab", ...
            assertThat(new Solution(dict).autocomplete("....."), hasSize(dict.size()));
        }

        @Test
        public void testWildcardMultiplePositionsLargeInput() {
            List<String> dict = power(alphabet, 5); // "aaaaa", "aaaab", ...
            assertThat(new Solution(dict).autocomplete("a.b.c"), isListOf(
                    cartesianProduct(List.of("a"),
                            cartesianProduct(alphabet,
                                    cartesianProduct(List.of("b"),
                                            cartesianProduct(alphabet, List.of("c"))
                                    )
                            )
                    )
            ));
        }
    }
}
