-- Fichier src/simple_alu.vhdl
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;

entity gate_not is
  port
  (
    i : in std_logic;
    o : out std_logic
  );
end gate_not;

architecture rtl of gate_not is
begin
  o <= not i;
end rtl;