const { MongoMemoryServer } = require('mongodb-memory-server');
const { dbService } = require('../services/database.service');
const DB_CONSTS = require('../utils/env');

describe('Database tests', () => {
    let mongoServer;
    let uri = '';
    const DEFAULT_POSTS = [
        {
            id: "1", title: "First Post", author: "alice", category: "Ressources", date: "2024-01-01", reactions: 5, comments: [{
                id: "1", author: "charlie", content: "Great post!", reactions: 2, date: "2025-01-03"
            }]
        },
        { id: "2", title: "Second Post", author: "bob", category: "Débats", date: "2025-11-02", reactions: 3, comments: [] },
    ];

    beforeEach(async () => {
        jest.spyOn(console, "log").mockImplementation(() => { });
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
    });

    afterEach(async () => {
        await dbService.client.close();
        await mongoServer.stop();
        jest.restoreAllMocks();
    });

    it("should connect to the database", async () => {
        await dbService.connectToServer(uri);
        expect(dbService.client).not.toBeUndefined();
    });

    it("should not connect to the database with invalid URI", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => { });
        await dbService.connectToServer("bad-uri");
        expect(spy).toHaveBeenCalled();
    });

    it("should populate the collections", async () => {
        await dbService.connectToServer(uri);
        await dbService.populateDb(DB_CONSTS.DB_COLLECTION_POSTS, DEFAULT_POSTS);

        const collections = await dbService.db.listCollections().toArray();
        expect(collections).toHaveLength(1);

        const item_data = await dbService.db.collection(DB_CONSTS.DB_COLLECTION_POSTS).find().toArray();
        expect(item_data).toEqual(DEFAULT_POSTS);
    });

    it("should not populate the collections if they are not empty", async () => {
        await dbService.connectToServer(uri);
        await dbService.db.collection(DB_CONSTS.DB_COLLECTION_POSTS).insertOne(DEFAULT_POSTS[0]);

        await dbService.populateDb(DB_CONSTS.DB_COLLECTION_POSTS, DEFAULT_POSTS);
        const item_data = await dbService.db.collection(DB_CONSTS.DB_COLLECTION_POSTS).find().toArray();
        expect(item_data).toHaveLength(1);
    });

});