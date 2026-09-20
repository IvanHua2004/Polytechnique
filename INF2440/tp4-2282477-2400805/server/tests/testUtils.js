const express = require('express');

function mockSendFileSuccess() {
    const res = express.response;
    const spy = jest.spyOn(res, 'sendFile').mockImplementation(function (filePath, options, callback) {
        if (typeof options === 'function') callback = options;
        if (callback) callback(null);
        if (typeof this.end === 'function') this.end();
        return this;
    });
    return spy;
}

module.exports = {
    mockSendFileSuccess,
};
