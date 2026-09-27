-- Question 2 : Écrivez votre requête SQL ici
SELECT P1.nom AS nom_base, P2.nom AS nom_evolution
FROM POKEMON AS P1
JOIN EVOLUTIONS AS E ON P1.id = E.pokemon_base_id
JOIN POKEMON AS P2 ON P2.id = E.pokemon_evolue_id
WHERE P1.type_principal = 'Feu';