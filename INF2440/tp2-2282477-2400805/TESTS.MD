# Librairie de tests unitaires Jest

La bibliothèque <a href="https://jestjs.io/">Jest</a> sera utilisée dans ce travail pratique. Pour exécuter les tests unitaires de jest, vous pouvez utiliser la commande `npm run test:unit` qui va exécuter vos tests dans le terminal. Notez que, initialement, certains tests échoueront si vous n'avez pas encore implémenté les fonctionnalités liées.

Les tests unitaires vous aideront à compléter une partie de votre travail. 

Notez que les tests fournis couvrent seulement une partie des fonctionnalités demandées dans l'énoncé. Vous devrez compléter votre code pour répondre à toutes les exigences fonctionnelles.

### Tests unitaires

Le fichier [books.test.js](./tests/books.test.js) contient des tests unitaires pour les fonctions du fichier [books.js](./src/assets/books.js). Si la transformation des fonctions en classes dans `books.js` est correcte, les tests devraient toujours passer sans problème.

Le fichier [utils.test.js](./tests/utils.test.js) contient des tests unitaires pour les fonctions du fichier [utils.js](./src/assets/utils.js). Vous devez compléter les fonctions dans `utils.js` pour que les tests passent. Notez que les tests couvrent la majorité, mais pas tous les cas limites des fonctions. Vous êtes libres à ajouter des tests supplémentaires si vous le souhaitez.

Le fichier [library.test.js](./tests/library.test.js) contient un test unitaire pour la fonction `formatRatings` du fichier [library.js](./src/assets/library.js). Ce test est un exemple d'utilisation du patron _Stratégie_ que vous aurez à utiliser dans votre travail pratique. Vous êtes libres à ajouter des tests supplémentaires pour valider le comportement de votre classe `Library`.

**Note** : Tous les tests fournis doivent passer lors de la remise.