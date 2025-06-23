import { courseApiClient } from '@whatsnxt/core-util';


export const CartAPI = {
  fetch: async function () {
    const response = await courseApiClient.get('/cart');
    console.log(' response:', response)
    return response.data;
  },
  createCart: async function () {
    const response = await courseApiClient.post('/cart', null);
    return response.data;
  },
  updateCart: async function(data){
    const response = await courseApiClient.post('/cart', data);
    return response.data;
  },
  deleteCartItem: async function (cartItemId) {
    try {
      const response = await courseApiClient.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw error;
    }
  },
}

