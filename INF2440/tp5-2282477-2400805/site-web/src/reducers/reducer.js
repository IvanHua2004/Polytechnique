import { Action, Category } from '../utils/constants';

export const initialState = {
    pseudo: '',
    title: '',
    category: Category.DEBATE,
    content: '',
};

export const reducer = (state, action) => {
    switch (action.type) {
        case Action.LOGIN:
            return { ...state, pseudo: action.pseudo };
        case Action.LOGOUT:
            return { ...initialState };
        case Action.NEW_POST_CONTENT:
            return { ...state, content: action.content };
        case Action.NEW_POST_TITLE:
            return { ...state, title: action.title };
        case Action.NEW_POST_CATEGORY:
            return { ...state, category: action.category };
        case Action.RESET_NEW_POST:
            return { ...state, title: '', content: '', category: Category.DEBATE };
        default:
            return state;
    }
};
