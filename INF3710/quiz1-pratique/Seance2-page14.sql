SELECT DISTINCT A1.uid_suivi
FROM Abonnements AS A1
JOIN Abonnements AS A2 ON A1.uid_suiveur = A2.uid_suiveur
WHERE A1.uid_suivi != '123' AND A2.uid_suivi = '123' AND A1.uid_suiveur = A2.uid_suiveur