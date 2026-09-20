import "../assets/css/components/reactionContainer.css";
import { useContext } from "react";
import { StateContext } from "../contexts/context";

function ReactionContainer({ upvoteCallback, downvoteCallback, reactions }) {

    const { pseudo } = useContext(StateContext);
    const isLoggedIn = pseudo && pseudo !== '' && pseudo !== 'Anonyme';

    return (
        <div className="reactions-container">
            <span className="reactions">{reactions}</span>
            {isLoggedIn && (
                <>
                    <button className="reaction-up" onClick={upvoteCallback}>&uarr;</button>
                    <button className="reaction-down" onClick={downvoteCallback}>&darr;</button>
                </>
            )}
        </div>
    );
}

export default ReactionContainer;
