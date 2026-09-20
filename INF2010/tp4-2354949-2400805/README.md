------------------------------------------------------------------------

![](resources/logo_poly.png)
<td><h1>INF2010 - Structures de données et algorithmes</h1></td>

Merci au cours INF3500 pour le format du Markdown

------------------------------------------------------------------------

Travail pratique \#4
====================

*Heap* - Implémentation d'une file de priorité
=============================================================

Objectifs
---------
* Apprendre le fonctionnement d’un *heap*
* Comprendre la complexité asymptotique d’un *heap*
* Utiliser un *heap* dans un problème complexe
* Développer des techniques de validation de code

Astuces
-------
Veuillez consulter la section **Astuces** du README du travail pratique 1 pour la configuration du projet.

Utilisation de ChatGPT ou autres SIAG
=====================================

L'utilisation des SIAG est uniquement permise lorsque explicitement énoncé.
Un emoji 🤖 accompagnera aussi ces sections.

⚠️ Tout autre utilisation de ChatGPT ou autres SIAG est strictement interdite ⚠️

------------------------------------------------------------------------
Partie 1 : Implémentation d'un *heap*
---------------
Un *heap* est une structure de données de la famille des arbres binaires et est communément utilisé comme implémentation d'une file de priorité.

Un des cas d'utilisation de cette structure est lorsque seulement les `k` plus petits éléments (ou plus grand) d'une liste de longueur `n` nous intéressent. 
En effet, dans ce cas de figure, on peut trouver les `k` plus petits/grands éléments avec une complexité temporelle de `O(n log k)`. 

Les *heap* sont aussi très utiles pour les algorithmes sur les graphes que nous verrons plus tard dans la session.
Il est souvent utile de pouvoir faire une file de priorité d'un type quelconque `T`.
Il faudra soit que ce type implémente `Comparable<T>` ou qu'un `Comparator<T>` soit fourni.
Les comparateurs permettent aussi de transformer une min heap en max heap et vice-versa.

Puisque nous utiliserons l'interface `Comparable<T>`, notre heap suivra [l'ordre naturel](https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html) du type.
C'est-à-dire que ce sera un min heap si on utilise des entiers sans comparateur explicite.
Si un utilisateur de notre librairie voulait un max heap, il aurait besoin de fournir un comparateur, par exemple `Comparator.reverseOrder()` pour inverser l'ordre.

Il est commun d'implémenter les opérations d'un _heap_ séparément de la structure de données sur laquelle elles sont appliquées.
C'est ce qui est fait par la librairie [heapq](https://docs.python.org/3/library/heapq.html) de Python par exemple.
Ceci permettra d'implémenter un _heapsort_ en-place facilement à partir des opérations que nous avons déjà définies. 

**Les éléments de la heap que nous implémenterons commencent à l'index 0, pas 1**

Pour bien implémenter la *heap*, suivez les tests contenus dans `HeapTest.java`. Il est recommandé de laisser les tests avec baromètre pour la toute fin.

Les fonctions identifiées avec `HAS TO BE RECURSIVE` doivent obligatoirement être implémentées récursivement.

**ATTENTION : Une note de 0 sera attribuée à cette partie si l’étudiant utilise un `heap` déjà implémenté provenant d’une librairie quelconque.**

Vous pouvez utiliser la visualisation suivante pour mieux comprendre comment la structure d'un heap fonctionne : [lien vers la visualisation](https://visualgo.net/en/heap)

------------------------------------------------------------------------

Partie 2 : Problème typique d'entrevue avec ChatGPT
----------------

Pour ce TP vous serez responsable de la validation de votre code. 
Un fichier de test (vide) est fourni au besoin.
Vous avez accès à [JUnit5](https://junit.org/junit5/) ainsi qu'à [Hamcrest](https://hamcrest.org/JavaHamcrest/) pour rédiger des tests.
La correction utilisera des tests automatisés auxquels vous n'avez pas accès.

Vous pouvez utiliser un SIAG (🤖) pour répondre à la question d'entrevue ainsi que pour vous aider à valider
votre code.

---

Pour résoudre ce problème vous devez utiliser un monceau ([PriorityQueue](https://docs.oracle.com/javase/7/docs/api/java/util/PriorityQueue.html) en Java).

On vous demande d'élaborer un algorithme répondant à la question d'entrevue suivante dans le fichier `Interview.java`:

**Écrire un algorithme permettant de joindre `k` listes triées dans une seule liste triée**

### Entrées
* Une liste de tableaux d'entiers de tailles arbitraires triés en ordre non décroissant.

### Sorties
* Une seule liste d'entiers triée en ordre non décroissant.

### Contraintes
Supposons une liste de `k` tableaux contenant en tout `n` éléments.
* Complexité temporelle : `O(n log k)` en pire cas
* Complexité spatiale en pire cas : À vous de la déterminer et de vous justifier

**Il est permis d’utiliser la librairie java.util pour cette partie. Une note de 0 sera attribuée à cette partie si l’étudiant utilise quelconque autre librairie.**

------------------------------------------------------------------------

### Exemple
Entrées :
* Tableaux : 
  ```
  [
    [1],
    [2, 2, 4],
    [3],
    []
  ]
  ```

* Sorties : `[1, 2, 2, 3, 4]`

Explication :

On insère d'abord `1` car c'est le plus petit élément des tableaux, puis `2`, encore `2`, `3` et `4`.
Il n'y a rien à faire pour le tableau vide.


Rapport
====================

⚠️ Attention, malgré que les SIAG soient permis pour la partie 2, vous devez répondre aux questions
dans vos propres mots ⚠️

Fournissez un rapport répondant aux questions et réflexions ci-dessous sur la __partie 2__:

1. Décrivez la logique de votre solution et analysez la complexité temporelle et spatiale.
2. Comment avez-vous validé votre code? Pouvez-vous être certains de la validité de votre algorithme?
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

### Soumission

##### Git
À la date de la remise, votre repo git devra contenir votre code final.

##### Moodle
Rapport en format PDF non compressé (pas de zip!)

------------------------------------------------------------------------

Barème de correction
--------------------

|          |                    |     |
|----------|--------------------|-----|
| Partie 1 | Réussite des tests | /9  |
| Partie 2 | Réussite des tests | /5  |
| Rapport  | Q1                 | /2  |
|          | Q2                 | /2  |
|          | Q3                 | /1  |
| Qualité  | Code & Rapport     | /1  |
| Total    |                    | /20 |


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
