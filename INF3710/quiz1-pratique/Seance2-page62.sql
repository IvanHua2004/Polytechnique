SELECT
FROM Abonnements AS A1, Abonnements AS A2, Abonnements AS A3, Abonnements AS A4
WHERE A1.uid_suiveur != A2.uid_suiveur AND A1.uid_suiveur = A3