(SELECT M.gid
FROM Membre AS M)
EXCEPT 
(SELECT M.gid
FROM Membre AS M 
JOIN Utilisateur AS U ON M.uid = U.uid
WHERE U.name = 'Leonardo')
