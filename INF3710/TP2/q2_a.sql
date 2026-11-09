SELECT DISTINCT A.nom
FROM Recompense AS R 
JOIN Personnage as P ON R.filmID = P.filmID
JOIN Acteur AS A ON A.acteurID = P.acteurID
WHERE R.categorie = 'Best Picture'