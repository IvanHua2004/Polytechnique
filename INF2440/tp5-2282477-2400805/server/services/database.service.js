const { MongoClient, ServerApiVersion } = require('mongodb');
const DB_CONSTS = require('../utils/env');

class DatabaseService {
  async populateDb(collectionName, data) {
    const collection = this.db.collection(collectionName);
    const count = await collection.countDocuments();
    if (count === 0 && data && data.length > 0) {
      await collection.insertMany(data);
    }
  }

  async connectToServer(uri) {
    try {
      this.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await this.client.connect();
      this.db = this.client.db(DB_CONSTS.DB_DB);
      /* eslint-disable-next-line no-console */
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(err);
    }
  }
}

const dbService = new DatabaseService();
module.exports = { dbService };
