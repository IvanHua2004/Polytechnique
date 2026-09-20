const { userService } = require('../services/user.service');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { dbService } = require('../services/database.service');

const DB_CONSTS = require("../utils/env");

describe("UserService tests", () => {
    let mongoServer;

    const TEST_USERS = [
        { username: "alice" },
        { username: "bob" },
    ];

    beforeEach(async () => {
        jest.spyOn(console, "log").mockImplementation(() => { });
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await dbService.connectToServer(uri);
        await dbService.db.collection(DB_CONSTS.DB_COLLECTION_USERS).insertMany(TEST_USERS);

        userService.dbService = dbService;
    });

    afterEach(async () => {
        await dbService.client.close();
        await mongoServer.stop();
        jest.restoreAllMocks();
    });

    it("should retrieve all users", async () => {
        const users = userService.userCollection;
        const allUsers = await users.find({}).toArray();
        expect(allUsers.length).toBe(TEST_USERS.length);
    });

    it("should create a new user with a new username", async () => {
        const newUser = await userService.createUser("charlie");
        expect(newUser).toEqual({ username: "charlie" });

        const allUsers = await userService.userCollection.find({}).toArray();
        expect(allUsers.length).toBe(TEST_USERS.length + 1);
    });

    it("should not create a user with an existing username", async () => {
        const existingUser = await userService.createUser("alice");
        expect(existingUser).toBeUndefined();

        const allUsers = await userService.userCollection.find({}).toArray();
        expect(allUsers.length).toBe(TEST_USERS.length);
    });

    it("should check for an existing user", async () => {
        const user = await userService.userExists("bob");
        expect(user).toEqual({ username: "bob" });
    });

    it("should return null for a non-existing user", async () => {
        const user = await userService.userExists("nonexistent");
        expect(user).toBeNull();
    });

    it("should reset the database", async () => {
        await userService.resetDatabase();
        const allUsers = await userService.userCollection.find({}).toArray();
        expect(allUsers.length).toBe(0);
    });

});