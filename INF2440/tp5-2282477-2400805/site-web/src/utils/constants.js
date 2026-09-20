export const NAME = "PolyPost";

export const Action = Object.freeze({
    LOGIN: Symbol("login"),
    LOGOUT: Symbol("logout"),
    POST: Symbol("post"),
    NEW_POST_CONTENT: Symbol("new-post-content"),
    NEW_POST_TITLE: Symbol("new-post-title"),
    NEW_POST_CATEGORY: Symbol("new-post-category"),
    RESET_NEW_POST: Symbol("reset-new-post"),
});

export const Category = Object.freeze({
    DEBATE: "Débats",
    RESSOURCES: "Ressources",
    PROJECT: "Projets",
});

export const HTTP_STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    REDIRECT: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
};
