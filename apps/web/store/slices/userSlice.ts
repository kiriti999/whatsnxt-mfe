
import { getCookieAccessToken } from '../../utils/Utils';

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

        default:
            return state;
    }
}
