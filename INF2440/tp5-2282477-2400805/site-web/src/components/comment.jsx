import { useParams } from "react-router";
import "../assets/css/components/comment.css";
import ReactionContainer from "../components/reactionContainer";
import { useState, useContext, useEffect } from "react";
import { StateContext } from "../contexts/context";
import { upvoteComment, downvoteComment } from "../utils/post.http";

function Comment({ comment, onClick, showDelete, postId, reload }) {
    const { postId: paramPostId } = useParams();
    const actualPostId = postId || paramPostId;
    const { pseudo } = useContext(StateContext);

    const {
        author,
        content,
        reactions,
        date,
        id,
    } = comment;

    const [shownReaction, setShownReaction] = useState(reactions);

    const dateObject = new Date(date);
    const dateAffiche = dateObject.toLocaleString("fr-CA", {
        dateStyle: "long",
        timeStyle: "short",
    });

    async function handleUpvote() {
        const result = await upvoteComment(actualPostId, id);
        if (result && reload) {
            reload();
        }
    }

    async function handleDownvote() {
        const result = await downvoteComment(actualPostId, id);
        if (result && reload) {
            reload();
        }
    }

    useEffect(() => {
        setShownReaction(reactions);
    }, [reactions]);

    const isAuthor = showDelete !== undefined ? showDelete : pseudo === author;

    return (
        <div className="comment" >
            <section className="comment-info">
                <p className="comment-author">{author}</p>
                <p className="comment-date">{dateAffiche}</p>
            </section>
            <p className="comment-content">{content}</p>
            <ReactionContainer
                reactions={shownReaction}
                upvoteCallback={handleUpvote}
                downvoteCallback={handleDownvote}
            />
            {isAuthor && (
                <button className="delete-button" onClick={onClick}>
                    <img src="../trash.svg" className="delete-icon" />
                </button>
            )}
        </div>
    );
}

export default Comment;
