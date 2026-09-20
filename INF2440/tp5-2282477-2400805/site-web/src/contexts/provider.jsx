import { useReducer } from 'react';
import { reducer, initialState } from '../reducers/reducer.js';
import { StateContext, DispatchContext } from './context';

export const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
};