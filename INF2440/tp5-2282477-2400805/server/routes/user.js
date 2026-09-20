/* eslint-disable no-console */
const { HTTP_STATUS } = require("../utils/http");
const router = require("express").Router();
const { userService } = require("../services/user.service");

router.post("/signup", async (request, response) => {
    try {
        const { username } = request.body;
        if (!username) return response.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Username is required" });

        const user = await userService.createUser(username);
        if (!user) return response.status(HTTP_STATUS.CONFLICT).json({ message: "Username already exists" });

        response.status(HTTP_STATUS.CREATED).json(user);
    } catch (error) {
        console.error(error);
        response.status(HTTP_STATUS.SERVER_ERROR).json({ message: error.message });
    }
});

router.get("/:username", async (request, response) => {
    try {
        const { username } = request.params;

        const user = await userService.userExists(username);
        if (!user) return response.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });

        response.status(HTTP_STATUS.SUCCESS).json(user);
    } catch (error) {
        console.error(error);
        response.status(HTTP_STATUS.SERVER_ERROR).json({ message: error.message });
    }
});

router.delete("/reset", async (_, response) => {
  try {
    await userService.resetDatabase();
    response.sendStatus(HTTP_STATUS.SUCCESS);
  } catch (error) {
    console.log(error);
    response.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
});

module.exports = { router };
