const DB_CONSTS = require("../utils/env");
const { FileService } = require("./file.service");
const path = require("path");
const { dbService } = require('./database.service');
const { v4: uuidv4 } = require("uuid");

class PostService {

    constructor() {
        this.JSON_PATH_POSTS = path.join(__dirname, "../data/posts.json");
        this.FileService = new FileService();
        this.dbService = dbService;
    }

    get postCollection() {
        return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_POSTS);
    }

    async getAllPosts() {
        const posts = await this.postCollection.find({}, {
            projection: {
                _id: 0,
                id: 1,
                title: 1,
                author: 1,
                category: 1,
                date: 1,
                reactions: 1,
                comments: 1
            }
        }).toArray();
        return posts.map(post => ({
            id: post.id,
            title: post.title,
            author: post.author,
            category: post.category,
            date: post.date,
            reactions: post.reactions || 0,
            commentCount: post.comments ? post.comments.length : 0
        }));
    }

    async getPost(id) {
        if (!id) return null;
        return await this.postCollection.findOne({ id }, { projection: { _id: 0 } });
    }

    async populateDb() {
        const posts = JSON.parse(
            await this.FileService.readFile(this.JSON_PATH_POSTS)
        ).posts;
        await this.dbService.populateDb(DB_CONSTS.DB_COLLECTION_POSTS, posts);
    }

    async deletePost(id, author) {
        const post = await this.getPost(id);
        if (!post) return undefined;
        if (post.author !== author) throw new Error("Unauthorized: only the author can delete this post");
        return await this.postCollection.deleteOne({ id });
    }

    async deleteComment(postId, commentId, author) {
        const post = await this.getPost(postId);
        if (!post) return undefined;
        const comment = post.comments?.find(c => c.id === commentId);
        if (!comment) return undefined;
        if (comment.author !== author) throw new Error("Unauthorized: only the author can delete this comment");
        const updatedComments = post.comments.filter(c => c.id !== commentId);
        await this.postCollection.updateOne(
            { id: postId },
            { $set: { comments: updatedComments } }
        );
        return true;
    }

    async createPost(postData) {
        const { title, content, author, category } = postData;
        if (!title || !content || !author || !category) return undefined;
        if (author === 'Anonyme' || author === '' || !author.trim()) {
            return undefined;
        }
        if (!title.trim() || !content.trim() || !category.trim()) {
            return undefined;
        }
        const exists = await this.postCollection.findOne({ title, author });
        if (exists) return undefined;
        const newPost = {
            id: uuidv4(),
            title,
            content,
            author,
            category,
            reactions: 0,
            comments: [],
            date: new Date().toISOString()
        };
        await this.postCollection.insertOne(newPost);
        return newPost;
    }

    async addComment(postId, commentData) {
        const { author, content } = commentData;
        if (!author || !content) throw new Error("Missing required fields");
        if (author === 'Anonyme' || author === '' || !author.trim()) {
            throw new Error("Comments must be created by authenticated users");
        }
        const post = await this.getPost(postId);
        if (!post) return undefined;
        const newComment = {
            id: uuidv4(),
            author,
            content,
            reactions: 0,
            date: new Date().toISOString()
        };
        const updatedComments = post.comments ? [...post.comments, newComment] : [newComment];
        await this.postCollection.updateOne(
            { id: postId },
            { $set: { comments: updatedComments } }
        );
        return newComment;
    }

    async toggleReactionOnPost(postId, value) {
        const post = await this.getPost(postId);
        if (!post) return undefined;
        let newValue = (post.reactions || 0) + value;
        if (newValue < 0) newValue = 0;
        await this.postCollection.updateOne(
            { id: postId },
            { $set: { reactions: newValue } }
        );
        return { postId, reactions: newValue };
    }

    async toggleReactionOnComment(postId, commentId, value) {
        const post = await this.getPost(postId);
        if (!post) return undefined;
        const comments = post.comments || [];
        const idx = comments.findIndex(c => c.id === commentId);
        if (idx === -1) return undefined;
        let newValue = (comments[idx].reactions || 0) + value;
        if (newValue < 0) newValue = 0;
        comments[idx].reactions = newValue;
        await this.postCollection.updateOne(
            { id: postId },
            { $set: { comments } }
        );
        return { commentId, reactions: newValue };
    }

    async updatePost(postId, updateData, author) {
        const post = await this.getPost(postId);
        if (!post) return undefined;
        if (post.author !== author) throw new Error("Unauthorized: only the author can update this post");
        
        const { content, category } = updateData;
        if (!content || !category) return undefined;
        if (!content.trim() || !category.trim()) return undefined;

        await this.postCollection.updateOne(
            { id: postId },
            { $set: { content, category } }
        );
        return await this.getPost(postId);
    }

    async resetDatabase() {
        await this.postCollection.deleteMany({});
        await this.populateDb();
    }

}

const postService = new PostService();
module.exports = { postService };
