library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
library WORK;
use WORK.all;

entity top is
  generic (
    N : positive := 16;
    M : positive := 8
    );
end top;

architecture arch of top is
  signal clk, reset                       : std_logic;
  signal zynq_rst, po_rst                 : std_logic;
  signal data_in                          : std_logic_vector(31 downto 0);
  signal x                                : unsigned(M-1 downto 0);
  signal from_zynq_tdata, to_zynq_tdata   : std_logic_vector(31 downto 0);
  signal from_zynq_tlast, to_zynq_tlast   : std_logic;
  signal from_zynq_tready, to_zynq_tready : std_logic;
  signal from_zynq_tvalid, to_zynq_tvalid : std_logic;

begin
  to_zynq_tdata(N-1 downto M) <= (others => '0');
  to_zynq_tdata(M-1 downto 0) <= std_logic_vector(x);
  -- On est prêt à recevoir une donnée quand le zynq est prêt
  from_zynq_tready            <= to_zynq_tready;
  reset                       <= zynq_rst or po_rst;

  inst_racine_carree_pipeline : entity racine_carree_pipeline(newton)
    generic map (
      N,
      M
      ) port map (
        clk     => clk,
        -- Le protocole AXI-Stream a un reset active-low
        reset   => not reset,
        i_A     => unsigned(from_zynq_tdata(N-1 downto 0)),
        i_valid => from_zynq_tvalid,
        i_last  => from_zynq_tlast,
        i_ready => to_zynq_tready,
        o_X     => x,
        o_valid => to_zynq_tvalid,
        o_last  => to_zynq_tlast
        );

  -- Power-on reset : Pour réinitialiser le système lorsqu'il est allumé
  por_inst : entity power_on_reset(behavioral)
    generic map(100)
    port map(clk, po_rst);

  -- Zynq
  zynq : entity zynq_wrapper(STRUCTURE)
    port map (
      clk              => clk,
      reset            => zynq_rst,
      from_zynq_tdata  => from_zynq_tdata,
      from_zynq_tlast  => from_zynq_tlast,
      from_zynq_tready => from_zynq_tready,
      from_zynq_tvalid => from_zynq_tvalid,
      to_zynq_tdata    => to_zynq_tdata,
      to_zynq_tkeep    => "1111",
      to_zynq_tlast    => to_zynq_tlast,
      to_zynq_tready   => to_zynq_tready,
      to_zynq_tvalid   => to_zynq_tvalid
      );

end arch;
