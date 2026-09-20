-------------------------------------------------------------------------------
--
-- code_barre_tb.vhd
--
-- v. 1.1 2025-09-21
--
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.numeric_std.all;
use IEEE.math_real.all;
use std.env.finish;
use work.utilitaires_inf3500_pkg.all;
use work.code_barre;

entity code_barre_tb is
  generic (
    N_tb : positive := 8
  );
end entity;

architecture arch of code_barre_tb is
  signal detecteur_tb         : std_logic_vector(N_tb - 1 downto 0);
  signal erreur_encre_vide_tb : std_logic;
  signal erreur_impression_tb : std_logic;
  signal impression_valide_tb : std_logic;
  signal rgb_tb               : std_logic_vector(5 downto 0);

  signal erreur_secteur_tb  : std_logic_vector(3 downto 0);
  signal erreur_position_tb : std_logic_vector(clog2(N_tb) - 1 downto 0);

  -- modèle de référence simplifié pour comparer aux sorties
  function modele_attendu(detecteur : std_logic_vector) 
    return std_logic_vector is
    variable occupe, premier, deuxieme : std_logic := '0';
    variable erreur_trouvee : boolean := false;
    variable pos     : integer := 0;
    constant secteur_taille : integer := detecteur'length / 4;
    variable erreur_secteur : std_logic_vector(3 downto 0) := (others => '0');
    variable resultats : std_logic_vector(15 downto 0);
    -- [15]=erreur_encre_vide, [14]=erreur_impression, [13]=impression_valide
    -- [12:9]=erreur_secteur, [8:0]=RGB(5:0)+position (non vérifié finement ici)
  begin
    resultats := (others => '0');

    for i in 0 to detecteur'length-1 loop
      if detecteur(i) = '1' then
        occupe := '1';
        if premier = '1' then
          deuxieme := '1';
          pos := i;
          if not erreur_trouvee then
            case i / secteur_taille is
              when 0 => erreur_secteur := "0001";
              when 1 => erreur_secteur := "0010";
              when 2 => erreur_secteur := "0100";
              when 3 => erreur_secteur := "1000";
              when others => erreur_secteur := "0000";
            end case;
            erreur_trouvee := true;
          end if;
        end if;
        premier := '1';
      else
        premier := '0';
      end if;
    end loop;

    if occupe = '0' then
      resultats(15) := '1';  -- erreur encre vide
    elsif deuxieme = '1' then
      resultats(14) := '1';  -- erreur impression
    else
      resultats(13) := '1';  -- impression valide
    end if;

    resultats(12 downto 9) := erreur_secteur;

    return resultats;
  end;

begin

  UUT : entity code_barre(arch)
    generic map(N => N_tb)
    port map(
      i_detecteur         => detecteur_tb,
      o_rgb               => rgb_tb,
      o_erreur_encre_vide => erreur_encre_vide_tb,
      o_erreur_impression => erreur_impression_tb,
      o_impression_valide => impression_valide_tb,
      o_erreur_secteur    => erreur_secteur_tb,
      o_erreur_position   => erreur_position_tb
    );

  -- application exhaustive des vecteurs de test, affichage et vérification
  process
    variable ref : std_logic_vector(15 downto 0);
  begin

    for k in 0 to 2 ** N_tb - 1 loop
      detecteur_tb <= std_logic_vector(to_unsigned(k, N_tb));
      wait for 10 ns; -- propagation

      ref := modele_attendu(detecteur_tb);

      -- vérifications de base
      assert erreur_encre_vide_tb = ref(15)
        report "Erreur encre vide incorrecte pour k=" & integer'image(k)
        severity error;

      assert erreur_impression_tb = ref(14)
        report "Erreur impression incorrecte pour k=" & integer'image(k)
        severity error;

      assert impression_valide_tb = ref(13)
        report "Impression valide incorrecte pour k=" & integer'image(k)
        severity error;

      assert erreur_secteur_tb = ref(12 downto 9)
        report "Erreur secteur incorrecte pour k=" & integer'image(k)
        severity error;

    end loop;

    report "Simulation terminée avec succès." severity note;

    finish;
    
  end process;

end arch;
