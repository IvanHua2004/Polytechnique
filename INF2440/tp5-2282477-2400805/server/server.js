const express = require('express');
const cors = require('cors');
const DB_CONSTS = require('./utils/env');

const { dbService } = require('./services/database.service');
const { postService } = require('./services/post.service');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

const app = express();
const PORT = 5020;
const SIZE_LIMIT = '10mb';

app.use(cors({ origin: '*' }));

/* eslint-disable no-console */
app.use((request, response, next) => {
    console.log(`New HTTP request: ${request.method} ${request.url}`);
    next();
});
/* eslint-enable no-console */

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: SIZE_LIMIT }));

app.use('/posts', postRouter.router);
app.use('/users', userRouter.router);


const server = app.listen(PORT, () => {
    dbService.connectToServer(DB_CONSTS.DB_URL).then(async () => {
        await postService.populateDb();
        /* eslint-disable-next-line no-console */
        console.log(`Listening on port ${PORT}.`);
    });
});

server.on('close', () => {
    dbService.client.close();
});

module.exports = server;