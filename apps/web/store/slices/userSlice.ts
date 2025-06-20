import { getCookieAccessToken } from '../../utils/commonHelper';

const initialState = {
    userToken: getCookieAccessToken(),
    userObject: null
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN': // New combined action
            return {
                ...state,
                userToken: action.data.token,
                userObject: action.data.userObject
            };

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