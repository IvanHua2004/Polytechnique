# Tests pour le serveur dynamique

Le code source du serveur est accompagné d'une série de tests qui permettent de vérifier les interactions entre votre serveur et une instance MongoDB. Le code source des tests est disponible dans le répertoire `server/tests`. Seulement la logique de gestion des publications et utilisateurs est testée et non le routeur Express.

Les tests unitaires utilisent la librairie _Jest_ que vous avez utilisée tout au long de la session. La librairie [MongoMemoryServer](https://github.com/nodkz/mongodb-memory-server) est utilisée pour remplacer une vraie instance de MongoDB par une instance _mocked_ pour les tests. Il est très important de se connecter à une base de données locale et contrôlée et non à votre instance MongoDB déployée en mode **production** pendant vos tests.

Vous êtes fortement encouragés à consulter les tests fournis. Ils vous aideront à mieux comprendre le travail à faire et le bon comportement du serveur. Notez que les tests fournis sont là pour aider le développement, mais ne couvrent pas 100% des cas possibles.

Pour exécuter les tests unitaires automatisés, utilisez la commande `npm test`. Cela exécutera les tests et produira un rapport dans votre terminal. Vous pouvez également utiliser la commande `npm run coverage` pour obtenir la couverture de code.

Notez que la fonction `console.log()` est remplacée par un mock vide (`()=>{ }`) pour réduire le bruit dans la console lors des tests. Évitez d'utiliser `console.log()` pour déboguer vos tests.
