import java.io.DataInputStream;
import java.io.IOException;
import java.net.Socket;
import java.util.concurrent.atomic.AtomicBoolean;

public class ClientMessageReceiver extends Thread {
    private Socket socket;
    private DataInputStream in;
    private AtomicBoolean keepRunning;

    public ClientMessageReceiver(Socket socket, AtomicBoolean keepRunning) {
        this.socket = socket;
        this.keepRunning = keepRunning;
        try {
            this.in = new DataInputStream(socket.getInputStream());
        } catch (IOException e) {
            System.err.println("Erreur lors de la création du DataInputStream pour le récepteur de messages: " + e.getMessage());
            this.keepRunning.set(false); // Stop running if we can't get input stream
        }
    }

    @Override
    public void run() {
        try {
            while (keepRunning.get()) {
                if (in.available() > 0) { // Check if data is available to read without blocking
                    String message = in.readUTF();
                    System.out.println("\r" + message);
                    System.out.print("> "); 
                } else {
                    Thread.sleep(50);
                }
            }
        } catch (IOException e) {
            if (keepRunning.get()) { 
                System.err.println("Connexion au serveur perdue ou erreur de lecture: " + e.getMessage());
            }
        } catch (InterruptedException e) {
            System.err.println("Récepteur de messages interrompu.");
            Thread.currentThread().interrupt();
        } finally {
            System.out.println("Récepteur de messages arrêté.");
        }
    }
}