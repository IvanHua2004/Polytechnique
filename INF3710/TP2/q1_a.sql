SELECT DISTINCT cliID FROM Commande
WHERE montant_total > 300 AND
cliID NOT IN (SELECT cliID FROM Commande
    WHERE montant_total > 1000)