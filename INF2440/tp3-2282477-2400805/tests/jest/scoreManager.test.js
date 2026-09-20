import { ScoreManager } from '../../src/assets/js/managers/scoreManager.js';
import { SCORE_KEY } from '../../src/assets/js/utils/consts.js';
import { jest } from '@jest/globals';

describe('ScoreManager tests', () => {
    let scoreManager;
    let storeServiceMock;

    const mockScores = [
        { name: 'Player 1', score: 30, gameSize: '2x2', date: '2025-10-01' },
        { name: 'Player 2', score: 20, gameSize: '4x3', date: '2025-10-02' },
        { name: 'Player 3', score: 25, gameSize: '3x2', date: '2025-10-03' },
        { name: 'Player 4', score: 15, gameSize: '2x2', date: '2025-10-04' },
    ];

    beforeEach(() => {
        storeServiceMock = {
            loadData: jest.fn(),
            saveData: jest.fn(),
        };
        scoreManager = new ScoreManager(storeServiceMock);
    });

    it('getAllScores should return all scores from storeService', () => {
        storeServiceMock.loadData.mockReturnValue(mockScores);
        const scores = scoreManager.getAllScores();
        expect(scores).toEqual(mockScores);
        expect(storeServiceMock.loadData).toHaveBeenCalledWith(SCORE_KEY, localStorage);
    });

    it('getAllScores should return empty array if no scores', () => {
        storeServiceMock.loadData.mockReturnValue(null);
        const scores = scoreManager.getAllScores();
        expect(scores).toEqual([]);
    });

    it('clearAllScores should delete all scores from storeService', () => {
        scoreManager.clearAllScores();
        expect(storeServiceMock.saveData).toHaveBeenCalledWith(SCORE_KEY, [], localStorage);
    });

    it('computeAndSaveScore should add a new score and save it', () => {
        storeServiceMock.loadData.mockReturnValue({ gameSize: '2x2' });
        scoreManager.getAllScores = jest.fn().mockReturnValue(mockScores);

        scoreManager.computeAndSaveScore('New Player', 3);
        expect(storeServiceMock.saveData).toHaveBeenCalled();
        expect(storeServiceMock.saveData).toHaveBeenCalledWith(SCORE_KEY, [...mockScores, { name: 'New Player', score: 3, gameSize: '2x2', date: expect.any(Date) }], localStorage);
    });

    // TODO : Tester computeAveragePerGameSize et corriger le problème dans le code source
    it('computeAveragePerGameSize should return correct averages', () => {
        scoreManager.getAllScores = jest.fn().mockReturnValue(mockScores);

        const averages = scoreManager.computeAveragePerGameSize();

        expect(averages).toEqual({
            "2x2": { sum: 45, length: 2, average: 22.5 },
            "4x3": { sum: 20, length: 1, average: 20 },
            "3x2": { sum: 25, length: 1, average: 25 },
        });
    });

    // TODO : Tester computeAveragePerGameSize dans le cas où aucune entrée n'existe
    it('computeAveragePerGameSize should return empty object if no scores', () => {
        scoreManager.getAllScores = jest.fn().mockReturnValue([]);
        const averages = scoreManager.computeAveragePerGameSize();
        expect(averages).toEqual({});
    });

    // TODO : Tester getMultiplicativeFactor et son comportement avec des tailles différentes
    it('getMultiplicativeFactor should return correct factor', () => {
        expect(scoreManager.getMultiplicativeFactor("4x3")).toBe(4);
        expect(scoreManager.getMultiplicativeFactor("3x2")).toBe(2);
        expect(scoreManager.getMultiplicativeFactor("2x2")).toBe(1); // default
        expect(scoreManager.getMultiplicativeFactor("unknown")).toBe(1); // fallback
    });

});