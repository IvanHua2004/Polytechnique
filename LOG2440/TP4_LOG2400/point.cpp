#include "point.h"

int Point::compteur = 0;

Point::Point(int px, int py) : x(px), y(py) {
    id = to_string(compteur++);
    texture = "";
}

void Point::deplacerPoint(int dx, int dy) {
    x = dx;
    y = dy;
}

int Point::getX() const {
    return x;
}

int Point::getY() const {
    return y;
}

string Point::getId() const {
    return id;
}

string Point::getTexture() const {
    return texture;
}

void Point::setTexture(const string& t) {
    texture += t;
}