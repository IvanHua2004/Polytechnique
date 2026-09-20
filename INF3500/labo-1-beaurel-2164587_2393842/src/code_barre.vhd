-------------------------------------------------------------------------------
--
-- code_barre.vhd
--
-- v. 2.0 2024-06-18
--
-------------------------------------------------------------------------------

library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.utilitaires_inf3500_pkg.all;

entity code_barre is
  generic (
    N : positive := 32 -- largeur du code
  );
  port (
    i_detecteur         : in std_logic_vector(N - 1 downto 0);
    o_rgb               : out std_logic_vector(5 downto 0);
    o_erreur_encre_vide : out std_logic;
    o_erreur_impression : out std_logic;
    o_impression_valide : out std_logic;

    o_erreur_secteur  : out std_logic_vector(3 downto 0);
    o_erreur_position : out std_logic_vector(clog2(N) - 1 downto 0)
  );
end;

architecture arch of code_barre is
begin

  assert N mod 4 = 0 report "Cette architecture ne fonctionne que pour N muliple de 4." severity error;

  -- allumer la premi�re led en rouge (RGB)
  -- o_rgb(2 downto 0) <= "100";
  -- la deuxi�me led est �teinte
  -- o_rgb(5 downto 3)   <= "000";
  -- o_erreur_encre_vide <= '1';
  -- o_erreur_impression <= '1';
  -- o_impression_valide <= '1';

  -- Start
 process(all)
 variable occupe : std_logic := '0';
 variable premier: std_logic := '0';
 variable deuxieme : std_logic := '0';
 variable erreur_trouvee : boolean := false;
 variable pos     : integer := 0;
 constant secteur_taille : integer := N / 4;
 variable erreur_secteur : std_logic_vector(3 downto 0) := (others => '0');


begin

o_rgb(2 downto 0) <= "000";
    for i in 0 to N-1 loop
        if i_detecteur(i) = '1' then
            occupe := '1';  
            if premier = '1' then
                deuxieme := '1';
                if not erreur_trouvee then
                pos := i-1;
                case pos / secteur_taille is
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
        o_erreur_encre_vide <= '1';
        o_erreur_impression <= '0';
        o_impression_valide <= '0';
        
        o_rgb(5 downto 3)    <= "001";
        o_erreur_secteur    <= "0000";
        o_erreur_position   <= (others => '0');
        
    elsif deuxieme = '1' then
        o_erreur_encre_vide <= '0';
        o_erreur_impression <= '1';
        o_impression_valide <= '0';
        
        o_rgb(5 downto 3)    <= "100";
        o_erreur_secteur  <= erreur_secteur;
        o_erreur_position <= std_logic_vector(to_unsigned(pos, clog2(N)));
          
        occupe := '0';
        premier := '0';
        deuxieme := '0';
        erreur_trouvee := false;
        pos     := 0;
        
    else
        o_erreur_encre_vide <= '0';
        o_erreur_impression <= '0';
        o_impression_valide <= '1';
        
        o_rgb(5 downto 3)    <= "010";
        o_erreur_secteur    <= "0000";
        o_erreur_position   <= (others => '0');
        
        occupe := '0';
        premier := '0';
        deuxieme := '0';
        
    end if;
    
--o_erreur_impression <= '0';
--o_erreur_encre_vide <= '1';
--o_impression_valide <= '0';


  -- code � modifier pour le bonus de la partie 4a.
  --o_erreur_secteur  <= erreur_secteur;
  --o_erreur_position <= std_logic_vector(to_unsigned(3, clog2(N)));
end process;
end;