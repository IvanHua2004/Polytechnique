(SELECT cliID FROM Commande
WHERE montant_total <= 300)
UNION ALL
(SELECT cliID FROM Commande
WHERE montant_total >= 1200)