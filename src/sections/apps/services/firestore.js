import { getAll } from 'src/services/firebase/firestore/helpers';
import { tagsCollection, categoriesCollection } from 'src/services/firebase/firestore/constants';

export async function getAppsCategories() {
  try {
    const categories = await getAll(categoriesCollection);

    return categories.filter((category) => (category.item_types ?? []).includes('app'));
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getTags() {
  try {
    const tags = await getAll(tagsCollection);

    return tags;
  } catch (error) {
    console.error(error);

    throw error;
  }
}
