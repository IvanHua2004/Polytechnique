const FileSystemManager = require('../managers/fileSystemManager');
const path = require('path');

// Mock fs.promises
jest.mock('fs', () => ({
    promises: {
        access: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
        unlink: jest.fn(),
    },
}));

const fs = require('fs').promises;

describe('FileSystemManager', () => {
    let fsManager;
    const mockImagesDir = '/mock/images';
    const mockDbFile = '/mock/db.json';

    beforeEach(() => {
        jest.clearAllMocks();
        fsManager = new FileSystemManager(mockImagesDir, mockDbFile);
    });

    describe('constructor', () => {
        it('should initialize with correct paths', () => {
            expect(fsManager.imagesDir).toBe(mockImagesDir);
            expect(fsManager.dbFile).toBe(mockDbFile);
        });
    });

    describe('ensureDBFile', () => {
        it('should create db file if it does not exist', async () => {
            fs.access.mockRejectedValue(new Error('File does not exist'));
            fs.writeFile.mockResolvedValue(undefined);

            await fsManager.ensureDBFile();

            expect(fs.access).toHaveBeenCalledWith(mockDbFile);
            expect(fs.writeFile).toHaveBeenCalledWith(mockDbFile, JSON.stringify([]));
        });
    });

    describe('readDB', () => {
        it('should read and parse JSON from database file', async () => {
            const mockData = [{ id: '1', title: 'Image 1' }];
            fs.readFile.mockResolvedValue(JSON.stringify(mockData));

            const result = await fsManager.readDB();

            expect(fs.readFile).toHaveBeenCalledWith(mockDbFile, 'utf-8');
            expect(result).toEqual(mockData);
        });

        it('should handle empty database', async () => {
            fs.readFile.mockResolvedValue('[]');

            const result = await fsManager.readDB();

            expect(result).toEqual([]);
        });

        it('should throw error on invalid JSON', async () => {
            fs.readFile.mockResolvedValue('invalid json');

            await expect(fsManager.readDB()).rejects.toThrow();
        });
    });

    describe('writeDB', () => {
        it('should write data as formatted JSON', async () => {
            const mockData = [{ id: '1', title: 'Image 1' }];

            await fsManager.writeDB(mockData);

            expect(fs.writeFile).toHaveBeenCalledWith(
                mockDbFile,
                JSON.stringify(mockData, null, 4)
            );
        });

        it('should handle empty array', async () => {
            await fsManager.writeDB([]);

            expect(fs.writeFile).toHaveBeenCalled();
        });
    });

    describe('saveImageFile', () => {
        it('should save image file to correct location', (done) => {
            const mockImageFile = {
                mv: jest.fn((filePath, callback) => callback(null)),
            };
            const filename = 'test.jpg';

            fsManager.saveImageFile(mockImageFile, filename).then(() => {
                expect(mockImageFile.mv).toHaveBeenCalledWith(
                    path.join(mockImagesDir, filename),
                    expect.any(Function)
                );
                done();
            });
        });

        it('should reject on file move error', (done) => {
            const mockError = new Error('File move failed');
            const mockImageFile = {
                mv: jest.fn((filePath, callback) => callback(mockError)),
            };
            const filename = 'test.jpg';

            fsManager.saveImageFile(mockImageFile, filename).catch((error) => {
                expect(error).toBe(mockError);
                done();
            });
        });
    });

    describe('deleteImageFile', () => {
        it('should delete image file', async () => {
            fs.unlink.mockResolvedValue(undefined);

            await fsManager.deleteImageFile('test.jpg');

            expect(fs.unlink).toHaveBeenCalledWith(path.join(mockImagesDir, 'test.jpg'));
        });

        it('should silently fail if file does not exist', async () => {
            const error = new Error('File not found');
            fs.unlink.mockRejectedValue(error);

            await expect(fsManager.deleteImageFile('nonexistent.jpg')).resolves.not.toThrow();
        });
    });
});
