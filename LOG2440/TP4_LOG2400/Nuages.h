#ifndef NUAGES_H
#define NUAGES_H

#include <vector>
#include <string>
#include "point.h"  
#include "strategieConsutruction.h"

using namespace std;

class Nuages {
public:
    Nuages();
    const vector<string>& getTexture1() const;
    const vector<string>& getTexture2() const;
    const vector<string>& getTexture3() const;
    vector<string>* getTextures();
    void ajouterNuage(const vector<string>& ids, vector<Point>& points);
    void setStrategieConstruction(const StrategieConstruction* strategie, vector<Point>& points);
private: 
    char symboles[3] = { 'o', '#', '$' };
    vector<string> textures[3];
    const StrategieConstruction* strategieConstruction;
};

#endif 