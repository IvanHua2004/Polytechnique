library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use WORK.all;

entity top is
  generic (
    N : positive := 32;
    M : positive := 16
  );
  port (
    i_btns_top : in std_logic_vector(3 downto 0);
    o_leds_top : out std_logic_vector(3 downto 0)
  );
end top;

architecture arch of top is
  signal clk, clk_50_Hz : std_logic;
  signal po_rst         : std_logic;
  signal btn_rst        : std_logic;
  signal reset, go      : std_logic;
  signal data_in        : std_logic_vector(31 downto 0);
  signal data_out       : unsigned(31 downto 0);
begin
  reset <= btn_rst or po_rst;

  gen_clk : entity generateur_horloge_precis(arch)
    generic map(125e6, 50)
    port map
      (clk, clk_50_Hz);

  inst_racine_carree : entity racine_carree(newton)
    generic map(
      N => 32,
      M => 16
    ) port map
    (

    reset,
    clk    => clk_50_Hz,
    i_A    => unsigned(data_in),
    i_go   => go,
    o_X    => data_out(M - 1 downto 0),
    o_fini => o_leds_top(0)
    );

  -- Instanciation d'un monopulseur par bouton
  -- Pour filtrer les effets de rebond dus aux contacteurs des boutons
  -- et à l'appui humain
  btn0db : entity monopulseur(arch)
    generic map('1', '1', 1, 1)
    port map
      (clk_50_Hz, i_btns_top(0), btn_rst);

  btn1db : entity monopulseur(arch)
    generic map('1', '1', 1, 1)
    port map
      (clk_50_Hz, i_btns_top(1), go);

  -- Power-on reset : Pour réinitialiser le système lorsqu'il est allumé
  por_inst : entity power_on_reset(behavioral)
    generic map(100)
    port map
      (clk, po_rst);

  zynq : entity zynq_wrapper(STRUCTURE)
    port map
    (
      clk       => clk,
      to_zynq   => std_logic_vector(data_out),
      from_zynq => data_in
    );

end arch;
