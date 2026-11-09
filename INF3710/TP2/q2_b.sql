SELECT DISTINCT A.nom
FROM Acteur AS A
JOIN Personnage AS P1 ON A.acteurID = P1.acteurID
JOIN Film AS F ON F.filmID = P1.filmID
JOIN Personnage AS P2 ON A.acteurID = P2.acteurID
JOIN Recompense AS R ON R.filmID = P2.filmID
WHERE F.genre = 'Sci-Fi';