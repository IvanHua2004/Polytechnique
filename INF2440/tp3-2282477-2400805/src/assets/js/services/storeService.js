export class StoreService {
  constructor() { }

  /**
   * TODO : Sauvegarde une donnée dans le storage.
   * @param {string} key - La clé sous laquelle sauvegarder la donnée.
   * @param {any} value - La valeur à sauvegarder (sera convertie en JSON).
   * @param {Storage} storage - Le type de stockage (sessionStorage ou localStorage).
   * @returns {void}
   */
  saveData(key, data, storage = sessionStorage) {
    try {
      const jsonData = JSON.stringify(data);
      storage.setItem(key, jsonData);
    } catch (error) {
      console.log("Erreur lors de la sauvegarde: ", error);
    }
  }

  /**
   * TODO : Charge une donnée depuis le storage.
   * @param {string} key - La clé de la donnée à charger.
   * @param {Storage} storage - Le type de stockage (sessionStorage ou localStorage).
   * @returns {any|null} La valeur associée à la clé, ou null si absente ou invalide.
   */
  loadData(key, storage = sessionStorage) {
    try {
      const data = storage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log("Erreur lors du chargement: ", error);
    }
  }

  /**
  * TODO : Supprime une donnée du storage.
  * @param {string} key - La clé de la donnée à supprimer.
  * @param {Storage} storage - Le type de stockage (sessionStorage ou localStorage).
  * @returns {void}
  */
  clearData(key, storage = sessionStorage) {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.log("Erreur lors de la suppression: ", error)
    }
  }

  /**
   * Vide complètement le storage.
   * @param {Storage} storage - Le type de stockage (sessionStorage ou localStorage).
   * @returns {void}
   */
  clearAllData(storage = sessionStorage) {
    storage.clear();
  }
}
