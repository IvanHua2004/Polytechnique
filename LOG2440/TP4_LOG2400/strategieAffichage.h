#pragma once
#include <string>
#include <vector>
#include "point.h"

class AffichageStrategie {
public:
    virtual string getString(const Point& p) const = 0;
    virtual ~AffichageStrategie() = default;
};

class AffichageTexture : public AffichageStrategie {
public:
    string getString(const Point& p) const override;
};

class AffichageID : public AffichageStrategie {
public:
    string getString(const Point& p) const override;
};