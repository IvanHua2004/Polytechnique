import { Link } from 'react-router';
import { useContext } from 'react';
import { StateContext } from '../contexts/context';
import '../assets/css/components/previewPost.css';

function PreviewPost({ title, author, category, date, count,id }) {
    const { pseudo } = useContext(StateContext);
    const dateObject = new Date(date);
    const dateAffiche = dateObject.toLocaleString("fr-CA", {
        dateStyle: "long",
        timeStyle: "short",
    });

    const isOwnPost = pseudo === author;
    return (
        <Link to={`/post/${id}`} className={isOwnPost ? "post own-post" : "post"} >
            <section className="post-info">
                <p className="post-author">{author}</p>
                <p className="post-category">{category}</p>
                <p className="post-date">{dateAffiche}</p>
            </section>
            <h3 className="post-title">{title}</h3>
            <span className="post-comments">{count} commentaire(s)</span>
        </Link>
    );
}

export default PreviewPost;
