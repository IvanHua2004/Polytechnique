---------------------------------------------------------------------------------------------------
--
-- PolyRISC_utilitaires_pkg.vhd
--
-- v. 1.0, 2020/11/15 Pierre Langlois
-- v. 1.0c 2021-11-28 inclut RB := GPIO_in, solution du labo #5
-- v. 1.1 2025-03-17 laboratoire 4
--
-- Déclarations et fonctions utilitaires pour le processeur PolyRISC
--
---------------------------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use IEEE.MATH_REAL.ceil;
use IEEE.MATH_REAL.log2;

package PolyRISC_utils is
  -----------------------------------------------------------------------------
  -- Constantes
  --
  -- dimensions du processeur
  -- nombre de registres
  constant POLYRISC_NREG   : positive := 16;
  -- Nombre de bits pour adresser les registres de PolyRISC
  -- 4 bits suffiraient pour 16 registres, mais les instructions RISC
  -- utilisent 5 bits car elles sont prévues pour 32 registres
  constant POLYRISC_AREG_W : positive := 5; -- positive(ceil(log2(real(POLYRISC_NREG))));
  -- largeur du chemin des données en bits
  constant POLYRISC_GPIO_W : positive := 32;
  -- largeur du PC et nombre de bits d'adresse de la mémoire
  -- d'instructions
  constant POLYRISC_MEMI_W : positive := 8;
  -- nombre de bits d'adresse de la mémoire des données
  constant POLYRISC_MEMD_W : positive := 8;
  -- Nombre de types d'instructions
  constant n_instr         : natural  := 4;
  -- Nombre de valeurs possibles pour la partie détails de
  -- l'instruction
  constant n_detail        : natural  := 16;

  -- Constantes pour la lisibilité
  -- Point de départ pour les décalages (on commence au MSB et on
  -- retranche la largeur de chaque champ)
  constant INST_START    : integer := POLYRISC_GPIO_W - 1;
  -- Largeur et décalage (par rapport au MSB !) de la catégorie
  constant INST_CAT_OFF  : integer := INST_START;
  constant INST_CAT_W    : integer := 2;
  -- Largeur et décalage du détail
  constant INST_DET_OFF  : integer := INST_CAT_OFF - INST_CAT_W;
  constant INST_DET_W    : integer := 4;
  -- Largeur des adresses de registres et décalages des registres
  constant INST_REG1_OFF : integer := INST_DET_OFF - INST_DET_W;
  constant INST_REG_W    : integer := POLYRISC_AREG_W;
  constant INST_REG2_OFF : integer := INST_REG1_OFF - INST_REG_W;
  -- Décalage de la valeur immédiate (la largeur est aussi le décalage
  -- car on prend tous les bits restants)
  constant INST_VAL_OFF  : integer := INST_REG2_OFF - INST_REG_W;
  constant INST_VAL_W    : integer := INST_VAL_OFF + 1;

  -- Structure pour l'encodage d'une instruction
  type instruction_t is record
    categorie : natural range 0 to n_instr - 1;
    detail    : natural range 0 to n_detail - 1;
    reg1      : unsigned(POLYRISC_AREG_W - 1 downto 0);
    reg2      : unsigned(POLYRISC_AREG_W - 1 downto 0);
    valeur    : signed(INST_VAL_W - 1 downto 0);
  end record;

  -- Déclaration des types pour les différents types de mémoires
  -- Fichier de registres
  type fichierRegistres_t is
    array(0 to 2 ** POLYRISC_AREG_W - 1) of signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Mémoire des données
  type memoireDonnees_t is
    array(0 to 2 ** POLYRISC_MEMD_W - 1) of signed(POLYRISC_GPIO_W - 1 downto 0);

  -----------------------------------------------------------------------------
  -- Fonction pour générer des instructions facilement en passant des
  -- entiers
  -- 
  function gen_inst(
    cat  : natural range 0 to n_instr - 1;
    det  : natural range 0 to n_detail - 1;
    reg1 : integer range 0 to POLYRISC_NREG - 1;
    reg2 : integer range 0 to POLYRISC_NREG - 1;
    val  : integer range - 2 ** POLYRISC_NREG to 2 ** POLYRISC_NREG - 1
    ) return instruction_t;
  -- Conversion de unsigned en instruction
  function to_inst(bits : unsigned(POLYRISC_GPIO_W - 1 downto 0))
    return instruction_t;
  -- Conversion inverse
  function inst_to_unsigned(inst : instruction_t)
    return unsigned;

  -- Catégories d'instructions
  constant reg         : natural := 0;
  constant reg_valeur  : natural := 1;
  constant branchement : natural := 2;
  constant memoire     : natural := 3;

  -- Détails d'instructions pour la catégorie mémoire
  constant lireMemoire    : natural := 0;
  constant ecrireMemoire  : natural := 1;
  constant lireGPIO_in    : natural := 2;
  constant ecrireGPIO_out : natural := 3;

  -- Encodage des opérations de l'UAL
  constant passeA  : natural := 0;
  constant passeB  : natural := 1;
  constant AplusB  : natural := 2;
  constant AmoinsB : natural := 3;
  constant AetB    : natural := 4;
  constant AouB    : natural := 5;
  constant nonA    : natural := 6;
  constant AouxB   : natural := 7;
  constant absA    : natural := 8;
  constant minAB   : natural := 9;
  constant maxAB   : natural := 10;
  constant AmulB   : natural := 11;
  constant Adiv2   : natural := 12;

  -- Encodage des conditions de branchement
  constant egal     : natural := 0;
  constant diff     : natural := 1;
  constant ppq      : natural := 2;
  constant pgq      : natural := 3;
  constant ppe      : natural := 4;
  constant pge      : natural := 5;
  constant toujours : natural := 6;
  constant jamais   : natural := 7;

  -- Déclaration des instructions prédéfinies
  -- Elles sont définies dans le package body
  constant NOP  : instruction_t;
  constant STOP : instruction_t;
end package;

package body PolyRISC_utils is
  -- Définition de la fonction gen_inst
  function gen_inst(
    cat  : natural range 0 to n_instr - 1;
    det  : natural range 0 to n_detail - 1;
    reg1 : integer range 0 to POLYRISC_NREG - 1;
    reg2 : integer range 0 to POLYRISC_NREG - 1;
    val  : integer range - 2 ** POLYRISC_NREG to 2 ** POLYRISC_NREG - 1
    ) return instruction_t
  is
    variable ret : instruction_t;
  begin
    ret := (
      cat,
      det,
      to_unsigned(reg1, INST_REG_W),
      to_unsigned(reg2, INST_REG_W),
      to_signed(val, INST_VAL_W)
      );
    return ret;
  end gen_inst;
  -- Définition de to_inst
  function to_inst(bits : unsigned(POLYRISC_GPIO_W - 1 downto 0))
    return instruction_t
  is
    variable ret : instruction_t;
  begin
    ret := (
      -- Catégorie
      to_integer(bits(INST_CAT_OFF downto INST_CAT_OFF - INST_CAT_W + 1)),
      -- Détail
      to_integer(bits(INST_DET_OFF downto INST_DET_OFF - INST_DET_W + 1)),
      -- Registre 1
      bits(INST_REG1_OFF downto INST_REG1_OFF - INST_REG_W + 1),
      bits(INST_REG2_OFF downto INST_REG2_OFF - INST_REG_W + 1),
      signed(bits(INST_VAL_OFF downto 0))
      );
    return ret;
  end to_inst;
  -- Override de to_unsigned pour les instructions
  function inst_to_unsigned(inst : instruction_t)
    return unsigned
  is
    variable ret : unsigned(POLYRISC_GPIO_W - 1 downto 0);
  begin
    ret := to_unsigned(inst.categorie, INST_CAT_W) &
           to_unsigned(inst.detail, INST_DET_W) &
           inst.reg1 &
           inst.reg2 &
           unsigned(inst.valeur);
    return ret;
  end inst_to_unsigned;

  -- instructions prédéfinies
  constant NOP : instruction_t := gen_inst(
    branchement, jamais, 0, 0, 0
    );
  constant STOP : instruction_t := gen_inst(
    branchement, toujours, 0, 0, 0
    );
end package body;
