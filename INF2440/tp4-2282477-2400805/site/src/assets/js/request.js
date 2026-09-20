import { SERVER_URL, HTTP_STATUS } from "./consts.js";

/**
 * Récupère toutes les images
 * @returns {Promise<Object[]>} - Liste des métadonnées des images
 */
async function getAllImages() {
    const response = await fetch(`${SERVER_URL}/images`);

    return handleFetchError(response);
}

/**
 * TODO : Récupère une image spécifique par son ID
 * @param {string} id - Identifiant de l'image
 * @param {string|null} code - Code secret (optionnel)
 * @returns {Promise<Object|null>} Informations de l'image ou null si le code secret est mauvais
 */
async function getImageById(id, code = null) {
    // ------- SOLUTION -------
    const url = code ? `${SERVER_URL}/images/${id}?code=${code}` : `${SERVER_URL}/images/${id}`;
    const response = await fetch(url);

    // TODO : Retourne les informations de l'image, ou retourne null si le code étais mauvais et que l'image était privée
    return null;
}

/**
 * TODO : Publie une nouvelle image
 * @param {FormData} formData - Données du formulaire avec image et métadonnées
 * @returns {Promise<string>} - Code secret de l'image
 */
async function publishImage(formData) {
    // TODO : Publier l'image et retourner le code secret
    return '';
}

/**
 * TODO : Modifie les métadonnées d'une image
 * @param {string} id - Identifiant de l'image
 * @param {string} code - Code secret de l'image
 * @param {{title?: string, status?: 'public'|'private', maxViews?: number, immediateDelete?: boolean}} data - Métadonnées à modifier
 * @returns {Promise<Object>} - Métadonnées de l'image mise à jour
 */
async function updateImage(id, code, data) {
    // TODO : Modifier l'image et retourner l'image mise à jour
    return {};
}

/**
 * TODO : Supprime une image
 * @param {string} id - Identifiant de l'image
 * @param {string} code - Code secret de l'image
 * @returns {Promise<Object>} - Message du serveur
 */
async function deleteImage(id, code) {
    // TODO : Supprime l'image et retourner l'image mise à jour
    return {};
}

/**
 * TODO : Réinitialise toutes les images
 * @returns {Promise<Object>} - Message du serveur
 */
async function resetAllImages() {
    // TODO : Réinitialise toutes les images et retourne le message du serveur
    return {};
}

/**
 * Utilitaire pour gérer les erreurs
 * @param {Response} response - Réponse de la requête
 * @returns {Promise<Object>} - Contenu de la requête converti en objet
 */
async function handleFetchError(response) {
    if (!response.ok) {
        throw new Error(`Status code: ${response.status}, Message: ${await response.text()}`);
    }
    try {
        return await response.json();
    } catch (parseError) {
        throw new Error(`Status code: ${response.status}, Message: ${parseError.message}`);
    }
};

/**
 * Génère l'URL d'une image pour l'affichage
 * @param {string} id - Identifiant de l'image
 * @param {string|null} code - Code secret de l'image (optionnel)
 * @returns {string} - URL pour afficher l'image
 */
function getImageUrl(id, code = null) {
    return code ? `${SERVER_URL}/images/static/${id}?code=${code}` : `${SERVER_URL}/images/static/${id}`;
}

export {
    getAllImages,
    getImageById,
    getImageUrl,
    publishImage,
    updateImage,
    deleteImage,
    resetAllImages
};
