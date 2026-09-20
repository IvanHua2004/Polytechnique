-------------------------------------------------------------------------------
--
-- PolyRISC_v2.vhd
--
-- v. 0.2 2014-11-11 avec Hamza Bendaoudi: réécriture des types des
-- instructions en constantes pour accomoder la synthèse
-- v. 0.3 2015-03-12 rendre le code conforme au diagramme, corrections
-- et simplifications
-- v. 0.4 2015-11-15 ajout de abs, min et max
-- v. 1.0 2020-11-13 décomposition du code, définitions dans un package
-- v. 1.0a 2021-04-01 ajustements mineurs pour le laboratoire #5
-- v. 1.0b 2021-11-28 inclut les instruction GPIO_out := RB
-- v. 1.0c 2021-11-28 inclut RB := GPIO_in, solution du labo #5
-- v. 1.1 2024-07-29 réécriture des process et des parties combinatoires
-- v. 2.0 2024-07-31 déplacement de la mémoire des instructions vers une
-- mémoire externe pour pouvoir la programmer avec PYNQ
-- v. 2.1 2025-03-17 devient le laboratoire 4
--
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use WORK.PolyRISC_utils.all;
-- Programme à exécuter
-- use WORK.PolyRISC_prgm.all;

entity PolyRISC is
  port(
    reset, clk    : in  std_logic;
    i_GPIO        : in  signed(POLYRISC_GPIO_W - 1 downto 0);
    i_GPIO_valide : in  std_logic;
    i_inst        : in  unsigned(POLYRISC_GPIO_W - 1 downto 0);
    o_inst_addr   : out unsigned(POLYRISC_MEMI_W - 1 downto 0);
    o_GPIO        : out signed(POLYRISC_GPIO_W - 1 downto 0);
    o_GPIO_valide : out std_logic
    );
end PolyRISC;

architecture RISCV of PolyRISC is
  -----------------------------------------------------------------------------
  -- Signaux intermédiaires pour faciliter le décodage
  --
  -- Catégorie
  signal iCat    : natural range 0 to n_instr - 1;
  -- Détails
  signal iDet    : natural range 0 to n_detail - 1;
  -- Première valeur
  signal iReg1   : unsigned(POLYRISC_AREG_W - 1 downto 0);
  -- Seconde valeur
  signal iReg2   : unsigned(POLYRISC_AREG_W - 1 downto 0);
  -- Valeur immédiate
  signal iVal    : signed(inst_val_w - 1 downto 0);
  -- Adresse dans le fichier de registres dans le cas d'une
  -- instruction en écriture ou lecture de registre
  signal addrReg : unsigned(POLYRISC_AREG_W - 1 downto 0);

  -----------------------------------------------------------------------------
  -- Signaux du fichier de registres
  --
  -- Fichier de registres
  signal fichierRegistres            : fichierRegistres_t;
  -- Données
  signal entreeReg, A, B             : signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Choix des registres pour les différents chemins de données
  signal choixA, choixB, choixCharge : unsigned(POLYRISC_AREG_W - 1 downto 0);
  -- "Enable" du fichier de registres
  signal chargeRegistre              : std_logic;
  -- Multiplexeur pour l'entrée du fichier de registres (entreeReg)
  signal entreeRegMux                : natural range 0 to 2;

  -----------------------------------------------------------------------------
  -- Signaux de l'UAL
  --
  -- Choix de l'instruction
  signal opUAL        : natural range 0 to n_detail - 1;
  -- Valeur immédiate
  signal vImmediate   : signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Multiplexeur pour B et la valeur immédiate
  signal UALBMux      : std_logic;
  -- Signaux intermédiaires pour l'UAL
  signal F_int, B_int : signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Sortie de l'UAL
  signal F            : signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Sorties pour l'unité de branchement
  signal Z, N         : std_logic;

  -----------------------------------------------------------------------------
  -- Signaux de l'unité de branchement
  --
  -- Condition de branchement
  signal condBr : natural range 0 to n_detail - 1;
  -- Valeur de la condition de branchement
  signal valBr  : std_logic;

  -----------------------------------------------------------------------------
  -- Signaux de la mémoire des données
  --
  -- Mémoire des données
  signal MD       : memoireDonnees_t;
  -- Chargement de la mémoire des données
  signal chargeMD : std_logic;

  -----------------------------------------------------------------------------
  -- Signaux de la mémoire des instructions
  --
  -- Compteur de programme
  signal CP          : unsigned(POLYRISC_MEMI_W - 1 downto 0);
  -- Instruction courante
  signal instruction : instruction_t;
-----------------------------------------------------------------------------
-- Architecture
begin
  -----------------------------------------------------------------------------
  -- Compteur de programme et lecture des instructions
  -----------------------------------------------------------------------------
  -- Lecture dans la mémoire des instructions
  -- La mémoire des instructions est une ROM, elle est constante.
  -- Elle est déclarée et définie dans un package séparé de ce fichier.
  o_inst_addr <= CP;
  instruction <= to_inst(i_inst);
  -- Assignation des signaux intermédiaires (pour clarifier le code)
  iCat        <= instruction.categorie;
  iDet        <= instruction.detail;
  iReg1       <= instruction.reg1;
  iReg2       <= instruction.reg2;
  iVal        <= instruction.valeur;

  -- Compteur de programme
  P_CP : process(clk)
  begin
    if rising_edge(clk) then
      -- Reset synchrone
      if reset = '1' then
        CP <= (others => '0');
      else
        -- Branchement
        if valBr = '1' then
          -- Si la condition de branchement est vraie, incrémenter le
          -- compteur de programme de la valeur passée dans
          -- l'instruction
          CP <= to_unsigned(to_integer(CP) + to_integer(iVal), CP'length);
        -- Lecture I/O
        elsif iCat = memoire and iDet = lireGPIO_in then
          -- Lors d'une lecture GPIO, le processeur est bloqué jusqu'à
          -- ce que le GPIO lui fournisse une donnée valide
          if i_GPIO_valide = '1' then
            CP <= CP + to_unsigned(1, CP'length);
          end if;
        -- Dans les autres cas, on incrémente le CP après chaque
        -- instruction
        else
          CP <= CP + to_unsigned(1, CP'length);
        end if;
      end if;
    end if;
  end process;

  -----------------------------------------------------------------------------
  -- Fichier de registres
  -----------------------------------------------------------------------------
  -- Signaux d'entrée de l'UAL à partir du fichier de registres
  A <= fichierRegistres(to_integer(choixA));
  B <= fichierRegistres(to_integer(choixB));
  -- Choix de l'entrée du fichier de registres en fonction du
  -- multiplexeur entreeRegMux
  entreeReg <=
    -- 0 sélectionne la sortie de l'UAL
    F when entreeRegMux = 0
    -- 1 sélectionne la valeur pointée par la sortie de l'UAL dans la
    -- mémoire
    else MD(to_integer(unsigned(F(POLYRISC_MEMD_W - 1 downto 0)))) when entreeRegMux = 1
    -- 2 sélectionne le bus GPIO
    else i_GPIO;
  -- Chargement synchrone du fichier de registres
  P_FR : process(clk)
  begin
    if rising_edge(clk) then
      -- Reset synchrone
      if reset = '1' then
        fichierRegistres <= (others => (others => '0'));
      else
        -- Si chargeRegistre est activé, charger le registre pointé
        -- par choixCharge
        if chargeRegistre = '1' then
          fichierRegistres(to_integer(choixCharge)) <= entreeReg;
        end if;
      end if;
    end if;
  end process;

  -----------------------------------------------------------------------------
  -- Unité de branchement
  -- L'unité de branchement est aussi combinatoire
  -----------------------------------------------------------------------------
  with condBr select
    valBr <=
    Z                 when egal,
    not(Z)            when diff,
    N                 when ppq,
    not(N) and not(Z) when pgq,
    N or Z            when ppe,
    not(N)            when pge,
    '1'               when toujours,
    '0'               when jamais,
    '0'               when others;

  -----------------------------------------------------------------------------
  -- Mémoire des données
  -----------------------------------------------------------------------------
  -- Chargement synchrone de la mémoire des données
  P_MD : process(clk)
  begin
    if rising_edge(clk) then
      -- Chargement seulement si l'instruction active chargeMD
      if chargeMD = '1' then
        MD(to_integer(unsigned(F(POLYRISC_MEMD_W - 1 downto 0)))) <= B;
      end if;
    end if;
  end process;

  -----------------------------------------------------------------------------
  -- UAL
  -----------------------------------------------------------------------------
  -- Choix de l'entrée B : valeur B en provenance du fichier de
  -- registres ou alors la valeur immédiate passée dans l'instruction, en
  -- fonction de UALBMux
  B_int <= B when UALBMux = '0' else vImmediate;
  -- F est la sortie de l'UAL
  F     <= F_int;

  -- Opérations de l'UAL
  with opUAL select
    F_int <=
    A                                       when passeA,
    B_int                                   when passeB,
    A + B_int                               when AplusB,
    A - B_int                               when AmoinsB,
    A and B_int                             when AetB,
    A or B_int                              when AouB,
    not(A)                                  when nonA,
    A xor B_int                             when AouxB,
    abs(A)                                  when absA,
    minimum(A, B_int)                       when minAB,
    maximum(A, B_int)                       when maxAB,
    resize(A * B_int, F_int'length)         when AmulB,
    shift_right (A, 1)                      when Adiv2,
    (others => '1')                         when others;

  -- Signaux de résultat pour l'unité de branchement
  -- Résultat nul ?
  Z <= '1' when F_int = to_signed(0, POLYRISC_GPIO_W) else '0';
  -- Résultat négatif ?
  N <= F_int(F_int'left);

  -----------------------------------------------------------------------------
  -- Registre du port de sortie o_GPIO
  -----------------------------------------------------------------------------
  P_o_GPIO : process(clk)
  begin
    if rising_edge(clk) then
      -- Reset synchrone
      if reset = '1' then
        o_GPIO        <= (others => '0');
        o_GPIO_valide <= '0';
      else
        if iCat = memoire and iDet = ecrireGPIO_out then
          o_GPIO        <= B;
          o_GPIO_valide <= '1';
        else
          o_GPIO_valide <= '0';
        end if;
      end if;
    end if;
  end process;

  -----------------------------------------------------------------------------
  -- Décodage des instructions
  -----------------------------------------------------------------------------
  -- Fichier de registres
  -- chargeRegistre est activé lors d'une instruction qui écrit dans
  -- les registres
  chargeRegistre <=
    '1' when (
      iCat = reg or
      iCat = reg_valeur or
      (iCat = memoire and iDet = lirememoire) or
      (iCat = memoire and iDet = lireGPIO_in and i_GPIO_valide = '1'))
    else '0';

  -- L'adresse du registre d'arrivée est donnée dans instruction.reg1
  choixCharge <= iReg1;
  -- L'adresse du premier registre de départ est donnée dans
  -- instruction.reg2
  choixA      <= iReg2;
  -- Dans le cas d'une opération registre - registre, on garde
  -- seulement les ceil(log2(POLYRISC_NREG)) + 1 bits les moins
  -- significatifs pour addresser le fichier de registres
  addrReg     <= unsigned(iVal(POLYRISC_AREG_W - 1 downto 0));
  -- Si l'instruction est de type reg, l'adresse du second membre de
  -- l'opération à réaliser est donnée dans les POLYRISC_AREG_W bits les moins
  -- significatifs de la valeur immédiate instruction.valeur
  choixB      <= addrReg when iCat = reg else iReg1;

  -----------------------------------------------------------------------------
  -- Contrôle de l'UAL
  -- valeur immédiate
  vImmediate <= resize(iVal, vImmediate'length);
  -- Multiplexeur pour le choix de l'entrée B de l'UAL
  -- Lors d'un branchement ou d'une opération registre-registre, la valeur
  -- stockée dans le registre adressé par choixB est passée à l'UAL. Lors d'une
  -- opération mémoire ou registre avec valeur immédiate, c'est la valeur
  -- immédiate qui est utilisée dans les calculs
  UALBMux    <= '1' when iCat = reg_valeur or iCat = memoire
                else '0';
  -- Opération de l'UAL
  -- Lors d'une opération de mémoire, on utilise l'UAL pour ajouter la valeur
  -- immédiate à l'adresse donnée en A (instruction.reg2). Lors d'un
  -- branchement, on doit soustraire les deux valeurs passées dans
  -- l'instruction pour les comparer. Dans les autres cas, le code de
  -- l'opération est passé dans instruction.detail.
  opUAL <= AplusB when iCat = memoire else
           AmoinsB when iCat = branchement else
           iDet;

  -----------------------------------------------------------------------------
  -- Contrôle de l'unité de branchement
  -- On ne permet un branchement que lors d'une instruction de branchement
  condBr <= iDet when iCat = branchement else jamais;

  -----------------------------------------------------------------------------
  -- Contrôle de la charge de la mémoire
  chargeMD <= '1' when iCat = memoire and iDet = ecrireMemoire else '0';

  -----------------------------------------------------------------------------
  -- Contrôle de la mémoire des données
  entreeRegMux <= 1 when iCat = memoire and iDet = lireMemoire else
                  2 when iCat = memoire and iDet = lireGPIO_in else
                  0;

end RISCV;
