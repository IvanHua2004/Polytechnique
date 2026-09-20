import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;
import java.lang.reflect.Type;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

public class Server {
    private static ServerSocket Listener;
    private static final String USERS_DB_PATH = "database/utilisateurs.json";
    private static final String CHAT_HISTORY_PATH = "database/chat_history.json";

    // Use synchronized lists for thread-safe access
    private static List<ClientHandler> connectedClients = Collections.synchronizedList(new ArrayList<>());
    private static ArrayList<ChatMessage> chatHistory = new ArrayList<>(); // Stores all messages for persistence

    public static void main(String[] args) throws Exception {
        Scanner scan = new Scanner(System.in);
        String userInput;

        // Initialize database files at server startup
        initUserDatabase();
        loadChatHistory(); // Load existing chat history

        // Get and validate server IP
        String serverAddress;
        do {
            System.out.print("Entrez l'adresse IP du serveur: ");
            userInput = scan.next();
        } while ((serverAddress = Utilities.parseIP(userInput)) == null);

        // Get and validate server Port
        Integer serverPort;
        do {
            System.out.print("Entrez le port du serveur: ");
            userInput = scan.next();
        } while ((serverPort = Utilities.parsePort(userInput)) == null);

        // Create the server socket
        Listener = new ServerSocket();
        Listener.setReuseAddress(true); // Allows the server to bind to the same address if it was recently closed
        InetAddress serverIP = InetAddress.getByName(serverAddress);
        Listener.bind(new InetSocketAddress(serverIP, serverPort));

        System.out.format("Le serveur écoute sur %s:%d%n", serverAddress, serverPort);
        System.out.println("Attente de connexions clients...");

        try {
            int clientNumber = 0;
            while (true) {
                // accept() is blocking, waits for a new client connection
                new ClientHandler(Listener.accept(), clientNumber++).start();
            }
        } catch (IOException e) {
            System.err.println("Erreur du serveur: " + e.getMessage());
        } finally {
            // Ensure all resources are closed on server shutdown
            if (Listener != null && !Listener.isClosed()) {
                Listener.close();
            }
            saveChatHistory(); // Save chat history before shutting down
            scan.close();
            System.out.println("Serveur arrêté.");
        }
    }

    /**
     * Ensures the user database file exists and is initialized as an empty JSON array if new.
     */
    public static void initUserDatabase() {
        File dataFile = new File(USERS_DB_PATH);
        dataFile.getParentFile().mkdirs(); // Create parent directories if they don't exist

        if (!dataFile.exists() || dataFile.length() == 0) {
            try {
                dataFile.createNewFile();
                ArrayList<Utilisateur> emptyList = new ArrayList<>();
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                try (Writer writer = new FileWriter(USERS_DB_PATH)) {
                    gson.toJson(emptyList, writer);
                    System.out.println("Base de données utilisateurs initialisée: " + USERS_DB_PATH);
                }
            } catch (IOException e) {
                System.err.println("Erreur lors de la création/initialisation de la base de données utilisateurs: " + e.getMessage());
            }
        }
    }

    /**
     * Loads chat messages from the persistent storage.
     */
    private static void loadChatHistory() {
        File historyFile = new File(CHAT_HISTORY_PATH);
        historyFile.getParentFile().mkdirs(); // Ensure directory exists

        if (!historyFile.exists() || historyFile.length() == 0) {
            try {
                historyFile.createNewFile();
                // Initialize with an empty JSON array if file is new/empty
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                try (Writer writer = new FileWriter(CHAT_HISTORY_PATH)) {
                    gson.toJson(new ArrayList<ChatMessage>(), writer);
                    System.out.println("Fichier d'historique de chat initialisé: " + CHAT_HISTORY_PATH);
                }
            } catch (IOException e) {
                System.err.println("Erreur lors de la création/initialisation du fichier d'historique de chat: " + e.getMessage());
            }
            return; // No history to load if just created
        }

        Type typeListChatMessage = new TypeToken<ArrayList<ChatMessage>>() {}.getType();
        Gson gson = new Gson();
        try (Reader reader = new FileReader(CHAT_HISTORY_PATH)) {
            ArrayList<ChatMessage> loadedHistory = gson.fromJson(reader, typeListChatMessage);
            if (loadedHistory != null) {
                chatHistory = loadedHistory;
                System.out.println("Historique de chat chargé. Nombre de messages: " + chatHistory.size());
            }
        } catch (IOException e) {
            System.err.println("Erreur lors du chargement de l'historique de chat: " + e.getMessage());
        }
    }

    /**
     * Saves all chat messages to the persistent storage.
     */
    private static void saveChatHistory() {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        try (Writer writer = new FileWriter(CHAT_HISTORY_PATH)) {
            gson.toJson(chatHistory, writer);
            System.out.println("Historique de chat sauvegardé.");
        } catch (IOException e) {
            System.err.println("Erreur lors de la sauvegarde de l'historique de chat: " + e.getMessage());
        }
    }

    /**
     * Adds a ClientHandler to the list of currently connected clients.
     * @param clientHandler The handler to add.
     */
    public static void addConnectedClient(ClientHandler clientHandler) {
        connectedClients.add(clientHandler);
        System.out.println("Client connecté. Total: " + connectedClients.size());
    }

    /**
     * Removes a ClientHandler from the list of currently connected clients.
     * @param clientHandler The handler to remove.
     */
    public static void removeConnectedClient(ClientHandler clientHandler) {
        connectedClients.remove(clientHandler);
        System.out.println("Client déconnecté. Total: " + connectedClients.size());
    }

    /**
     * Adds a new chat message to the history and ensures persistence.
     * @param message The chat message to add.
     */
    public static void addChatMessage(ChatMessage message) {
        chatHistory.add(message);
        // Consider saving frequently or on a timer, or only on server shutdown
        // For simplicity, we'll just add to memory for now and save on shutdown.
        // For real-time persistence, you'd save here or debounce saves.
    }

    /**
     * Returns a copy of the current chat history.
     * @return An ArrayList of ChatMessage objects.
     */
    public static ArrayList<ChatMessage> getChatHistory() {
        return new ArrayList<>(chatHistory); // Return a copy to prevent concurrent modification issues
    }

    /**
     * Broadcasts a chat message to all currently connected clients.
     * @param message The ChatMessage object to broadcast.
     */
    public static void broadcastMessage(ChatMessage message) {
        String formattedMessage = message.toString();
        // Iterate over a copy of the list to avoid ConcurrentModificationException
        for (ClientHandler client : new ArrayList<>(connectedClients)) {
            try {
                client.sendMessage(formattedMessage);
            } catch (IOException e) {
                System.err.println("Erreur lors de l'envoi du message au client: " + client.getName() + " (" + e.getMessage() + ")");
                // If a client can't receive, it might be disconnected, remove it.
                // This removal is already handled by the ClientHandler's finally block
                // when it catches an IOException during read.
            }
        }
    }
}