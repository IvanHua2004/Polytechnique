const express = require('express');
const HTTP_STATUS = require('../consts');

class ImagesRouter {
    constructor(imagesManager) {
        this.router = express.Router();
        this.imagesManager = imagesManager;
        this.configureRoutes();
    }

    configureRoutes() {
        /**
         * @swagger
         * /images:
         *   get:
         *     tags:
         *       - Images
         *     summary: Récupère toutes les images
         *     description: Retourne la liste des images publiques et privées en excluant leur code secret
         *     responses:
         *       200:
         *         description: Liste des images récupérée avec succès
         *       500:
         *         description: Erreur interne du serveur
         */
        this.router.get('/', async (req, res) => {
            try {
                const images = await this.imagesManager.getAllImages();
                res.json(images);
            } catch (e) {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: e.message });
            }
        });

        /**
         * @swagger
         * /images/static/{id}:
         *   get:
         *     tags:
         *       - Images
         *     summary: Récupère le fichier image
         *     description: Retourne le fichier image par son ID. Si l'image est privée, le code secret est requis.
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: ID unique de l'image
         *         schema:
         *           type: string
         *       - in: query
         *         name: code
         *         description: Code secret pour accéder à une image privée
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Fichier image
         *         content:
         *           image/*:
         *             schema:
         *               type: string
         *               format: binary
         *       403:
         *         description: Code secret invalide ou manquant pour une image privée
         *       404:
         *         description: Image non trouvée
         */
        this.router.get('/static/:id', async (req, res) => {
            const { id } = req.params;
            const { code } = req.query;

            const result = await this.imagesManager.getImageFileById(id, code);
            if (this.handleErrorResponse(result, res)) return;

            res.sendFile(result.filePath, {}, async (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
                if (result.deleteAfterSend) {
                    await this.imagesManager.deleteImage(id, result.deletionCode);
                }
            });
        });

        // TODO : Définir une route pour accéder aux métadonnés d'une image spécifique utilisant this.imagesManager.getImageById

        /**
         * @swagger
         * /images/{id}:
         */
        this.router.use('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { code } = req.query;
                res.sendStatus(HTTP_STATUS.NOT_FOUND);
            } catch (e) {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: e.message });
            }
        });

        // TODO : Définir une route pour publier une nouvelle image utilisant this.imagesManager.createImage

        /**
         * @swagger
         * /images:
         */
        this.router.use('/', async (req, res) => {
            if (!req.files || !req.files.image) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Image file required' });
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'TODO' });

        });

        // TODO : Définir une route pour modifier une image utilisant this.imagesManager.updateImage

        /**
         * @swagger
         * /images/{id}:
         */
        this.router.use('/:id', async (req, res) => {
            const { id } = req.params;
            const { code } = req.query;
            res.json({});
        });

        // TODO : Définir une route pour supprimer une image utilisant this.imagesManager.deleteImage

        /**
         * @swagger
         * /images/{id}:
         */
        this.router.use('/:id', async (req, res) => {
            const { id } = req.params;
            const { code } = req.query;
            res.status(HTTP_STATUS.NO_CONTENT).end();
        });
    }

    /**
     * Gère la réponse en cas d'erreur
     * @param {{error?: number}} result - Résultat de l'opération
     * @param {Response} res - Réponse de la requête HTTP
     * @returns {boolean} - True si la réponse est 404 ou 403
     */
    handleErrorResponse(result, res) {
        if (result && result.error === HTTP_STATUS.NOT_FOUND) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' });
            return true;
        }
        if (result && result.error === HTTP_STATUS.FORBIDDEN) {
            res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Forbidden' });
            return true;
        }
        return false;
    }
}

module.exports = ImagesRouter;
