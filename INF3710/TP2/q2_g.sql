SELECT R.nom
FROM Realisateur AS R 
JOIN Film AS F ON R.realisateurID = F.realisateurID
GROUP BY R.nom, R.realisateurID
HAVING COUNT(F.filmID) > 2 AND AVG(F.note) > 8.0