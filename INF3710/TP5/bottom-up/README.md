TP5: Programmation dynamique
Ce travail pratique est à réaliser seul ou en équipe de deux personnes au maximum.

Objectif
Vous devrez implémenter six fonctions qui, ensemble, permettent de choisir un plan d'exécution de requête à l'aide de la programmation dynamique.

Un plan d'exécution décrit comment lire les tables, appliquer les filtres et effectuer les jointures entre les résultats. Une requête qui joint TA, TB et TC peut utiliser plusieurs plans, par exemple :

(TA JOIN TB) JOIN TC TA JOIN (TB JOIN TC)

Les deux plans produisent le même résultat, mais l'un peut nécessiter davantage de calculs. Par exemple, sa première jointure peut produire plus de lignes que la deuxième jointure devra ensuite traiter. L'optimiseur compare les coûts estimés des différents plans et retourne celui dont le coût est le plus faible.

L'optimiseur énumère les plans possibles, mais ne les exécute pas. Le code fourni estime le nombre de lignes et le coût de chaque plan.

Réalisation du TP
Vous travaillerez uniquement dans le fichier optimizer.py. Les requêtes SQL ont déjà été parsées par le code fourni. Vos fonctions reçoivent donc un objet Query contenant les tables, les filtres et les jointures.

Le code fournit des méthodes permettant d'estimer le nombre de tuples (lignes), le nombre de valeurs distinctes dans une colonne et le coût d'un plan. Vous n'avez donc pas besoin d'exécuter les requêtes pour obtenir des statistiques exactes.

Le code fournit également les différentes méthodes permettant de lire et de joindre les tables. Votre tâche consiste à comparer ces possibilités, et non à implémenter les algorithmes de base de données qui les exécutent. Vous pouvez consulter utils.py pour obtenir plus de détails.

Algorithme principal
Dans ce TP, une sous-requête désigne un ensemble de tables provenant de la requête originale ainsi que toutes les opérations de cette requête qui concernent ces tables. Le dictionnaire subquery_to_best_plan_map conserve le plan le moins coûteux trouvé pour chaque sous-requête, identifiée par l'ensemble des tables qu'elle contient.

ensemble de tables -> plan le moins coûteux trouvé pour ces tables

Pour une requête contenant les tables A, B et C, l'optimiseur commence par les petites sous-requêtes avant de traiter les plus grandes :

Une table : {A}, {B}, {C}

Deux tables : {A, B}, {A, C}, {B, C}

Requête complète : {A, B, C}

Pour trouver le meilleur plan pour {A, B, C}, on divise cet ensemble en deux groupes déjà traités, par exemple {A} et {B, C}. On joint les plans enregistrés pour ces groupes, puis on compare le résultat avec les autres partitions possibles. Une partition n'est valide que s'il existe une condition de jointure entre les groupes et que l'ordre des jointures autorisé par la requête SQL est respecté.

Voici l'algorithme présenté en cours, exprimé sous forme de pseudocode :

subquery_to_best_plan_map[{une table}] = méthode de lecture la moins coûteuse

pour chaque taille de groupe de 2 au nombre total de tables :

    pour chaque groupe de cette taille :

        essayer toutes les partitions en deux groupes plus petits

        combiner les plans déjà enregistrés pour ces groupes

        conserver le plan valide le moins coûteux

retourner le plan enregistré pour l'ensemble des tables

Travail demandé
Implémentez les fonctions dans l'ordre indiqué ci-dessous. Chaque étape repose sur les fonctions réalisées précédemment.

1. Construire les plans pour une seule table
calculate_filter_score mesure quels filtres sont les plus avantageux à appliquer tôt. order_filters utilise ces scores pour déterminer l'ordre d'application des filtres.

choose_best_access_plan compare les différentes méthodes d'accès à une table, ajoute tous les filtres associés à cette table et retourne le plan complet le moins coûteux. Le paramètre required_columns indique les colonnes qui doivent être lues.

Après avoir implémenté une fonction, vous pouvez remettre `optimizer.py` sur Gradescope pour obtenir le résultat des tests associés à cette fonction.

Étape 2 — Plans pour des sous-ensembles

2. Construire les plans pour des sous-ensembles de tables
enumerate_partitions retourne toutes les façons possibles de diviser un groupe en une partie gauche et une partie droite. Pour {A, B, C}, cela inclut notamment {A} avec {B, C}, ainsi que {B, C} avec {A}, puisque l'inversion des deux parties peut modifier le coût.

find_best_plan_for_table_subset combine les plans des sous-ensembles plus petits déjà enregistrés dans subquery_to_best_plan_map. Elle essaie les jointures autorisées et retourne le plan dont le coût estimé est le plus faible.


Étape 3 — Plan complet

3. Construire le plan complet
optimize commence avec les plans fournis pour chaque table individuelle. Elle traite ensuite les sous-ensembles de taille 2, puis 3, et ainsi de suite, jusqu'à ce que le dictionnaire contienne un plan pour la requête complète.


Lisez la docstring de chaque fonction avant de l'implémenter. Conservez les noms des fonctions et leurs paramètres, car les tests les appellent directement.

Exécution du projet
Installez les dépendances une seule fois :

uv sync

La validation de votre travail se fait sur Gradescope et le nombre de remises est illimité.

Les tests visibles indiquent les cas réussis ou échoués et affichent les erreurs produites par votre code. Pour les tests privés, Gradescope indique uniquement les numéros des tests échoués. Si votre code produit une erreur Python ou dépasse la limite de temps, cette erreur est également affichée.

Vous pouvez examiner le plan choisi pour la requête d'exemple :

uv run python main.py queries/example.sql

La sortie affiche l'arbre du plan d'exécution, le nombre estimé de lignes et le coût total estimé.

Remise
Remettez uniquement le fichier `optimizer.py`. Conservez les noms des fonctions et leurs paramètres, puisque les tests visibles et privés les appellent directement.
