#import "../../template/template.typ": *

#show: doc => template(
  course: [INF3500 - Conception et réalisation de systèmes numériques],
  title: [Note 1\ Installation des _board files_ PYNQ],
  authors: ([Marc-Antoine #smallcaps[Manningham]], [Beaurel #smallcaps[Fohom]]),
  date: [Automne 2025],
  doc,
)

= Installation avec l'installeur de Vivado

Si votre version de Vivado est suffisamment récente, vous pouvez
installer les _board files_ PYNQ au moment de sélectionner la _board_
pour le projet. Pour cela, appuyez sur "Refresh" dans la fenêtre du
choix de la carte. Ensuite, cherchez "pynq" dans la barre de recherche
et installez la carte avec le bouton "Télécharger". Vous pouvez
ensuite la sélectionner pour votre projet.

= Installation à la main

== Chercher les sources

Le bundle de _board files_ est disponible sur le site du fabricant~:
#link( "https://www.tulembedded.com/FPGA/ProductsPYNQ-Z2.html",
[`https://www.tulembedded.com/FPGA/ProductsPYNQ-Z2.html`] ). Vous
pouvez le télécharger directement en utilisant ce
#link("https://dpoauwgwqsy2x.cloudfront.net/Download/pynq-z2.zip")[#text(blue,
[lien de téléchargement])].

== Installer le bundle

Une fois le fichier `.zip` téléchargé, déplacez-le dans
`<xilinx-install-dir>/Vivado/2022.2/data/boards/board_files/`. Sous
Linux, le chemin d'installation par défaut de Vivado est souvent
`/tools/Xilinx`, éventuellement `/opt/Xilinx`. Sous Windows, il s'agit
souvent de `C:\Xilinx`.

De là, dézippez le fichier `.zip` dans ce répertoire. Cela devrait
créer un dossier
`<xilinx-install-dir>/Vivado/2022.2/data/boards/board_files/pynq-z2`. C'est
tout !

*Note~:* Si Vivado était déjà lancé avant de procéder à l'installation, il
faudra le relancer pour avoir accès aux nouveaux _board files_.
