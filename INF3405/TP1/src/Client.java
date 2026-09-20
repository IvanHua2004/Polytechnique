import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicBoolean; // To safely share exit condition

public class Client {

    private static Socket socket;
    private static String serverAddress;
    private static int serverPort;
    private static String username;
    private static DataOutputStream out;
    private static AtomicBoolean keepRunning = new AtomicBoolean(true); // Flag to control receiver thread

    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        String userInput;

        try {
        	do {
                // Get and validate server IP
                do {
                    System.out.print("Entrez l'adresse IP du serveur: ");
                    userInput = scan.nextLine(); // Use nextLine() to read full line input
                } while (Utilities.parseIP(userInput) == null);
                serverAddress = userInput;

                // Get and validate server Port
                do {
                    System.out.print("Entrez le port du serveur: ");
                    userInput = scan.nextLine(); // Use nextLine()
                } while (Utilities.parsePort(userInput) == null);
                serverPort = Utilities.parsePort(userInput);
        	} while (!login(scan));
            out = new DataOutputStream(socket.getOutputStream());

            // Start a separate thread for receiving messages
            ClientMessageReceiver messageReceiver = new ClientMessageReceiver(socket, keepRunning);
            messageReceiver.start();

            System.out.println("Connecté au serveur. Tapez \\exit pour quitter.");
            System.out.println("Vous pouvez commencer à clavarder!");

            // Main loop for sending messages
            while (keepRunning.get()) { // Check if we should continue sending
                System.out.print("> ");
                String messageToSend = scan.nextLine(); // Use nextLine to read full messages

                if (messageToSend.trim().isEmpty()) { // Don't send empty messages
                    continue;
                }

                if (messageToSend.equals("\\exit")) {
                    keepRunning.set(false); // Signal receiver thread to stop
                    out.writeUTF(messageToSend); // Send exit command to server
                    break;
                } else {
                    // THIS IS WHERE THE MESSAGE IS SENT
                    if (messageToSend.length() > 200) {
                        System.err.println("Erreur: Message trop long (max 200 caractères).");
                        continue;
                    }
                    out.writeUTF(messageToSend); 
                }
            }

        } catch (IOException e) {
            if (keepRunning.get()) {
                System.err.println("Erreur de connexion au serveur ou de communication inattendue: " + e.getMessage());
            } else {
                System.out.println("Déconnexion du serveur.");
            }
        } finally {
            try {
                // Ensure socket and scanner are closed
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
                scan.close();
                System.out.println("Connexion fermée.");
            } catch (IOException e) {
                System.err.println("Erreur lors de la fermeture de la connexion: " + e.getMessage());
            }
        }
    }

    public static boolean login(Scanner scan) throws IOException {
    	boolean isAuthenticated = false;
    	int nEssais = 0;
        System.out.println("Début de tentative d'authentification...");

        while (!isAuthenticated && nEssais != 5) {
            try {
                // Connect to the server for each login attempt
                socket = new Socket(serverAddress, serverPort);
                DataOutputStream loginOut = new DataOutputStream(socket.getOutputStream());
                DataInputStream loginIn = new DataInputStream(socket.getInputStream());

                System.out.print("Entrez votre nom d'utilisateur: ");
                username = scan.nextLine(); // Use nextLine to read full line
                System.out.print("Entrez votre mot de passe: ");
                String password = scan.nextLine();

                loginOut.writeUTF(username);
                loginOut.writeUTF(password);

                isAuthenticated = loginIn.readBoolean(); // Server sends true if authenticated

                if (isAuthenticated) {
                    System.out.println(loginIn.readUTF()); // Read the welcome message/history prompt
                    // Server will now proceed to send chat history, if any, via the same socket
                } else {
                    System.err.println("Erreur dans la saisie du mot de passe ou nom d'utilisateur non valide.");
                    // Close the socket for this failed attempt
                    if (socket != null && !socket.isClosed()) {
                        socket.close();
                    }
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            } catch (IOException e) {
            	nEssais++;
                System.err.println("Impossible de se connecter au serveur (" + e.getMessage() + "). Essaie: " + nEssais + ". Réessayer.");
                
                // It's crucial to close the socket on failure to prevent resource leaks
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
                // Optional: add a small delay before retrying to prevent rapid failed attempts
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return (nEssais != 5);
    }

    public static String getUsername() {
        return username;
    }
}