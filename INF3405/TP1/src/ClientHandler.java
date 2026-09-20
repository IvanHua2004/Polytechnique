import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.lang.reflect.Type;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Collections; // For synchronized list

import com.google.gson.Gson;
import com.google.gson.GsonBuilder; // For pretty printing JSON
import com.google.gson.reflect.TypeToken;

public class ClientHandler extends Thread {
    private Socket socket;
    private int clientNumber;
    private String username;
    private DataOutputStream out;
    private DataInputStream in;
    private boolean isAuthenticated = false;
    private String clientIp;
    private int clientPort;

    private static final String USERS_DB_PATH = "database/utilisateurs.json";
    private static final String CHAT_HISTORY_PATH = "database/chat_history.json";

    public ClientHandler(Socket socket, int clientNumber) {
        this.socket = socket;
        this.clientNumber = clientNumber;
        this.clientIp = socket.getInetAddress().getHostAddress();
        this.clientPort = socket.getPort();
        System.out.println("Nouvelle connexion avec le client #" + clientNumber + " à " + socket);
    }

    public void run() {
        try {
            in = new DataInputStream(socket.getInputStream());
            out = new DataOutputStream(socket.getOutputStream());

            authenticateUser();

            if (isAuthenticated) {
                Server.addConnectedClient(this); // Add this handler to the list of connected clients
                sendChatHistory(); // Send the last 15 messages

                // Main loop for receiving messages from this client
                String clientMessage;
                while (true) {
                    clientMessage = in.readUTF(); // Blocking call, waits for client message

                    if (clientMessage.equals("\\exit")) {
                        System.out.println("Client #" + clientNumber + " (" + username + ") a demandé la déconnexion.");
                        break; // Exit the loop
                    }

                    if (clientMessage.length() > 200) {
                        out.writeUTF("Erreur: Votre message dépasse la limite de 200 caractères.");
                        continue;
                    }

                    // Create ChatMessage object
                    ChatMessage chatMessage = new ChatMessage(
                            username,
                            clientMessage,
                            clientIp,
                            clientPort,
                            Utilities.getCurrentTimestamp()
                    );

                    System.out.println(chatMessage.toString()); // Display on server console
                    Server.addChatMessage(chatMessage); // Store message on server
                    Server.broadcastMessage(chatMessage); // Broadcast to all clients
                }
            }
        } catch (IOException e) {
            // This often means the client disconnected unexpectedly
            System.err.println("Client #" + clientNumber + " (" + username + ") déconnecté ou erreur de communication: " + e.getMessage());
        } finally {
            try {
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
            } catch (IOException e) {
                System.err.println("Erreur lors de la fermeture du socket du client #" + clientNumber + ": " + e.getMessage());
            }
            Server.removeConnectedClient(this); // Remove this handler from the list
            System.out.println("Connexion avec le client #" + clientNumber + " fermée.");
        }
    }

    private void authenticateUser() throws IOException {
        String nom = in.readUTF();
        String motDePasse = in.readUTF();
        this.username = nom; // Set username for this handler

        isAuthenticated = verifyUser(nom, motDePasse);
        out.writeBoolean(isAuthenticated);

        if (isAuthenticated) {
            out.writeUTF("Bienvenue, " + username + " ! Vous êtes connecté.");
        } else {
            System.out.println("Tentative de connexion échouée pour " + nom + ".");
            // Socket will be closed in the finally block of run()
        }
    }

    private synchronized void sendChatHistory() throws IOException {
        ArrayList<ChatMessage> history = Server.getChatHistory();
        int startIndex = Math.max(0, history.size() - 15);
        for (int i = startIndex; i < history.size(); i++) {
            out.writeUTF(history.get(i).toString());
        }
    }

    public void sendMessage(String message) throws IOException {
        out.writeUTF(message);
    }

    // --- User Database Management ---
    private boolean verifyUser(String nom, String motDePasse) {
        ArrayList<Utilisateur> listeUtilisateurs = loadUsers();
        for (Utilisateur utilisateur : listeUtilisateurs) {
            if (utilisateur.getNom().equals(nom)) {
                if (utilisateur.getMotDePasse().equals(motDePasse)) {
                    System.out.println("Authentification réussie pour l'utilisateur: " + nom);
                    return true;
                } else {
                    System.out.println("Mot de passe incorrect pour l'utilisateur: " + nom);
                    return false;
                }
            }
        }
        System.out.println("Utilisateur '" + nom + "' n'existe pas. Création d'un nouveau compte.");
        addUser(nom, motDePasse);
        return true; // New user is always considered valid
    }

    private void addUser(String nom, String motDePasse) {
        ArrayList<Utilisateur> listeUtilisateurs = loadUsers();
        listeUtilisateurs.add(new Utilisateur(nom, motDePasse));

        Gson gson = new GsonBuilder().setPrettyPrinting().create(); // For readable JSON

        try (Writer writer = new FileWriter(USERS_DB_PATH)) {
            gson.toJson(listeUtilisateurs, writer);
            System.out.println("Compte '" + nom + "' créé et enregistré.");
        } catch (IOException e) {
            System.err.println("Erreur lors de l'ajout de l'utilisateur '" + nom + "': " + e.getMessage());
        }
    }

    private ArrayList<Utilisateur> loadUsers() {
        Type typeListeUtilisateur = new TypeToken<ArrayList<Utilisateur>>() {}.getType();
        Gson gson = new Gson();

        // Ensure the file exists and is initialized
        Server.initUserDatabase();

        try (Reader reader = new FileReader(USERS_DB_PATH)) {
            ArrayList<Utilisateur> users = gson.fromJson(reader, typeListeUtilisateur);
            return (users != null) ? users : new ArrayList<>(); // Return empty list if file is empty JSON
        } catch (IOException e) {
            System.err.println("Erreur lors du chargement des utilisateurs: " + e.getMessage());
            return new ArrayList<>(); // Return empty list on error
        }
    }
}