const request = require('supertest');
const express = require('express');
const fileUpload = require('express-fileupload');
const ImagesRouter = require('../routes/imagesRouter');
const HTTP_STATUS = require('../consts');
const { mockSendFileSuccess } = require('./testUtils');

describe('ImagesRouter', () => {
    let app;
    let imagesRouter;
    let mockImagesManager;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(fileUpload());

        mockImagesManager = {
            getAllImages: jest.fn(),
            getImageById: jest.fn(),
            getImageFileById: jest.fn(),
            createImage: jest.fn(),
            updateImage: jest.fn(),
            deleteImage: jest.fn(),
        };

        imagesRouter = new ImagesRouter(mockImagesManager);
        app.use('/images', imagesRouter.router);
    });

    describe('GET /images', () => {
        it('should return all images', async () => {
            const mockImages = [
                { id: '1', title: 'Image 1', status: 'public', views: 0 },
                { id: '2', title: 'Image 2', status: 'private', views: 5 },
            ];

            mockImagesManager.getAllImages.mockResolvedValue(mockImages);

            const response = await request(app).get('/images');

            expect(response.status).toBe(HTTP_STATUS.SUCCESS);
            expect(response.body).toEqual(mockImages);
        });

        it('should return empty array when no images exist', async () => {
            mockImagesManager.getAllImages.mockResolvedValue([]);

            const response = await request(app).get('/images');

            expect(response.status).toBe(HTTP_STATUS.SUCCESS);
            expect(response.body).toEqual([]);
        });

        it('should return 500 on error', async () => {
            mockImagesManager.getAllImages.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/images');

            expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /images/static/:id', () => {
        it('should accept code query parameter', async () => {
            mockImagesManager.getImageFileById.mockResolvedValue({
                error: HTTP_STATUS.NOT_FOUND,
            });

            await request(app).get('/images/static/1?code=SECRET123');

            expect(mockImagesManager.getImageFileById).toHaveBeenCalledWith('1', 'SECRET123');
        });

        it('should return 404 for non-existent image', async () => {
            mockImagesManager.getImageFileById.mockResolvedValue({
                error: HTTP_STATUS.NOT_FOUND,
            });

            const response = await request(app).get('/images/static/non-existent');

            expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
        });

        it('should return 403 for forbidden access', async () => {
            mockImagesManager.getImageFileById.mockResolvedValue({
                error: HTTP_STATUS.FORBIDDEN,
            });

            const response = await request(app).get('/images/static/1');

            expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
        });

        it('should attempt to send file when no error', async () => {
            jest.spyOn(global.console, 'error').mockImplementation(() => { });
            mockImagesManager.getImageFileById.mockResolvedValue({
                filePath: '/images/test.jpg',
                deleteAfterSend: false,
            });

            // eslint-disable-next-line no-magic-numbers
            await expect(request(app).get('/images/static/1').timeout(1000)).rejects.toThrow();

            expect(mockImagesManager.getImageFileById).toHaveBeenCalledWith('1', undefined);
        });

        it('should not delete when deleteAfterSend is false and send succeeds', async () => {
            mockImagesManager.getImageFileById.mockResolvedValue({
                filePath: '/images/test.jpg',
                deleteAfterSend: false,
            });

            const sendFileSpy = mockSendFileSuccess();

            mockImagesManager.deleteImage.mockImplementation(() => {
                throw new Error('deleteImage should not be called');
            });

            await request(app).get('/images/static/1');

            expect(mockImagesManager.getImageFileById).toHaveBeenCalledWith('1', undefined);
            expect(mockImagesManager.deleteImage).not.toHaveBeenCalled();

            sendFileSpy.mockRestore();
        });

        it('should handle immediate deletion after send', async () => {
            mockImagesManager.getImageFileById.mockResolvedValue({
                filePath: '/images/test.jpg',
                deleteAfterSend: true,
                deletionCode: 'SECRET_DELETE_CODE',
            });

            mockImagesManager.deleteImage.mockResolvedValue({ success: true });

            const sendFileSpy1 = mockSendFileSuccess();

            await request(app).get('/images/static/1?code=SECRET123');

            expect(mockImagesManager.getImageFileById).toHaveBeenCalledWith('1', 'SECRET123');
            expect(mockImagesManager.deleteImage).toHaveBeenCalledWith('1', 'SECRET_DELETE_CODE');

            expect(sendFileSpy1).toHaveBeenCalled();
            sendFileSpy1.mockRestore();
        });
    });
});
