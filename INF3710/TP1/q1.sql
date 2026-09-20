-- Question 1 : Écrivez votre requête SQL ici
SELECT
    P.nom,
    P.generation,
    P.total_statistiques
FROM
    POKEMON AS P
WHERE
    P.type_principal LIKE 'Feu'

    