---------------------------------------------------------------------------------------------------
-- 
-- racine_carree_tb.vhd
--
-- v. 1.0 Pierre Langlois 2022-02-25 laboratoire #4 INF3500, fichier de démarrage
-- v. 1.1 2024-07-29
-- v. 1.2 Bonification avec tests exhaustifs
--
---------------------------------------------------------------------------------------------------
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.math_real.all;
use work.all;

entity racine_carree_tb is
  generic (
    N    : positive := 16;
    M    : positive := 8;
    kmax : positive := 10
  );
end racine_carree_tb;

architecture arch of racine_carree_tb is
  signal reset     : std_logic;
  signal clk       : std_logic := '0';
  constant periode : time      := 10 ns;
  constant A_MAX   : integer   := 65535;
  
  signal A    : unsigned(N - 1 downto 0);
  signal go   : std_logic;
  signal X    : unsigned(M - 1 downto 0);
  signal fini : std_logic;
  
  -- Fonction de référence pour le calcul de la racine carrée
  function floor_sqrt_func (input : unsigned) return integer is
    variable val_real    : real;
    variable result_real : real;
  begin
    val_real    := real(to_integer(input));
    result_real := sqrt(val_real);
    return integer(floor(result_real));
  end function floor_sqrt_func;
  
begin

  UUT : entity racine_carree(newton)
    generic map(N, M, kmax)
    port map(reset, clk, i_A => A, i_go => go, o_X => X, o_fini => fini);
    
  clk   <= not clk after periode / 2;
  reset <= '1' after 0 ns, '0' after 5 * periode / 4;
  
  validation_module : process
    variable max_erreur_abs : integer := 0;
    variable sum_erreur_abs : real    := 0.0;
    
    variable erreur_abs  : integer;
    variable val_attendue : integer;
    variable nb_tests    : integer := 0;
    
  begin
    wait until reset = '0';
    wait for 2 * periode;
    
    report "=== DEBUT DE LA SIMULATION EXHAUSTIVE ===" severity note;
    report "Test de A = 0 à A = " & integer'image(A_MAX) severity note;
    
    for i in 0 to A_MAX loop
      A <= to_unsigned(i, A'length);
 
      go <= '1';
      wait for periode;
      go <= '0';

      wait until fini = '1';
      
      val_attendue := floor_sqrt_func(to_unsigned(i, A'length));
      
      erreur_abs := abs(to_integer(X) - val_attendue);
      
      sum_erreur_abs := sum_erreur_abs + real(erreur_abs);
      nb_tests := nb_tests + 1;
      
      assert (erreur_abs <= 1) 
        report "ERREUR TROP GRANDE pour A = " & integer'image(i) & 
               " | Valeur attendue: " & integer'image(val_attendue) & 
               " | Valeur obtenue: " & integer'image(to_integer(X)) & 
               " | Erreur: " & integer'image(erreur_abs)
        severity error;
      
      if erreur_abs > max_erreur_abs then
        max_erreur_abs := erreur_abs;
      end if;
      
      if i < 10 or i = 100 or i = 1000 or i = 10000 or i = 30000 or i = A_MAX then
        report "A = " & integer'image(i) & 
               " | X = " & integer'image(to_integer(X)) & 
               " | Attendu = " & integer'image(val_attendue) & 
               " | Erreur = " & integer'image(erreur_abs)
        severity note;
      end if;
      
      wait for 2 * periode;
    end loop;
    
    report "=== RESULTATS DE LA SIMULATION EXHAUSTIVE ===" severity note;
    report "Nombre de tests effectués: " & integer'image(nb_tests) severity note;
    report "ERREUR ABSOLUE MAXIMALE: " & integer'image(max_erreur_abs) severity note;
    
    if nb_tests > 0 then
      report "ERREUR ABSOLUE MOYENNE: " & real'image(sum_erreur_abs / real(nb_tests)) severity note;
    end if;
    
    report "=== SIMULATION TERMINEE ===" severity note;
    
    wait;
  end process validation_module;
  
end arch;