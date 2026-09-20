public class Utilisateur {
    private String nom_;
    private String motDePasse_;

    public Utilisateur(String nom, String motDePasse) {
        this.nom_ = nom;
        this.motDePasse_ = motDePasse;
    }

    public String getNom() {
        return nom_;
    }

    public String getMotDePasse() {
        return motDePasse_;
    }
}