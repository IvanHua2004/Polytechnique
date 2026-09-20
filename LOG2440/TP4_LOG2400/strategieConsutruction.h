#pragma once
#include <string>
#include <vector>
#include "point.h"

using namespace std;

class StrategieConstruction {
public:
    virtual ~StrategieConstruction() = default;
    virtual void construireNuages(vector<string> (&textures)[3], vector<Point>& points) const = 0;
};

class ConstructionCroissante : public StrategieConstruction {
public:
    void construireNuages(vector<string> (&textures)[3], vector<Point>& points) const override;
};

class ConstructionMinimale : public StrategieConstruction {
public:
    void construireNuages(vector<string> (&textures)[3], vector<Point>& points) const override;
};

