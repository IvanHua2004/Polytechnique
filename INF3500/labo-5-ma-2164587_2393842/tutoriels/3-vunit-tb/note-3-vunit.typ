#import "../../template/template.typ": *

#show: doc => template(
  course: [INF3500 - Conception et réalisation de systèmes numériques],
  title: [Utilisation de VUnit pour la simulation de bancs d'essai VHDL],
  authors: ([Marc-Antoine #smallcaps[Manningham]]),
  date: [Automne 2025],
  doc,
)

= Qu'est-ce que VUnit ?
VUnit est une librarie python et VHDL qui permet de faciliter la création et l'exécution de bancs d'essai VHDL. Elle permet de créer des tests unitaires à partir de banc d'essai VHDL. Ce genre de librairie est très utile pour automatiser les tests de validation de composants VHDL et de faire de l'intégration continue pour détecter les régressions sur les TBs.

= Pourquoi utiliser VUnit ?
VUnit permet de:
- Compiler de manière incrémentale les fichiers VHDL pour réduire le temps de simulation
- Détecter et d'exécuter les tests unitaires de manière parallèle automatiquement
- Générer des rapports de tests et les exporter pour le CI (Gitlab Runner, Jenkins, etc.)
- Inclure des librairies VHDL pour faciliter la création de tests unitaires
- Avoir des composantes de tests pour des protocoles (AXI, UART, etc.)
- Être indépendant d'un outil de simulation particulier

= Installation de VUnit
L'installation consiste à installer la librairie python vunit_hdl. Une manière de l'installer est d'utiliser pip:
```bash
pip install vunit-hdl
```
== Prérequis
Pour utiliser VUnit, il faut avoir installé un outil de simulation VHDL (ActiveHDL, GHDL, etc.). Pour avoir une interface graphique pour les tests avec GHDL, il faut avoir installé l'outil GTKWave.
```bash
sudo apt install gtkwave ghdl # Installation pour Ubuntu
sudo dnf install gtkwave ghdl # Installation pour CentOS/Fedora
```
#figure(
  image("images/VUnit_diagram.png", width: 95%),
  caption: [Diagramme de fonctionnement de VUnit],
)

#pagebreak()
= Démarrage rapide avec VUnit
== Script python
Un projet avec VUnit consiste à créer un script python à la racine qui va définir où se trouvent les fichiers VHDL et comment les compiler. Voici un exemple de script python pour un projet simple:
#raw(read("exemple_projet/run.py"), block: true, lang: "python")

== Exemple d'entité en VHDL à tester (ne dépend pas de VUnit)
Voici un exemple d'entité en VHDL à tester avec VUnit. Cette entité est un simple inverseur de signal:
#raw(read("exemple_projet/src/simple_alu.vhdl"), block: true, lang: "ada")
#pagebreak()

== Fichiers de banc d'essai VHDL
Un banc d'essai VHDL doit être écrit de manière à être compatible avec VUnit. Pour ce faire, il faut qu'il contient un générique runner_cfg dans l'entité de test, une déclaration de librairie vunit_lib et des appels à la fonction run dans un while avec la test_suite.
#raw(read("exemple_projet/src/simple_alu_tb.vhdl"), block: true, lang: "ada")

== Commande pour utiliser VUnit
Pour lancer tous les tests sans interface:
```bash
python3 run.py
```

Pour lancer un test spécifique:
```bash
python3 run.py lib.simple_alu_tb.inversion_0
# À noter qu'une étoile (*) peut être utilisée pour lancer plusieurs tests qui ont un nom commun
python3 run.py lib.simple_alu_tb.inversion*
```

Pour lancer un test avec une interface graphique:
```bash
python3 run.py -g lib.simple_alu_tb.inversion_0
```

== Bonnes pratiques
Il est en général recommandé de faire un fichier de banc d'essai par entité VHDL à tester. Cela permet de mieux organiser les tests. N'oubliez pas que le VHDL contient des procédures et des fonctions qui permettent d'éviter de se répéter.

= Lien vers la documentation de VUnit (en anglais)
Pour plus de références, la documentation de VUnit est disponible sur le site officiel: #link("https://vunit.github.io/")

== Pour aller plus loin
- Utilisation de VUnit avec des génériques sur le banc d'essai: #link("https://vunit.github.io/blog/2017_06_03_enable_your_simulator_to_handle_complex_top_level_generics.html")
- Utilisation de VUnit avec des protocoles (AXI, UART, etc.): #link("https://vunit.github.io/verification_components/user_guide.html/")