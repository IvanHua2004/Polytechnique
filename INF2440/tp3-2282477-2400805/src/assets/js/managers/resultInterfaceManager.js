import { StoreService } from "../services/storeService.js";
import { ScoreManager } from "./scoreManager.js";
import { SCORE_KEY } from "../utils/consts.js";

export class ResultInterfaceManager {
  constructor() {
    this.storeService = new StoreService();
    this.scoreManager = new ScoreManager(this.storeService);
    this.averageScoreContent = document.getElementById("average-score-content");
    this.tableBody = document.getElementById("result-table-body");
    this.avgScoreBtn = document.getElementById("avg-score-btn");
    this.deleteScoreBtn = document.getElementById("delete-score-btn");
  }

  /**
 * TODO : Ajouter les gestionnaires d'événements sur les deux boutons
 * TODO : Charger les scores et les afficher dans le tableau
 * TODO : Afficher un message si aucun score n'est disponible
 * Initialise l'interface des résultats
 */
  initResultInterface() {
    this.#renderScores();
    this.avgScoreBtn.addEventListener("click", () => this.#computeAverageScore());
    this.deleteScoreBtn.addEventListener("click", () => {
      this.#deleteScore();
      this.#renderScores();
      this.averageScoreContent.innerHTML = "";
    });
  }

  #renderScores() {
    const scores = this.scoreManager.getAllScores();

    const headerRow = this.tableBody.querySelector("tr");
    this.tableBody.innerHTML = "";
    if (headerRow) this.tableBody.appendChild(headerRow);

    if (scores.length === 0) {
      const emptyRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = "Aucun score disponible.";
      emptyRow.appendChild(cell);
      this.tableBody.appendChild(emptyRow);
      return;
    }


    scores.forEach(score => {
      const row = this.#createTableRowElement(score);
      this.tableBody.appendChild(row);
    });
  }

  /**
  * TODO : Générer dynamiquement les lignes du tableau de scores
  * Génère une ligne de tableau HTML pour un score donné. 
  * Chaque cellule est créée et remplie avec les données appropriées dans un élément <tr>.
  * @param {{name: string, score: number, gameSize: string, date: string}} score
  * @returns {HTMLTableRowElement} élément <tr> de la ligne du tableau
  */
  #createTableRowElement(score) {
    const rowElement = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = score.name;
    rowElement.appendChild(nameCell);

    const scoreCell = document.createElement("td");
    scoreCell.textContent = score.score;
    rowElement.appendChild(scoreCell);

    const sizeCell = document.createElement("td");
    sizeCell.textContent = score.gameSize;
    rowElement.appendChild(sizeCell);

    const dateCell = document.createElement("td");

    const d = new Date(score.date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    dateCell.textContent = `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
    rowElement.appendChild(dateCell);

    return rowElement;
  }

  /**
  * TODO : Ajouter la logique pour supprimer les scores et mettre à jour l'affichage
  * Supprime tous les scores enregistrés et met à jour l'affichage du tableau.
  */
  #deleteScore() {
    this.scoreManager.clearAllScores();
    localStorage.removeItem(SCORE_KEY);
  }

  /**
   * Calcule et affiche la moyenne des scores par taille de jeu.
   */
  #computeAverageScore() {
    const scoreSumPerGameSize = this.scoreManager.computeAveragePerGameSize();
    if (!scoreSumPerGameSize) return;

    this.averageScoreContent.innerHTML = "";

    for (const key in scoreSumPerGameSize) {
      const averageScore = document.createElement("li");
      averageScore.textContent = `La moyenne de score pour la taille du jeu ${key} est de ${scoreSumPerGameSize[key].average.toFixed(2)}`;
      this.averageScoreContent.appendChild(averageScore);
    }
  }
}
