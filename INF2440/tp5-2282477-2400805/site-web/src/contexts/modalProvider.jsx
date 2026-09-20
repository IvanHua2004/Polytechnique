import { useState } from 'react';
import { ModalContext } from '../contexts/context';

function ModalProvider({ children, element }) {
    const [modal, setModal] = useState(false);
    return (
        <ModalContext.Provider value={setModal}>
            {children}
            {modal ? element : <></>}
        </ModalContext.Provider>
    );
}

export default ModalProvider;
