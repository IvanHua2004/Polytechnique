SELECT A1.nom
FROM Acteur AS A1, Acteur AS A2
JOIN Personnage AS P1 ON A1.acteurID = P1.acteurID
JOIN Personnage AS P2 ON A2.acteurID = P2.acteurID
JOIN Film AS F1 ON F1.filmID = P1.filmID
JOIN Film AS F2 ON F2.filmID = P2.filmID
WHERE A1.acteurID = A2.acteurID 
    AND F1.titre = 'Inception'
    AND F2.titre = 'Titanic'