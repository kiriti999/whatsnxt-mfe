import { getCookieAccessToken } from '../../utils/commonHelper';

const initialState = {
    userToken: getCookieAccessToken(),
    userObject: null
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_USER_TOKEN':
            return { ...state, userToken: action.data };

        case 'UPDATE_USER_INFO':
            return { ...state, userObject: action.data };

        case 'LOGOUT':
            return {
                ...state,
                userToken: null,
                userObject: null
            };

        default:
            return state;
    }
}