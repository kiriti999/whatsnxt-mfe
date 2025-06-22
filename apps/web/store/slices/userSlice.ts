
const initialState = {
    userToken: null,
    userObject: null
};


export const userReducer = (state = initialState, action) => {
    switch (action.type) {

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