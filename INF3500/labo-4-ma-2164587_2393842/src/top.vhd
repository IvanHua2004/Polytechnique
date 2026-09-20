-------------------------------------------------------------------------------
--
-- top.vhd
--
-- Top-level du laboratoire 4, qui instancie le zynq et le module demo.
-- Le script TCL create_zynq_wrapper.tcl doit être sourcé pour que ce
-- top-level fonctionne.
--
-- v. 1.1 2024-06-11
-- v. 1.2 2025-03-17 devient le laboratoire 4
--
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
-- Définition des utilitaires pour PolyRISC, notamment la largeur du
-- GPIO `POLYRISC_GPIO_W`
use WORK.PolyRISC_utils.all;
use WORK.all;

entity top is
  port (
    o_led_top  : out std_logic_vector(3 downto 0);
    i_btns_top : in  std_logic_vector(3 downto 0)
    );
end top;

architecture arch of top is
  signal clk     : std_logic;
  -- Power-on reset
  signal poreset : std_logic;
  -- Reset global
  signal rst     : std_logic;

  -- Signaux pour relier la ROM et le PolyRISC
  -- Instruction
  signal polyrisc_instruction : unsigned(POLYRISC_GPIO_W - 1 downto 0);
  -- Adresse de l'instruction
  signal polyrisc_instr_addr  : unsigned(POLYRISC_MEMI_W - 1 downto 0);

  -- Drapeau qui indique que le PolyRISC a mis un résultat valide sur
  -- son GPIO
  signal polyrisc_gpio_out_ok : std_logic;
  -- Sortie GPIO du PolyRISC
  signal polyrisc_gpio_out    : signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Drapeau qui indique que l'interface utilisateur a mis une entrée valide
  -- sur l'entrée GPIO du PolyRISC
  signal polyrisc_gpio_in_ok  : std_logic;
  -- Entrée GPIO du PolyRISC
  signal polyrisc_gpio_in     : signed(POLYRISC_GPIO_W - 1 downto 0);
  -- Reset pour le PolyRISC
  signal polyrisc_reset       : std_logic := '0';

  -- Signaux pour relier la ROM et le contrôleur AXI-Stream
  -- Signaux AXI pour relier le contrôleur AXI-Stream et le ZYNQ
  signal s2r_last       : std_logic;
  signal s2r_valid      : std_logic;
  signal s2r_ready      : std_logic;
  -- Signal de données relié au bus AXI du ZYNQ
  signal s2r_donnee_in  : std_logic_vector(32 - 1 downto 0);
  -- Signal qui relie l'entrée de données de la ROM et le contrôleur
  -- AXI-Stream
  signal s2r_donnee_out : unsigned(POLYRISC_GPIO_W - 1 downto 0);
  -- Signal qui porte l'adresse donnée par le contrôleur AXI-Stream
  signal s2r_addr_out   : unsigned(POLYRISC_MEMI_W - 1 downto 0);
  -- Signal "write enable" du contrôleur AXI Stream pour la ROM
  signal s2r_wr         : std_logic;
  -- Signal qui donne son adresse à la ROM
  signal rom_addr_in    : unsigned(POLYRISC_MEMI_W - 1 downto 0);

  -- Signaux pour le ZYNQ
  signal data_out, data_in : std_logic_vector(31 downto 0);
  -- Contrôle du PolyRISC à travers l'interface GPIO du ZYNQ :
  -- 0x1 fait partir le PolyRISC
  -- 0x2 réinitialise le PolyRISC
  signal zynq_control      : std_logic_vector(31 downto 0);
begin
  -----------------------------------------------------------------------------
  -- Gestion des resets
  -- Le bouton 0 et le power-on reset réinitialisent complètement le design
  -- Le bit 2 du GPIO1 du Zynq est connecté au reset du convertisseur
  -- AXI-Stream vers ROM d'instructions
  rst            <= poreset or i_btns_top(0) or zynq_control(2);
  -- Le bit 1 du GPIO1 du Zynq est connecté au reset du PolyRISC
  polyrisc_reset <= poreset or i_btns_top(0) or zynq_control(1);

  -----------------------------------------------------------------------------
  -- Module power-on reset, pour reset tous les composants à
  -- l'allumage
  --
  por_inst : entity power_on_reset
    port map (
      clk       => clk,
      reset_out => poreset);

  -----------------------------------------------------------------------------
  -- PolyRISC
  --
  -- On utilise le bit 0 du GPIO du ZYNQ comme bit de contrôle pour le
  -- PolyRISC
  polyrisc_gpio_in_ok <= zynq_control(0);
  PolyRISC_inst : entity PolyRISC(RISCV)
    port map (
      reset         => polyrisc_reset,
      clk           => clk,
      i_GPIO        => polyrisc_gpio_in,
      i_GPIO_valide => polyrisc_gpio_in_ok,
      i_inst        => polyrisc_instruction,
      o_inst_addr   => polyrisc_instr_addr,
      o_GPIO        => polyrisc_gpio_out,
      o_GPIO_valide => polyrisc_gpio_out_ok);

  -----------------------------------------------------------------------------
  -- Gestion de l'adresse de la ROM
  -- Lorsque le contrôleur AXI-Stream a une donnée valide, la ROM doit
  -- se faire adresser par lui pour être écrite. Dans le cas
  -- contraire, la ROM est adressée par le PolyRISC.
  rom_addr_in <= s2r_addr_out when s2r_valid else polyrisc_instr_addr;

  -----------------------------------------------------------------------------
  -- ROM qui contient les instructions
  --
  ROM_inst : entity PolyRISC_ROM(arch)
    port map (
      clk      => clk,
      i_addr   => rom_addr_in,
      i_wr     => s2r_wr,
      i_donnee => s2r_donnee_out,
      o_donnee => polyrisc_instruction);

  -----------------------------------------------------------------------------
  -- AXI stream vers ROM
  S2R_inst : entity AXIS2ROM(arch)
    generic map (
      DATA_IN_W  => 32,
      DATA_OUT_W => POLYRISC_GPIO_W,
      ADDR_W     => POLYRISC_MEMI_W)
    port map (
      clk      => clk,
      reset    => rst,
      i_donnee => s2r_donnee_in,
      i_last   => s2r_last,
      i_valid  => s2r_valid,
      o_ready  => s2r_ready,
      o_donnee => s2r_donnee_out,
      o_addr   => s2r_addr_out,
      o_wr     => s2r_wr);

  -----------------------------------------------------------------------------
  -- Le ZYNQ fournit la clk et permet au design de fonctionner sur la
  -- PYNQ, mais vous n'avez pas à vous en soucier
  --
  -- Signaux pour le ZYNQ
  --
  -- Les resize sont là pour s'assurer que le design soit
  -- synthétisable même lorsqu'on change les paramètres du PolyRISC
  -- (data_in et data_out sont fixés à 32 bits par le GPIO du Zynq)
  polyrisc_gpio_in <= resize(signed(data_in), POLYRISC_GPIO_W);
  data_out         <= std_logic_vector(resize(polyrisc_gpio_out, 32));

  -- Instance du ZYNQ pour faire fonctionner le design sur la PYNQ
  zynq : entity zynq_wrapper(STRUCTURE)
    port map (
      clk               => clk,
      to_zynq_data      => data_out,
      from_zynq_data    => data_in,
      -- Contrôle
      from_zynq_control => zynq_control,
      -- Interface AXI-Stream
      from_zynq_tdata   => s2r_donnee_in,
      from_zynq_tlast   => s2r_last,
      from_zynq_tready  => s2r_ready,
      from_zynq_tvalid  => s2r_valid
      );
end arch;
