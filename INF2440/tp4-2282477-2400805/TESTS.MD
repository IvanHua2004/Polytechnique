# Jest et tests unitaires

La bibliothèque <a href="https://jestjs.io/">Jest</a> est utilisée dans ce travail pratique. La librairie <a href="https://github.com/ladjs/supertest#readme">Supertest</a> sera également utilisée pour les tests des gestionnaires de routes HTTP de votre serveur.

Pour exécuter les tests unitaires de jest, vous pouvez utiliser la commande `npm run test` depuis le dossier `./server`.

Notez que les tests fournis couvrent seulement une partie des fonctionnalités demandées dans l'énoncé. Même si tous vos tests réussissent, cela ne constitue pas une assurance que toutes les fonctionnalités sont implémentées correctement. Fiez-vous au [README.MD](./README.MD) afin de vous assurer de répondre à toutes les exigences fonctionnelles.

## Tests des gestionnaires

Les tests unitaires dans [adminManager.test.js](./server/tests/adminManager.test.js), [imagesManager.test.js](./server/tests/imagesManager.test.js) et [fileSystemManager.test.js](./server/tests/fileSystemManager.test.js) vous sont fournis à titre d'exemples pour bien comprendre le fonctionnement du système.

Ces tests portent principalement sur la **logique interne** de l’application. Ils vérifient que les fonctions des gestionnaires produisent les bons résultats selon différentes conditions, sans impliquer le serveur HTTP. Leur objectif est d’assurer que le traitement des données et les opérations internes se comportent correctement.

## Tests de routes

Les tests dans [imagesRouter.test.js](./server/tests/imagesRouter.test.js) vous sont fournis.

Contrairement aux tests des gestionnaires, ces tests se concentrent sur les **routes HTTP** du serveur. Ils simulent de vraies requêtes envoyées au serveur et vérifient que les **réponses** sont conformes au comportement attendu. Ils permettent donc de valider l’intégration entre la logique interne et l’interface HTTP du serveur.

**Important**: Notez que les tests vérifient uniquement les routes qui vous sont fournies. Les routes que vous devez vous-même implémenter ne seront pas couvertes par ces tests.

## Tests fonctionnels

Étant donné que les tests fournis ne couvrent pas l'entièreté des fonctionnalités de votre application, il est important de valider par vous-même le fonctionnement de celles-ci tout au long de votre processus de développement.

Pour ce faire, vous pouvez utiliser les outils de développement de votre navigateur web pour vous aider à déboguer votre code JS (raccourci <kbd>F12</kbd>). Vous pouvez également utiliser [Postman](https://www.postman.com/) pour tester vos requêtes ou bien [ThunderClient](https://www.thunderclient.com/).
