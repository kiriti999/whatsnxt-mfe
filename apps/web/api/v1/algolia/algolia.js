/* eslint-disable import/no-anonymous-default-export */
import { getAlgoliaIndex } from './getAlgoliaIndex';
const index = getAlgoliaIndex();

export async function indexPost(post) {
  try {

    const record = {
      objectID: post._id,
      categoryId: post.categoryId,
      categoryName: post.categoryName,
      description: post.description,
      title: post.title,
      slug: post.slug,
      listed: post.listed,
      published: post.published,
      updatedAt: post.updatedAt,
      _id: post._id,
    };

    const algoliaResponse = await index.saveObject(record);
  } catch (error) {
    console.log('algolia.js:: error: ', error);
  }
}

export async function deleteIndex(id) {
  try {
    console.log('algolia.js:: deleteIndex:: id:', id);

    const algoliaResponse = await index.deleteObject(id);
    console.log(
      'algolia.js:: deleteIndex:: algoliaResponse: ',
      algoliaResponse,
    );
  } catch (error) {
    console.log('algolia.js:: error: ', error);
  }
}

export async function searchByKeyword(keyword, page = 0, hitsPerPage = 10) {
  await index.setSettings({ searchableAttributes: ['title'] });
  const response = await index.search(keyword, {
    page: page,
    hitsPerPage: hitsPerPage,
  });
  return response;
}
