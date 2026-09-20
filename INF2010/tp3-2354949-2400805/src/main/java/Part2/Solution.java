package Part2;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Solution {

    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
    }

    private final TrieNode root = new TrieNode();
    private final int maxResults;

    // Constructeur sans limite (pour test large)
    public Solution(List<String> dictionary) {
        this(dictionary, Integer.MAX_VALUE); // Pas de limite par défaut ici
    }

    public Solution(List<String> dictionary, int maxResults) {
        this.maxResults = maxResults;
        for (String word : dictionary) {
            insert(word);
        }
    }

    private void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEndOfWord = true;
    }

    public List<String> autocomplete(String prefix) {
        List<String> results = new ArrayList<>();
        TrieNode node = root;
        StringBuilder path = new StringBuilder();

        // Parcourir le préfixe pour atteindre le nœud de départ
        int depth = 0;
        while (depth < prefix.length()) {
            char c = prefix.charAt(depth);
            if (c == '.') break; // Stop dès qu'on rencontre un joker
            TrieNode next = node.children.get(c);
            if (next == null) return results; // Pas de mot possible
            path.append(c);
            node = next;
            depth++;
        }

        // Lancer DFS en tenant compte que depth pointe sur premier '.' ou fin du préfixe
        dfsWithPrefix(node, prefix, depth, path, results);
        return results;
    }

    private void dfsWithPrefix(TrieNode node, String prefix, int depth, StringBuilder path, List<String> results) {
        if (node == null || results.size() >= maxResults) return;

        if (depth == prefix.length()) {
            // Le préfixe est entièrement parcouru, on complète les mots possibles à partir d'ici
            takeAllWords(node, path, results);
            return;
        }

        char c = prefix.charAt(depth);
        if (c == '.') {
            // Le joker correspond à n'importe quelle lettre parmi les enfants
            for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
                if (results.size() >= maxResults) break;
                path.append(entry.getKey());
                dfsWithPrefix(entry.getValue(), prefix, depth + 1, path, results);
                path.deleteCharAt(path.length() - 1);
            }
        } else {
            TrieNode next = node.children.get(c);
            if (next != null) {
                path.append(c);
                dfsWithPrefix(next, prefix, depth + 1, path, results);
                path.deleteCharAt(path.length() - 1);
            }
        }
    }

    private void takeAllWords(TrieNode node, StringBuilder path, List<String> results) {
        if (results.size() >= maxResults) return;

        if (node.isEndOfWord) {
            results.add(path.toString());
        }

        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            if (results.size() >= maxResults) break;
            path.append(entry.getKey());
            takeAllWords(entry.getValue(), path, results);
            path.deleteCharAt(path.length() - 1);
        }
    }
}
