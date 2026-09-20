// TODO : Compléter la classe et les méthodes selon les besoins
export class ConfigurationInterfaceManager {
    constructor(storeService, gameConfigKey) {
        this.storeService = storeService;
        this.gameConfigKey = gameConfigKey;
    }

    /**
     * TODO : Initialiser la page de configuration du jeu et gérer la soumission du formulaire
     */
    initializeConfigurationPage() {
        // TODO : Gérer la soumission du formulaire
        const form = document.getElementById("game-config-form");

        const savedConfig = this.storeService.loadData(this.gameConfigKey);
        if (savedConfig) {
            form.gameSize.value = savedConfig.gameSize;
            form.cardType.value = savedConfig.cardType;
            form.maxAttempts.value = savedConfig.maxAttempts;
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const config = this.generateConfig(form);

            if (!config.maxAttempts || config.maxAttempts <= 0) {
                alert("Max attempts must be > 0");
                this.storeService.saveData(this.gameConfigKey, config, sessionStorage); // save even if failed
                return;
            }
            this.storeService.saveData(this.gameConfigKey, config, sessionStorage);
            window.location.href = "game.html"
        })
    }

    /**
    * TODO : Extraire la configuration du formulaire de jeu dans un objet prédéfini
    * @param {HTMLFormElement} formElement formulaire de configuration du jeu
    * @returns {{gameSize: string, cardType: string, maxAttempts: number}} configuration de sauvegarde
    */
    generateConfig(formElement) {
        const gameSize = formElement.querySelector('select[name="gameSize"]').value;
        const cardType = formElement.querySelector('input[name="cardType"]:checked').value;
        const maxAttempts = parseInt(formElement.querySelector('input[name="maxAttempts"]').value);

        return {
            gameSize,
            cardType,
            maxAttempts
        };
    }

}