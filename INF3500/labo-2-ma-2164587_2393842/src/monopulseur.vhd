-------------------------------------------------------------------------------
--
-- monopulseur.vhd
--
-- Debounceur de bouton
--
-- v. 1.1 2024-06-04
--
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity monopulseur is
  generic (
    -- Definir le temps de debounce en fonction de la frequence d'horloge
    duree_debounce : integer := 2500000
    );
  port (
    rst             : in  std_logic;
    clk             : in  std_logic;
    I_bouton        : in  std_logic;
    O_bouton_stable : out std_logic
    );
end monopulseur;

architecture behavioral of monopulseur is
  signal bouton_sync_0     : std_logic;
  signal bouton_sync_1     : std_logic;
  signal bouton_sync_2     : std_logic;
  signal bouton_debounce   : std_logic;
  signal compteur_debounce : integer range 0 to duree_debounce;
begin
  -- Synchronisation du signal de bouton avec l'horloge
  process(all)
  begin
    if rst = '1' then
      bouton_sync_0 <= '0';
      bouton_sync_1 <= '0';
      bouton_sync_2 <= '0';
    elsif rising_edge(clk) then
      bouton_sync_0 <= I_bouton;
      bouton_sync_1 <= bouton_sync_0;
      bouton_sync_2 <= bouton_sync_1;
    end if;
  end process;

  -- Debouncing du signal de bouton
  process(all)
  begin
    if rst = '1' then
      compteur_debounce <= 0;
      bouton_debounce   <= '0';
    elsif rising_edge(clk) then
      if bouton_sync_2 = bouton_sync_1 then
        if compteur_debounce < duree_debounce then
          compteur_debounce <= compteur_debounce + 1;
        else
          bouton_debounce <= bouton_sync_2;
        end if;
      else
        compteur_debounce <= 0;
      end if;
    end if;
  end process;

  -- Affectation du signal de bouton debounce a la sortie
  O_bouton_stable <= bouton_debounce;

end behavioral;
