-------------------------------------------------------------------------------
--
-- Division par réciproque
-- 2010/01/25 v. 1.0 : Tarek Ould Bachir, création
-- 2010/05/13 v. 1.1 : Tarek Ould Bachir, modification de certains commentaires
-- 2011/01/13 v. 2.0 : Pierre Langlois, élimination de l'horloge, simplification générale, ajout de commentaires
-- 2022/02/22 v. 2.1 : Pierre Langlois, quelques mises à jour, réduction de la taille de la ROM, etc.
-- 2022/02/25 v. 2.2 : Pierre Langlois, numérateur et dénominateur de tailles différentes
-- 2025/10/20 v. 3.0 : Marc-Antoine Manningham, conversion pour utiliser ufixed au lieu d'unsigned pour la sortie
--
-------------------------------------------------------------------------------
--
-- Fonctionnement du module
--
-- Les entrées num et denom sont des nombres entiers exprimés respectivement sur W_num et W_denom bits.
--
-- La division quotient = num / denom est effectuée par la multiplication quotient = num * (1 / denom), où 
--   où les valeurs approximatives des réciproques (1 / denom) sont précalculées et entreposées dans une mémoire ROM.
-- Les réciproques sont exprimées avec W_frac bits.
-- La taille de la ROM est donc de 2 ** W_denom mots de W_frac bits chacun.
--
-- Les cas particuliers de denom = 0 (erreur de division par 0) et de denom = 1 (quotient = num) sont traités séparément.
--
-- Le quotient est exprimé en format ufixed avec W_num - 1 bits pour la partie entière et W_frac bits pour la partie fractionnaire.
-- Par exemple, pour W_num = 3 et W_frac = 2, le quotient serait de type ufixed(2 downto -2) :
--   - Bits 2 downto 0 : partie entière (0 à 7)
--   - Bits -1 downto -2 : partie fractionnaire (0.25, 0.5, 0.75)
--
-------------------------------------------------------------------------------

library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.math_real.all;
use ieee.fixed_pkg.all;

entity division_par_reciproque is
  generic (
    -- Nombre de bits pour le numérateur
    W_num : integer := 16;
    -- Nombre de bits pour le dénominateur
    W_denom : integer := 8;
    -- Nombre de bits pour exprimer les réciproques
    W_frac : integer := 14
  );
  port (
    -- Numérateur
    num : in unsigned(W_num - 1 downto 0);
    -- Dénominateur
    denom : in unsigned(W_denom - 1 downto 0);
    -- Approximation du quotient de num / denom
    quotient : out ufixed(W_num - 1 downto -W_frac);
    -- '1' si b = 0
    erreur_div_par_0 : out std_logic
  );
end division_par_reciproque;

architecture arch of division_par_reciproque is
  type ROM_reciproque_type is array(0 to 2 ** W_denom - 1) of unsigned(W_frac - 1 downto 0);

  -- Calcul des valeurs de la réciproque 1 / denom
  function init_mem return ROM_reciproque_type is
    variable reciproque : ROM_reciproque_type;
  begin
    -- Valeur bidon, on va générer une erreur de toute façon si on
    -- divise par 0
    reciproque(0) := to_unsigned(0, reciproque(0)'length);
    -- Valeur bidon, on va retourner num si on divise par 1
    reciproque(1) := to_unsigned(0, reciproque(0)'length);
    for i in 2 to 2 ** W_denom - 1 loop
      reciproque(i) := to_unsigned(integer(round(real(2 ** W_frac) / real(i))), reciproque(0)'length);
    end loop;
    return reciproque;
  end init_mem;

  -- la mémoire ROM est initialisée lors de l'instanciation du module
  -- par appel de la fonction
  constant ROM_reciproque : ROM_reciproque_type := init_mem;

begin
  -- Cas de la division par 0
  erreur_div_par_0 <= '1' when denom = 0 else
    '0';

  process (all)
  begin
    if denom = 1 then
      -- Si denom == 1, alors on retourne num directement, exprimé sur
      -- W_num + W_frac bits en le décalant W_frac positions vers la
      -- gauche.
      quotient <= to_ufixed(num, W_num - 1, -W_frac);
    else
      -- Sinon, on retourne le produit
      quotient <= to_ufixed(std_logic_vector(num * ROM_reciproque(to_integer(denom))), W_num - 1, -W_frac);
      -- quotient <= num * ROM_reciproque(to_integer(denom));
    end if;
  end process;
end arch;
