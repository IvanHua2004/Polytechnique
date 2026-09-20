const fs = require('fs');

class FileService {
  async readFile(path) {
    return await fs.promises.readFile(path);
  }
}

module.exports = { FileService };
