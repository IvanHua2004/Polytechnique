const { postService } = require('../services/post.service');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { dbService } = require('../services/database.service');

const DB_CONSTS = require("../utils/env");

describe("PostsService tests", () => {
    let mongoServer;

    const TEST_POSTS = [
        {
            id: "1", title: "First Post", author: "alice", category: "Ressources", date: "2024-01-01", reactions: 5, comments: [{
                id: "1", author: "charlie", content: "Great post!", reactions: 2, date: "2025-01-03"
            }]
        },
        { id: "2", title: "Second Post", author: "bob", category: "Débats", date: "2025-11-02", reactions: 3, comments: [] },
    ];

    beforeEach(async () => {
        jest.spyOn(console, "log").mockImplementation(() => { });
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await dbService.connectToServer(uri);
        await dbService.db.collection(DB_CONSTS.DB_COLLECTION_POSTS).insertMany(structuredClone(TEST_POSTS));


        const mockFileSystemManager = {
            readFile: jest.fn().mockResolvedValue(JSON.stringify(TEST_POSTS))
        };
        postService.FileService = mockFileSystemManager;
        postService.JSON_PATH_POSTS = "fake_path_posts.json";

        postService.dbService = dbService;
    });

    afterEach(async () => {
        await dbService.client.close();
        await mongoServer.stop();
        jest.restoreAllMocks();
    });

    describe("Collection accessors", () => {

        it("getAllPosts should return all posts without comments", async () => {
            const posts = await postService.getAllPosts();
            expect(posts).toHaveLength(2);
            expect(posts[0].comments).toBeUndefined();
            expect(posts[1].comments).toBeUndefined();
        });

        it("getPost should return a post by ID without _id attribute", async () => {
            const post = await postService.getPost("1");
            expect(post).toEqual(TEST_POSTS[0]);
            expect(post._id).toBeUndefined();
        });

    });

    describe("Post operations", () => {
        it("createPost should add a new post and return it", async () => {
            const newPostData = {
                title: "Third Post", author: "dave", category: "Annonces", content: "This is the third post."
            };
            const newPost = await postService.createPost(newPostData);
            expect(newPost).toHaveProperty("id");
            expect(newPost).toHaveProperty("date");
            expect(newPost.reactions).toBe(0);
            expect(newPost.comments).toEqual([]);

            const postsInDb = await postService.getAllPosts();
            expect(postsInDb).toHaveLength(3);
        });

        it("createPost should return undefined if data is missing", async () => {
            const incompletePostData = {
                title: "Incomplete Post", author: "eve"
            }; // manque de contenu et catégorie
            const res = await postService.createPost(incompletePostData);
            expect(res).toBeUndefined();
        });

        it("createPost should return undefined if a post with the same author and title exists", async () => {
            const duplicatePostData = {
                title: "First Post", author: "alice", category: "Ressources", content: "Duplicate post content."
            };
            const res = await postService.createPost(duplicatePostData);
            expect(res).toBeUndefined();
        });

        it("deletePost should remove a post by ID if author matches", async () => {
            const deleteResult = await postService.deletePost("1", "alice");
            expect(deleteResult.deletedCount).toBe(1);

            const postsInDb = await postService.getAllPosts();
            expect(postsInDb).toHaveLength(1);
        });

        it("deletePost should throw error if author does not match", async () => {
            await expect(postService.deletePost("1", "bob")).rejects.toThrow("Unauthorized: only the author can delete this post");

            const postsInDb = await postService.getAllPosts();
            expect(postsInDb).toHaveLength(2);
        });

        it("toggleReactionOnPost should update reactions", async () => {
            const updatedPost = await postService.toggleReactionOnPost("1", 1);
            expect(updatedPost.reactions).toBe(TEST_POSTS[0].reactions + 1);
        });

        it("toggleReactionOnPost should return undefined for non-existent post", async () => {
            const res = await postService.toggleReactionOnPost("-1", 1);
            expect(res).toBeUndefined();
        });
    });

    describe("Comment operations", () => {
        it("addComment should add a comment to a post", async () => {
            const commentData = { author: "eve", content: "Nice post!" };
            const newComment = await postService.addComment("1", commentData);
            expect(newComment).toHaveProperty("id");
            expect(newComment.author).toBe("eve");
            expect(newComment.content).toBe("Nice post!");
            expect(newComment.reactions).toBe(0);

            const post = await postService.getPost("1");
            expect(post.comments).toHaveLength(2);
        });

        it("addComment should throw error if required fields are missing", async () => {
            const incompleteCommentData = { author: "frank" }; // manque de contenu
            await expect(postService.addComment("1", incompleteCommentData)).rejects.toThrow("Missing required fields");
        });

        it("addComment should return undefined for non-existent post", async () => {
            const commentData = { author: "eve", content: "Nice post!" };
            const res = await postService.addComment("-1", commentData);
            expect(res).toBeUndefined();
        });

        it("deleteComment should remove a comment from a post", async () => {
            const deleteResult = await postService.deleteComment("1", "1", "charlie");
            expect(deleteResult).toBe(true);

            const post = await postService.getPost("1");
            expect(post.comments).toHaveLength(0);
        });

        it("deleteComment should return undefined for non-existent post", async () => {
            const res = await postService.deleteComment("-1", "1", "charlie");
            expect(res).toBeUndefined();
        });

        it("deleteComment should not modify post if comment does not exist", async () => {
            await postService.deleteComment("1", "-1", "charlie");
            const post = await postService.getPost("1");
            expect(post.comments).toHaveLength(1);
        });

        it("deleteComment should throw error if author does not match", async () => {
            await expect(postService.deleteComment("1", "1", "bob")).rejects.toThrow("Unauthorized: only the author can delete this comment");
        });

        it("toggleReactionOnComment should update comment reactions", async () => {
            const updatedComment = await postService.toggleReactionOnComment("1", "1", 1);
            expect(updatedComment.commentId).toBe("1");
            expect(updatedComment.reactions).toBe(3);
        });

        it("toggleReactionOnComment should return undefined for non-existent post", async () => {
            const res = await postService.toggleReactionOnComment("-1", "1", 1);
            expect(res).toBeUndefined();
        });

        it("toggleReactionOnComment should return undefined for non-existent comment", async () => {
            const res = await postService.toggleReactionOnComment("1", "-1", 1);
            expect(res).toBeUndefined();
        });
    });

    describe("Utils", () => {

        it('populateDb should call readFile and populateDb functions', async () => {
            const fsSpy = jest.spyOn(postService.FileService, "readFile");
            const dbSpy = jest.spyOn(postService.dbService, "populateDb");
            await postService.populateDb();
            expect(fsSpy).toHaveBeenCalled();
            expect(dbSpy).toHaveBeenCalled();
        });

        it("resetDatabase should clear and repopulate the posts collection", async () => {
            const spy = jest.spyOn(postService, 'populateDb');
            await postService.resetDatabase();
            expect(spy).toHaveBeenCalled();
        });
    });

});