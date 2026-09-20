public class ChatMessage {
    private String senderUsername;
    private String messageContent;
    private String clientIp;
    private int clientPort;
    private String timestamp;

    public ChatMessage(String senderUsername, String messageContent, String clientIp, int clientPort, String timestamp) {
        this.senderUsername = senderUsername;
        this.messageContent = messageContent;
        this.clientIp = clientIp;
        this.clientPort = clientPort;
        this.timestamp = timestamp;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public String getClientIp() {
        return clientIp;
    }

    public int getClientPort() {
        return clientPort;
    }

    public String getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return String.format("[%s - %s:%d - %s]: %s",
                senderUsername, clientIp, clientPort, timestamp, messageContent);
    }
}