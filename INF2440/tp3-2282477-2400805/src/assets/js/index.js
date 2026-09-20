import { StoreService } from "./services/storeService.js";
import { GAME_CONFIG_KEY } from "./utils/consts.js";
import { ConfigurationInterfaceManager } from "./managers/configurationInterfaceManager.js";

const configurationInterfaceManager = new ConfigurationInterfaceManager(new StoreService(), GAME_CONFIG_KEY);

configurationInterfaceManager.initializeConfigurationPage();
