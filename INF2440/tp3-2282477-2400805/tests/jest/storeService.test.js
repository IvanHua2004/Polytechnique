import { StoreService } from "../../src/assets/js/services/storeService";

describe("StoreService tests", () => {
    let storeService;

    beforeEach(() => {
        storeService = new StoreService();
    });

    afterEach(() => {
        storeService = null;
    });

    it('saveData should store data in the specified storage', () => {
        const key = 'testKey';
        const data = { name: 'test', value: 42 };
        storeService.saveData(key, data, localStorage);
        const storedData = JSON.parse(localStorage.getItem(key));
        expect(storedData).toEqual(data);
    });

    it('loadData should retrieve data from the specified storage', () => {
        const key = 'testKey';
        const data = { name: 'test', value: 42 };
        localStorage.setItem(key, JSON.stringify(data));
        const loadedData = storeService.loadData(key, localStorage);
        expect(loadedData).toEqual(data);
    });

    it('loadData should return null if the key does not exist', () => {
        const loadedData = storeService.loadData('nonExistentKey', localStorage);
        expect(loadedData).toBeNull();
    });

    it('clearData should remove the specified key from the storage', () => {
        const key = 'testKey';
        const data = { name: 'test', value: 42 };
        localStorage.setItem(key, JSON.stringify(data));
        storeService.clearData(key, localStorage);
        const storedData = localStorage.getItem(key);
        expect(storedData).toBeNull();
    });

    it('clearAllData should clear all data from the specified storage', () => {
        localStorage.setItem('key1', JSON.stringify({}));
        localStorage.setItem('key2', JSON.stringify({}));
        storeService.clearAllData(localStorage);
        expect(localStorage.length).toBe(0);
    });
});
