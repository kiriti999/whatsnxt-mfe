import { bffApiClient } from '@whatsnxt/core-util';


export const CartAPI = {
  fetch: async function () {
    const response = await bffApiClient.get('/cart');
    return response.data;
  },
  createCart: async function () {
    const response = await bffApiClient.post('/cart', null);
    return response.data;
  },
  deleteCartItem: async function (cartItemId) {
    try {
      const response = await bffApiClient.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw error;
    }
  },
}

