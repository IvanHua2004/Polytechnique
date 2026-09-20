-------------------------------------------------------------------------------
--
-- power_on_reset.vhd
--
-- Generation d'un power-on-reset pour design synchrone
--
-- v. 1.1 2024-07-10
--
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.STD_LOGIC_ARITH.all;
use IEEE.STD_LOGIC_UNSIGNED.all;

entity power_on_reset is
  generic (
    reset_time : integer := 100
    );
  port (
    clk       : in  std_logic;
    reset_out : out std_logic
    );
end power_on_reset;

architecture behavioral of power_on_reset is
  signal reset_counter  : integer range 0 to reset_time := 0;
  signal internal_reset : std_logic                     := '1';
begin
  process(all)
  begin
    if rising_edge(clk) then
      if reset_counter < 100 then
        reset_counter  <= reset_counter + 1;
        internal_reset <= '1';
      else
        internal_reset <= '0';
      end if;
    end if;
  end process;

  reset_out <= internal_reset;
end Behavioral;
