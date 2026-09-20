library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use work.all;

entity AXIS2ROM is
  generic (
    DATA_IN_W  : positive := 32;
    DATA_OUT_W : positive := 32;
    ADDR_W     : positive := 8
    );
  port (
    clk, reset : in  std_logic;
    i_donnee   : in  std_logic_vector(DATA_IN_W - 1 downto 0);
    i_last     : in  std_logic;
    i_valid    : in  std_logic;
    o_ready    : out std_logic;
    o_donnee   : out unsigned(DATA_OUT_W - 1 downto 0);
    o_addr     : out unsigned(ADDR_W - 1 downto 0);
    o_wr       : out std_logic
    );
end AXIS2ROM;

architecture arch of AXIS2ROM is
  -- signal donnee  : std_logic_vector(DATA_W - 1 downto 0);
  signal adresse : integer := 0;
  signal ready   : std_logic;
begin
  o_ready  <= ready;
  o_addr   <= to_unsigned(adresse, ADDR_W);
  o_donnee <= resize(unsigned(i_donnee), DATA_OUT_W);
  -- Écrire quand un handshake a lieu
  o_wr     <= i_valid and ready;

  -- Lire les données depuis le AXI stream et les écrire une par une
  -- en incrémentant l'adresse
  process(clk, reset)
  begin
    if reset = '1' then
      ready   <= '0';
      adresse <= 0;
    elsif rising_edge(clk) then
      ready <= '1';
      if i_valid = '1' then
        adresse <= adresse + 1;
      end if;
    end if;
  end process;
end arch;

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use work.all;

entity S2R_tb is
  generic (
    DATA_W : positive := 32;
    ADDR_W : positive := 8
    );
end S2R_tb;

architecture tb of S2R_tb is
  constant periode      : time                                  := 10 ns;
  constant MAX_CNT      : integer                               := 100;
  signal clk            : std_logic                             := '0';
  signal reset          : std_logic                             := '0';
  signal uut_donnee_in  : std_logic_vector(DATA_W - 1 downto 0) := (others => '1');
  signal uut_donnee_out : unsigned(DATA_W - 1 downto 0);
  signal uut_valid      : std_logic;
  signal uut_ready      : std_logic;
  signal uut_last       : std_logic;
  signal uut_wr         : std_logic;
  signal uut_addr_out   : unsigned(ADDR_W - 1 downto 0);
begin
  clk   <= not(clk) after periode / 2;
  reset <= '1'      after 0 ns, '0' after 9 * periode / 4;

  UUT : entity AXIS2ROM(arch)
    generic map (
      DATA_IN_W  => DATA_W,
      DATA_OUT_W => DATA_W,
      ADDR_W     => ADDR_W)
    port map (
      clk      => clk,
      reset    => reset,
      i_donnee => uut_donnee_in,
      i_last   => uut_last,
      i_valid  => uut_valid,
      o_ready  => uut_ready,
      o_donnee => uut_donnee_out,
      o_addr   => uut_addr_out,
      o_wr     => uut_wr);

  process(clk, reset)
    variable cnt : integer := 0;
  begin
    if reset = '1' then
      cnt       := 0;
      uut_valid <= '0';
    elsif rising_edge(clk) then
      if cnt > 10 and cnt < 20 then
        uut_valid <= '0';
      else
        uut_valid <= '1';
      end if;
      if cnt = MAX_CNT - 1 then
        uut_last <= '1';
      elsif cnt = MAX_CNT then
        report "Done" severity failure;
      else
        uut_last <= '0';
      end if;
      if uut_ready = '1' then
        cnt := cnt + 1;
      end if;
      uut_donnee_in <= std_logic_vector(to_unsigned(cnt, DATA_W));
    end if;
  end process;
end tb;


-------------------------------------------------------------------------------
-- Test d'intégration pour le AXI-Stream et la ROM
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;
use work.PolyRISC_utils.all;
use work.all;

entity S2R_int_tb is
end S2R_int_tb;

architecture arch of S2R_int_tb is
  constant periode      : time                                           := 10 ns;
  constant MAX_CNT      : integer                                        := 100;
  signal clk            : std_logic                                      := '0';
  signal reset          : std_logic                                      := '0';
  signal rom_donnee_out : unsigned(POLYRISC_GPIO_W - 1 downto 0)         := (others => '1');
  signal rom_addr_in    : unsigned(POLYRISC_MEMI_W - 1 downto 0)         := (others => '1');
  signal s2r_donnee_in  : std_logic_vector(POLYRISC_GPIO_W - 1 downto 0) := (others => '1');
  signal s2r_donnee_out : unsigned(POLYRISC_GPIO_W - 1 downto 0);
  signal s2r_valid      : std_logic;
  signal s2r_ready      : std_logic;
  signal s2r_last       : std_logic;
  signal s2r_wr         : std_logic;
  signal s2r_addr_out   : unsigned(POLYRISC_MEMI_W - 1 downto 0);
  signal cnt            : integer                                        := 0;
begin
  clk         <= not(clk) after periode / 2;
  reset       <= '1'      after 0 ns, '0' after 9 * periode / 4;
  rom_addr_in <= s2r_addr_out when cnt < MAX_CNT / 2
                 else to_unsigned(cnt - MAX_CNT / 2, POLYRISC_MEMI_W);
  s2r_donnee_in <= std_logic_vector(to_signed(cnt, POLYRISC_GPIO_W));

  ROM : entity PolyRISC_ROM
    port map (
      clk      => clk,
      i_addr   => rom_addr_in,
      i_wr     => s2r_wr,
      i_donnee => s2r_donnee_out,
      o_donnee => rom_donnee_out);

  S2R : entity AXIS2ROM
    generic map (
      DATA_IN_W  => POLYRISC_GPIO_W,
      DATA_OUT_W => POLYRISC_GPIO_W,
      ADDR_W     => POLYRISC_MEMI_W)
    port map (
      clk      => clk,
      reset    => reset,
      i_donnee => s2r_donnee_in,
      i_last   => s2r_last,
      i_valid  => s2r_valid,
      o_ready  => s2r_ready,
      o_donnee => s2r_donnee_out,
      o_addr   => s2r_addr_out,
      o_wr     => s2r_wr);

  process(clk, reset)
  begin
    if reset = '1' then
      cnt       <= -1;
      s2r_valid <= '0';
    elsif falling_edge(clk) then
      if cnt < MAX_CNT / 2 then
        -- Test du handshake
        if cnt > 10 and cnt < 20 then
          s2r_valid <= '0';
        else
          s2r_valid <= '1';
        end if;

        if cnt = MAX_CNT / 2 - 1 then
          s2r_last <= '1';
        else
          s2r_last <= '0';
        end if;

        if s2r_ready = '1' then
          cnt <= cnt + 1;
        end if;
      else
        s2r_valid <= '0';
        if cnt = MAX_CNT then
          report "Done" severity failure;
        end if;
        cnt <= cnt + 1;
      end if;
    end if;
  end process;
end arch;
