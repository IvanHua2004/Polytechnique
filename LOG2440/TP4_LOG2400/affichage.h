#pragma once
#include <string>
#include <memory>
#include <vector>
#include "point.h"
#include "Nuages.h"
#include "strategieConsutruction.h"
#include "strategieAffichage.h"

const int LARGEUR = 30;
const int HAUTEUR = 20;

class Gestionnaire {

public:
    Gestionnaire();
    void setStrategieConstruction(unique_ptr<StrategieConstruction> strategie1);
    void setStrategieAffichage(unique_ptr<AffichageStrategie> strategie2);
    void creerPoints(const std::string& ligne);
    void tracerLigne(std::vector<std::vector<char>>& grille);
    void imprimerGrille();
    void afficherPoints();
    void afficherNuages();
    void supprimerPoint();
    void deplacerPoint();
    void fusionnerPoints();
private:
    vector<Point> points;
    Nuages nuages;
    unique_ptr<StrategieConstruction> strategieConstruction;
    unique_ptr<AffichageStrategie> strategieAffichage;
};

