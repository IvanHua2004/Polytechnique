#include "nuages.h"

Nuages::Nuages() : strategieConstruction(nullptr) {}

void Nuages::ajouterNuage(const vector<string>& ids, vector<Point>& points) {
    for (int i = 0; i < 3; i++) {
        if (textures[i].empty()) {
            textures[i].insert(textures[i].end(), ids.begin(), ids.end());
            for (const string&  id : ids) {
                for (auto& p : points) {
                    if (p.getId() == id) {
                        p.setTexture(string(1, symboles[i]));
                        break;
                    }
                }
            }
            return;
        }
    }
}

const vector<string>& Nuages::getTexture1() const {
    return textures[0];
}

const vector<string>& Nuages::getTexture2() const {
    return textures[1];
}

const vector<string>& Nuages::getTexture3() const {
    return textures[2];
}

vector<string>* Nuages::getTextures()  {
    return textures;
}

void Nuages::setStrategieConstruction(const StrategieConstruction* strategie, vector<Point>& points) {
    strategieConstruction = strategie;
    if (strategieConstruction) {
        strategieConstruction->construireNuages(textures, points);
    }
};