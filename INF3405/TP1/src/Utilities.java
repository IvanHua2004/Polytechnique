import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Utilities {

    /**
     * Parses and validates an IP address string.
     * An IP address is considered valid if it has four octets, and each octet
     * is a number between 0 and 255.
     *
     * @param ip The IP address string to validate.
     * @return The validated IP address string if valid, null otherwise.
     */
    public static String parseIP(String ip) {
        if (ip == null || ip.isEmpty()) {
            System.err.println("Erreur: L'adresse IP ne peut pas être vide.");
            return null;
        }
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            System.err.println("Erreur: L'adresse IP doit être composée de quatre octets (ex: 192.168.1.1).");
            return null;
        }
        for (String part : parts) {
            try {
                int val = Integer.parseInt(part);
                if (val < 0 || val > 255) {
                    System.err.println("Erreur: Chaque octet de l'adresse IP doit être entre 0 et 255.");
                    return null;
                }
            } catch (NumberFormatException e) {
                System.err.println("Erreur: Un octet de l'adresse IP n'est pas un nombre valide.");
                return null;
            }
        }
        return ip; // Valid IP
    }

    /**
     * Parses and validates a port number string.
     * A port is considered valid if it's an integer between 5000 and 5050.
     *
     * @param portStr The port number string to validate.
     * @return The validated port number if valid, null otherwise.
     */
    public static Integer parsePort(String portStr) {
        if (portStr == null || portStr.isEmpty()) {
            System.err.println("Erreur: Le numéro de port ne peut pas être vide.");
            return null;
        }
        try {
            int port = Integer.parseInt(portStr);
            if (port >= 5000 && port <= 5050) {
                return port;
            } else {
                System.err.println("Erreur: Le port doit être entre 5000 et 5050.");
                return null;
            }
        } catch (NumberFormatException e) {
            System.err.println("Erreur: Le port n'est pas un nombre valide.");
            return null;
        }
    }

    /**
     * Gets the current date and time formatted as "YYYY-MM-DD@HH:MM:SS".
     *
     * @return Formatted current date and time string.
     */
    public static String getCurrentTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd@HH:mm:ss");
        return now.format(formatter);
    }
}