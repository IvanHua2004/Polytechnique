SELECT F.titre, COUNT(P.acteurID) AS nb_acteurs
FROM Film AS F   
JOIN Personnage AS P ON F.filmID = P.filmID
GROUP BY F.titre