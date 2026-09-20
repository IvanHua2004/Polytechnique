#import "../../template/template.typ": *

#show: doc => template(
  course: [INF3500 - Conception et réalisation de systèmes numériques],
  title: [Note 2\ Connexion à PYNQ sur la PYNQ-Z2],
  authors: ([Marc-Antoine #smallcaps[Manningham]], [Beaurel #smallcaps[Fohom]]),
  date: [Automne 2025],
  doc,
)

= Démarrer la PYNQ-Z2 sur Pynq Linux

- Insérez votre carte SD flashée avec Pynq Linux dans le port SD de la
  PYNQ-Z2.
- Assurez-vous de mettre le cavalier de boot (`JP2`) de la PYNQ sur la
  position SD, comme montré sur la figure~@jumper-sd.
#figure(
  image("images/000-pynq-jumper.png"),
  caption: [Cavalier de boot de la PYNQ (encadré en rouge) en position SD]
) <jumper-sd>
- Pour alimenter la PYNQ, branchez le câble USB à un port USB de votre
  PC. Assurez-vous aussi que le cavalier d'alimentation (`JP5`),
  proche du bouton d'alimentation, est positionné sur `USB`. Allumez
  la carte. Au bout d'environ une minute, ses quatre LEDs devraient
  clignoter, et ses deux LEDs RGB s'allumer, indiquant que Pynq Linux
  est démarré.
- Reliez le port Ethernet de la PYNQ avec celui de votre ordinateur à
  l'aide d'un câble Ethernet.

= Attribuer une adresse IP statique au PC

Pour pouvoir communiquer avec la PYNQ via Ethernet et se connecter au
serveur Jupyter qui tourne dessus, il faut attribuer une adresse IP
statique à votre ordinateur.

== Sous Windows

- Ouvrez le Panneau de configuration.
- Naviguez à "Réseau et Internet" > "Connexions réseau".
- Trouvez votre interface réseau Ethernet.
- Double-cliquez dessus pour l'ouvrir, puis cliquez sur "Propriétés".
- Sélectionnez Internet Protocol Version 4 (TCP/IPv4) et cliquez sur
  "Propriétés".
- Sélectionnez "Utiliser l'adresse IP suivante".
- Définissez l'adresse IP sur `192.168.2.x` où `x` est une valeur
  quelconque entre 0 et 255, différente de 99#footnote[`192.168.2.99`
  est l'adresse IP statique de Pynq Linux] <note99>, par exemple 101.
- Définissez le masque de sous-réseau sur `255.255.255.0` puis cliquez
  sur "OK".

== Sous Linux

Vous avez besoin des droits `root` pour réaliser cette opération.

- Ouvrez un terminal avec les droits d'administrateur (dans un
  terminal, tapez `sudo su` et entrez votre mot de passe).
- Entrez la commande~:
  ```
  # ip a
  ```
  pour déterminer le nom de votre interface Ethernet. La plupart du
  temps, les interfaces Wi-Fi commencent par la lettre `w` et les
  interfaces Ethernet par la lettre `e`. En général, l'interface
  Ethernet s'appelle `eth0` ou `eno1`. La figure~@ip-example montre un
  exemple de sortie de `ip a`. Dans la suite, le nom que vous avez
  déterminé est désigné par `<if-name>`.

#figure(
  image("images/ip-ex.png"),
  caption:[Exemple de sortie de `ip a`. Ici, l'interface Ethernet s'appelle `eno1`]
) <ip-example>

- Activez votre interface Ethernet~:
  ```
  # ip link set <if-name> up
  ```
  en remplaçant `<if-name>` par le nom de votre interface déterminé à
  l'étape précédente.
- Ajoutez une adresse IP statique à votre interface Ethernet avec la
  commande~:
  ```
  # ip a add 192.168.2.<x>/24 dev <if-name>
  ```
  en remplaçant `<x>` par un nombre de votre choix entre 0 et 255,
  différent de 99#footnote(<note99>), par exemple 101.

= Accéder au serveur Jupyter

Pour accéder au serveur Jupyter de la PYNQ, ouvrez un navigateur et
tapez `192.168.2.99:9090` dans la barre d'URL. Si la connexion a
fonctionné, vous devriez voir s'afficher la page de connexion de
Jupyter montrée sur la figure~@jupyter-login. Le mot de passe est
`xilinx`.

#figure(
  image("images/20-login-jupyter.png"),
  caption: [Page d'accueil de Jupyter]
) <jupyter-login>

Si vous le souhaitez, vous pouvez changer le _hostname_ par défaut de
Pynq Linux (qui est `pynq`). Pour ce faire, utilisez "New" dans
Jupyter et sélectionnez "Terminal", puis utilisez le script
`pynq_hostname.sh`~:
```
# pynq_hostname.sh <new-hostname>
```
en remplaçant `<new-hostname>` par le nom désiré. La carte doit être
redémarrée pour que les changements prennent effet~; vous pouvez
redémarrer avec la commande~:
```
# shutdown -r now
```
