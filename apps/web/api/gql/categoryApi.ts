import api from '@whatsnxt/core-util/src/GraphqlClient';

const GET_CATEGORIES_QUERY = (isPrivate = false) => `
  query ${isPrivate ? 'GetPrivCategories' : 'GetPubCategories'} {
    ${isPrivate ? 'privCategories' : 'pubCategories'} {
      _id
      categoryName
    }
  }
`;

const GET_CATEGORIES_COUNT_QUERY = (isPrivate = false) => `
  query ${isPrivate ? 'GetPrivCategoriesCount' : 'GetPubCategoriesCount'} {
    ${isPrivate ? 'privCategoriesCount' : 'pubCategoriesCount'} {
      categoryName
      categoryId
      count
    }
  }
`

export const CategoryAPI = {
  getCategories: async function () {
    const { data } = await api.request({
      data: {
        query: GET_CATEGORIES_QUERY
      }
    });
    return data.data ? data.data.privCategories || data.data.pubCategories : [];
  },
  getArticleCountByCategory: async function () {
    const { data } = await api.request({
      data: {
        query: GET_CATEGORIES_COUNT_QUERY
      }
    });
    return data.data ? data.data.privCategoriesCount || data.data.pubCategoriesCount : [];
  },
}
