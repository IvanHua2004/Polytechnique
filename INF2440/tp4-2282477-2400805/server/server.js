const express = require('express');
const fileUpload = require('express-fileupload');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const ImagesRouter = require('./routes/imagesRouter');
const FileSystemManager = require('./managers/fileSystemManager');
const ImagesManager = require('./managers/imagesManager');
const AdminRouter = require('./routes/adminRouter');
const AdminManager = require('./managers/adminManager');
const path = require('path');

class Server {
    constructor() {
        this.configureRoutes();
    }

    configureRoutes() {
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'API de PolyImages',
                    version: '1.0.0',
                    description: "API pour un système d'imagerie limitée permettant de partager des images avec des limites de vues",
                    contact: {
                        name: 'LOG2440',
                    }
                },
                servers: [
                    {
                        url: 'http://localhost:5020',
                        description: 'Serveur de développement',
                    }
                ]
            },
            apis: ['./routes/*.js'],
        };

        const swaggerSpec = swaggerJSDoc(swaggerOptions);

        this.app = express();
        // TODO : Ajouter les bons middlewares pour accepter les requêtes de plusieurs origines
        
        const maxImageFileSize = 1048576;
        this.app.use(fileUpload({ limits: { fileSize: maxImageFileSize }, abortOnLimit: true }));

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json({ limit: '10mb' }));

        const imagesDir = path.join(__dirname, './data/images');
        const dbFile = path.join(__dirname, './data/images.json');
        const fsManager = new FileSystemManager(imagesDir, dbFile);
        const imagesManager = new ImagesManager(fsManager);
        const imagesRouter = new ImagesRouter(imagesManager);
        // TODO : Configurer le routeur au bon préfixe

        const adminManager = new AdminManager(fsManager);
        const adminRouter = new AdminRouter(adminManager);
        // TODO : Configurer le routeur au bon préfixe

        this.app.use('/api', swaggerUI.serve, swaggerUI.setup(swaggerSpec, { explorer: true }));
        this.app.get('/api-docs.json', (req, res) => {
            res.json(swaggerSpec);
        });
    }

    launch() {
        const PORT = 5020;
        this.server = this.app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    }
}

const server = new Server();

module.exports = server;