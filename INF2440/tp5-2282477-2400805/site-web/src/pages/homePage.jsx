import { useContext, useState, useEffect } from 'react';
import { StateContext } from '../contexts/context';
import { getAllPosts, publishPost } from '../utils/post.http';
import PreviewPost from '../components/previewPost';
import NewPost from '../components/newPost';
import '../assets/css/pages/homePage.css';

const HomePage = () => {
    const { title, content, category, pseudo } = useContext(StateContext);
    const [posts, setPosts] = useState([]);
    const isLoggedIn = pseudo && pseudo !== '' && pseudo !== 'Anonyme';

    async function loadPosts() {
        setPosts(await getAllPosts());
    }

    async function sendPost() {
        const res = await publishPost(title, content, pseudo, category);
        if (res) {
            setPosts(await getAllPosts());
        }
        return res;
    }

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <div id="post-list">
            {posts && posts.length > 0 ? posts.map(post => (
                <PreviewPost
                    key={post.id}
                    title={post.title}
                    author={post.author}
                    category={post.category}
                    date={post.date}
                    count={post.commentCount}
                    id={post.id}
                />
            )) : <p>Aucune publication</p>}
            {isLoggedIn ? (
                <NewPost sendPost={sendPost} />
            ) : <h3>Veuillez vous connecter pour publier</h3>}
        </div>
    );
};

export default HomePage;
