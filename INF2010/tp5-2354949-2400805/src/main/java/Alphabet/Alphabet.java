package Alphabet;

import java.util.ArrayList;

public class Alphabet {

    public static ArrayList<Character> lexicalOrder(String[] dictionary) {
        ArrayList<Character> lexicalOrder = new ArrayList<>();
        Graph<Character> graph = new Graph<Character>();

        // Ajouter les caractères au graphe
        for (String word : dictionary) {
            for (int i = 0; i < word.length(); i++) {
                graph.createVertex(word.charAt(i));
            }
        }

        // Comparer les mots adjacents
        for (int i = 0; i < dictionary.length - 1; i++) {
            String word1 = dictionary[i];
            String word2 = dictionary[i + 1];
            int minLen = Math.min(word1.length(), word2.length());

            boolean foundDiff = false;
            for (int j = 0; j < minLen; j++) {
                char c1 = word1.charAt(j);
                char c2 = word2.charAt(j);
                if (c1 != c2) {
                    graph.connect(c1, c2);
                    foundDiff = true;
                    break;
                }
            }

            // Gérer ordre invalide, par exemple ["abc", "ab"]
            // (on s'attend à ce que "ab" précède "abc")
            if (!foundDiff && word1.length() > word2.length()) {
                return new ArrayList<>();
            }
        }

        // Algorithme de Kahn avec ArrayList comme file
        ArrayList<Vertex<Character>> queue = new ArrayList<>();

        for (Vertex<Character> vertex : graph.vertices) {
            if (vertex.indegree == 0) {
                queue.add(vertex);
            }
        }

        int index = 0;
        while (index < queue.size()) {
            Vertex<Character> current = queue.get(index);
            index++;
            lexicalOrder.add(current.label);

            for (Vertex<Character> neighbor : current.toVertex) {
                neighbor.indegree--;
                if (neighbor.indegree == 0) {
                    queue.add(neighbor);
                }
            }
        }

        // Vérifier pour des cycles
        if (lexicalOrder.size() != graph.vertices.size()) {
            return new ArrayList<>(); // Cycle ou input invalide
        }

        return lexicalOrder;
    }
}
