# Fichier run.py
from vunit import VUnit

vu = VUnit.from_argv()
vu.add_vhdl_builtins() # Permet d'inclure les librairies VHDL de VUnit

lib = vu.add_library("lib")
lib.add_source_files("src/*.vhd") # Ajouter les bons fichiers VHDL ici

vu.main()