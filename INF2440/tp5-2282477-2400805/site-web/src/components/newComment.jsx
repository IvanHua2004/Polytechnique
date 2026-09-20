import { useState } from "react";

const NewComment = ({ sendComment }) => {
    const [text, setText] = useState("");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            sendComment(text.trim());
            setText("");
        }
    };
    
    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="comment"> Ajouter un commentaire : </label>
                <input 
                    id="comment" 
                    name="comment" 
                    value={text}
                    onChange={(e) => setText(e.target.value)} 
                />
                <button type="submit">Envoyer</button>
            </form>
        </>
    );

};

export default NewComment;