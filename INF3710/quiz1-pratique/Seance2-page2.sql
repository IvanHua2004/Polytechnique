SELECT DISTINCT G.name
FROM Membre AS M1
JOIN Membre AS M2 ON M1.gid = M2.gid
JOIN Utilisateur AS U1 ON U1.uid = M1.uid
JOIN Utilisateur AS U2 ON U2.uid = M2.uid
JOIN Groupe AS G ON M1.gid = G.gid
WHERE U1.name = "Leonardo Ouf" AND U2.name = "Raphael Ouch"