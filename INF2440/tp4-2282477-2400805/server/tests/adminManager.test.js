const AdminManager = require('../managers/adminManager');

describe('AdminManager', () => {
    let adminManager;
    let mockFsManager;

    beforeEach(() => {
        mockFsManager = {
            readDB: jest.fn(),
            writeDB: jest.fn(),
        };

        adminManager = new AdminManager(mockFsManager);
    });

    describe('resetImages', () => {
        it('should reset all images to initial state', async () => {
            const mockImages = [
                {
                    id: '1',
                    title: 'Image 1',
                    status: 'private',
                    views: 100,
                    immediateDelete: true,
                },
                {
                    id: '2',
                    title: 'Image 2',
                    status: 'public',
                    views: 50,
                    immediateDelete: true,
                },
            ];

            mockFsManager.readDB.mockResolvedValue(mockImages);

            await adminManager.resetImages();

            expect(mockFsManager.writeDB).toHaveBeenCalled();
            const writtenData = mockFsManager.writeDB.mock.calls[0][0];

            expect(writtenData).toHaveLength(2);
            writtenData.forEach((img) => {
                expect(img.status).toBe('public');
                expect(img.views).toBe(0);
                expect(img.immediateDelete).toBe(false);
            });
        });

        it('should handle empty database', async () => {
            mockFsManager.readDB.mockResolvedValue([]);

            await adminManager.resetImages();

            expect(mockFsManager.writeDB).toHaveBeenCalledWith([]);
        });

        it('should preserve other image properties during reset', async () => {
            const mockImages = [
                {
                    id: '1',
                    title: 'Image 1',
                    filename: 'image1.jpg',
                    secretCode: 'SECRET1',
                    createdAt: '2025-01-01T00:00:00Z',
                    maxViews: 10,
                    status: 'private',
                    views: 100,
                    immediateDelete: true,
                },
            ];

            mockFsManager.readDB.mockResolvedValue(mockImages);

            await adminManager.resetImages();

            const writtenData = mockFsManager.writeDB.mock.calls[0][0];
            const resetImage = writtenData[0];

            expect(resetImage.id).toBe('1');
            expect(resetImage.title).toBe('Image 1');
            expect(resetImage.filename).toBe('image1.jpg');
            expect(resetImage.secretCode).toBe('SECRET1');
            expect(resetImage.createdAt).toBe('2025-01-01T00:00:00Z');
            // eslint-disable-next-line no-magic-numbers
            expect(resetImage.maxViews).toBe(10);
        });
    });
});
