import { GameManager, gameGridState } from '../../src/assets/js/managers/gameManager.js';
import { jest } from '@jest/globals';

describe('GameManager tests', () => {
    let gameManager;
    let storeServiceMock;
    let scoreManagerMock;
    let config = { gameSize: '2x3', cardType: 'letters', maxAttempts: 5 };

    beforeEach(() => {
        storeServiceMock = {
            loadData: jest.fn(),
            saveData: jest.fn(),
            clearData: jest.fn(),
        };

        scoreManagerMock = {
            computeAndSaveScore: jest.fn(),
        };

        // Pass mocks to GameManager
        gameManager = new GameManager();
        gameManager.storeService = storeServiceMock;
        gameManager.scoreManager = scoreManagerMock;

        // Set default gameBoard and gameState
        storeServiceMock.loadData.mockReturnValue(config);
        gameManager.gameBoard = gameManager.initNewGameBoard();
        gameManager.gameState = gameManager.initNewGameState();
    });

    // Test initGameBoard
    it('initGameBoard should return a game configuration object', () => {
        const board = gameManager.initGameBoard();
        expect(board.cardContents.length).toBe(6);
        expect(board.cardContents.every(c => !c.visible)).toBe(true);
        expect(board.rows).toBe(3);
        expect(board.cols).toBe(2);
        expect(board.totalPairs).toBe(3);
    });

    // Test initGameState
    it('initGameState should return a game state object', () => {
        const state = gameManager.initGameState();
        expect(state.gridState).toBe(gameGridState.NO_CARDS_VISIBLE);
        expect(state.previousCardValue).toBeNull();
        expect(state.remainingAttempts).toBe(config.maxAttempts);
        expect(state.matchedPairsCount).toBe(0);
    });

    // Test createCardContent
    describe('createCardContent tests', () => {
        it('createCardContent should create pairs of card containing letters', () => {
            const content = gameManager.createCardContent(6, 'letters');
            expect(content.length).toBe(6);
            expect(content.every(c => !c.visible)).toBe(true);
            const values = content.map(c => c.value);
            expect(new Set(values).size).toBe(3); // 3 unique pairs
        });

        it('createCardContent should create pairs of card containing numbers only', () => {
            const content = gameManager.createCardContent(6, 'numbers');
            expect(content.length).toBe(6);
            expect(content.every(c => !c.visible)).toBe(true);
            const values = content.map(c => c.value);
            expect(new Set(values).size).toBe(3);
        });

        it('createCardContent should only have invisible cards', () => {
            const content = gameManager.createCardContent(6, 'letters');
            expect(content.every(c => c.visible === false)).toBe(true);
        });
    });

    // Test updateGameState
    describe('updateGameState tests', () => {
        beforeEach(() => {
            gameManager.gameState = gameManager.initGameState();
            gameManager.matchedPairFound = false;
        });

        it('updateGameState should change the state correctly on first click', () => {
            const cardValue = 'A';
            gameManager.updateGameState(cardValue);
            expect(gameManager.gameState.gridState).toBe(gameGridState.ONE_CARD_VISIBLE);
            expect(gameManager.gameState.previousCardValue).toBe(cardValue);
        });

        it('updateGameState should change the state correctly on second click with a match', () => {
            gameManager.gameState.gridState = gameGridState.ONE_CARD_VISIBLE;
            gameManager.gameState.previousCardValue = 'A';
            gameManager.matchedPairFound = false;

            gameManager.updateGameState('A');

            expect(gameManager.gameState.matchedPairsCount).toBe(1);
            expect(gameManager.gameState.gridState).toBe(gameGridState.NO_CARDS_VISIBLE);
        });

        it('updateGameState should change the state correctly on second click without a match', () => {
            gameManager.gameState.gridState = gameGridState.ONE_CARD_VISIBLE;
            gameManager.gameState.previousCardValue = 'A';
            gameManager.gameState.remainingAttempts = 5;
            gameManager.matchedPairFound = false;

            gameManager.updateGameState('B');

            expect(gameManager.gameState.matchedPairsCount).toBe(0);
            expect(gameManager.gameState.remainingAttempts).toBe(4);
            expect(gameManager.gameState.gridState).toBe(gameGridState.NO_CARDS_VISIBLE);
            expect(gameManager.gameState.previousCardValue).toBeNull();
        });
    });

    // Test setCardVisible
    it('setCardVisible should change the visibility of the selected card', () => {
        gameManager.gameBoard = {
            cardContents: [
                { value: 'A', visible: false },
                { value: 'B', visible: false },
                { value: 'A', visible: false },
                { value: 'B', visible: false },
            ]
        };

        gameManager.setCardVisible(1);
        expect(gameManager.gameBoard.cardContents[1].visible).toBe(true);
    });

    // End condition tests
    describe('end condition tests', () => {
        it('isGameOver should return true when no attempts remain', () => {
            gameManager.gameState.remainingAttempts = 0;
            expect(gameManager.isGameOver()).toBe(true);
        });

        it('hasWon should return true when all pairs are matched', () => {
            gameManager.gameBoard = { totalPairs: 3 };
            gameManager.gameState.matchedPairsCount = 3;
            expect(gameManager.hasWon()).toBe(true);
        });
    });

    // Test resetGame
    it('resetGame should reinitialize the game state and board', () => {
        gameManager.resetGame();
        expect(gameManager.gameState.remainingAttempts).toBe(config.maxAttempts);
        expect(gameManager.gameBoard.cardContents.length).toBe(6);
    });

    // Test saveScore
    it('saveScore should interact with scoreManager to save the score', () => {
        gameManager.gameState.remainingAttempts = 3;
        gameManager.saveScore('Alice');

        expect(scoreManagerMock.computeAndSaveScore).toHaveBeenCalledWith('Alice', 3);
        expect(storeServiceMock.clearData).toHaveBeenCalledWith('memory_game_current_state');
    });

    // Full game simulation
    describe('End to end test', () => {
        it('should simulate a full game session', () => {
            gameManager.resetGame();

            gameManager.gameBoard.cardContents = [
                { value: 'A', visible: false },
                { value: 'B', visible: false },
                { value: 'A', visible: false },
                { value: 'B', visible: false },
                { value: 'C', visible: false },
                { value: 'C', visible: false },
            ];

            const selections = [0, 2, 1, 3, 4, 5];

            selections.forEach(index => {
                const cardValue = gameManager.gameBoard.cardContents[index].value;
                gameManager.updateGameState(cardValue);
            });

            expect(gameManager.hasWon()).toBe(true);
            expect(gameManager.isGameOver()).toBe(false);
            expect(gameManager.gameState.remainingAttempts).toBe(config.maxAttempts);
        });
    });
});
