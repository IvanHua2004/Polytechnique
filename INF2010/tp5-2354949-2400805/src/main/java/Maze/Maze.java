package Maze;

import java.util.*;
import java.util.stream.Collectors;

public class Maze {
    /**
     * Returns the distance of the shortest path within the maze
     * @param maze 2D table representing the maze
     * @return Distance of the shortest path within the maze, null if not solvable
     */
    public static Integer findShortestPath(ArrayList<ArrayList<Tile>> maze) {
        if (maze == null || maze.isEmpty() || maze.getFirst().isEmpty()) {
            return null; // Invalid maze
        }

        int rows = maze.size();
        int cols = maze.getFirst().size();

        ArrayList<int[]> exitTiles = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (maze.get(r).get(c) == Tile.Exit) {
                    exitTiles.add(new int[]{r, c});
                }
            }
        }

        if (exitTiles.size() < 2) {
            return null;
        }

        int minPathLength = Integer.MAX_VALUE;

        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int[] startExit : exitTiles) {
            int[][] distances = new int[rows][cols];
            for (int[] row : distances) {
                Arrays.fill(row, -1);
            }

            Queue<int[]> queue = new LinkedList<>();

            int startR = startExit[0];
            int startC = startExit[1];

            queue.offer(new int[]{startR, startC});
            distances[startR][startC] = 0;

            while (!queue.isEmpty()) {
                int[] current = queue.poll();
                int r = current[0];
                int c = current[1];

                if (maze.get(r).get(c) == Tile.Exit && (r != startR || c != startC)) {
                    minPathLength = Math.min(minPathLength, distances[r][c]);
                }

                for (int i = 0; i < 4; i++) {
                    int nr = r + dr[i];
                    int nc = c + dc[i];

                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        if (maze.get(nr).get(nc) != Tile.Wall && distances[nr][nc] == -1) {
                            distances[nr][nc] = distances[r][c] + 1;
                            queue.offer(new int[]{nr, nc});
                        }
                    }
                }
            }
        }

        if (minPathLength == Integer.MAX_VALUE) {
            return null;
        } else {
            return minPathLength;
        }
    }
}