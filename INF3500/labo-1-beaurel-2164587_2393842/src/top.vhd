library ieee;
use ieee.std_logic_1164.all;
use ieee.NUMERIC_STD.all;
use work.all;

entity top is
  port (
    rgb     : out std_logic_vector(5 downto 0);
    led_top : out std_logic_vector(3 downto 0)
  );
end top;

architecture arch of top is
  signal clk               : std_logic;
  signal count             : unsigned(31 downto 0) := to_unsigned(0, 32);
  signal data_out, data_in : std_logic_vector(31 downto 0);
begin

  inst_code_barre : entity code_barre(arch)
    generic map(
      N => 32
    ) port map
    (
    i_detecteur         => data_in,
    o_rgb               => rgb,
    o_erreur_encre_vide => data_out(29),
    o_erreur_impression => data_out(30),
    o_impression_valide => data_out(31),
    o_erreur_secteur    => led_top,
    o_erreur_position   => data_out(4 downto 0)
    );

  data_out(28 downto 5) <= (others => '0');

  zynq : entity zynq_wrapper(STRUCTURE)
    port map
    (
      clk       => clk,
      to_zynq   => data_out,
      from_zynq => data_in
    );

end arch;