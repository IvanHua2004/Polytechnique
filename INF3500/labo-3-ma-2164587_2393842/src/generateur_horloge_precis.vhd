---------------------------------------------------------------------------------------------------
-- 
-- generateur_horloge_precis.vhd
--
-- Pierre Langlois
-- v. 1.0, 2020/07/22, inspir� de plusieurs modules pr�c�dents
--
-- G�n�rateur d'horloge pr�cis, mais co�teux.
-- La fr�quence de l'horloge de sortie est pr�cise par rapport � la fr�quence de l'horloge d'entr�e,
-- et le signal d'horloge de sortie est sans vacillement (jitter).
--
---------------------------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity generateur_horloge_precis is
  generic (
    freq_in  : natural := 2;
    freq_out : natural := 1
  );
  port (
    clk_in  : in std_logic;
    clk_out : out std_logic
  );
end generateur_horloge_precis;

architecture arch of generateur_horloge_precis is

begin

  assert real(freq_in) / real(freq_out) / 2.0 <= real(natural'high)
  report "Le rapport des fréquences est trop élevé, > " & integer'image(natural'high) & "." severity failure;
  assert freq_in >= 2 * freq_out
  report "La fréquence de sortie doit être infèrieure ou égale à la moitié de la fréquence d'entrée, utilisez un modèle différent." severity failure;

  process (clk_in)
    constant compte_max : natural := freq_in / freq_out / 2;
    variable compteur   : natural range 0 to compte_max;
    variable clk_int    : std_logic := '0';
  begin
    if rising_edge(clk_in) then
      if compteur = compte_max then
        clk_int  := not(clk_int);
        compteur := 0;
      else
        compteur := compteur + 1;
      end if;
    end if;
    clk_out <= clk_int;
  end process;

end arch;
