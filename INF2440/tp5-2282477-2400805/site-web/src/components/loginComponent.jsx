import { DispatchContext, ModalContext } from '../contexts/context';
import { Action } from '../utils/constants';
import { connectUser } from '../utils/user.http';
import { useContext } from 'react';
import '../assets/css/components/loginComponent.css';

const LoginComponent = () => {
    const dispatch = useContext(DispatchContext);
    const setModal = useContext(ModalContext);

    const changePseudo = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const pseudo = formData.get('pseudo');
        if (!pseudo) return;
        await connectUser(pseudo);
        dispatch({ type: Action.LOGIN, pseudo });
        setModal(false);
    };

    return (
        <form onSubmit={changePseudo} id="login">
            <h3>Veuillez entrer un nom d'utilisateur</h3>
            <input type="text" name="pseudo" />
            <button type="submit">Se connecter</button>
            <button type="button" id="close" onClick={() => setModal(false)}>X</button>
        </form>
    );
};

export default LoginComponent;
