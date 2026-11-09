SELECT DISTINCT A.nom
FROM Acteur AS A 
JOIN Personnage AS P ON P.acteurID = A.acteurID
JOIN Film AS F ON P.filmID = F.filmID
GROUP BY A.acteurID, A.nom
HAVING MIN(F.annee) > 2010;