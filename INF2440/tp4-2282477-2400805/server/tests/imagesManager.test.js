/* eslint-disable no-magic-numbers, max-lines */
const ImagesManager = require('../managers/imagesManager');
const HTTP_STATUS = require('../consts');

describe('ImagesManager', () => {
    let imagesManager;
    let mockFsManager;

    beforeEach(() => {
        mockFsManager = {
            readDB: jest.fn(),
            writeDB: jest.fn(),
            saveImageFile: jest.fn(),
            deleteImageFile: jest.fn(),
            imagesDir: '/images',
        };

        imagesManager = new ImagesManager(mockFsManager);
    });

    describe('getAllImages', () => {
        it('should return all images without secret codes', async () => {
            const mockImages = [
                {
                    id: '1',
                    title: 'Image 1',
                    secretCode: 'SECRET1',
                    status: 'public',
                    views: 0,
                },
                {
                    id: '2',
                    title: 'Image 2',
                    secretCode: 'SECRET2',
                    status: 'private',
                    views: 5,
                },
            ];

            mockFsManager.readDB.mockResolvedValue(mockImages);

            const result = await imagesManager.getAllImages();

            expect(result).toHaveLength(2);
            result.forEach((img, idx) => {
                expect(img).not.toHaveProperty('secretCode');
                expect(img.id).toBe(mockImages[idx].id);
            });
        });

        it('should return empty array when no images exist', async () => {
            mockFsManager.readDB.mockResolvedValue([]);

            const result = await imagesManager.getAllImages();

            expect(result).toEqual([]);
        });
    });

    describe('getImageById', () => {
        let mockImages = [];
        beforeEach(() => {
            mockImages = [
                {
                    id: '1',
                    title: 'Public Image',
                    secretCode: 'SECRET1',
                    status: 'public',
                    views: 0,
                },
            ];
        });

        it('should return image metadata and increment views for public image without code', async () => {

            mockFsManager.readDB.mockResolvedValue(mockImages);
            const newViews = mockImages[0].views + 1;
            const result = await imagesManager.getImageById('1');

            expect(result).not.toHaveProperty('secretCode');
            expect(result.title).toBe(mockImages[0].title);
            expect(result.views).toBe(newViews);
            expect(mockFsManager.writeDB).toHaveBeenCalled();
        });

        it('should return 404 error for non-existent image', async () => {
            mockFsManager.readDB.mockResolvedValue([]);

            const result = await imagesManager.getImageById('non-existent');

            expect(result.error).toBe(HTTP_STATUS.NOT_FOUND);
        });

        it('should return 403 error for private image without code', async () => {
            mockImages[0].status = 'private';

            mockFsManager.readDB.mockResolvedValue(mockImages);

            const result = await imagesManager.getImageById('1');

            expect(result.error).toBe(HTTP_STATUS.FORBIDDEN);
        });

        it('should return image metadata and increment views for private image with correct code', async () => {
            mockImages[0].status = 'private';
            const newViews = mockImages[0].views + 1;
            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.getImageById('1', 'SECRET1');

            expect(result).not.toHaveProperty('secretCode');
            expect(result.title).toBe(mockImages[0].title);
            expect(result.views).toBe(newViews);
            expect(mockFsManager.writeDB).toHaveBeenCalled();
        });
    });

    describe('getImageFileById', () => {
        let mockImages = [];
        beforeEach(() => {
            mockImages = [
                {
                    id: '1',
                    filename: 'image.jpg',
                    secretCode: 'SECRET1',
                    status: 'public',
                    views: 0,
                    maxViews: 10,
                },
            ];
        });
        it('should return file path for public image', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.getImageFileById('1');

            expect(result).toHaveProperty('filePath');
            expect(result.filePath).toContain('image.jpg');
            expect(result.deleteAfterSend).toBe(false);
        });

        it('should return 404 error for non-existent image', async () => {
            mockFsManager.readDB.mockResolvedValue([]);
            const result = await imagesManager.getImageFileById('non-existent');

            expect(result.error).toBe(HTTP_STATUS.NOT_FOUND);
        });

        it('should return 403 error for private image without code', async () => {
            mockImages[0].status = 'private';

            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.getImageFileById('1');

            expect(result.error).toBe(HTTP_STATUS.FORBIDDEN);
        });

        it('should mark for deletion when max views reached and immediateDelete is true', async () => {
            mockImages[0].views = 10;
            mockImages[0].immediateDelete = true;

            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.getImageFileById('1', 'SECRET1');

            expect(result.filePath).toContain('image.jpg');
            expect(result.deleteAfterSend).toBe(true);
            expect(result.deletionCode).toBe('SECRET1');
        });

        it('should make private when max views reached and immediateDelete is false', async () => {
            mockImages[0].views = 10;
            mockImages[0].immediateDelete = false;

            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.getImageFileById('1', 'SECRET1');

            expect(mockImages[0].status).toBe('private');
            expect(mockImages[0].maxViews).toBeNull();
            expect(result.deleteAfterSend).toBe(false);
        });
    });

    describe('createImage', () => {
        it('should create a new image with correct metadata', async () => {
            const mockImages = [];
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const imageFile = { name: 'test.jpg', mv: jest.fn() };
            const result = await imagesManager.createImage({
                title: 'Test Image',
                image: imageFile,
                status: 'public',
                maxViews: 10,
                immediateDelete: 'true',
            });

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('secretCode');
            expect(result.title).toBe('Test Image');
            expect(result.status).toBe('public');
            expect(result.maxViews).toBe(10);
            expect(result.immediateDelete).toBe(true);
            expect(result.views).toBe(0);
            expect(mockFsManager.saveImageFile).toHaveBeenCalled();
            expect(mockFsManager.writeDB).toHaveBeenCalled();
        });

        it('should handle immediateDelete as string "false"', async () => {
            const mockImages = [];
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const imageFile = { name: 'test.jpg' };
            const result = await imagesManager.createImage({
                title: 'Test Image',
                image: imageFile,
                status: 'private',
                maxViews: null,
                immediateDelete: 'false',
            });

            expect(result.immediateDelete).toBe(false);
        });

        it('should create image with createdAt timestamp', async () => {
            const mockImages = [];
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const imageFile = { name: 'test.jpg' };
            const before = new Date();
            const result = await imagesManager.createImage({
                title: 'Test Image',
                image: imageFile,
                status: 'public',
                maxViews: null,
                immediateDelete: 'false',
            });
            const after = new Date();
            const createdAt = new Date(result.createdAt);

            expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('updateImage', () => {
        let mockImages = [];
        beforeEach(() => {
            mockImages = [
                {
                    id: '1',
                    title: 'Original Title',
                    secretCode: 'SECRET1',
                    status: 'public',
                    views: 0,
                    maxViews: 10,
                    immediateDelete: false,
                },
            ];
        });

        it('should update image properties', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const result = await imagesManager.updateImage('1', 'SECRET1', {
                title: 'New Title',
                status: 'private',
                maxViews: 5,
                immediateDelete: true
            });

            expect(result.title).toBe('New Title');
            expect(result.status).toBe('private');
            expect(result.maxViews).toBe(5);
            expect(result.immediateDelete).toBe(true);
            expect(mockFsManager.writeDB).toHaveBeenCalled();
        });

        it('should return 404 for non-existent image', async () => {
            mockFsManager.readDB.mockResolvedValue([]);

            const result = await imagesManager.updateImage('non-existent', 'SECRET', {
                title: 'New Title',
            });

            expect(result.error).toBe(HTTP_STATUS.NOT_FOUND);
        });

        it('should return 403 for incorrect secret code', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const result = await imagesManager.updateImage('1', 'WRONG_CODE', {
                title: 'New Title',
            });

            expect(result.error).toBe(HTTP_STATUS.FORBIDDEN);
        });

        it('should update maxViews and make image private when max views reached', async () => {
            mockImages[0].views = 15;
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const result = await imagesManager.updateImage('1', 'SECRET1', {
                maxViews: 10,
            });

            expect(result.status).toBe('private');
            expect(result.maxViews).toBeNull();
        });

        it('should delete image when max views reached and immediateDelete is true', async () => {
            mockImages[0].views = 10;
            mockImages[0].maxViews = 10;
            mockImages[0].immediateDelete = true;

            mockFsManager.readDB.mockResolvedValue(mockImages);
            const deleteSpy = jest.spyOn(imagesManager, 'deleteImage').mockResolvedValue({ success: true });

            await imagesManager.updateImage('1', 'SECRET1', { maxViews: 6 });

            expect(deleteSpy).toHaveBeenCalledWith('1', 'SECRET1');
        });

        it('should set maxViews to null when provided null', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);

            const result = await imagesManager.updateImage('1', 'SECRET1', {
                maxViews: null,
            });

            expect(result.maxViews).toBeNull();
        });
    });

    describe('deleteImage', () => {
        let mockImages = [];
        beforeEach(() => {
            mockImages = [
                {
                    id: '1',
                    filename: 'image.jpg',
                    secretCode: 'SECRET1',
                    title: 'Image',
                },
            ];
        });
        it('should delete image and file', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.deleteImage('1', 'SECRET1');

            expect(result.success).toBe(true);
            expect(mockFsManager.deleteImageFile).toHaveBeenCalledWith('image.jpg');
            expect(mockFsManager.writeDB).toHaveBeenCalledWith([]);
        });

        it('should return 404 for non-existent image', async () => {
            mockFsManager.readDB.mockResolvedValue([]);
            const result = await imagesManager.deleteImage('non-existent', 'SECRET');
            expect(result.error).toBe(HTTP_STATUS.NOT_FOUND);
        });

        it('should return 403 for incorrect secret code', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);
            const result = await imagesManager.deleteImage('1', 'WRONG_CODE');
            expect(result.error).toBe(HTTP_STATUS.FORBIDDEN);
        });

        it('should not throw if deletion fails gracefully', async () => {
            mockFsManager.readDB.mockResolvedValue(mockImages);
            mockFsManager.deleteImageFile.mockResolvedValue(undefined);
            const result = await imagesManager.deleteImage('1', 'SECRET1');
            expect(result.success).toBe(true);
        });
    });
});
