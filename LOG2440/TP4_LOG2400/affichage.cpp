#include "affichage.h"
#include <cmath>
#include <iostream>
#include <sstream>
#include <algorithm>

using namespace std;

void Gestionnaire::tracerLigne(vector<vector<char>>& grille) {
    
    auto nuagesParTexture = nuages.getTextures();
    for (int n = 0; n < 3; ++n) {
        if (strategieConstruction) {
            auto& idsNuage  = nuagesParTexture[n];
            for (size_t i = 0; i < idsNuage.size(); ++i) {
                size_t nextIndex = (i + 1) % idsNuage.size();
                Point* p1 = nullptr;
                Point* p2 = nullptr;
                for (auto& p : points) {
                    if (p.getId() == idsNuage[i]) p1 = &p;
                    if (p.getId() == idsNuage[nextIndex]) p2 = &p;
                    if (p1 && p2) break;
                }
                if (!p1 || !p2) continue;
                int dx = p2->getX() - p1->getX();
                int dy = p2->getY() - p1->getY();
                double pente;

                // Si la ligne est verticale
                if (dx == 0) {
                    for (int j = 0; j <= abs(dy); ++j) {
                        int y = (p1->getY() < p2->getY()) ? p1->getY() + j : p1->getY() - j;
                        if (p2->getX() >= 0 && p2->getX() < LARGEUR && y >= 0 && y < HAUTEUR)
                            grille[y][p2->getX()] = '|';
                    }
                }
                // Si la ligne est horizontale
                else if (dy == 0) {
                    for (int j = 0; j <= abs(dx); ++j) {
                        int x = (p1->getX() < p2->getX()) ? p1->getX() + j : p1->getX() - j;
                        if (p2->getY() >= 0 && p2->getY() < HAUTEUR && x >= 0 && x < LARGEUR)
                            grille[p2->getY()][x] = '-';
                    }
                }

                // Si la ligne est diagonale
                else {
                    pente = (double) dy / dx;
                    for (int i = 0; i <= abs(dy); ++i) {
                        double t = (double)i / abs(dy);
                        // On fait une interpolation lineaire
                        int x = round(p1->getX() + t * (p2->getX() - p1->getX()));
                        int y = round(p1->getY() + t * (p2->getY() - p1->getY()));

                        int debut = 0, fin = 0;
                        if (abs(pente) < 0.4) {
                            debut = x-1;
                            fin = x+1;
                        } else if (abs(pente) < 0.8) {
                            debut = x-1;
                            fin = x;
                        } else {
                            debut = x;
                            fin = x;
                        }
                        for (int k = debut; k <= fin; ++k) {
                            if (k >= 0 && k < LARGEUR && y >= 0 && y < HAUTEUR) {
                                grille[y][k] = (pente > 0) ? '/' : '\\';
                            }
                        }
                    }
                }
            }
        }
        // Ajouter les points
        for (const Point& p : points) {
            int x = p.getX();
            int y = p.getY();
            string textures = strategieAffichage->getString(p);
            if (x >= 0 && x < LARGEUR && y >= 0 && y < HAUTEUR) {
                for (int i = 0; i < textures.length() && x < LARGEUR; i++) {
                    char texture = textures[i];
                    grille[y][x++] = texture;
                }
            }
        } 
    }
}

void Gestionnaire::imprimerGrille() {
    // On crée une grille.
    vector<vector<char>> grille(HAUTEUR, vector<char>(LARGEUR, ' '));

    // On trace une ligne entre le point 0 et 1.
    // TODO : Remplacer par un tracé selon la commande de l'utilisateur (c1 ou c2)
    tracerLigne(grille);


    // On imprime la grille.
    for (int y = HAUTEUR - 1; y >= 0; --y) {
        for (int x = 0; x < LARGEUR; ++x)
            cout << grille[y][x];
        cout << '\n';   
    }
}


void Gestionnaire::creerPoints(const string& ligne) {
    //vector<Point> points;
    // On crée un flux de lecture (istringstream) à partir de la chaîne ligne.
    istringstream iss(ligne);
    string token;
    // On lit chaque point de la ligne (séparé par des espaces).
    while (iss >> token) {
        // On vérifie que le point est entre parenthèses
        if (token.size() >= 3 && token.front() == '(' && token.back() == ')') {
            // On enlève les parenthèses au début et à la fin.
            token = token.substr(1, token.size() - 2);
            // On remplace la virgule par un espace.
            replace(token.begin(), token.end(), ',', ' ');
            // On crée un flux de lecture pour chaque point
            istringstream pair(token);
            int x, y;
            // On ajoute un point {x, y} au vecteur de points.
            if (pair >> x >> y) {
                points.push_back(Point(x, y));
            }
        }
    }
}

// Fonction pour afficher les points et les nuages
void Gestionnaire::afficherPoints() {
    cout << "\nListe:\n";
    for (const auto& p : points) {
        cout << p.getId() + ": ("
            + to_string(p.getX()) + ","
            + to_string(p.getY()) + ")   textures: '"
            + p.getTexture() + "'\n";
    }
}

void Gestionnaire::afficherNuages() {
    if (!nuages.getTexture1().empty()) {
        cout << "Nuage \"o\" contient les points: ";
        for (size_t i = 0; i < nuages.getTexture1().size(); ++i) {
            cout << nuages.getTexture1()[i];
            if (i != nuages.getTexture1().size() - 1) cout << ", ";
        }
        cout << "\n";
    }
    if (!nuages.getTexture2().empty()) {
        cout << "Nuage \"#\" contient les points: ";
        for (size_t i = 0; i < nuages.getTexture2().size(); ++i) {
            cout << nuages.getTexture2()[i];
            if (i != nuages.getTexture2().size() - 1) cout << ", ";
        }
        cout << "\n";
    }
    if (!nuages.getTexture3().empty()) {
        cout << "Nuage \"$\" contient les points: ";
        for (size_t i = 0; i < nuages.getTexture3().size(); ++i) {
            cout << nuages.getTexture3()[i];
            if (i != nuages.getTexture3().size() - 1) cout << ", ";
        }
        cout << "\n";
    }
}

// Fonction pour supprimer un point
void Gestionnaire::supprimerPoint() {
    string idSupprimer;
    cout << "ID du point a supprimer: ";
    cin >> idSupprimer;
    auto it = find_if(points.begin(), points.end(),
        [&](const Point& p) { return p.getId() == idSupprimer; });
    if (it == points.end()) {
        cout << "Erreur : ID invalide";
    }
    else {
        auto nuageParTexture = nuages.getTextures();
        for (int i = 0; i < 3; ++i) {
            auto& nuage = nuageParTexture[i];
            nuage.erase(remove(nuage.begin(), nuage.end(), idSupprimer), nuage.end());
        }
        points.erase(it);
    }
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

// Fonction pour déplacer un point
void Gestionnaire::deplacerPoint() {
    string idDeplacer;
    int nouveauX, nouveauY;
    cout << "ID du point a deplacer: ";
    cin >> idDeplacer;
    auto it = find_if(points.begin(), points.end(),
        [&](const Point& p) { return p.getId() == idDeplacer; });
    if (it == points.end()) {
        cout << "Erreur : ID invalide";
    }
    else {
        cout << "Nouvelle position (x y): ";
        if (!(cin >> nouveauX >> nouveauY)) {
            cout << "Erreur : Mauvaise coordonnees\n";
        }
        else {
            it->deplacerPoint(nouveauX, nouveauY);
        }
    }
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

// Fonction pour créer des nuages de points
void Gestionnaire::fusionnerPoints() {
    cout << "Entrez les IDs des points a fusionner (ex: 0 2 4) : ";
    string ligne;
    getline(cin >> ws, ligne);
    istringstream iss(ligne);
    string id;
    vector<string> ids;
    while (iss >> id) {
        auto it = find_if(points.begin(), points.end(),
            [&](const Point& p) { return p.getId() == id; });
        if (it != points.end()) ids.push_back(id);
        else {
            cout << "ID invalide: " << id << "\n";
        }
    }
    if (!ids.empty()) {
        nuages.ajouterNuage(ids, points);
    }
}

Gestionnaire::Gestionnaire() : strategieConstruction(nullptr), strategieAffichage(nullptr) {}

void Gestionnaire::setStrategieConstruction(std::unique_ptr<StrategieConstruction> strategie1) {
    strategieConstruction = move(strategie1);
    nuages.setStrategieConstruction(strategieConstruction.get(), points);
}

void Gestionnaire::setStrategieAffichage(unique_ptr<AffichageStrategie> strategie2) {
    strategieAffichage = move(strategie2);
}