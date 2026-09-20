import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useContext } from "react";
import { getPost, upvotePost, downvotePost, deletePost, deleteComment, addComment, updatePost } from "../utils/post.http";
import Comment from "../components/comment";
import "../assets/css/pages/postPage.css";
import ReactionContainer from "../components/reactionContainer";
import { StateContext } from "../contexts/context";
import NewComment from "../components/newComment";
import { Category } from "../utils/constants";

const PostPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState();
    const [reactions, setReactions] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const { pseudo } = useContext(StateContext);
    const navigate = useNavigate();

    async function loadPost() {
        setPost(await getPost(postId));
    }

    useEffect(() => {
        loadPost();
    }, [postId]);

    useEffect(() => {
        if (post) {
            setReactions(post.reactions || 0);
            setEditContent(post.content);
            setEditCategory(post.category);
        }
    }, [post]);

    let dateAffiche;
    if (post) {
        const dateObject = new Date(post.date);
        dateAffiche = dateObject.toLocaleString("fr-CA", {
            dateStyle: "long",
            timeStyle: "short",
        });
    }

    async function handleUpvote() {
        const result = await upvotePost(postId);
        if (result) {
            await loadPost();
        }
    }

    async function handleDownvote() {
        const result = await downvotePost(postId);
        if (result) {
            await loadPost();
        }
    }

    async function deleteAction() {
        if (!post) return;
        const result = await deletePost(post.id, pseudo);
        if (result && result.message && result.message.includes("successfully")) {
            navigate("/");
        }
    }

    async function removeComment(id) {
        if (!post) return;
        const result = await deleteComment(post.id, id, pseudo);
        if (result && result.message && result.message.includes("successfully")) {
            await loadPost();
        }
    }

    async function sendComment(content) {
        if (!post) return;
        const result = await addComment(post.id, content, pseudo);
        if (result) {
            await loadPost();
        }
    }

    function handleEdit() {
        setIsEditing(true);
    }

    async function handleSave() {
        if (!post) return;
        const result = await updatePost(post.id, editContent, editCategory, pseudo);
        if (result && !result.message) {
            setIsEditing(false);
            await loadPost();
        }
    }

    function handleCancel() {
        setIsEditing(false);
        setEditContent(post.content);
        setEditCategory(post.category);
    }

    return (
        post ?
            <>
                <div className="post-container">
                    <section className="post-info">
                        <p className="post-author">{post.author}</p>
                        {!isEditing ? (
                            <p className="post-category">{post.category}</p>
                        ) : (
                            <select 
                                value={editCategory} 
                                onChange={(e) => setEditCategory(e.target.value)}
                            >
                                {Object.keys(Category).map((key) =>
                                    <option key={Category[key]} value={Category[key]}>{Category[key]}</option>
                                )}
                            </select>
                        )}
                        <p className="post-date">{dateAffiche}</p>
                    </section>
                    <h3 className="post-title">{post.title}</h3>
                    {!isEditing ? (
                        <p className="post-content">{post.content}</p>
                    ) : (
                        <textarea 
                            className="post-content"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="5"
                        />
                    )}
                    {pseudo === post.author && (
                        <button className="delete-button" onClick={deleteAction}>
                            <img src="../trash.svg" className="delete-icon" />
                        </button>
                    )}
                    <ReactionContainer
                        reactions={reactions}
                        upvoteCallback={handleUpvote}
                        downvoteCallback={handleDownvote}
                    />
                    {pseudo === post.author && !isEditing && (
                        <button onClick={handleEdit}>Modifier</button>
                    )}
                    {isEditing && (
                        <>
                            <button onClick={handleSave}>Sauvegarder</button>
                            <button onClick={handleCancel}>Annuler</button>
                        </>
                    )}
                </div>
                <section className="comments-container">
                    <h3>Commentaires : </h3>
                    <div className="comment-list">
                        {post.comments && post.comments.length > 0 ? post.comments.map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                onClick={() => removeComment(comment.id)}
                                showDelete={pseudo === comment.author}
                                postId={post.id}
                                reload={loadPost}
                            />
                        )) : <p>Aucun commentaire</p>}
                    </div>
                    {pseudo && pseudo !== 'Anonyme' && (
                        <NewComment sendComment={sendComment} />
                    )}
                </section>
            </>
            : <></>
    );
};

export default PostPage;
