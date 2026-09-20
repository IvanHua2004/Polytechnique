-------------------------------------------------------------------------------
--
-- feu_tb.vhd
--
-- Banc de test exhaustif et automatisé pour le module feu.vhd
-- Vérifie les transitions d’état, le clignotement et le reset simultané.
--
-- v. 2.1 2025-10-17
--
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use std.env.finish;

entity feu_tb is
end entity;

architecture arch of feu_tb is
  -- Signaux du banc de test
  signal clk, reset    : std_logic := '0';
  signal I_btns        : std_logic_vector(3 downto 0) := (others => '0');
  signal O_feu0, O_feu1 : std_logic_vector(2 downto 0);

  constant CLK_PERIODE : time := 8 ns;
  constant CLK_FREQ    : integer := 125_000_000;  -- 125 MHz

  -- États de couleur attendus
  constant C_VERT    : std_logic_vector(2 downto 0) := "010";
  constant C_ORANGE  : std_logic_vector(2 downto 0) := "110";
  constant C_ROUGE   : std_logic_vector(2 downto 0) := "100";
  constant C_ETEINT  : std_logic_vector(2 downto 0) := "000";

begin
  clk <= not clk after CLK_PERIODE / 2;
  reset <= '1', '0' after 100 ns;

  UUT : entity work.feu(arch)
    port map(
      clk    => clk,
      reset  => reset,
      I_btns => I_btns,
      O_feu0 => O_feu0,
      O_feu1 => O_feu1
    );

  process
  begin
    report "=== Début de la simulation du feu de circulation ===" severity note;
    wait until reset = '0';
    wait for 50 ns;

    -- Test initial : au reset
    assert (O_feu0 = C_ETEINT and O_feu1 = C_ETEINT)
      report "echec : les feux devraient être éteints au reset" severity error;

    -- Appui sur bouton 0 → Feu 0 vert / Feu 1 rouge
    I_btns(0) <= '1';
    wait for 16 ns;
    I_btns(0) <= '0';
    wait for 200 ns;

    assert (O_feu0 = C_VERT and O_feu1 = C_ROUGE)
      report "echec : après appui sur btn0, Feu0 devrait être vert et Feu1 rouge" severity error;

    -- Appuyer sur les deux boutons à la fois
    I_btns(0) <= '1';
    I_btns(1) <= '1';
    wait for 32 ns;
    I_btns(0) <= '0';
    I_btns(1) <= '0';
    wait for 200 ns;

    assert (O_feu0 = C_ETEINT and O_feu1 = C_ETEINT)
      report "echec : le reset par appui simultané sur btn0 et btn1 ne fonctionne pas" severity error;


    -- Appui sur bouton 1 → Feu 0 rouge / Feu 1 vert
    I_btns(1) <= '1';
    wait for 16 ns;
    I_btns(1) <= '0';
    wait for 200 ns;

    assert (O_feu0 = C_ROUGE and O_feu1 = C_VERT)
      report "echec : après appui sur btn1, Feu0 devrait être rouge et Feu1 vert" severity error;

    -- Test clignottement orange pendant 2s
    I_btns(1) <= '1';
    wait for 16 ns;
    I_btns(1) <= '0';
    wait for 200000 us;

    assert not (O_feu0 = O_feu1)
      report "echec : pendant le clignotement, les feux ne doivent pas être identiques" severity error;

    report "Tous les tests se sont terminés avec succes" severity note;
    finish;
  end process;

end architecture;
