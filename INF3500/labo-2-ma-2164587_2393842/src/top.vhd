-------------------------------------------------------------------------------
--
-- top.vhd
--
-- Top-level du laboratoire 2, qui instancie le zynq et le module feu
-- et gère le debouncing des signaux générés par les boutons. Le
-- script TCL create_zynq_wrapper.tcl doit être sourcé pour que ce
-- top-level fonctionne.
--
-- v. 2.1 2024-06-25
--
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use WORK.all;

entity top is
  port (
    -- Switch utilisé comme reset (on utilise un seul switch)
    I_sw_top      : in  std_logic;
    -- Les quatre boutons
    I_btns_top    : in  std_logic_vector(3 downto 0);
    -- Les deux LEDs RGB (3 bits de couleur chacune)
    O_rgbleds_top : out std_logic_vector(5 downto 0)
    );
end top;

architecture arch of top is
  signal clk                    : std_logic;
  signal rst                    : std_logic;
  signal btn0, btn1, btn2, btn3 : std_logic;
  signal btns_db                : std_logic_vector(3 downto 0);
  signal feu0                   : std_logic_vector(2 downto 0);
  signal feu1                   : std_logic_vector(2 downto 0);
begin

  -- Signal transportant les quatre boutons débouncés par le
  -- monopulseur (`&' est la concaténation en VHDL)
  btns_db       <= btn3 & btn2 & btn1 & btn0;
  -- Les deux feux sont rassemblés pour être envoyés aux LEDs
  O_rgbleds_top <= feu1 & feu0;

  -- Module d'intérêt
  feu_inst : entity feu(arch)
    port map(
      clk    => clk,
      reset  => rst,
      I_btns => btns_db,
      O_feu0 => feu0,
      O_feu1 => feu1
      );

  -- Instanciation d'un monopulseur par bouton
  -- Pour filtrer les effets de rebond dus aux contacteurs des boutons
  -- et à l'appui humain
  btn0db : entity monopulseur(behavioral)
    generic map(2500000)
    port map(
      rst             => rst,
      clk             => clk,
      I_bouton        => I_btns_top(0),
      O_bouton_stable => btn0
      );

  btn1db : entity monopulseur(behavioral)
    generic map(2500000)
    port map(
      rst             => rst,
      clk             => clk,
      I_bouton        => I_btns_top(1),
      O_bouton_stable => btn1
      );

  btn2db : entity monopulseur(behavioral)
    generic map(2500000)
    port map(
      rst             => rst,
      clk             => clk,
      I_bouton        => I_btns_top(2),
      O_bouton_stable => btn2
      );

  btn3db : entity monopulseur(behavioral)
    generic map(2500000)
    port map(
      rst             => rst,
      clk             => clk,
      I_bouton        => I_btns_top(3),
      O_bouton_stable => btn3
      );

  -- Power-on reset : Pour réinitialiser le système lorsqu'il est allumé
  por_inst : entity power_on_reset(behavioral)
    generic map(100)
    port map(clk, rst);

  -- Module Zynq
  zynq : entity zynq_wrapper(STRUCTURE)
    port map (
      clk     => clk,
      to_zynq => std_logic_vector(to_unsigned(0, 32))
      );
end arch;
