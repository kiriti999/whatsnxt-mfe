import { createSlice, PayloadAction, createAsyncThunk, Reducer } from '@reduxjs/toolkit';
import { courseApiClient } from '@whatsnxt/core-util';

// Types
export interface CartItem {
	id: string;
	_id?: string;
	price: number;
	quantity: number;
	courseName?: string;
	slug?: string;
	total_cost?: number;
	lessons?: any;
	duration?: any;
	image?: string;
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
		try {
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
		} catch (error) {
			console.error('Error parsing localStorage cart:', error);
			// Clear corrupted data
			localStorage.removeItem('cart');
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
		try {
			localStorage.setItem('cart', JSON.stringify({
				cartItems: state.cartItems,
				discount: state.discount,
			}));
		} catch (error) {
			console.error('Error saving to localStorage:', error);
		}
	}
};

const isItemExistInCart = (cartItems: CartItem[], id: string): boolean => {
	return cartItems.some((item) => item.id === id);
};

// Async thunks
export const updateCartOnServer = createAsyncThunk(
	'cart/updateCartOnServer',
	async (details: { cartItems: CartItem[]; discount: number }) => {
		const { cartItems, discount } = details;
		try {
			await courseApiClient.post('/cart', { cartItems, discount });
			return details;
		} catch (error) {
			throw new Error('Failed to update cart on server');
		}
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

		addToCart: (state, action: PayloadAction<CartItem>) => {
			// Ensure the item has an id
			if (!action.payload.id) {
				console.error('Cart item must have an id');
				return;
			}

			const existingItem = state.cartItems.find(
				(item) => item.id === action.payload.id
			);

			if (existingItem) {
				existingItem.quantity += 1;
			} else {
				const newItem: CartItem = {
					...action.payload,
					quantity: action.payload.quantity || 1,
					price: action.payload.price || action.payload.total_cost || 0,
				};

				// Ensure _id is set if not provided
				if (!newItem._id && newItem.id) {
					newItem._id = newItem.id;
				}

				state.cartItems.push(newItem);
			}

			saveToLocalStorage(state);
		},

		getDiscount: (state, action: PayloadAction<number>) => {
			state.discount = action.payload;
			saveToLocalStorage(state);
		},

		removeFromCart: (state, action: PayloadAction<string>) => {
			state.cartItems = state.cartItems.filter(
				(item) => item.id !== action.payload
			);
			saveToLocalStorage(state);
		},

		resetCart: (state) => {
			state.cartItems = [];
			state.discount = 0;
			state.error = null;

			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem('cart');
			}
		},

		// Helper actions for quantity management
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
			if (item && action.payload.quantity > 0) {
				item.quantity = action.payload.quantity;
				saveToLocalStorage(state);
			}
		},

		// Clear any errors
		clearError: (state) => {
			state.error = null;
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
	clearError,
} = cartSlice.actions;

// Export reducer with explicit type annotation
export const cartReducer: Reducer<CartState> = cartSlice.reducer;

// Define RootState type for selectors
type RootState = { cart: CartState };

// Selectors
export const selectCartItems = (state: RootState): CartItem[] => state.cart.cartItems;
export const selectCartDiscount = (state: RootState): number => state.cart.discount;
export const selectCartTotal = (state: RootState): number =>
	state.cart.cartItems.reduce((total, item) => {
		const itemPrice = item.price || item.total_cost || 0;
		return total + (itemPrice * item.quantity);
	}, 0) - state.cart.discount;
export const selectCartItemCount = (state: RootState): number =>
	state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
export const selectCartLoading = (state: RootState): boolean => state.cart.loading;
export const selectCartError = (state: RootState): string | null => state.cart.error;

// Helper selector to check if item exists in cart
export const selectIsItemInCart = (state: RootState, itemId: string): boolean =>
	state.cart.cartItems.some(item => item.id === itemId);

// Default export with explicit type
const reducer: Reducer<CartState> = cartSlice.reducer;
export default reducer;