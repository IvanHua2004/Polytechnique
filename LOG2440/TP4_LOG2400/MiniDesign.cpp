#include "affichage.h"
#include "nuages.h"
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

int main(int argc, char* argv[]) {
    Gestionnaire gestionnaire;
    string args;
    // On accepte des points en entrée.
    if (argc > 1) {
        ostringstream oss;
        for (int i = 1; i < argc; ++i) oss << argv[i] << " ";
        args = oss.str();
    }
    else {
        cout << "Entrez les points au format (x,y) :\n> ";
        getline(cin, args);
    }

    // Voici des fonctions utiles pour réaliser le TP. 
    // TODO: Il faudrait les placer dans des classes appropriées.
    gestionnaire.creerPoints(args);

    // Ce sont différentes textures possibles. Seules les 2 premières sont utilisées dans les scénarios du TP.
    vector<char> texturesNuages = { 'o', '#', '$' };
    string cmd;

    // Menu
    while (true) {
        cout << "\nCommandes:\n"
            << "a  - Afficher les points et les nuages\n"
            << "o1 - Afficher l'orthèse avec les textures des points\n"
            << "o2 - Afficher l'orthèse avec les IDs des points\n"
            << "f  - Fusionner des points dans un nuage (et appliquer texture)\n"
            << "d  - Deplacer un point (ID)\n"
            << "s  - Supprimer un point (ID)\n"
            << "c1 - Créer les surfaces selon l'ordre des IDs\n"
            << "c2 - Créer les surfaces selon la distance minimale\n"
            << "q  - Quitter\n> ";
        getline(std::cin, cmd);
        if (cmd == "o1") {  
            gestionnaire.setStrategieAffichage(make_unique<AffichageTexture>());
            gestionnaire.imprimerGrille();
        }
        if (cmd == "o2") {
            gestionnaire.setStrategieAffichage(make_unique<AffichageID>());
            gestionnaire.imprimerGrille();
        }
        if (cmd == "f") gestionnaire.fusionnerPoints();
        if (cmd == "q") break;
        if (cmd == "a") {
            gestionnaire.afficherPoints();
            gestionnaire.afficherNuages();
        }
        if (cmd == "s") gestionnaire.supprimerPoint();
        if (cmd == "d") gestionnaire.deplacerPoint();
        if (cmd == "c1") gestionnaire.setStrategieConstruction(make_unique<ConstructionCroissante>());
        if (cmd == "c2") gestionnaire.setStrategieConstruction(make_unique<ConstructionMinimale>());
    }

    return 0;
}