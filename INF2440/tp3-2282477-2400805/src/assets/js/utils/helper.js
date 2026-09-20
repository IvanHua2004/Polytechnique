/**
 * Trie aléatoirement les éléments d'un tableau en place
 * @param {Array} array tableau à mélanger
 * @returns {Array} tableau mélangé
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Formate un objet Date en chaîne de caractères localisée
 * @param {Date} date - Date à formater
 * @returns {string} Chaîne de date formatée
 * @private
*/
export function formatDate(date) {
  return date
    .toLocaleString("fr-FR", { hour12: false })
    .split(" ")
    .reverse()
    .join(" - ");
}