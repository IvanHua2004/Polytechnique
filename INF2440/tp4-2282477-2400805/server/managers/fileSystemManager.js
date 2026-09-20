const fs = require('fs').promises;
const path = require('path');

class FileSystemManager {
    constructor(imagesDir, dbFile) {
        this.imagesDir = imagesDir;
        this.dbFile = dbFile;
        this.ensureDBFile();
    }

    /**
     * Vérifie l'existence du fichier de la base de données et le crée si absent
     */
    async ensureDBFile() {
        try {
            await fs.access(this.dbFile);
        } catch (e) {
            await fs.writeFile(this.dbFile, '[]');
        }
    }

    /**
     * Accède à l'objet sauvegardé dans le fichier de la base de données
     * @returns {Promise<Object>} - L'objet sauvegardé
     */
    async readDB() {
        const data = await fs.readFile(this.dbFile, 'utf-8');
        return JSON.parse(data);
    }

    /**
     * Sauvegarde un objet dans le fichier de la base de données
     * @param {Object} data - L'objet à sauvegarder
     */
    async writeDB(data) {
        await fs.writeFile(this.dbFile, JSON.stringify(data, null, 4));
    }

    /**
     * Sauvegarde une image
     * @param {File} imageFile - Fichier de l'image
     * @param {string} filename - Nom du fichier de l'image
     */
    async saveImageFile(imageFile, filename) {
        return new Promise((resolve, reject) => {
            imageFile.mv(path.join(this.imagesDir, filename), err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Supprime une image
     * @param {string} filename - Nom du fichier de l'image
     */
    async deleteImageFile(filename) {
        try {
            await fs.unlink(path.join(this.imagesDir, filename));
        } catch (e) { }
    }
}

module.exports = FileSystemManager;
