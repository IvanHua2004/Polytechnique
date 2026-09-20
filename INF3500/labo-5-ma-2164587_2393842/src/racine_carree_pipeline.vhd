---------------------------------------------------------------------------------------------------
-- 
-- racine_carree_pipeline.vhd
--
-- v. 1.0 2024-08-07 laboratoire #4 INF3500 - code de base
-- v. 1.1 2025-02-17 laboratoire #5 INF3500 - code de base
--
---------------------------------------------------------------------------------------------------

library IEEE;
use IEEE.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.fixed_pkg.all;
use work.all;

entity racine_carree_pipeline is
  generic (
    -- Nombre de bits de A
    N    : positive := 16;
    -- Nombre de bits de X
    M    : positive := 8;
    -- Nombre max d'itérations
    kmax : positive := 2 
    );
  port (
    reset, clk : in  std_logic;
    -- Le nombre dont on cherche la racine carré
    i_A        : in  unsigned(N - 1 downto 0);
    -- '1' quand une données qui est passée à travers la pipeline
    -- est valide
    i_valid    : in  std_logic;
    -- '1' quand la dernière donnée est passée à travers la
    -- pipeline
    i_last     : in  std_logic;
    -- Indique quand le zynq est prêt à recevoir des données
    i_ready    : in  std_logic;
    -- La racine carré de A, telle que X * X = A
    o_X        : out unsigned(M - 1 downto 0);
    -- '1' quand une données qui est passée à travers la pipeline
    -- est valide
    o_valid    : out std_logic;
    -- '1' quand la dernière donnée est passée à travers la
    -- pipeline
    o_last     : out std_logic
    );
end racine_carree_pipeline;

architecture newton of racine_carree_pipeline is
  -- Pour le module de division, nombre de bits pour exprimer les réciproques
  constant W_frac : integer := 14;

  -- Types pour implémenter la pipeline - étendus pour kmax étages
  type pipeline_vec_n_t is array(0 to kmax) of unsigned(N-1 downto 0);
  type pipeline_vec_xk_t is array(0 to kmax) of unsigned(M-1 downto 0);
  type pipeline_vec_q_t is array(0 to kmax-1) of ufixed(N-1 downto -W_frac);
  type pipeline_bit_t is array(0 to kmax) of std_logic;

  signal A_pipeline                    : pipeline_vec_n_t;
  signal xk_pipeline                   : pipeline_vec_xk_t;
  signal quotient_pipeline             : pipeline_vec_q_t;
  signal valid_pipeline, last_pipeline : pipeline_bit_t;
  signal erreur_div0                   : std_logic_vector(kmax-1 downto 0);
  
  signal div_result_pipeline : pipeline_vec_xk_t;
  
begin
  o_X     <= xk_pipeline(kmax);
  o_valid <= valid_pipeline(kmax);
  o_last  <= last_pipeline(kmax);

  gen_diviseur : for k in 0 to kmax-1 generate
    diviseur_k : entity work.division_par_reciproque
      generic map(
        W_num   => N,
        W_denom => M,
        W_frac  => W_frac
      )
      port map(
        num            => A_pipeline(k),
        denom          => xk_pipeline(k),
        quotient       => quotient_pipeline(k),
        erreur_div_par_0 => erreur_div0(k)
      );
  end generate gen_diviseur;

  process(quotient_pipeline)
  begin
    for k in 0 to kmax-1 loop
      div_result_pipeline(k) <= unsigned(to_slv(resize(quotient_pipeline(k), M-1, 0)));
    end loop;
  end process;

  process (clk, reset) is
  begin
    if reset = '1' then
      A_pipeline     <= (others => (others => '0'));
      xk_pipeline    <= (others => (others => '0'));
      valid_pipeline <= (others => '0');
      last_pipeline  <= (others => '0');
      
    elsif rising_edge(clk) and i_ready = '1' then
      A_pipeline(0)     <= i_A;
      valid_pipeline(0) <= i_valid;
      last_pipeline(0)  <= i_last;
      
      if i_A > 16384 then
        xk_pipeline(0) <= "11111111";
      elsif i_A > 4096 then
        xk_pipeline(0) <= "10000000";
      elsif i_A > 1024 then
        xk_pipeline(0) <= "01000000";
      elsif i_A > 256 then
        xk_pipeline(0) <= "00100000";
      elsif i_A > 64 then
        xk_pipeline(0) <= "00010000";
      else
        xk_pipeline(0) <= "00001000";
      end if;

      for k in 0 to kmax-1 loop
        A_pipeline(k+1)     <= A_pipeline(k);
        valid_pipeline(k+1) <= valid_pipeline(k);
        last_pipeline(k+1)  <= last_pipeline(k);
        
        xk_pipeline(k+1) <= shift_right(xk_pipeline(k) + div_result_pipeline(k), 1);
      end loop;
    end if;
  end process;

end newton;
