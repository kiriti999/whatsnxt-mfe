import { createSlice, PayloadAction, createAsyncThunk, Reducer } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { CartAPI } from '../../apis/v1/cart/cart';

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
	[key: string]: any;
}

export interface CartState {
	cartItems: CartItem[];
	discount: number;
	loading: boolean;
	error: string | null;
}

// Initial state - Keep it simple
const initialState: CartState = {
	cartItems: [],
	discount: 0,
	loading: false,
	error: null,
};

// Async thunk for server updates
export const updateCartOnServer = createAsyncThunk(
	'cart/updateCartOnServer',
	async (details: { cartItems: CartItem[]; discount: number }, { rejectWithValue }) => {
		try {
			// Using CartAPI (recommended)
			const response = await CartAPI.updateCart(details);

			// Check if response indicates success
			if (response && (response.success || response.message === 'Cart updated successfully')) {
				return details;
			}

			// If response doesn't indicate success, throw error
			throw new Error(response?.error || 'Unexpected response from server');

		} catch (error) {
			console.error('Cart update error:', error);
			// Return a rejected action with the error message
			return rejectWithValue(error instanceof Error ? error.message : 'Failed to update cart on server');
		}
	}
);
// Helper functions
const saveToLocalStorage = (cartItems: CartItem[], discount: number) => {
	if (typeof window !== 'undefined') {
		try {
			const cartData = { cartItems, discount };
			localStorage.setItem('cart', JSON.stringify(cartData));
		} catch (error) {
			console.error('Error saving to localStorage:', error);
		}
	}
};

const loadFromLocalStorage = (): { cartItems: CartItem[]; discount: number } => {
	if (typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem('cart');
			if (stored) {
				const parsed = JSON.parse(stored);
				return {
					cartItems: parsed.cartItems || [],
					discount: parsed.discount || 0,
				};
			}
		} catch (error) {
			console.error('Error loading from localStorage:', error);
			localStorage.removeItem('cart');
		}
	}
	return { cartItems: [], discount: 0 };
};

// Cart slice
const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		// Load cart from localStorage
		loadCart: (state) => {
			const { cartItems, discount } = loadFromLocalStorage();
			state.cartItems = cartItems;
			state.discount = discount;
		},

		// Update entire cart
		updateCart: (state, action: PayloadAction<{ cartItems: CartItem[]; discount: number }>) => {
			state.cartItems = action.payload.cartItems;
			state.discount = action.payload.discount;
			saveToLocalStorage(state.cartItems, state.discount);
		},

		// Add item to cart (with server sync)
		addToCart: (state, action: PayloadAction<CartItem>) => {
			const payload = action.payload;

			if (!payload.id) {
				state.error = 'Item must have an id';
				return;
			}

			const existingItemIndex = state.cartItems.findIndex(
				(item) => item.id === payload.id
			);

			if (existingItemIndex >= 0) {
				state.cartItems[existingItemIndex].quantity += 1;
			} else {
				const newItem: CartItem = {
					id: payload.id,
					_id: payload._id || payload.id,
					price: payload.price || payload.total_cost || 0,
					quantity: payload.quantity || 1,
					courseName: payload.courseName,
					slug: payload.slug,
					total_cost: payload.total_cost || payload.price || 0,
					lessons: payload.lessons,
					duration: payload.duration,
					image: payload.image,
					...payload
				};
				state.cartItems.push(newItem);
			}

			saveToLocalStorage(state.cartItems, state.discount);
			state.error = null;
		},

		// Remove item from cart
		removeFromCart: (state, action: PayloadAction<string>) => {
			state.cartItems = state.cartItems.filter(
				(item) => item.id !== action.payload
			);
			saveToLocalStorage(state.cartItems, state.discount);
		},

		// Update quantity
		updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
			const { id, quantity } = action.payload;
			const item = state.cartItems.find(item => item.id === id);

			if (item && quantity > 0) {
				item.quantity = quantity;
				saveToLocalStorage(state.cartItems, state.discount);
			}
		},

		// Increment quantity
		incrementQuantity: (state, action: PayloadAction<string>) => {
			const item = state.cartItems.find(item => item.id === action.payload);
			if (item) {
				item.quantity += 1;
				saveToLocalStorage(state.cartItems, state.discount);
			}
		},

		// Decrement quantity
		decrementQuantity: (state, action: PayloadAction<string>) => {
			const item = state.cartItems.find(item => item.id === action.payload);
			if (item && item.quantity > 1) {
				item.quantity -= 1;
				saveToLocalStorage(state.cartItems, state.discount);
			}
		},

		// Set discount
		setDiscount: (state, action: PayloadAction<number>) => {
			state.discount = action.payload;
			saveToLocalStorage(state.cartItems, state.discount);
		},

		// Reset cart
		resetCart: (state) => {
			state.cartItems = [];
			state.discount = 0;
			state.error = null;

			if (typeof window !== 'undefined') {
				localStorage.removeItem('cart');
			}
		},

		// Clear error
		clearError: (state) => {
			state.error = null;
		},
	},

	extraReducers: (builder) => {
		builder
			// Handle SSR hydration
			.addCase(HYDRATE, (state, action: any) => {
				const serverCart = action.payload?.cart;
				if (serverCart && state.cartItems.length === 0) {
					state.cartItems = serverCart.cartItems || [];
					state.discount = serverCart.discount || 0;
				}
			})
			// Handle async thunk states
			.addCase(updateCartOnServer.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCartOnServer.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(updateCartOnServer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || 'Failed to update cart';
			});
	},
});

// Export actions
export const {
	loadCart,
	updateCart,
	addToCart,
	removeFromCart,
	updateQuantity,
	incrementQuantity,
	decrementQuantity,
	setDiscount,
	resetCart,
	clearError,
} = cartSlice.actions;

// Export reducer with explicit type annotation
const cartReducer: Reducer<CartState> = cartSlice.reducer;
export { cartReducer };
export default cartReducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.cartItems;
export const selectCartDiscount = (state: { cart: CartState }) => state.cart.discount;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;

export const selectCartTotal = (state: { cart: CartState }) => {
	const items = state.cart.cartItems;
	const discount = state.cart.discount;
	const total = items.reduce((sum, item) => {
		const price = item.price || item.total_cost || 0;
		return sum + (price * item.quantity);
	}, 0);
	return Math.max(0, total - discount);
};

export const selectCartItemCount = (state: { cart: CartState }) => {
	return state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
};

export const selectIsItemInCart = (state: { cart: CartState }, itemId: string) => {
	return state.cart.cartItems.some(item => item.id === itemId);
};