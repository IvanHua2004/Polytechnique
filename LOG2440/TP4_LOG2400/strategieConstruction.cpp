#include "strategieConsutruction.h"
#include <algorithm>
#include <cmath>

void ConstructionCroissante::construireNuages(vector<string> (&textures)[3],
                                            vector<Point>& points) const {

    for (int i = 0; i < 3; ++i) {
        sort(textures[i].begin(), textures[i].end());
    }
}

void ConstructionMinimale::construireNuages(vector<string> (&textures)[3],
                                            vector<Point>& points) const {
    
    for (int i = 0; i < 3; ++i) {

        vector<string>& ids = textures[i];
        if (ids.size() < 2) continue;

        vector<string> tri;
        tri.push_back(ids[0]);
        ids.erase(ids.begin());

        while (!ids.empty()) {
            const string& comparaisonId = tri.back();

            auto it = min_element(ids.begin(), ids.end(), [&](const string& a, const string& b) {
                const Point* pa = nullptr;
                const Point* pb = nullptr;
                const Point* pComparaison = nullptr;
                for (const auto& p : points) {
                    if (p.getId() == a) pa = &p;
                    else if (p.getId() == b) pb = &p;
                    else if (p.getId() == comparaisonId) pComparaison = &p;
                }
                double distance1 = hypot(
                    pa->getX()-pComparaison->getX(),
                    pa->getY()-pComparaison->getY());
                double distance2 = hypot(
                    pb->getX()-pComparaison->getX(), 
                    pb->getY()-pComparaison->getY());

                return distance1 < distance2;
            });
            tri.push_back(*it);
            ids.erase(it);
        }
        ids = tri;
    }
}