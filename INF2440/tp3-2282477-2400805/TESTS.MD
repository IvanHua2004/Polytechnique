## Cypress et tests bout en bout (`e2e`)

La bibliothèque <a href="https://www.cypress.io/">Cypress</a> est utilisée dans ce travail pratique, tout comme le TP1. Pour exécuter l'ensemble des tests, vous avez la possibilité d'utiliser `npm run test`. En utilisant la commande `npm run test`, vous devriez voir une nouvelle fenêtre apparaître.

Plusieurs tests unitaire, d'intégration et d'acceptation vous sont fournis dans le répertoire [e2e](./tests/cypress/e2e/) pour vous aider à compléter votre travail. Les tests fournis sont les suivants :

- [Index](./tests/cypress/e2e/index.cy.js): suite de tests pour la page principale du site et l'interaction avec les éléments de la page.
- [Game](./tests/cypress/e2e/game.cy.js): suite de tests pour la page de jeu et l'interaction avec les éléments du jeu.
- [Results](./tests/cypress/e2e/results.cy.js): suite de tests pour la page des résultats et l'interaction avec les éléments de la page. Notez que vous devez implémenter au moins 2 tests dans cette suite.
- [E2E](./tests/cypress/e2e/e2e.cy.js): tests de bout en bout qui configure une partie de "2x2", joue la partie, puis vérifie que les résultats sont correctement affichés. Vous êtes responsables de compléter ce test. Utilisez les tests fournis pour vous aider dans la rédaction. Notez que le _mock_ de la fonction `window.prompt()` dans la page de jeu est déjà fait pour vous.

Ces tests vérifient les différents parties du travail à compléter. Il est fortement conseillé de bien les lire pour comprendre le fonctionnement attendu de l'application.

**Note** : les tests ont une certaine flexibilité. Les tests fournis ne couvrent pas 100% des requis du TP. Certains éléments seront évalués manuellement. Le test de bout en bout couvre que le cas d'utilisation principal de l'application.

## Jest et tests unitaires

La bibliothèque <a href="https://jestjs.io/">Jest</a> est également utilisée dans ce travail pratique. Pour exécuter les tests unitaires de jest, vous pouvez utiliser la commande `npm run test:unit` qui va exécuter vos tests dans le terminal.

Les tests unitaires pour la classe `StoreService` dans le fichier [storeService.spec.js](./tests/jest/storeService.test.js) vous sont fournis pour vous aider à implémenter la classe. Vous êtes responsables de compléter les tests pour les classes `ScoreManager` dans le fichier [scoreManager.spec.js](./tests/jest/scoreManager.test.js) et `GameManager` dans le fichier [gameManager.spec.js](./tests/jest/gameManager.test.js). Utilisez les tests fournis pour vous aider dans la rédaction.

## Correction de défauts dans le code

Le calcul des scores moyens dans la classe `ScoreManager` est incorrect. Vous devez identifier et corriger le problème dans le code. 

Vous devez écrire les tests qui permettent de trouver le problème et le corriger. Vous aurez à écrire des tests unitaires avec `Jest` et des tests d'interface avec `Cypress` pour la correction de ce défaut.


**Note** : Tous les tests fournis ou rédigés par vous doivent passer lors de la remise.