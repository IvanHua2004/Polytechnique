#1.

# Creer une table virtuelle
# Justification: S'assurer que seulement les rows / lignes de types jeux soient partagees..

CREATE VIEW Produit_jeux AS  
    SELECT p.pid, p.cid, p.nom, p.prix, p.remise, p.quantity
        FROM Produit AS P
        JOIN Categorie AS C ON P.cid = C.cid
    WHERE c.type = "jeu"

#2. 
CREATE ROLE analystejeux
	   GRANT SELECT ON Produit_jeux TO analystejeux
	   GRANT analystejeux TO Mareme