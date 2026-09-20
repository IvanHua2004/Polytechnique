import { POST, GET } from './http';

const USER_URL = "users/";

async function signUp(username) {
    return await POST(`${USER_URL}signup`, { username: username });
}

async function isUsernameTaken(username) {
    const response = await GET(`${USER_URL}${username}`);
    return response.username;
}

export async function connectUser(username) {
    const isTaken = await isUsernameTaken(username);
    if (!isTaken) {
        const user = await signUp(username);
        return user?.username || username;
    }
    return isTaken;
}



