const { FileService } = require("../services/file.service");
const fs = require('fs');

describe("FileService tests", () => {
    const fileService = new FileService();

    it("readFile should call fs.promises.readFile function", async () => {
        const spy = jest.spyOn(fs.promises, "readFile").mockImplementation(() => {});
        await fileService.readFile('test');
        expect(spy).toHaveBeenCalled();
    });
});