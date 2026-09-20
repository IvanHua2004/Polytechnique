-------------------------------------------------------------------------------
--
-- PolyRISC_tb.vhd
-- v 0.1 2024-08-06 impl�mentation d'un banc d'essai avec file I/O
-- pour tester un programme pour PolyRISC
--
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use IEEE.MATH_REAL.all;                 -- pour floor et sqrt
-- Pour lire / �crire dans des fichiers
use STD.TEXTIO.all;
use IEEE.STD_LOGIC_TEXTIO.all;
use work.all;
use work.PolyRISC_utils.all;

entity PolyRISC_tb is
end;

architecture arch_tb of PolyRISC_tb is
  -- On simule la m�moire des instructions avec une constante
  -- Programme de d�monstration : calcul du n-i�me terme de la suite
  -- de Fibonacci, o� n est donn� au processeur sur son GPIO
  type memoireInstSimulation is
    array(0 to 2 ** POLYRISC_MEMI_W - 1) of unsigned(POLYRISC_GPIO_W - 1 downto 0);
  -- gen_inst g�n�re une instruction de type instruction_t � partir de nombres
  -- entiers (voir le fichier PolyRISC_utils_pkg.vhd)
  -- inst_to_unsigned convertit une instruction en unsigned de la
  -- largeur correspondante
  constant memoire_inst : memoireInstSimulation :=
    (
      -- 0 : R0 := i_GPIO (entrée)
      0      => inst_to_unsigned(gen_inst(memoire, lireGPIO_in, 0, 0, 0)),
      -- 1 : R1 := $0 (bas)
      1      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 1, 0, 0)),
      -- 2 : R2 := $32767 (haut)
      2      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 2, 0, 32767)),
      -- 3 : R3 := $0 (pivot)
      3      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 3, 0, 0)),
      -- 4 : R4 := $0 (pivot au carrée)
      4      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 4, 0, 0)),
      -- 5 : R5 := $16 (compteur)
      5      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 5, 0, 16)),
      -- 6 : R6 := $0 (constante 0)
      6      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 6, 0, 0)),
      -- 7 : R7 := $1 (constante 1)
      7      => inst_to_unsigned(gen_inst(reg_valeur, passeB, 7, 0, 1)),
      -- 8 : R3 := R1 + R2
      8      => inst_to_unsigned(gen_inst(reg, AplusB, 3, 1, 2)),
      -- 9 : R3 := R3 / 2
      9      => inst_to_unsigned(gen_inst(reg, Adiv2, 3, 3, 0)),
      -- 10 : R4 := R3 * R3
      10      => inst_to_unsigned(gen_inst(reg, AmulB, 4, 3, 3)),
      -- 11 : si R4 > R0 aller CP + 3
      11     => inst_to_unsigned(gen_inst(branchement, pgq, 0, 4, 3)),
      -- 12 : R1 := R3
      12     => inst_to_unsigned(gen_inst(reg, passeA, 1, 3, 0)),
      -- 13 : toujours aller CP + 2
      13     => inst_to_unsigned(gen_inst(branchement, toujours, 0, 0, 2)),
      -- 14 : R2 := R3
      14     => inst_to_unsigned(gen_inst(reg, passeA, 2, 3, 0)),
      -- 15 : R5 := R5 - R7
      15     => inst_to_unsigned(gen_inst(reg, AmoinsB, 5, 5, 7)),
      -- 16 : si R5 > R6 aller CP - 8
      16     => inst_to_unsigned(gen_inst(branchement, pgq, 6, 5, -8)),
      -- 17 : o_GPIO := R3
      17     => inst_to_unsigned(gen_inst(memoire, ecrireGPIO_out, 3, 0, 0)),
      -- 18 : Instruction STOP qui arrete le processeur
      18     => inst_to_unsigned(STOP),
      -- Le reste de la m moire est NOP
      others => inst_to_unsigned(NOP));

  -- P�riode de l'horloge
  constant periode         : time                                 := 10 ns;
  signal clk               : std_logic                            := '0';
  signal uut_reset         : std_logic;
  -- GPIO
  signal GPIO_in, GPIO_out : signed(POLYRISC_GPIO_W - 1 downto 0);
  signal GPIO_in_valide    : std_logic                            := '0';
  signal GPIO_out_valide   : std_logic;
  -- Signaux pour relier PolyRISC � la m�moire d'instructions simul�e
  signal instruction       : unsigned(POLYRISC_GPIO_W - 1 downto 0);
  signal inst_addr         : unsigned(POLYRISC_MEMI_W - 1 downto 0);
  -- Signaux pour la lecture dans les fichiers de vecteurs
  file fichier_entrees     : text;
  file fichier_sorties     : text;
  -- Signal pour passer le vecteur de test � l'UUT
  signal vecteur_test      : signed(POLYRISC_GPIO_W - 1 downto 0) := (others => '0');
begin
  -- clk
  clk         <= not clk after periode / 2;
  -- Lecture de l'instruction par PolyRISC
  instruction <= memoire_inst(to_integer(inst_addr));
  -- Affectation du GPIO au vecteur de test
  GPIO_in     <= vecteur_test;

  -- instanciation du module � v�rifier
  UUT : entity PolyRISC(RISCV)
    port map (
      clk           => clk,
      reset         => uut_reset,
      i_GPIO        => GPIO_in,
      i_GPIO_valide => GPIO_in_valide,
      i_inst        => instruction,
      o_inst_addr   => inst_addr,
      o_GPIO        => GPIO_out,
      o_GPIO_valide => GPIO_out_valide
      );

  test : process
    -- Dur�e de reset
    constant reset_cnt     : integer := 5;
    -- Variable pour stocker la ligne courante du fichier d'entr�es
    variable ligne_entrees : line;
    -- Variable interm�diaire pour lire le fichier d'entr�e comme un
    -- entier
    variable ligne_sortie : line;
    variable entree_int    : integer;
    variable attendu  : integer;
    variable resultat : integer;
    begin
    -- Ouverture des fichiers
    file_open(fichier_entrees, "dichotomie_vecs.txt", read_mode);
    file_open(fichier_sorties, "dichotomie_out.txt", write_mode);
    -- Tant qu'on a des entr�es � lire, on les soumet � l'UUT
    while not(endfile(fichier_entrees)) loop
      -- Lire la ligne courante du fichier
      readline(fichier_entrees, ligne_entrees);
      -- read sert � lire le contenu d'une ligne dans une ou plusieurs
      -- variable(s) VHDL
      read(ligne_entrees, entree_int);
      vecteur_test   <= to_signed(entree_int, POLYRISC_GPIO_W);
      -- R�initialisation du processeur pendant (9/4) * periode
      uut_reset      <= '1';
      -- On ajoute periode / 2 pour se retrouver sur le front
      -- descendant de l'horloge, afin d'�tre s�r de changer les
      -- valeurs des pins avant le front montant
      wait for periode * reset_cnt + periode / 2;
      uut_reset      <= '0';
      -- Indication au PolyRISC que l'entr�e sur son GPIO est pr�te
      -- en laissant passer un front d'horloge pour s'assurer qu'il
      -- la prend bien en compte
      GPIO_in_valide <= '1';
      wait for periode;
      GPIO_in_valide <= '0';
      -- Attente du temps de calcul du processeur
      while GPIO_out_valide = '0' loop
        wait for periode;
      end loop;
      -------------------------------------------------------------------------
      -- �criture des sorties sur stdout : vous devez modifier cette
      -- partie pour �crire dans un fichier
        report "Sortie : " & integer'image(to_integer(GPIO_out)) severity note;
        ligne_sortie := new string'("");
        
        write(ligne_sortie, to_integer(GPIO_out));  -- écrit le résultat dans la ligne
        writeline(fichier_sorties, ligne_sortie);   -- écrit la ligne dans le fichier
        deallocate(ligne_sortie);  -- important pour éviter les fuites mémoire
          
        resultat := to_integer(GPIO_out);
        attendu := integer(floor(sqrt(real(entree_int))));

        assert (resultat = attendu)
        
        report "ERREUR : entrée=" & integer'image(entree_int) &
               " attendu=" & integer'image(attendu) &
               " obtenu=" & integer'image(resultat)
        severity error;
    -------------------------------------------------------------------------
    end loop;
    -- Fermeture des fichiers
    file_close(fichier_entrees);
    file_close(fichier_sorties);
    -- N'oubliez pas de fermer votre fichier de sortie !
    -- Fin de simulation
    report "Fin" severity failure;
  end process;
end;