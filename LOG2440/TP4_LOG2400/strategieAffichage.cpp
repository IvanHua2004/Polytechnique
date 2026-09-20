#include "strategieAffichage.h"

string AffichageTexture::getString(const Point& p) const {
    if (p.getTexture() == "") {
        return ".";
    }
    return p.getTexture();
}

string AffichageID::getString(const Point& p) const {
    std::string id = p.getId();
    return id;
}