const express = require('express');
const HTTP_STATUS = require('../consts');

class AdminRouter {
    constructor(adminManager) {
        this.router = express.Router();
        this.adminManager = adminManager;
        this.configureRoutes();
    }

    configureRoutes() {
        // TODO : Définir une route pour réinitialiser les images utilisant this.adminManager.resetImages

        /**
         * @swagger
         * /admin/reset:
         *   delete:
         *     tags:
         *       - Admin
         *     summary: Reinitialise toutes les images a l'état public
         *     description: Met a jour toutes les images avec un statut public, 0 vues, supprime les limites de vues et désactive l'option de suppression immediate.
         *     responses:
         *       500:
         *         description: Erreur interne du serveur(TODO Ajouter les autres réponses)
         */
        this.router.delete('/reset', async (req, res) => {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'TODO' });
        });
    }
}

module.exports = AdminRouter;
