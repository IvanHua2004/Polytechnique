-------------------------------------------------------------------------------
--
-- feu.vhd
--
-- v. 2.0 2024-06-25
--
-------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;

entity feu is
  port(
    -- Horloge
    clk    : in  std_logic;
    reset  : in  std_logic;
    -- Boutons pour activer les feux
    -- Le bouton 0 (resp. 1) active (passe au vert) le feu 0 (resp. 1)
    -- Les boutons 0 et 1 sont utilisés comme reset quand pressés
    -- simultanément
    I_btns : in  std_logic_vector(3 downto 0);
    -- I_mode       : in  std_logic_vector(1 downto 0);
    O_feu0 : out std_logic_vector(2 downto 0);
    O_feu1 : out std_logic_vector(2 downto 0)
    );
end feu;

architecture arch of feu is
  constant C_VERT : std_logic_vector(2 downto 0) := "010"; -- Vert
  constant C_ORANGE : std_logic_vector(2 downto 0) := "110"; -- Orange
  constant C_ROUGE : std_logic_vector(2 downto 0) := "100"; -- Rouge
  constant C_ETEINT : std_logic_vector(2 downto 0) := "000"; -- ETEINT
  
  constant NB_BTN : integer := 4;
  constant DELAI1S : integer := 125_000_000-1; 
  constant DELAI2S : integer := 2*125_000_000-1; 
  
  type etat_type is (E_0, E_1, E_2, E_3, E_4);
  -- État du système
  signal etat : etat_type := E_0;

  -- Reset
  signal rst : std_logic := '0';
  
  -- Détection de front montant
  signal btns_next : std_logic_vector(NB_BTN-1 downto 0) := (others => '0');
  signal btns_prev : std_logic_vector(NB_BTN-1 downto 0) := (others => '0');
  signal btns_rising : std_logic_vector(NB_BTN-1 downto 0);
  
  -- Compteur
  signal compteur : integer range 0 to DELAI2S := 0;
  signal fermer : std_logic := '0';
begin
  rst <= (I_btns(0) and I_btns(1)) or reset;
  
process(clk)
begin
  if rising_edge(clk) then
    btns_next <= I_btns;
    btns_rising <= btns_next and not btns_prev;
    btns_prev <= btns_next;
  end if;
end process;

process(clk, rst)
  begin
    if rst = '1' then
      etat     <= E_0;
      compteur <= 0;
      
    elsif rising_edge(clk) then
      case etat is
        when E_0 =>
          compteur <= 0;
          if btns_rising(0) = '1' then
            etat <= E_1;
          elsif btns_rising(1) = '1' then
            etat <= E_2;
          else
            etat <= E_0;
          end if;

        when E_1 =>
          compteur <= 0;
          if btns_rising(0) = '1' then
            etat <= E_3;
          else
            etat <= E_1;
          end if;

        when E_2 =>
          compteur <= 0;
          if btns_rising(1) = '1' then
            etat <= E_4;
          else
            etat <= E_2;
          end if;

        when E_3 =>
          if compteur < DELAI1S then
            compteur <= compteur + 1; 
            etat <= E_3;
          elsif compteur < DELAI2S then
            compteur <= compteur + 1;              
            if (compteur mod 25_000_000 = 0) then
                fermer <= not fermer;
            end if;
            etat <= E_3;
          else
            etat <= E_2;
            compteur <= 0;
            fermer <= '0';
          end if;

        when E_4 =>
          if compteur < DELAI1S then
            compteur <= compteur + 1; 
            etat <= E_4;
          elsif compteur < DELAI2S then
            compteur <= compteur + 1;              
            if (compteur mod 25_000_000 = 0) then
                fermer <= not fermer;
            end if;
            etat <= E_4;
          else
            etat <= E_1;
            compteur <= 0;
            fermer <= '0';
          end if;
      end case;
    end if;
  end process;
  
  process(etat) is
  begin
    case etat is 
      when E_0 =>
        O_feu0 <= C_ETEINT;
        O_feu1 <= C_ETEINT;
      when E_1 =>
        O_feu0 <= C_VERT;
        O_feu1 <= C_ROUGE;
      when E_2 =>
        O_feu0 <= C_ROUGE;
        O_feu1 <= C_VERT;
      when E_3 =>
        if fermer = '0' then         
            O_feu0 <= C_ORANGE;
            O_feu1 <= C_ROUGE;
        else
            O_feu0 <= C_ETEINT;
            O_feu1 <= C_ROUGE;
        end if;
      when E_4 =>
        if fermer = '0' then         
            O_feu0 <= C_ROUGE;
            O_feu1 <= C_ORANGE;
        else
            O_feu0 <= C_ROUGE;
            O_feu1 <= C_ETEINT;
        end if;
    end case;
  end process;
end arch;
