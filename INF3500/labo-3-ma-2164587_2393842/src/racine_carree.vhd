---------------------------------------------------------------------------------------------------
-- 
-- racine_carree.vhd
--
-- v. 1.0 Pierre Langlois 2022-02-25 laboratoire #4 INF3500 - code de base
-- v. 1.1 2024-07-29
--
---------------------------------------------------------------------------------------------------

library IEEE;
use IEEE.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.fixed_pkg.all;
use work.all;

entity racine_carree is
  generic (
    -- Nombre de bits de A
    N : positive := 16;
    -- Nombre de bits de X
    M : positive := 8;
    -- Nombre d'itérations à faire
    kmax : positive := 11
  );
  port (
    reset, clk : in std_logic;
    i_A : in unsigned(N - 1 downto 0);
    i_go : in std_logic;
    o_X : out unsigned(M - 1 downto 0);
    o_fini : out std_logic
  );
end racine_carree;

 architecture newton of racine_carree is
  constant W_frac : integer := 14; 

  type etat_type is (attente, calculs);
  signal etat : etat_type := attente;
  signal k : integer range 0 to kmax := 0;
  signal A_int : unsigned(N - 1 downto 0) := (others => '0');
  signal xk : unsigned(M - 1 downto 0) := (others => '0');
  signal fini : std_logic := '0';
  signal quotient_div : ufixed(N - 1 downto -W_frac);
  signal erreur_div0  : std_logic;
  signal div_result   : unsigned(M - 1 downto 0);

begin
  diviseur : entity work.division_par_reciproque
    generic map(
      W_num  => N,
      W_denom => M,
      W_frac => W_frac
    )
    port map(
      num   => A_int,
      denom => xk,
      quotient => quotient_div,
      erreur_div_par_0 => erreur_div0
    );
    
div_result <= resize(unsigned(to_slv(resize(quotient_div, M - 1, 0))), xk'length);
    
  process(clk, reset)
  begin
    if reset = '1' then
      etat     <= attente;
      k        <= 0;
      A_int    <= (others => '0');
      xk       <= (others => '0');
      fini     <= '0';
    elsif rising_edge(clk) then
      case etat is
        when attente =>
          if i_go = '1' then
            k <= 0;
            A_int <= i_A;
            if A_int > 16384 then
                    xk <= "11111111";
                elsif A_int > 4096 then
                    xk <= "10000000";
                elsif A_int > 1024 then
                    xk <= "01000000";
                elsif A_int > 256 then
                    xk <= "00100000";
                elsif A_int > 64 then
                    xk <= "00010000";
                else
                    xk <= "00001000";
                end if;
            -- xk <= to_unsigned(255, M);
            etat <= calculs;
          end if;
          
        when calculs =>
          if k < kmax then
            xk <= shift_right(xk + div_result, 1);
            k <= k + 1;
            fini <= '0';
          else
            fini <= '1';
            etat <= attente;
          end if;
      end case;
    end if;
  end process;
  o_X    <= xk;
  o_fini <= fini;
end newton;
