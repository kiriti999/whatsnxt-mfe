import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { bffApiClient } from '@whatsnxt/core-util';

// Types
export interface CartItem {
	id: string;
	_id: string;
	price: number;
	quantity: number;
	[key: string]: any; // For additional properties
}

export interface CartState {
	cartItems: CartItem[];
	discount: number;
	loading: boolean;
	error: string | null;
}

// Helper functions
const getLocalCart = (): CartState => {
	if (typeof localStorage !== 'undefined') {
		const localCart = localStorage.getItem('cart');
		if (localCart) {
			const parsed = JSON.parse(localCart);
			return {
				cartItems: parsed.cartItems || [],
				discount: parsed.discount || 0.0,
				loading: false,
				error: null,
			};
		}
	}
	return {
		cartItems: [],
		discount: 0.0,
		loading: false,
		error: null,
	};
};

const saveToLocalStorage = (state: CartState) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('cart', JSON.stringify({
			cartItems: state.cartItems,
			discount: state.discount,
		}));
	}
};

const isItemExistInCart = (cartItems: CartItem[], id: string): boolean => {
	return cartItems.some((item) => item.id === id);
};

const createActionData = (
	data: any,
	price: number,
	cartItems: CartItem[],
	idType: string
): CartItem => {
	const newActionData: any = { ...data };
	if (price > 0 && !isItemExistInCart(cartItems, `${idType}_${data.id}`)) {
		newActionData.id = `${idType}_${newActionData.id}`;
		newActionData.price = newActionData[price] || price;
	}
	return newActionData;
};

// Async thunks
export const updateCartOnServer = createAsyncThunk(
	'cart/updateCartOnServer',
	async (details: { cartItems: CartItem[]; discount: number }) => {
		const { cartItems, discount } = details;
		await bffApiClient.post('/cart', { cartItems, discount });
		return details;
	}
);

// Initial state
const initialState: CartState = getLocalCart();

// Cart slice
const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		updateCart: (state, action: PayloadAction<{ cartItems: CartItem[]; discount: number }>) => {
			state.cartItems = action.payload.cartItems;
			state.discount = action.payload.discount;
			saveToLocalStorage(state);
		},

		addToCart: (state, action: PayloadAction<{ id: string; price: number;[key: string]: any }>) => {
			const existingItem = state.cartItems.find(
				(course) => action.payload.id === course._id
			);

			if (existingItem) {
				existingItem.quantity += 1;
			} else {
				const { price } = action.payload;
				const newItem = createActionData(action.payload, price, state.cartItems, 'price');
				state.cartItems.push(newItem);
			}

			saveToLocalStorage(state);

			// Trigger server update (you can dispatch this separately)
			// updateCartOnServer({ cartItems: state.cartItems, discount: state.discount });
		},

		getDiscount: (state, action: PayloadAction<number>) => {
			state.discount = action.payload;
			saveToLocalStorage(state);
		},

		removeFromCart: (state, action: PayloadAction<string>) => {
			state.cartItems = state.cartItems.filter(
				(item) => action.payload !== item.id
			);
			saveToLocalStorage(state);

			// Trigger server update
			// updateCartOnServer({ cartItems: state.cartItems, discount: state.discount });
		},

		resetCart: (state) => {
			state.cartItems = [];
			state.discount = 0;

			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem('cart');
			}

			// Trigger server update
			// updateCartOnServer({ cartItems: [], discount: 0 });
		},

		// New helper actions
		incrementQuantity: (state, action: PayloadAction<string>) => {
			const item = state.cartItems.find(item => item.id === action.payload);
			if (item) {
				item.quantity += 1;
				saveToLocalStorage(state);
			}
		},

		decrementQuantity: (state, action: PayloadAction<string>) => {
			const item = state.cartItems.find(item => item.id === action.payload);
			if (item && item.quantity > 1) {
				item.quantity -= 1;
				saveToLocalStorage(state);
			}
		},

		updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
			const item = state.cartItems.find(item => item.id === action.payload.id);
			if (item) {
				item.quantity = action.payload.quantity;
				saveToLocalStorage(state);
			}
		},
	},

	extraReducers: (builder) => {
		builder
			.addCase(updateCartOnServer.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCartOnServer.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(updateCartOnServer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || 'Failed to update cart on server';
			});
	},
});

// Export actions
export const {
	updateCart,
	addToCart,
	getDiscount,
	removeFromCart,
	resetCart,
	incrementQuantity,
	decrementQuantity,
	updateQuantity,
} = cartSlice.actions;

// Export reducer
export const cartReducer = cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.cartItems;
export const selectCartDiscount = (state: { cart: CartState }) => state.cart.discount;
export const selectCartTotal = (state: { cart: CartState }) =>
	state.cart.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) - state.cart.discount;
export const selectCartItemCount = (state: { cart: CartState }) =>
	state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;