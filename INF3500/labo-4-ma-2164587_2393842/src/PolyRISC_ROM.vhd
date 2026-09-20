-------------------------------------------------------------------------------
--
-- PolyRISC_ROM.vhd
--
-- Implémente une mémoire en lecture seule depuis laquelle PolyRISC
-- peut lire ses instructions
--
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use work.PolyRISC_utils.all;

entity PolyRISC_ROM is
  port(
    clk      : in  std_logic;
    -- Adresse de la requête
    i_addr   : in  unsigned(POLYRISC_MEMI_W - 1 downto 0);
    -- "write enable" : Mis à 1 lorsqu'on veut écrire dans la mémoire
    -- Ce pin ne sera pas utilisé par PolyRISC mais par l'interface
    -- qui lira les instructions depuis un buffer PYNQ pour charger la
    -- mémoire d'instructions
    i_wr     : in  std_logic;
    -- Donnée à écrire à l'adresse addr si i_wr vaut 1
    i_donnee : in  unsigned(POLYRISC_GPIO_W - 1 downto 0);
    -- Donnée à lire à l'adresse addr
    o_donnee : out unsigned(POLYRISC_GPIO_W - 1 downto 0)
    );
end PolyRISC_ROM;

architecture arch of PolyRISC_ROM is
  -- Mémoire des instructions
  type memoireInstructions_t is
    array(0 to 2 ** POLYRISC_MEMI_W - 1) of unsigned(POLYRISC_GPIO_W - 1 downto 0);
  -- La mémoire en elle-même
  signal memoire : memoireInstructions_t := (others => (others => '0'));
begin
  -- La lecture est asynchrone
  o_donnee <= memoire(to_integer(i_addr));

  -- L'écriture se fait de manière synchrone
  process(clk)
  begin
    if rising_edge(clk) then
      if i_wr = '1' then
        memoire(to_integer(i_addr)) <= i_donnee;
      end if;
    end if;
  end process;

end arch;

-------------------------------------------------------------------------------
-- Test bench
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use work.PolyRISC_utils.all;
use work.all;

entity ROM_tb is
end ROM_tb;

architecture testbench of ROM_tb is
  constant periode  : time                                   := 10 ns;
  signal clk        : std_logic                              := '0';
  signal addr       : unsigned(POLYRISC_MEMI_W - 1 downto 0) := (others => '0');
  signal wr         : std_logic;
  signal donnee_out : unsigned(POLYRISC_GPIO_W - 1 downto 0);
  signal donnee_in  : unsigned(POLYRISC_GPIO_W - 1 downto 0);
begin
  clk <= not(clk) after periode / 2;

  UUT : entity PolyRISC_ROM
    port map (
      clk      => clk,
      i_addr   => addr,
      i_wr     => wr,
      i_donnee => donnee_in,
      o_donnee => donnee_out);

  process(clk)
    variable cnt : integer := 0;
    variable val : integer := 16#CAFE#;
  begin
    if falling_edge(clk) then
      -- Phase 1 : écrire
      if cnt < 10 then
        wr        <= '1';
        addr      <= to_unsigned(cnt, POLYRISC_MEMI_W);
        donnee_in <= to_unsigned(val, POLYRISC_GPIO_W);
        val       := val + 1;
      elsif cnt < 20 then
        wr   <= '0';
        addr <= to_unsigned(cnt - 10, POLYRISC_MEMI_W);
      else
        report "Done" severity failure;
      end if;
      cnt := cnt + 1;
    end if;
  end process;
end testbench;
