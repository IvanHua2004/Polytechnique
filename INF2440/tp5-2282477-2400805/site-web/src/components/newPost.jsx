import { StateContext, DispatchContext } from '../contexts/context';
import { useContext } from 'react';
import { Category, Action } from '../utils/constants';
import '../assets/css/components/newPost.css';

const NewPost = ({ sendPost }) => {
    const { title, content, category } = useContext(StateContext);
    const dispatch = useContext(DispatchContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title && content && category) {
            await sendPost();
            dispatch({ type: Action.RESET_NEW_POST });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Créer un nouveau post</h3>
            <section>
                <label htmlFor="title">Titre : </label>
                <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={title} 
                    onChange={e => dispatch({ type: Action.NEW_POST_TITLE, title: e.target.value })} 
                />
            </section>
            <section>
                <label htmlFor="content">Contenu : </label>
                <textarea 
                    id="content" 
                    name="content" 
                    value={content} 
                    onChange={e => dispatch({ type: Action.NEW_POST_CONTENT, content: e.target.value })} 
                />
            </section>
            <section>
                <label htmlFor="category">Catégorie : </label>
                <select 
                    id="category" 
                    name="category" 
                    value={category} 
                    onChange={e => dispatch({ type: Action.NEW_POST_CATEGORY, category: e.target.value })}
                >
                    {Object.keys(Category).map((key) =>
                        <option key={Category[key]} value={Category[key]}>{Category[key]}</option>
                    )}
                </select>
            </section>
            <button type="submit">
                Publier
            </button>
        </form>
    );
};

export default NewPost;
