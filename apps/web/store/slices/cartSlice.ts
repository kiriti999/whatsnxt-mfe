/* eslint-disable no-case-declarations */
/* eslint-disable default-param-last */

import { bffApiClient } from '@whatsnxt/core-util';

const localCart = typeof localStorage !== 'undefined' ? localStorage.getItem('cart') : null;
const initialState = localCart ? JSON.parse(localCart) : {
	cartItems: [],
	discount: 0.0,
};

// COUNTER REDUCER
export const cartReducer = (state = initialState, action: { type: any; data: { cartItems: any; discount?: any; id: any; price: any }; id: any; }) => {

	const isItemExistInCart = (id: string) => {
		const result = state.cartItems.some((item: { id: any; }) => item.id === id)
		return result;
	}

	const createActionData = (data: { id: any; }, price: number, cartState: { cartItems: any[]; }, idType: string) => {
		const newActionData: any = { ...data };
		if (price > 0 && !(isItemExistInCart(`${idType}_${data.id}`))) {
			newActionData.id = `${idType}_${newActionData.id}`;
			newActionData.price = newActionData[price];
		}
		cartState.cartItems.push(newActionData)
	}

	const updateCart = async (details: { cartItems: any; discount: any; }) => {
		const { cartItems, discount } = details;
		await bffApiClient.post('/cart', { cartItems, discount });
	}

	switch (action.type) {
		case 'UPDATE_CART':
			const updateState = {
				...state,
				cartItems: action.data.cartItems,
				discount: action.data.discount
			};

			localStorage.setItem('cart', JSON.stringify(updateState));
			return updateState;

		case 'ADD_TO_CART':
			let existingItem = state.cartItems.find(
				(course: { _id: any; }) => action.data.id === course._id
			);
			if (existingItem) {
				existingItem.quantity += 1;
				return { ...state };
			} else {
				const newState = {
					...state,
					cartItems: [...state.cartItems],
				}

				let { price } = action.data;

				createActionData(action.data, price, newState, 'price');

				localStorage.setItem('cart', JSON.stringify(newState));
				updateCart(newState);

				return newState;
			}

		case 'GET_DISCOUNT':
			return {
				...state,
				discount: action.data,
			};

		case 'REMOVE_CART':
			let new_items = state.cartItems.filter(
				(item: { id: any; }) => action.id !== item.id
			);
			const newState = {
				...state,
				cartItems: new_items
			};
			localStorage.setItem('cart', JSON.stringify(newState));
			updateCart(newState);

			return newState;

		case 'RESET_CART':
			localStorage.removeItem('cart');
			updateCart({ cartItems: [], discount: 0 });
			return {
				...state,
				cartItems: [],
			};
		default:
			return state;
	}
};
