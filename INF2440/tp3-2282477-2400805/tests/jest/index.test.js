import { ConfigurationInterfaceManager } from '../../src/assets/js/managers/configurationInterfaceManager.js';
import { StoreService } from '../../src/assets/js/services/storeService.js';
import { GAME_CONFIG_KEY } from '../../src/assets/js/utils/consts';

describe('Configuration page tests', () => {
    let configurationInterfaceManager;
    let formElement;
    beforeEach(() => {
        configurationInterfaceManager = new ConfigurationInterfaceManager(new StoreService(), GAME_CONFIG_KEY);
        formElement = document.createElement('form');
        formElement.setAttribute('id', 'game-config-form');
        formElement.innerHTML = `
            <select name="gameSize" id="game-size">
                <option value="4x3" selected>4x3</option>
            </select>
            <input type="radio" name="cardType" value="numbers" checked>
            <input type="number" name="maxAttempts" id="max-attempts" value="5">
        `;
        document.body.appendChild(formElement);
    });

    afterEach(() => {
        formElement = null;
    });

    test('generateConfig returns correct configuration object', () => {
        const config = configurationInterfaceManager.generateConfig(formElement);
        expect(config).toEqual({
            gameSize: '4x3',
            cardType: 'numbers',
            maxAttempts: 5,
        });
    });
});