------------------------------------------------------------------------

![](resources/logo_poly.png)
<td><h1>INF2010 - Structures de données et algorithmes</h1></td>


------------------------------------------------------------------------

Travail pratique \#3
====================

Arbre Binaire de recherche
=============================================================

Objectifs
---------
* Apprendre le fonctionnement d’un arbre binaire de recherche
* Comprendre le fonctionnement d’un arbre AVL
* Utiliser les concepts vus en cours dans des analyses de complexité
* Utiliser un SIAG pour apprendre de nouveaux concepts


Astuces
-------
Veuillez consulter la section **Astuces** du README du travail pratique 1 pour la configuration du projet.

Utilisation de ChatGPT ou autres SIAG
=====================================

L'utilisation des SIAG est uniquement permise lorsque explicitement énoncé.
Un emoji 🤖 accompagnera aussi ces sections.

⚠️ Tout autre utilisation de ChatGPT ou autres SIAG est strictement interdite ⚠️

------------------------------------------------------------------------
Partie 1 : Implémentation des arbres binaires de recherche BST et AVL
---------------
Un arbre AVL est un arbre binaire de recherche équilibré. Celui-ci oblige que la différence entre la hauteur gauche et 
la hauteur droite soit inférieure à 2. 
Si cette condition n’est pas respectée, il faut rééquilibrer l’arbre avec l’algorithme des arbres AVL. 
Dans le cas du retrait d’un élément, une démarche spécifique doit être utilisée.
L'implémentation de ces algorithmes est disponible dans les diapositives du cours et dans le chapitre 4 du livre de Mark Allen Weiss.

Pour la première partie, il vous est demandé de compléter les classes suivantes:
- `BinaryTree`: Fonctionnalités permettant de traverser un arbre de différentes manières
- `BinarySearchTree`: Implémente un arbre de recherche qui non-équilibré
- `AvlTree`: Arbre de recherche AVL (équilibré)

**ATTENTION : Une note de 0 sera automatiquement attribuée si vous utilisez un arbre binaire d’une librairie quelconque.**


------------------------------------------------------------------------

Partie 2 : Implémentation d'un système d'autocomplétion simple
----------------

Les arbres binaires de recherche et les arbres AVL sont des structures de données appropriées pour une introduction aux structures d'arbres.
Cependant, ce ne sont pas des structures qui sont très utilisées en pratique.
Des tables de hachages sont généralement préférable lorsqu'il faut associer des paires `clé, valeur`.

Il existe cependant, plusieurs structures d'arbres spécialisées qui permettent de répondre à des besoins spécifiques.
Par exemple, les [arbres de volumes englobants](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) sont très
populaires pour accélérer plusieurs algorithmes dans les jeux vidéos (détection de collisions, etc.).

Pour cette partie du TP, vous devez développer un système d'autocomplétion simple.
Vous aurez certainement besoin d'identifier une structure de donnée spécialisée permettant de satisfaire les exigences du système.
Vous pouvez utiliser un SIAG (🤖) et toutes autres ressources pour déterminer la solution.

### Problème

À partir d'un dictionnaire de mots initial, votre système doit pouvoir suggérer des mots à partir d'un préfixe donné.
L'ordre des résultats n'est pas important.
Le préfixe donné peut contenir des `.` qui correspondent à n'importe quelle lettre.

### Contraintes
- Les mots du dictionnaire et le préfixe donné contiennent seulement des lettres minuscules de a à z (et `.` pour le préfixe).
- L'analyse du dictionnaire initial doit avoir une complexité temporelle en pire cas de `O(s)`, où `s` est le nombre de caractères total (somme des longueurs de chaque mots).
- La suggestion de préfixes doit avoir une complexité temporelle en pire cas de `O(Σ^w * m + k * L)`, où
    *  `Σ` = 26 (taille de l'alphabet)
    *  `w` = nombre de `.` dans le préfixe
    *  `m` = longueur du préfixe
    *  `k` = nombres de résultats
    *  `L` = longueur moyenne des résultats
    - (Lorsque aucun `.` est présent, la complexité attendue est donc `O(m + k*L)`) 

### Exemple 1

```
Dictionnaire: ["let", "const", "loop"]
Préfixe: "l"

Résultat: ["let", "loop"]
```

### Exemple 2

```
Dictionnaire: ["let", "const", "loop"]
Préfixe: ".o"

Résultat: ["const", "loop"]
```

Rapport
====================

⚠️ Attention, malgré que les SIAG soient permis pour la partie 2, vous devez répondre aux questions
dans vos propres mots ⚠️

Fournissez un rapport répondant aux questions et réflexions ci-dessous sur la __partie 2__:

1. Expliquez le fonctionnement de votre système (logique de l'implémentation)
2. Faites l'analyse de la complexité temporelle et spatiale des deux opérations de votre système
   - Initialisation
   - Recherche
3. Décrivez _brièvement_ votre utilisation des SIAG dans ce TP 
   - Questions et réponses obtenus, etc.
   - Avez-vous utilisez d'autres ressources?
   - Quelles conclusions ou observations avez-vous tirées de l'utilisation des SIAG pour ce TP?
    
## Astuces et exemple pour les analyses de complexité

- Consultez la section 2.4 du livre de Weiss pour les règles de bases et des exemples.
    - Pour l'analyse des relations de récurrence, voir la section 7.6.1 (Pas besoin pour ce TP)
- Faites des analyses complètes et montrez vos simplifications.

---
Soit le code suivant:

```java
int countOccurrences(String sentence, char letter) {
    int nOccurrences = 0;

    for (int i = 0; i < sentence.length(); i++) {
        if (sentence.charAt(i) == letter) {
            nOccurrences++;
        }
    }

    return nOccurrences;
}
```

Exemple de réponse attendue:

__Logique de la solution__:

La solution itère au travers de la chaine de caractère et compare chaque lettre.
Lorsqu'une lettre correspond à la lettre recherchée, un compteur est incrémenté.
Le compteur contient le nombre d'occurrences de la lettre recherché à la fin de l'itération.

### Analyses de complexités

Soit `n` la longueur de `sentence`

__Complexité temporelle__

- L'initialisation de `nOccurrences` se fait en O(1)
- La boucle s'exécute `n` fois
    - La comparaison dans la boucle se fait en O(1)
    - l'incrémentation de `nOccurrences` se fait en O(1)
    - Le corps de la boucle est donc O(1)
    - La boucle est donc O(n * (1+1)) = O(n)
- La fonction s'exécute donc en O(1 + n) = O(n)

__Complexité spatiale__

La fonction utilise les variables `nOccurences` et `i` qui sont de taille constante, la complexité spatiale
est donc de O(1+1) = O(1).

------------------------------------------------------------------------

Soumission
==========

### Git

À la date de la remise, votre repo git devra contenir votre code final.

### Moodle

Rapport en format PDF non compressé (pas de zip!)

------------------------------------------------------------------------

Barème de correction
--------------------
|          |                      |     |
|----------|----------------------|-----|
| Partie 1 | Réussite des tests   | /8  |
| Partie 2 | Réussite des tests   | /7  |
| Rapport  | Q1                   | /1  |
|          | Q2                   | /2  |
|          | Q3                   | /1  |
| Qualité  | Code & Rapport       | /1  |
| Total    |                      | /20 |


#### ATTENTION
* Si une fonction n’a pas la complexité correcte, vous perdrez les points pour tous les tests utilisant cette fonction.
* Un chargé vérifiera que votre code respecte les complexités spécifiées et ne contourne pas les tests avant d'attribuer les points pour la *Réussite des tests*.
* Les tests sont indicatifs de votre note, mais tout le code sera révisé pour vérifier qu'il répond aux exigences. La note finale peut différer de celle des tests.

------------------------------------------------------------------------

#### Qu'est-ce que du code de qualité?
* Absence de code dupliqué
* Absence de warnings à la compilation
* Absence de code mort: code en commentaire, variables inutilisées, etc.
* Respect des mêmes conventions de codage dans tout le code produit :
  * Langue utilisée
  * Noms des variables, fonctions et classes
* Variables, fonctions et classes avec des noms pertinents et clairs expliquant leur intention
* Code bien commenté et documenté pour expliquer les parties complexes
* Respect des principes de programmation orientée objet (si applicable): encapsulation, héritage, polymorphisme

Pour plus d'informations, consultez [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)

--- 

Le dernier commit de votre répertoire sera utilisé comme remise finale. Chaque jour de retard créera une pénalité
additionnelle de 20 %. Aucun travail ne sera accepté après 4 jours de retard.

---

Bonne chance 🚀