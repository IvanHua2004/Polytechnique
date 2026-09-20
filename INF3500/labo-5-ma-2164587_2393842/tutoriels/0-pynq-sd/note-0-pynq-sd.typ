#import "../../template/template.typ": *

#show: doc => template(
  course: [INF3500 - Conception et réalisation de systèmes numériques],
  title: [Note 0\ Installation de Pynq Linux sur une carte micro-SD],
  authors: ([Marc-Antoine #smallcaps[Manningham]], [Beaurel #smallcaps[Fohom]]),
  date: [Automne 2025],
  doc,
)

= Télécharger l'image de Pynq Linux

Vous pouvez télécharger l'image de Pynq Linux en cliquant sur
#link("https://bit.ly/pynqz2_v3_0_1")[ce lien]. Pour plus de détails,
vous pouvez vous référer à la
#link("https://pynq.readthedocs.io/en/latest/getting_started/pynq_z2_setup.html")[documentation
de PYNQ].

= Flasher l'image sur la micro-SD

Pour les laboratoires de INF3500, il faudra vous procurer une carte
micro-SD d'*au moins 8~Go*. La boutique Coopoly vend des cartes
micro-SD et des adaptateurs. Attention, si votre micro-SD contient des
données, elles seront complètement écrasées par l'opération~; pensez
donc à copier son contenu ailleurs si vous voulez le conserver.

== Avec une interface graphique (tous systèmes)

Vous pouvez utiliser le logiciel
#link("https://etcher.balena.io/")[*balenaEtcher*] pour flasher
l'image de Pynq Linux sur votre micro-SD. Pour ce faire, installez le
logiciel (bouton "Download Etcher" sur la page d'accueil du site). Une
alternative spécifique à Windows qui ne sera pas détaillée ici est
*Win32DiskImager*.

Une fois l'application lancée (cf. figure~@etcher-0), sélectionnez
"Flash from file" (l'option par défaut), puis sélectionnez l'image de
Pynq Linux que vous avez téléchargée. Ensuite, sélectionnez votre
micro-SD dans "Select target", et enfin appuyez sur "Flash!".

#warning(title: [Attention~!])[Assurez-vous de bien sélectionner votre
micro-SD et non l'un de vos disques~: si vous flashez accidentellement
votre disque dur, vous briserez votre système et risquerez de perdre
vos données.

Normalement, balenaEtcher détecte automatiquement les disques-durs
internes et vous prévient si vous les sélectionnez, mais il vaut
toujours mieux une double-vérification.]

#figure(
  image("images/etcher-0.png"),
  caption: [Page d'accueil de balenaEtcher],
  supplement: "Figure"
) <etcher-0>

== En ligne de commande (systèmes UNIX)

#warning(title: [Attention])[Si vous n'êtes pas certain.e.s de ce que
vous faites, préférez utiliser balenaEtcher, car `dd` ne posera aucune
question et écrasera le disque que vous lui donnerez comme cible, même
s'il s'agit d'un disque qui contient votre système ou vos données.]

Si vous avez un système d'exploitation UNIX (Linux, MacOS, ...) vous
pouvez utiliser l'utilitaire `dd` pour flasher l'image de Pynq Linux
sur votre carte micro-SD. Pour ce faire, connectez votre carte SD à
votre ordinateur, et lancez `lsblk` (sous Linux) ou `diskutil list`
(sous macOS). De là, déterminez le _device file_ de votre micro-SD
(vous pouvez par exemple débrancher la carte, lancer `lsblk`, puis
brancher la carte, lancer `lsblk` à nouveau et voir quelle ligne est
apparue).

#figure(
  [```
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda      8:0    0 119.2G  0 disk 
├─sda1   8:1    0 336.5M  0 part /boot/efi
├─sda2   8:2    0     1G  0 part /boot
└─sda3   8:3    0 117.9G  0 part /home
                                 /
sdb      9:0    0   7.4G  0 disk
├─sdb1   9:1    0   500M  0 part
└─sdb2   9:2    0   7.2G  0 part
zram0  252:0    0   3.7G  0 disk [SWAP]
  ```],
  caption: [Exemple de sortie de `lsblk`],
  kind: image,
) <lsblk>

#figure(
  [```
/dev/disk0
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *251.0 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:                  Apple_HFS Mac SSD                 150.0 GB   disk0s2
   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
   4:       Microsoft Basic Data Windows 8               100.1 GB   disk0s4
/dev/disk1
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *500.1 GB   disk1
   1:                  Apple_HFS George Garside          300.2 GB   disk1s1
   2:               Windows_NTFS GRGARSIDE               199.9 GB   disk1s2
  ```],
  caption: [Exemple de sortie de `diskutil list`],
  kind: image,
) <diskutil>

Généralement, la micro-SD apparaîtra avec le nom `sd<lettre>` (sous
Linux). Vous pouvez aussi observer la colonne `MOUNTPOINTS`~: si les
partitions d'un disque sont montées à `/boot`, `/efi`, `/`, `/home`,
`/var` ou `/tmp`, c'est un de vos disques internes~; la micro-SD sera
soit montée automatiquement à un chemin comme
`/media/utilisateur/<nom>` ou `/mnt/<nom>`, ou pas montée du tout
(colonne `MOUNTPOINTS` vide). Dans la figure @lsblk, on voit que le
disque interne dont les partitions sont montées aux emplacements
évoqués plus haut est `sda`, et le disque `sdb` n'est pas monté~: il
s'agit de la micro-SD. Notez aussi qu'on voit des partitions~: les
lignes avec `sdb<x>` sont les partitions du disque `sdb`.

Une fois que vous avez déterminé le nom du _device file_, vous pouvez
vérifier qu'il existe avec `ls /dev/<nom-déterminé>`. Et enfin, vous
pouvez flasher la micro-SD avec la commande~:

```
sudo dd if=<image-pynq-linux.zip> of=/dev/<nom-carte-SD> bs=4M status=progress
```

Par exemple, dans le cas de la figure~@lsblk, si j'ai téléchargé
l'image Pynq dans `~/Downloads`, ma commande sera~:

```
sudo dd if=~/Downloads/pynq_z2_v3.0.1.zip of=/dev/sdb bs=4M status=progress
```
