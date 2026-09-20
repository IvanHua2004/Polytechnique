import { POST, GET, PATCH, DELETE, PUT } from './http';

const URL_POSTS = "posts";

export async function getAllPosts() {
    const posts = await GET(URL_POSTS);
    if (posts.message) {
        alert(posts.message);
    }
    return Array.isArray(posts) ? posts : [];
}

export async function getPost(id) {
    const post = await GET(`${URL_POSTS}/${id}`);
    if (post.message) {
        alert(post.message);
        return false;
    }
    return post;
}

export async function publishPost(title, content, author, category) {
    const newPost = await POST(`${URL_POSTS}/`, {
        title: title,
        content: content,
        author: author,
        category: category,
    });

    if (newPost.message) {
        alert(newPost.message);
    }
    return !!newPost.id;
}

export async function addComment(postId, content, author) {
    const newComment = await POST(`${URL_POSTS}/${postId}/comments`, {
        content: content,
        author: author,
    });

    if(newComment.message) {
        alert(newComment.message);
    }

    return !!newComment;
}

async function updateReactionsPost(postId, value) {
    const reactions = await PATCH(`${URL_POSTS}/${postId}/reactions`, {
        value: value,
    });

    if (reactions.message) {
        alert(reactions.message);
    }

    return !!reactions;
}

async function updateReactionsComment(postId, commentId, value) {
    const reactions = await PATCH(`${URL_POSTS}/${postId}/comments/${commentId}/reactions`, {
        value: value,
    });

    if (reactions.message) {
        alert(reactions.message);
    }

    return reactions;
}

export async function upvotePost(postId) {
    return updateReactionsPost(postId, 1);
}

export async function downvotePost(postId) {
    return updateReactionsPost(postId, -1);
}

export async function upvoteComment(postId, commentId) {
    return updateReactionsComment(postId, commentId, 1);
}

export async function downvoteComment(postId, commentId) {
    return updateReactionsComment(postId, commentId, -1);
}

export async function deletePost(postId, author) {
    const response = await DELETE(`${URL_POSTS}/${postId}`, {
        author: author,
    });
    if (response.message) {
        alert(response.message);
    }
    return response;
}

export async function deleteComment(postId, commentId, author) {
    const response = await DELETE(`${URL_POSTS}/${postId}/comments/${commentId}`, {
        author: author,
    });

    if (response.message) {
        alert(response.message);
    }

    return response;
}

export async function updatePost(postId, content, category, author) {
    const response = await PUT(`${URL_POSTS}/${postId}`, {
        content: content,
        category: category,
        author: author,
    });

    if (response.message) {
        alert(response.message);
    }

    return response;
}

