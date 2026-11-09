SELECT A.nom
FROM Acteur AS A
JOIN Personnage AS P ON A.acteurID = P.acteurID
GROUP BY A.nom, A.acteurID
HAVING COUNT(DISTINCT P.filmID) >= 2