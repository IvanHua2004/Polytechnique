-- Fichier src/simple_alu_tb.vhdl
library vunit_lib; -- Nécessaire pour VUnit
context vunit_lib.vunit_context; -- Nécessaire pour VUnit

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;

library lib;

entity simple_alu_tb is
  generic
    (runner_cfg : string); -- Nécessaire pour vunit
end entity;

architecture tb of simple_alu_tb is
  signal i, o : std_logic;
begin
  alu_uut : entity lib.gate_not
    port map
    (
      i => i,
      o => o
    );

  main : process is
  begin
    test_runner_setup(runner, runner_cfg); -- Nécessaire pour vunit
    while test_suite loop -- Nécessaire pour vunit
      if run("inversion_0") then -- Exemple de test réussi
        i <= '0';
        wait for 10 ns;
        assert o = '1' report "Expected 1 but got " & to_string(o);
      elsif run("inversion_1") then -- Exemple de test échoué
        i <= '0'; -- Devrait être '1'
        wait for 10 ns;
        assert o = '0' report "Expected 0 but got " & to_string(o);
      end if;
    end loop;
    test_runner_cleanup(runner); -- Nécessaire pour vunit
  end process;
end architecture;