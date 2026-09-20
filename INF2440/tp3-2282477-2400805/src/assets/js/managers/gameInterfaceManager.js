import { DELAY_BEFORE_FLIP_BACK, CARD_SIZE } from "../utils/consts.js";
import { GameManager, gameGridState } from "./gameManager.js";

export class GameInterfaceManager {
  constructor() {
    this.gameManager = new GameManager();
    this.gameBoardElement = document.getElementById("game-board");
    // TODO : Empêcher le bouton droit de la souris
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    this.gameInfoElement = document.getElementById("game-info");
    this.firstCardElement = null;
    this.secondCardElement = null;
    this.isProcessing = false;
    const askNewGame = localStorage.getItem("ASK_NEW_GAME");
    if (askNewGame === "true") {
      localStorage.removeItem("ASK_NEW_GAME");
      const res = confirm("Souhaitez-vous commencer une nouvelle partie ?");
      if (res) {
        this.resetGameInterface();
      } else {
        this.navigate("index.html");
        return;
      }
    }


    this.initGameInterface();
  }

  /**
   * TODO : Initialiser l'interface du plateau de jeu dans le DOM.
   */
  initGameInterface() {
    const gameBoard = this.gameManager.gameBoard;
    if (!gameBoard) {
      this.gameInfoElement.textContent =
        "Aucune configuration de jeu trouvée. Veuillez retourner à la page d'accueil pour configurer le jeu.";
      return;
    }

    this.gameBoardElement.innerHTML = "";
    this.gameBoardElement.style.display = "grid";
    this.gameBoardElement.style.gridTemplateColumns = `repeat(${gameBoard.cols}, ${CARD_SIZE}px)`;
    this.gameBoardElement.style.gridTemplateRows = `repeat(${gameBoard.rows}, ${CARD_SIZE}px)`;
    this.gameBoardElement.style.justifyContent = "center";
    this.gameBoardElement.style.gap = "10px";

    gameBoard.cardContents.forEach((card, index) => {
      const cardElement = this.createCardElement(index);

      if (card.visible && this.isCardInCompletedPair(index)) {
        const back = cardElement.querySelector(".game-card-back");
        const front = cardElement.querySelector(".game-card-front");
        back.style.opacity = "1";
        front.style.opacity = "0";
        cardElement.setAttribute("data-hidden", "false");
        cardElement.style.pointerEvents = "none";
      } else {
        this.gameManager.gameBoard.cardContents[index].visible = false;
      }

      cardElement.addEventListener("click", (e) => this.onCardElementClick(e));
      this.gameBoardElement.appendChild(cardElement);
    });

    this.#updateRemainAttempts();
  }

  /**
   * Vérifie si une carte fait partie d'une paire complétée
   */
  isCardInCompletedPair(index) {
    const cardValue = this.gameManager.gameBoard.cardContents[index].value;
    const visibleCards = this.gameManager.gameBoard.cardContents
      .map((card, i) => ({ value: card.value, index: i, visible: card.visible }))
      .filter(card => card.visible);

    // Compter combien de cartes avec cette valeur sont visibles
    const sameValueCards = visibleCards.filter(card => card.value === cardValue);
    return sameValueCards.length === 2; // Paire complète
  }

  /**
   * TODO : Créer un élément DOM représentant une carte du jeu.
   */
  createCardElement(index) {
    const cardData = this.gameManager.gameBoard.cardContents[index];
    const card = document.createElement("div");
    card.classList.add("game-card-content");

    card.setAttribute("data-hidden", "true");
    card.setAttribute("data-index", index);
    card.style.width = `${CARD_SIZE}px`;
    card.style.height = `${CARD_SIZE}px`;

    const front = document.createElement("div");
    front.classList.add("game-card-front");

    const back = document.createElement("div");
    back.classList.add("game-card-back");
    back.textContent = cardData.value;

    card.appendChild(front);
    card.appendChild(back);

    return card;
  }

  /**
   * TODO : Retourner ou cache une carte visuellement.
   */
  toggleCard(cardElement) {
    const isHidden = cardElement.getAttribute("data-hidden") === "true";
    const back = cardElement.querySelector(".game-card-back");
    const front = cardElement.querySelector(".game-card-front");

    if (isHidden) {
      back.style.opacity = "1";
      front.style.opacity = "0";
      cardElement.setAttribute("data-hidden", "false");
    } else {
      back.style.opacity = "0";
      front.style.opacity = "1";
      cardElement.setAttribute("data-hidden", "true");
    }
  }

  /**
   * TODO : Gérer le clic utilisateur sur une carte du plateau.
   */
  async onCardElementClick(event) {
    if (this.isProcessing) return;

    const cardElement = event.currentTarget;
    const index = parseInt(cardElement.getAttribute("data-index"));
    const cardData = this.gameManager.gameBoard.cardContents[index];

    if (cardData.visible ||
      (this.firstCardElement && this.secondCardElement) ||
      cardElement === this.firstCardElement) {
      return;
    }

    this.toggleCard(cardElement);
    this.gameManager.gameBoard.cardContents[index].visible = true;

    if (!this.firstCardElement) {
      this.firstCardElement = cardElement;
      this.gameManager.gameState.gridState = gameGridState.ONE_CARD_VISIBLE;
      this.gameManager.gameState.previousCardValue = cardData.value;
    } else if (!this.secondCardElement) {
      this.secondCardElement = cardElement;

      const firstIndex = parseInt(this.firstCardElement.getAttribute("data-index"));
      const firstValue = this.gameManager.gameBoard.cardContents[firstIndex].value;
      const secondValue = cardData.value;

      if (firstValue === secondValue) {
        this.gameManager.matchedPairFound = true;
        this.gameManager.gameState.matchedPairsCount++;
        this.#handleMatchedPair();
        this.gameManager.saveGameState();
      } else {
        this.isProcessing = true;
        this.gameManager.gameState.remainingAttempts--;
        await this.#handleUnmatchedPair();
        this.isProcessing = false;
        this.gameManager.saveGameState();
      }

      this.#updateRemainAttempts();

      if (this.gameManager.hasWon()) {
        setTimeout(() => this.#handleGameWin(), 500);
      } else if (this.gameManager.isGameOver()) {
        setTimeout(() => this.#handleGameOver(), 500);
      }
    }
  }

  /**
   * Redirige l'utilisateur vers un URL quelconque
   */
  navigate(target) {
    window.location.href = target;
  }

  /**
   * TODO : Réinitialiser l'interface du jeu.
   */
  resetGameInterface() {
    this.gameManager.resetGame();
    this.firstCardElement = null;
    this.secondCardElement = null;
    this.isProcessing = false;
    this.initGameInterface();
  }

  /**
   * TODO : Mettre à jour le nombre d'essai restants dans l'interface.
   */
  #updateRemainAttempts() {
    const attempts = this.gameManager.gameState.remainingAttempts;
    document.getElementById("remain-attempts").textContent = attempts;
  }

  /**
   * TODO : Gérer l'affichage et la logique lorsqu'une paire est trouvée.
   */
  #handleMatchedPair() {
    this.firstCardElement.style.pointerEvents = "none";
    this.secondCardElement.style.pointerEvents = "none";
    this.gameManager.gameState.gridState = gameGridState.NO_CARDS_VISIBLE;
    this.gameManager.gameState.previousCardValue = null;

    this.#resetSelection();
  }

  /**
   * Gère l'affichage et la logique lorsqu'une paire n'est pas trouvée.
   */
  async #handleUnmatchedPair() {
    await new Promise((resolve) =>
      setTimeout(() => {
        this.toggleCard(this.firstCardElement);
        this.toggleCard(this.secondCardElement);

        const firstIndex = parseInt(this.firstCardElement.getAttribute("data-index"));
        const secondIndex = parseInt(this.secondCardElement.getAttribute("data-index"));

        this.gameManager.gameBoard.cardContents[firstIndex].visible = false;
        this.gameManager.gameBoard.cardContents[secondIndex].visible = false;

        this.gameManager.gameState.gridState = gameGridState.NO_CARDS_VISIBLE;
        this.gameManager.gameState.previousCardValue = null;

        this.#resetSelection();
        resolve();
      }, DELAY_BEFORE_FLIP_BACK)
    );
  }

  /**
   * Réinitialise la sélection des cartes (aucune carte sélectionnée).
   */
  #resetSelection() {
    this.firstCardElement = null;
    this.secondCardElement = null;
  }

  /**
   * TODO : Gérer la fin de partie lorsque le joueur a perdu.
   */
  #handleGameOver() {
    const res = confirm(
      "Partie terminée ! Vous avez épuisé toutes vos tentatives.\n Voulez-vous commencer une nouvelle partie ?"
    );
    if (res) {
      this.resetGameInterface();
    } else {
      localStorage.setItem("ASK_NEW_GAME", "true");
      this.navigate("index.html");
    }
  }

  /**
   * TODO : Gérer la fin de partie lorsque le joueur a gagné.
   */
  #handleGameWin() {
    const name = window.prompt(
      "Félicitations ! Vous avez gagné !\nVeuillez entrer votre nom pour la sauvegarde de votre score."
    );
    if (name) {
      this.gameManager.saveScore(name);
    } else {
      localStorage.setItem("ASK_NEW_GAME", "true");
    }
    setTimeout(() => this.navigate("results.html"), 50);
  }
}