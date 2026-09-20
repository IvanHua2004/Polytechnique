package Alphabet;

import java.util.ArrayList;
import java.util.HashMap;

public class Graph<ValueType> {
    private HashMap<ValueType, Integer> vertexMap;
    ArrayList<Vertex<ValueType>> vertices;
    private Integer nbVertex;

    public Graph() { // ← changed from default to public
        nbVertex = 0;
        vertices = new ArrayList<>();
        vertexMap = new HashMap<>();
    }

    public Vertex<ValueType> createVertex(ValueType value) {
        Integer pos = vertexMap.get(value);

        if (pos == null) {
            pos = nbVertex;
            vertexMap.put(value, pos);
            vertices.add(new Vertex<>(value));
            nbVertex++;
        }

        return vertices.get(pos);
    }

    public void connect(ValueType src, ValueType dst) {
        Vertex<ValueType> srcVertex = createVertex(src);
        Vertex<ValueType> dstVertex = createVertex(dst);

        srcVertex.connect(dstVertex);
    }
}
