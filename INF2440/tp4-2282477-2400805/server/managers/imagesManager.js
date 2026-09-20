const { randomUUID } = require('node:crypto');
const HTTP_STATUS = require('../consts');
const Path = require('path');

class ImagesManager {
    constructor(fsManager) {
        this.fsManager = fsManager;
    }

    /**
     * Récupèrer les métadonnées de toutes les images sans leurs codes secrets
     * @returns {Object[]} - Métadonnées des images
     */
    async getAllImages() {
        return (await this.fsManager.readDB()).map(img => {
            const { secretCode, ...publicData } = img;
            return publicData;
        });
    }

    /**
     * TODO : Récupérer les métadonnées d'une image, le code secret est requis si l'image est privée
     * @param {string} id - Identifiant de l'image
     * @param {string|null} code - Code secret pour acceder à l'image privée (optionnel)
     * @returns {Object} - Métadonnées de l'image sans le code secret ou une erreur 403/404 si l'accès n'est pas valide
     */
    async getImageById(id, code = null) {
        const images = await this.fsManager.readDB();
        const img = images.find(i => i.id === id);
        if (!img) {
            return { error: HTTP_STATUS.NOT_FOUND };
        }
        if (img.status === 'private' && img.secretCode !== code) {
            return { error: HTTP_STATUS.FORBIDDEN };
        }
        const { secretCode, ...publicData } = img;
        return publicData;
    }

    /**
     * TODO : Récupérer le chemin du fichier de l'image, le code secret est requis si l'image est privée
     * TODO : Gérer le cas où le nombre maximum de vues est atteint : rendre l'image privée ou la marquer pour suppression après l'envoi au client
     * @param {string} id - Identifiant de l'image
     * @param {string|null} code - Code secret pour acceder à l'image privée (optionnel)
     * @returns {{filePath: string, deleteAfterSend?: boolean, deletionCode?: string}|{error: number}} - Chemin du fichier image accompagné d'un flag de suppression si nécessaire, ou une erreur 403/404 si l'accès n'est pas valide
     */
    async getImageFileById(id, code = null) {
        const images = await this.fsManager.readDB();
        const img = images.find(i => i.id === id);
        if (!img) return { error: HTTP_STATUS.NOT_FOUND };
        // TODO
        if (img.status === 'private' && img.secretCode !== code) {
            return { error: HTTP_STATUS.FORBIDDEN }
        }
        if (img.views >= img.maxViews) {
            return { error: HTTP_STATUS.FORBIDDEN };
        }
        img.views += 1;
        await this.fsManager.readDB(images);


        return { filePath: '', deleteAfterSend: false, deletionCode: null };
    }

    /**
     * TODO : Créer une nouvelle image avec les métadonnées fournies et la sauvegarder
     * TODO : Sauvegarder le fichier image également
     * @param {{title: string, image: File, status: 'public'|'private', maxViews: number, immediateDelete: 'true'|'false'}} data - Métadonnées de la nouvelle image
     * @returns {Object} - Métadonnées de l'image créée avec le code secret
     */
    async createImage({ title, image, status, maxViews, immediateDelete }) {
        // ------- SOLUTION -------
        const id = randomUUID();
        const filename = `${id}_${image.name}`;
        /* eslint-disable-next-line no-magic-numbers */
        const secretCode = Array.from({ length: 6 }, () => Math.random().toString(36)[2]).join('').toUpperCase();
        return {};
    }

    /**
     * TODO : Mettre à jour les métadonnées d'une image existante, le code secret est toujours requis
     * TODO : Gérer le cas où le nombre maximum de vues est atteint après la mise à jour : rendre l'image privée ou la supprimer
     * @param {string} id - Identifiant de l'image
     * @param {string} code - Code secret pour modifier l'image
     * @param {{title?: string, status?: 'public'|'private', maxViews?: number, immediateDelete?: boolean}} data - Données à modifier (tous les champs sont optionnels)
     * @returns {Object|{error: number}} - Métadonnées de l'image mise à jour ou une erreur 403/404 si l'accès n'est pas valide
     */
    async updateImage(id, code, { title, status, maxViews, immediateDelete }) {
        return {};
    }

    /**
     * TODO : Supprimer une image existante, le code secret est toujours requis
     * @param {string} id - Identifiant de l'image
     * @param {string} code - Code secret pour supprimer l'image
     * @returns {{success: boolean}|{error: number}} - Succès ou erreur 403/404 si l'accès n'est pas valide
     */
    async deleteImage(id, code) {
        return { success: true };
    }
}

module.exports = ImagesManager;
