import { GAME_CONFIG_KEY, SCORE_KEY } from "../utils/consts.js";

export class ScoreManager {
  /**
   * @param {StoreService} storeService
   */
  constructor(storeService) {
    this.storeService = storeService;
  }

  /**
   * Renvoie tous les scores présents dans le localStorage
   * @returns {Array<{name: string, score: number, gameSize: string, date: string}>}
   */
  getAllScores() {
    return this.storeService.loadData(SCORE_KEY, localStorage) || [];
  }

  /**
   * Calcule et sauvegarde le score d'un joueur
   * @param {string} name nom du joueur
   * @param {number} remainingAttempts - Nombre tentatives restantes du joueur
   */
  computeAndSaveScore(name, remainingAttempts) {
    const { gameSize } = this.storeService.loadData(GAME_CONFIG_KEY);
    const date = new Date();
    const factor = this.getMultiplicativeFactor(gameSize);
    const score = factor * remainingAttempts; // use the correctly spelled variable
    const scoreInfo = { name, score, gameSize, date };
    const existingScores = this.getAllScores();
    const updatedScores = [...existingScores, scoreInfo];
    this.storeService.saveData(SCORE_KEY, updatedScores, localStorage);
  }



  /**
   * TODO : Trouver et corriger le problème avec cette méthode
   * @returns {{sum:number, length:number, average:number}} Un objet où chaque clé est une taille de jeu et chaque valeur est un objet contenant la somme des scores, le nombre de scores et la moyenne des scores pour cette taille de jeu.
   * Exemple de retour :
   * {
   *   "4x3": { sum: 120, length: 5, average: 24 },
   *   "3x2": { sum: 80, length: 4, average: 20 }
   * }
   */
  computeAveragePerGameSize() {
    const scores = this.getAllScores();
    return scores.reduce((acc, scoreInfo) => {
      const { score, gameSize } = scoreInfo;

      if (!acc[gameSize]) {
        acc[gameSize] = { sum: 0, length: 0, average: 0 };
      }

      acc[gameSize].sum += score;
      acc[gameSize].length += 1;
      acc[gameSize].average = acc[gameSize].sum / acc[gameSize].length;

      return acc;
    }, {});
  }

  /**
   * Supprime tous les scores enregistrés dans le localStorage
   */
  clearAllScores() {
    this.storeService.saveData(SCORE_KEY, [], localStorage);
  }

  /**
   * Obtient le facteur multiplicatif basé sur la taille du jeu
   * @param {string} gameSize - Identifiant de la taille du jeu (ex: "4x3", "3x2")
   * @returns {number} Facteur multiplicatif pour le calcul du score
   * @private
   */
  getMultiplicativeFactor(gameSize) {
    return gameSize === "4x3" ? 4 : gameSize === "3x2" ? 2 : 1;
  }
}
