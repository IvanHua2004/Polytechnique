import { ModalContext, DispatchContext, StateContext } from '../contexts/context';
import { Action } from '../utils/constants';
import { useContext } from 'react';

function LoginButton() {
    const setModal = useContext(ModalContext);
    const dispatch = useContext(DispatchContext);
    const { pseudo } = useContext(StateContext);

    const handleClick = () => {
        if (!pseudo || pseudo === '' || pseudo === 'Anonyme') {
            setModal(true);
        } else {
            dispatch({ type: Action.LOGOUT });
        }
    };

    const isLoggedIn = pseudo && pseudo !== '' && pseudo !== 'Anonyme';
    
    return (
        <div>
            <span>({isLoggedIn ? pseudo : 'Anonyme'}) </span>
            <button onClick={handleClick}>
                {isLoggedIn ? "Se déconnecter" : "Se connecter"}
            </button>
        </div>
    );
}

export default LoginButton;
