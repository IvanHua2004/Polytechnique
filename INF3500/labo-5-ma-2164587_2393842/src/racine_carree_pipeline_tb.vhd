---------------------------------------------------------------------------------------------------
-- 
-- racine_carree_tb.vhd
--
-- v. 1.0 Pierre Langlois 2022-02-25 laboratoire #4 INF3500, fichier de démarrage
-- v. 1.1 2024-07-29
-- v. 1.2 2025-03-17 laboratoire #5
--
---------------------------------------------------------------------------------------------------

library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.math_real.all;
use work.all;

entity racine_carree_tb is
  generic (
    N : positive := 16;
    M : positive := 8
    );
end racine_carree_tb;

architecture arch of racine_carree_tb is
  signal reset     : std_logic;
  signal clk       : std_logic := '0';
  constant periode : time      := 10 ns;
  constant MAX     : integer   := 10;
  constant kmax    : integer   := 3;
  
  type tab_int is array(0 to 5) of integer;
  constant valeurs     : tab_int := (0, 1, 4, 25, 144, 1024);
  constant attentes    : tab_int := (0, 1, 2, 5, 12, 32);
  
  -- Sigaux pour le module
  signal A         : unsigned(N - 1 downto 0);
  signal valid     : std_logic;
  signal last_in   : std_logic;
  signal ready_in  : std_logic;
  signal valid_in  : std_logic;
  signal X         : unsigned(M - 1 downto 0);
  signal last_out  : std_logic;
  signal valid_out : std_logic;
  
  signal idx_send  : integer := 0;
  signal idx_recv  : integer := 0;
begin
  UUT : entity racine_carree_pipeline(newton)
    generic map(N, M, kmax)
    port map(
      reset   => reset,
      clk     => clk,
      i_A     => A,
      i_valid => valid_in,
      i_last  => last_in,
      i_ready => ready_in,
      o_X     => X,
      o_valid => valid_out,
      o_last  => last_out
      );

  -- Simualtion de l'horloge et du power-on reset
  clk   <= not clk after periode / 2;
  reset <= '1'     after 0 ns, '0' after 5 * periode / 4;

  process(clk, reset)
    variable i : integer := 0;
  begin
    if reset = '1' then
      A        <= (others => '0');
      valid_in <= '0';
      last_in  <= '0';
      ready_in <= '0';
      idx_send <= 0;
      idx_recv <= 0;
    elsif falling_edge(clk) then
      -- Pour le test-bench, on considère que le handshake AXI est
      -- toujours fait
      valid_in <= '1';
      ready_in <= '1';
      -- Last sur la dernière donnée
      if idx_send < valeurs'length then

        A <= to_unsigned(valeurs(idx_send), N);

        if idx_send = valeurs'length - 1 then
          last_in <= '1';
        else
          last_in <= '0';
        end if;

        report "ENVOI A=" & integer'image(valeurs(idx_send)) severity note;
        idx_send <= idx_send + 1;
      else
        valid_in <= '0';
        last_in  <= '0';
      end if;
      
      if valid_out = '1' then

        assert to_integer(X) = attentes(idx_recv)
          report "ERREUR: sqrt(" & integer'image(valeurs(idx_recv)) &
                 ") attendu=" & integer'image(attentes(idx_recv)) &
                 " obtenu=" & integer'image(to_integer(X))
          severity error;

        report "OK: sqrt(" & integer'image(valeurs(idx_recv)) &
               ") = " & integer'image(to_integer(X)) severity note;

        idx_recv <= idx_recv + 1;
      end if;

      i := i + 1;
      report integer'image(i) severity note;
      
      if i = MAX then
        report "Fin de simulation" severity failure;
      end if;
    end if;
  end process;

end arch;