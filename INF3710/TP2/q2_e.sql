SELECT A1.nom, A1.naissance
FROM Acteur AS A1, Acteur AS A2
WHERE A2.nom = 'Kate Winslet'
    AND A1.pays = A2.pays