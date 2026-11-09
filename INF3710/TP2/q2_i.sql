SELECT A.nom, F.titre
FROM Acteur AS A
JOIN Personnage AS P ON P.acteurID = A.acteurID
JOIN Film AS F ON F.filmID = P.filmID
WHERE F.note = (
    SELECT MAX(F2.note)
    FROM Personnage AS P2
    JOIN Film AS F2 ON F2.filmID = P2.filmID
    WHERE P2.acteurID = A.acteurID
)