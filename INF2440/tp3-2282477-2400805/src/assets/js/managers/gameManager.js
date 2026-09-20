import { GAME_CONFIG_KEY, GAME_STATE_KEY, LETTERS, NUMBERS } from "../utils/consts.js";
import { shuffleArray } from "../utils/helper.js";
import { StoreService } from "../services/storeService.js";
import { ScoreManager } from "./scoreManager.js";

export const gameGridState = {
  NO_CARDS_VISIBLE: "no_cards_visible",
  ONE_CARD_VISIBLE: "one_card_visible",
};

export class GameManager {
  /**
   * Initialise le gestionnaire de jeu, charge la configuration et l'état du jeu.
   * Si la partie sauvegardée n'est pas valide, elle est supprimée.
   */
  constructor() {
    this.storeService = new StoreService();
    this.scoreManager = new ScoreManager(this.storeService);
    this.matchedPairFound = false;
    const gameConfig = this.storeService.loadData(GAME_CONFIG_KEY);
    this.gameBoard = gameConfig ? this.initGameBoard() : null;
    this.gameState = gameConfig ? this.initGameState() : null;
    this.gameBoard = this.initGameBoard();
    this.gameState = this.initGameState();
    this.checkAndHandleConfigChange();
  }

  /**
   * Vérifie si la configuration a changé et réinitialise la partie si c'est le cas
   */
  checkAndHandleConfigChange() {
    const savedState = this.storeService.loadData(GAME_STATE_KEY);
    const currentConfig = this.storeService.loadData(GAME_CONFIG_KEY);

    if (savedState && currentConfig) {
      const savedConfig = savedState.gameConfig;
      if (savedConfig.gameSize !== currentConfig.gameSize ||
        savedConfig.cardType !== currentConfig.cardType ||
        savedConfig.maxAttempts !== currentConfig.maxAttempts) {
        this.storeService.clearData(GAME_STATE_KEY);
        this.resetGame();
      }
    }
  }

  /**
   * Initialise le plateau de jeu selon la configuration ou la partie en cours.
   */
  initGameBoard() {
    const savedState = this.storeService.loadData(GAME_STATE_KEY);
    if (savedState?.gameBoard) return savedState.gameBoard;

    const gameConfig = this.storeService.loadData(GAME_CONFIG_KEY)
    if (!gameConfig) {
      return null;
    }

    const [cols, rows] = gameConfig.gameSize.split('x').map(Number);
    const totalCards = rows * cols;

    return {
      rows,
      cols,
      cardContents: this.createCardContent(totalCards, gameConfig.cardType),
      totalPairs: totalCards / 2,
    };
  }

  /**
   * Initialise l'état du jeu (tentatives restantes, paires trouvées, etc).
   */
  initGameState() {
    const savedState = this.storeService.loadData(GAME_STATE_KEY);
    if (savedState?.gameState) return savedState.gameState;

    const gameConfig = this.storeService.loadData(GAME_CONFIG_KEY) || { maxAttempts: 5 };
    return {
      gridState: gameGridState.NO_CARDS_VISIBLE,
      previousCardValue: null,
      remainingAttempts: gameConfig.maxAttempts,
      matchedPairsCount: 0,
    };
  }

  /**
   * Génère le contenu des cartes du plateau selon le type (lettres ou chiffres).
   */
  createCardContent(totalCards, cardType) {
    const pool = cardType === "letters" ? LETTERS : NUMBERS;
    const pairsNeeded = totalCards / 2;

    const uniques = shuffleArray([...pool]).slice(0, pairsNeeded);
    const deck = uniques.flatMap((value) => [
      { value, visible: false },
      { value, visible: false },
    ]);

    return shuffleArray(deck);
  }

  /**
   * Met à jour l'état du jeu après la sélection d'une carte.
   */
  updateGameState(cardValue) {
    if (this.gameState.gridState === gameGridState.NO_CARDS_VISIBLE) {
      this.gameState.gridState = gameGridState.ONE_CARD_VISIBLE;
      this.gameState.previousCardValue = cardValue;
      return;
    }
    if (this.gameState.previousCardValue === cardValue) {
      this.gameState.matchedPairsCount += 1;
      this.matchedPairFound = true;
    }
    this.gameState.gridState = gameGridState.NO_CARDS_VISIBLE;
    this.gameState.remainingAttempts -= this.matchedPairFound ? 0 : 1;
    this.gameState.previousCardValue = null;
  }

  /**
   * Rend visible une carte sur le plateau.
   */
  setCardVisible(i) {
    this.gameBoard.cardContents[i].visible = true;
    this.saveGameState();
  }

  /**
   * Rend cachée une carte sur le plateau.
   */
  setCardHidden(i) {
    this.gameBoard.cardContents[i].visible = false;
    this.saveGameState();
  }

  /**
   * Sauvegarde l'état complet du jeu
   */
  saveGameState() {
    const gameConfig = this.storeService.loadData(GAME_CONFIG_KEY);
    if (!gameConfig) return;

    const stateToSave = {
      gameConfig: gameConfig,
      gameBoard: this.gameBoard,
      gameState: this.gameState,
      timestamp: new Date().getTime()
    };

    this.storeService.saveData(GAME_STATE_KEY, stateToSave);
  }

  /**
   * Vérifie si la partie est terminée (plus de tentatives).
   */
  isGameOver() {
    return this.gameState.remainingAttempts === 0;
  }

  /**
   * Vérifie si le joueur a gagné (toutes les paires trouvées).
   */
  hasWon() {
    return this.gameState.matchedPairsCount === this.gameBoard.totalPairs;
  }

  /**
   * Réinitialise complètement le jeu
   */
  resetGame() {
    this.matchedPairFound = false;
    this.storeService.clearData(GAME_STATE_KEY);
    this.gameBoard = this.initNewGameBoard();
    this.gameState = this.initNewGameState();
  }

  /**
   * Initialise un nouveau plateau (sans charger de sauvegarde)
   */
  initNewGameBoard() {
    const gameConfig = this.storeService.loadData(GAME_CONFIG_KEY);
    if (!gameConfig) return null;

    const [cols, rows] = gameConfig.gameSize.split('x').map(Number);
    const totalCards = rows * cols;

    return {
      rows,
      cols,
      cardContents: this.createCardContent(totalCards, gameConfig.cardType),
      totalPairs: totalCards / 2,
    };
  }

  /**
   * Initialise un nouvel état (sans charger de sauvegarde)
   */
  initNewGameState() {
    const gameConfig = this.storeService.loadData(GAME_CONFIG_KEY);
    if (!gameConfig) return null;

    return {
      gridState: gameGridState.NO_CARDS_VISIBLE,
      previousCardValue: null,
      remainingAttempts: gameConfig.maxAttempts,
      matchedPairsCount: 0,
    };
  }

  /**
   * Sauvegarde le score du joueur avec son nom.
   */
  saveScore(name) {
    this.scoreManager.computeAndSaveScore(
      name,
      this.gameState.remainingAttempts
    );
    this.storeService.clearData(GAME_STATE_KEY);
  }
}