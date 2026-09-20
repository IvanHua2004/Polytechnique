const DB_CONSTS = require("../utils/env");
const { dbService } = require('./database.service');

class UserService {

    constructor() {
        this.dbService = dbService;
    }

    get userCollection() {
        return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_USERS);
    }

    async createUser(username) {
        if (!username) return undefined;
        const exists = await this.userCollection.findOne({ username });
        if (exists) return undefined;
        await this.userCollection.insertOne({ username });
        return { username };
    }

    async userExists(username) {
        return await this.userCollection.findOne({ username }, { projection: { _id: 0 } });
    }

    async resetDatabase() {
        await this.userCollection.deleteMany({});
    }

}

const userService = new UserService();
module.exports = { userService };
